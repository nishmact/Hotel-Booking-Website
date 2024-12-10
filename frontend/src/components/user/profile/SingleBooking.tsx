import { useEffect, useState } from "react";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { useLocation } from "react-router-dom";
import PaymentCard from "./PaymentCard";
import { toast } from "react-toastify";
import { VendorData } from "../../../types/vendorTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface Booking {
  _id: string;
  date: string;
  name: string;
  eventName: string;
  city: string;
  pin: number;
  mobile: number;
  vendorId: VendorData;
  status: string;
  payment_status: string;
  checkIn: string; // Add check-in field
  checkOut: string;
}

function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

const SingleBooking = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const [booking, setBooking] = useState<Booking>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const fetchBooking = async () => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/api/user/single-booking?bookingId=${id}`,
        {
          withCredentials: true,
        }
      );
      console.log(response.data.bookings);
      setBooking(response.data.bookings[0]);
    } catch (error) {
      console.error("Error fetching booking:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const confirmCancel = async () => {
    try {
      await axiosInstance.put(
        `${BASE_URL}/api/user/cancel-booking?bookingId=${id}`,
        {},
        { withCredentials: true }
      );
      handleOpen();
      fetchBooking();
      toast.success("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const formatDate = (isoDate: any) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {booking?.payment_status === "Pending" &&
        booking?.status === "Accepted" && (
          <div className="mx-20 w-full p-4 bg-red-100 text-red-700 rounded-lg flex items-center mb-5">
            <Icon />
            <span className="ml-2">
              Please complete your payment to confirm your booking.
            </span>
          </div>
        )}
      {booking?.status !== "Cancelled" && (
        <div className="float-right mx-20">
          <button
            onClick={handleOpen}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel Booking
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between gap-4 mx-20 mt-10">
        <div className="bg-white shadow rounded-lg w-full p-5">
          <div className="flex justify-between border-b pb-4 mb-4">
            <div>
              <h5 className="text-gray-700 font-semibold mb-1">Hotel</h5>
              <p className="text-gray-500">{booking?.vendorId?.name}</p>
            </div>
            <div>
              <h5 className="text-gray-700 font-semibold mb-1">City</h5>
              <p className="text-gray-500">{booking?.vendorId?.city}</p>
            </div>
            <div>
              <h5 className="text-gray-700 font-semibold mb-1">Check-In</h5>
              <p className="text-gray-500">{formatDate(booking?.checkIn)}</p>
            </div>
            <div>
              <h5 className="text-gray-700 font-semibold mb-1">Check-Out</h5>
              <p className="text-gray-500">{formatDate(booking?.checkOut)}</p>
            </div>
            <div>
              <h5 className="text-gray-700 font-semibold mb-1">Status</h5>
              <p
                className={`text-sm font-medium ${
                  booking?.status === "Accepted"
                    ? "text-green-500"
                    : booking?.status === "Rejected"
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
              >
                {booking?.status}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h6 className="text-gray-700 font-semibold mb-1">Contact</h6>
              <p className="text-gray-500">{booking?.vendorId?.phone}</p>
              <p className="text-gray-500">{booking?.vendorId?.email}</p>
            </div>
          </div>
        </div>
      </div>
      <PaymentCard booking={booking!} />

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-700">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 mt-4">
              Are you sure you want to cancel the booking?
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleOpen}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleBooking;
