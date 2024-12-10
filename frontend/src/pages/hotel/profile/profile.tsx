import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import HotelRootState from "../../../redux/rootstate/HotelState";
import { useEffect, useState } from "react";
import { axiosInstanceHotel} from "../../../config/api/axiosinstance";
import Layout from "../../../layout/vendor/Layout";
import { HotelData } from "../../../types/hotelTypes";


const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const Profile = () => {
  const hotelData = useSelector(
    (state: HotelRootState) => state.hotel.hotelData
  );

  console.log("hotelData....",hotelData)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [hotel, setVendor] = useState<HotelData>();

  useEffect(() => {
    axiosInstanceHotel
      .get(`${BASE_URL}/api/hotel/gethotel?hotelid=${hotelData?._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setVendor(response.data.data);
        console.log("Fetched vendor data:", response.data.data);
      })
      .catch((error) => {
        console.log("here", error);
      });
  }, [id, hotelData]);

  console.log("Vendor data on frontend:", hotel);

  return (
    <Layout>
      <div className="bg-white shadow-lg rounded-md p-6 space-y-6">
        {hotel ? (
          <>
            {/* Vendor Name and Price */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <div className="text-1xl font-semibold text-blue-800">
                <p>Email: {hotel.email}</p>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <img
                src={hotel.logoUrl}
                alt={hotel.name}
                className="rounded-md w-full h-full object-cover object-center"
              />
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
