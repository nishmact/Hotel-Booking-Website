import { useEffect, useState } from 'react';
import { axiosInstanceVendor } from '../../../config/api/axiosinstance';
import { useLocation } from 'react-router-dom';
import { Booking } from '../../../types/commonTypes';
import Layout from '../../../layout/vendor/Layout';
import UpdateStatus from './UpdateStatus';

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const ViewBooking = () => {
  const [bookings, setBookings] = useState<Booking>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  useEffect(() => {
    axiosInstanceVendor
      .get(`${BASE_URL}/api/vendor/single-booking-details?bookingId=${id}`, { withCredentials: true })
      .then((response) => {
        setBookings(response.data.bookings[0]);
        console.log(response.data.bookings);
      })
      .catch((error) => {
        console.log('here', error);
      });
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    setBookings((prevBookings) => {
      if (!prevBookings) {
        return;
      }
      return {
        ...prevBookings,
        status: newStatus,
      };
    });
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
    <Layout>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6 w-full">
          <h5 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Event Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h6 className="text-lg font-medium text-gray-900">Hotel:</h6>
              <p className="text-sm text-gray-800">{bookings?.vendorId?.name}</p>
            </div>
            <div>
              <h6 className="text-lg font-medium text-gray-900">City:</h6>
              <p className="text-sm text-gray-800">{bookings?.vendorId?.city}</p>
            </div>
            <div>
              <h6 className="text-lg font-medium text-gray-900">Check-In:</h6>
              <p className="text-sm text-gray-800">{formatDate(bookings?.checkIn)}</p>
            </div>
            <div>
              <h6 className="text-lg font-medium text-gray-900">Check-Out:</h6>
              <p className="text-sm text-gray-800">{formatDate(bookings?.checkOut)}</p>
            </div>
            <div>
              <h6 className="text-lg font-medium text-gray-900">Status:</h6>
              <p className={`text-sm ${bookings?.status === 'Accepted' ? 'text-green-800' : bookings?.status === 'Rejected' ? 'text-red-800' : 'text-blue-800'}`}>
                {bookings?.status}
              </p>
            </div>
          </div>
          <h6 className="text-lg font-semibold text-gray-900 mt-6">Customer Information</h6>
          <div className="mt-2">
            <p className="text-sm text-gray-800 mb-2"><span className="font-medium">Name:</span> {bookings?.userId?.name}</p>
            <p className="text-sm text-gray-800"><span className="font-medium">Contact:</span> {bookings?.userId?.phone}</p>
          </div>
        </div>
        {bookings?.status === "Pending" && (
  <div className="w-full md:w-1/2 lg:w-1/2 xl:w-1/2 mt-5 ml-6"> {/* Adjust width here */}
    <UpdateStatus
      bookingId={bookings?._id}
      onStatusChange={handleStatusChange}
    />
  </div>
)}

      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-6 w-full mb-20">
        <h5 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Payment Details</h5>
        <p className="text-lg text-gray-700 mb-2">
          Payment Status: <span className="text-blue-600 font-semibold">{bookings?.payment_status}</span>
        </p>
        {/* Additional payment detail information can be added here */}
      </div>
    </Layout>
  );
};

export default ViewBooking;
