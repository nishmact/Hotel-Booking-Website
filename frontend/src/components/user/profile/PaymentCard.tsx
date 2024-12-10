import { useState } from "react";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../../config/api/axiosinstance";
import UserRootState from "../../../redux/rootstate/UserState";
import { VendorData } from "../../../types/vendorTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface Booking {
  _id: string;
  name: string;
  city: string;
  pin: number;
  mobile: number;
  vendorId: VendorData;
  status: string;
  payment_status: string;
}

interface PaymentCardProps {
  booking: Booking;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ booking }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const user = useSelector((state: UserRootState) => state.user.userdata);

  const handleClick = async () => {
    try {
      console.log("Initiating payment...");
      console.log("User ID:", user?._id);
      console.log("Booking ID:", booking?._id);
      console.log("Vendor ID:", booking?.vendorId?._id); // Access the vendor's ID directly
  
      // Ensure to include name and logoUrl here
      const response = await axiosInstance.post(
        `${BASE_URL}/api/user/create-checkout-session`,
        { 
          userId: user?._id, 
          bookingId: booking?._id, 
          vendorId: booking?.vendorId?._id,
          name:   booking?.vendorId?.name,// Assuming booking has a name field
         
        }, 
        { withCredentials: true }
      );
  
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
    }
  };
  
  

  return (
    <>
      <div className="mt-6 mb-20 mx-20 bg-white shadow-lg rounded-lg p-5">
        <div className="border-b border-gray-200 pb-5">
          <div className="flex justify-between">
            <div>
              <h5 className="text-lg font-semibold text-gray-700">
                Payment Details
              </h5>
              <h6 className="text-md text-gray-600">
                Status:{" "}
                <span
                  className={
                    booking?.payment_status === "Completed"
                      ? "text-green-500"
                      : "text-blue-400"
                  }
                >
                  {booking?.payment_status}
                </span>
              </h6>
            </div>
            <div>
              {booking?.status === "Accepted" &&
              booking?.payment_status === "Pending" ? (
                <button
                  onClick={handleOpen}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Make Payment
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between p-5">
          <div>{/* You can add additional details here if needed */}</div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-60">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 md:p-10 mx-4">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Confirm Payment
            </h3>
            <p className="text-lg text-gray-700 mb-8">
              Token Amount: <span className="font-bold">20000</span>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleOpen}
                className="px-6 py-3 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleClick}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentCard;
