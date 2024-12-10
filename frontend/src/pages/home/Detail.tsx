import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { AiFillStar } from "react-icons/ai";
import {
  axiosInstance,
  axiosInstanceChat,
} from "../../config/api/axiosinstance";
import GuestInfoForm from "../vendor/forms/GuestInForm/GuestInfoForm";
import { useSelector } from "react-redux";
import UserRootState from "../../redux/rootstate/UserState";
import { toast } from "react-toastify";
import { USER } from "../../config/constants/constants";
import ReviewCard from "../../components/home/VendorProfile/ReviewCard";
import { Review } from "../../types/commonTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface Hotel {
  _id: string;
  name: string;
  starRating: number;
  imageUrls: string[];
  facilities: string[];
  description: string;
  pricePerNight: number;
}

interface Location {
  latitude: string; // or number depending on the data type you expect
  longitude: string; // or number
}

const Detail = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const userId = user?._id;
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { roomId } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/api/user/details/${hotelId}/${roomId}`
        );
        setHotel(response.data.room); // Set room data
        setLocation(response.data.location); // Set location data
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          navigate("/error", { state: { message: "Hotel or room not found" } });
        } else {
          navigate("/error", { state: { message: "Internal server error" } });
        }
      }
    };

    if (hotelId && roomId) {
      fetchHotel();
    }
  }, [hotelId, roomId, navigate]);

  useEffect(() => {
    axiosInstance
      .get(`${BASE_URL}/api/user/getReviews?vendorId=${hotelId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setReviews(response.data.reviews);
      });
  }, [hotelId]);

  const handleChat = async () => {
    if (!userId) {
      toast.error("User must be logged in to start a chat.", {
        style: {
          background: "red",
          color: "#FFFFFF",
        },
        autoClose: 3000,
      });
      return;
    }
    const body = {
      senderId: userId,
      receiverId: hotelId,
    };
    try {
      await axiosInstanceChat
        .post(`${BASE_URL}/api/conversation/`, body)
        .then(() => {
          navigate(`${USER.CHAT}`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  if (!hotel) {
    return <div>Loading...</div>;
  }

  const latitude = location ? parseFloat(location.latitude) : 0; // Default to 0 if location is null
  const longitude = location ? parseFloat(location.longitude) : 0; // Default to 0 if location is null

  return (
    <div className="space-y-6 mt-10">
      <div>
        <span className="flex">
          {Array.from({ length: hotel.starRating }).map((_, index) => (
            <AiFillStar key={index} className="fill-yellow-400" />
          ))}
        </span>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <div className="flex space-x-4">
            <button
              className="w-fit bg-gray-900 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800"
              onClick={handleChat}
            >
              Chat with us
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotel.imageUrls.map((image, index) => (
          <div key={index} className="h-[300px]">
            <img
              src={image}
              alt={hotel.name}
              className="rounded-md w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {hotel.facilities.map((facility, index) => (
          <div key={index} className="border border-slate-300 rounded-sm p-3">
            {facility}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <div className="whitespace-pre-line">{hotel.description}</div>
        <div className="h-fit">
          <GuestInfoForm
            pricePerNight={hotel.pricePerNight}
            hotelId={hotel._id}
          />
        </div>
      </div>
      {/* Reviews Section */}
      <hr className="border-t-2 mt-10" />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {reviews.length > 0 ? (
          reviews.map((review, index) => <ReviewCard key={index} {...review} />)
        ) : (
          <div className="text-center text-gray-600"></div>
        )}
      </div>

      {/* Map Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold">Hotel Location</h2>
        <div className="h-[300px] w-full mt-4">
          <MapContainer
            center={[20.5937, 78.9629]} // Center on India
            zoom={3} // Lower zoom level to show a larger area (India)
            scrollWheelZoom={true} // Allow zooming with the mouse scroll
            className="h-[300px] w-full mt-4 rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>{hotel.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Detail;
