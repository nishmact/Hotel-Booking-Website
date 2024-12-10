import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import VendorRootState from "../../../redux/rootstate/VendorState";
import { useEffect, useState } from "react";
import { axiosInstanceVendor } from "../../../config/api/axiosinstance";
import { VendorData, RoomData } from "../../../types/vendorTypes";
import Layout from "../../../layout/vendor/Layout";
import Modal from "react-modal";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const Profile = () => {
  const vendorData = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const [vendor, setVendor] = useState<VendorData>();
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  useEffect(() => {
    axiosInstanceVendor
      .get(`${BASE_URL}/api/vendor/getvendor?vendorid=${vendorData?._id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setVendor(response.data.data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }, [id, vendorData]);

  const openRoomModal = (room: RoomData) => {
    setSelectedRoom(room);
  };

  const closeRoomModal = () => {
    setSelectedRoom(null);
  };

  return (
    <Layout>
      <div className="bg-white shadow-lg rounded-md p-6 space-y-6 mt-10">
        {vendor ? (
          <>
            {/* Hotel Name, Logo, and Location */}
            <div className="flex flex-col items-center">
              <img
                src={vendor.logoUrl}
                alt={vendor.name}
                className="w-24 h-24 object-cover rounded-full mb-4"
              />
              <h1 className="text-3xl font-bold">{vendor.name}</h1>
              <p className="text-lg text-gray-500">
                {vendor.city}, {vendor.country}
              </p>
            </div>

            {/* Rooms Section */}
            <h2 className="text-2xl font-semibold mt-6"></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.rooms?.map((room, index) => (
                <div
                  key={index}
                  onClick={() => openRoomModal(room)}
                  className="cursor-pointer border border-gray-300 p-4 rounded-md shadow-md hover:shadow-lg transition"
                >
                  <img
                    src={room.imageUrls[0] || "https://via.placeholder.com/300"}
                    alt={room.name}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                  <h3 className="text-lg font-bold">{room.name}</h3>
                  <p className="text-gray-500">Price Per Night: ${room.pricePerNight}</p>
                </div>
              ))}
            </div>

            {/* Room Details Modal */}
            {selectedRoom && (
              <Modal
              isOpen={!!selectedRoom}
              onRequestClose={closeRoomModal}
              className="p-8 bg-white rounded-md shadow-lg max-w-4xl max-h-[90vh] mx-auto mt-20 flex flex-col"
            >
              <h2 className="text-2xl font-semibold">{selectedRoom.name}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {selectedRoom.imageUrls.map((image, index) => (
                  <div key={index} className="h-[300px]">
                    <img
                      src={image || "https://via.placeholder.com/300"}
                      alt={selectedRoom.name}
                      className="rounded-md w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            
              <p className="text-lg mt-2">
                <strong>Price Per Night:</strong> ${selectedRoom.pricePerNight}
              </p>
            
              {/* Display Facilities */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mt-4">
                {selectedRoom.facilities?.map((facility, index) => (
                  <div key={index} className="border border-slate-300 rounded-sm p-3">
                    {facility}
                  </div>
                ))}
              </div>
            
              {/* Scrollable description */}
              <div className="overflow-y-auto mt-4 flex-1">
                <p className="whitespace-pre-line">{selectedRoom.description}</p>
              </div>
            
              {/* Close button */}
              <button
                onClick={closeRoomModal}
                className="mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500 self-end"
              >
                Close
              </button>
            </Modal>
            
            
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
