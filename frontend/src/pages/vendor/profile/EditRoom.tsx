import { useEffect, useState } from "react";
import Layout from "../../../layout/vendor/Layout";
import ManageHotelForm, { HotelFormData } from "../forms/ManageHotelForm/ManageHotelForm";
import { axiosInstanceVendor } from "../../../config/api/axiosinstance";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const EditRoom = () => {
  const { roomId } = useParams(); // Retrieve roomId from URL
  const [roomData, setRoomData] = useState<HotelFormData | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;

      try {
        const response = await axiosInstanceVendor.get(
          `${BASE_URL}/api/vendor/getroom?roomId=${roomId}` // Ensure the correct endpoint
        );
        setRoomData(response.data);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  return (
    <Layout>
      <div className="container mx-auto">
        {roomData ? (
          <ManageHotelForm initialData={roomData} isEditMode={true} />
        ) : (
          <p>Loading room data...</p>
        )}
      </div>
    </Layout>
  );
};

export default EditRoom;
