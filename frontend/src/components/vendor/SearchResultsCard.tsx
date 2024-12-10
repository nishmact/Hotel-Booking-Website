import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { VendorData } from "../../types/vendorTypes";

type Props = {
  hotel: VendorData;
};

const SearchResultsCard = ({ hotel }: Props) => {
  // Ensure rooms is an array
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [hotel.rooms];
  console.log("hotels...",hotel)
console.log("rooms..",rooms)
  return (
    <div className="grid gap-8">
      {rooms.map((room, index) => (
        <div
          key={index}
          className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] border border-slate-300 rounded-lg p-8 gap-8"
        >
          {/* Room Image */}
          <div className="w-full h-[300px]">
            <img
              src={
                room.imageUrls.length > 0
                  ? room.imageUrls[0]
                  : "default-image.jpg"
              }
              className="w-full h-full object-cover object-center rounded"
              alt={room.name}
            />
          </div>

          {/* Room Details */}
          <div className="flex flex-col gap-4">
            {/* Hotel Name and Location */}
            <div>
              <Link
                to={`/detail/${hotel._id}/${room._id}`}
                className="text-2xl font-bold cursor-pointer"
              >
                {hotel.name || "Hotel Name"}
              </Link>
              <div className="flex items-center mt-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="ml-1 text-sm">
                  {hotel.city}, {hotel.country}
                </span>
              </div>
            </div>

            {/* Room Details */}
            <div>
              <h3 className="text-lg font-semibold">
                {room.name || "Room Name"}
              </h3>
              <p
                className="text-sm text-gray-600 overflow-hidden text-ellipsis"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {room.description || "No description available"}
              </p>

              <div className="flex gap-2 mt-2">
                {room.facilities.slice(0, 3).map((facility, facilityIndex) => (
                  <span
                    key={facilityIndex}
                    className="bg-gray-300 p-2 rounded-lg font-bold text-xs whitespace-nowrap"
                  >
                    {facility}
                  </span>
                ))}
                {room.facilities.length > 3 && (
                  <span className="text-sm">
                    +{room.facilities.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Room Price */}
            <div>
              <span className="font-bold">
                ₹{room.pricePerNight || "N/A"} per night
              </span>
            </div>

            {/* View More Button */}
            <div className="flex justify-end mt-4">
              <Link
                to={`/detail/${hotel._id}/${room._id}`}
                className="bg-gray-900 text-white px-4 py-2 font-semibold text-lg rounded-lg shadow-sm hover:bg-gray-800 transition duration-300 ease-in-out"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResultsCard;
