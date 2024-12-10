import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { toast } from "react-toastify";
import UserRootState from "../../../redux/rootstate/UserState";
import { useSelector } from "react-redux";
import { toast as hottoast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { USER } from "../../../config/constants/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface VendorReviewProps {
  id: string | undefined;
  setReviewAdded: (value: boolean) => void;
  reviewAdded: boolean;
}

const AddReview: React.FC<VendorReviewProps> = ({
  id,
  setReviewAdded,
  reviewAdded,
}) => {
  const user = useSelector((state: UserRootState) => state.user.userdata);

  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const navigate = useNavigate();
  useEffect(() => {
    if (reviewAdded) {
      setRating(0);
      setReview("");
    }
  }, [reviewAdded]);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleReviewChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReview(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    // Debug user state
    console.log("User State: ", user);
    if (!user) {
      hottoast.error("User must be logged in to add a review.");
      return;
    }
  
    // Debug input values
    console.log("Rating and Review: ", { rating, review });
    if (rating === 0) {
      hottoast.error("Please select a rating.");
      return;
    }
  
    if (!review.trim()) {
      hottoast.error("Please enter a review.");
      return;
    }
  
    console.log("Data being sent:", {
      vendorId: id,
      userId: user?._id,
      rating: rating,
      content: review,
    });
  
    axiosInstance
      .post(
        `${BASE_URL}/api/user/addVendorReview`,
        { vendorId: id, userId: user?._id, rating: rating, content: review },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("API Response: ", response.data);
        navigate(`${USER.PAYMENT_SUCCESS}`);
        toast.success(response.data.message);
        setReviewAdded(true);
        setRating(0);
        setReview("");
      })
      .catch((error) => {
        console.error("API Error: ", error);
        hottoast.error(error.response?.data?.message || "Something went wrong");
      });
  };
  

  return (
    <div className="max-w-2xl mx-5 lg:mx-auto mt-20 p-8 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700"
          >
            Rating
          </label>
          <div className="flex items-center space-x-2 mt-2">
            {Array.from({ length: 5 }, (_, index) => (
              <svg
                key={index}
                onClick={() => handleRatingChange(index + 1)}
                xmlns="http://www.w3.org/2000/svg"
                fill={index < rating ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-6 h-6 cursor-pointer text-yellow-400 ${
                  index < rating ? "fill-current" : "stroke-current"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              </svg>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="review"
            className="block text-sm font-medium text-gray-700"
          >
            Review
          </label>
          <textarea
            id="review"
            name="review"
            rows={4}
            value={review}
            onChange={handleReviewChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReview;
