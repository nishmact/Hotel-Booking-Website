import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { axiosInstance } from "../../config/api/axiosinstance";
import { USER } from "../../config/constants/constants";
import AddReview from "../../components/home/VendorProfile/AddReview";
import { useSelector } from "react-redux";
import VendorRootState from "../../redux/rootstate/VendorState";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export default function PaymentSuccess() {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [reviewAdded, setReviewAdded] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Manage popup visibility

  useEffect(() => {
    axiosInstance
      .post(`${BASE_URL}/api/user/add-payment`, {}, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        setReviewAdded(false);
      })
      .catch((error) => {
        console.log("here", error);
      });
  }, [id, reviewAdded]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="mt-6 w-96 text-center p-6 border border-gray-200 rounded-lg shadow-lg bg-white">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
        <h5 className="text-xl font-semibold text-green-600 mb-2">
          Payment Successful
        </h5>
        <p className="text-gray-700">
          Your payment has been successfully processed.
        </p>
        <div className="pt-4 flex flex-col gap-4 items-center">
          {/* View Details Button */}
          <Link to={`${USER.PROFILE}${USER.BOOKING}?id=${id}`}>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 bg-transparent border border-green-600 rounded hover:bg-green-600 hover:text-white transition duration-200">
              View Details
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </Link>
          {/* Add Reviews Button */}
          <button
            onClick={() => setShowPopup(true)} // Show the popup on click
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-transparent border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-200"
          >
            Add Review
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 12.75l2.25 2.25 5.25-5.25"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Popup Modal */}
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)} // Close the popup
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition duration-200"
              aria-label="Close"
            >
              {/* Close Icon (SVG) */}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* AddReview Component */}
            <AddReview
              id={vendor?._id}
              setReviewAdded={setReviewAdded}
              reviewAdded={reviewAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
