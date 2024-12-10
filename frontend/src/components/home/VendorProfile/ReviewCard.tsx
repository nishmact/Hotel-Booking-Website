import { useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { UserData } from "../../../types/userTypes";
import UserRootState from "../../../redux/rootstate/UserState";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface Review {
  _id: string;
  userId: UserData;
  rating: number;
  content: string;
  reply: Array<string>;
  key: number;
}

const ReviewCard: React.FC<Review> = ({
  _id,
  userId,
  rating,
  content,
  reply,
}) => {
  const user = useSelector((state: UserRootState) => state.user.userdata);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  const [review, setReview] = useState(content);
  const [error, setError] = useState("");

  const [showReplies, setShowReplies] = useState(false);
  const toggleReplies = () => setShowReplies(!showReplies);

  const handleUpdate = async () => {
    if (review.trim() === "") {
      setError("Review cannot be empty!");
      return;
    }
    try {
      await axiosInstance
        .patch(`${BASE_URL}/api/user/update-review`, {
          reviewId: _id,
          review: review,
        })
        .then((res) => {
          if (res.data.updateReview) {
            handleOpen();
            toast.success("Review updated successfully!");
          }
        });
    } catch (error) {
      handleOpen();
      console.log(error);
    }
  };

  return (
    <>
      <div className="bg-white w-full p-5 shadow-lg rounded-md transition-all duration-200 ease-in-out shadow-[0px_-5px_10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4">
          <img
            src={userId?.imageUrl ? userId.imageUrl : "/imgs/user-default.svg"}
            alt={userId?.name}
            className="w-8 h-8 rounded-full cursor-pointer bg-white"
          />
          <div className="flex w-full flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <h6 className="text-blue-gray-600">{userId.name}</h6>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => {
                  if (index < Math.floor(rating)) {
                    return (
                      <span key={index} className="text-yellow-500">
                        ★
                      </span>
                    );
                  } else if (
                    index < Math.floor(rating) + 1 &&
                    rating % 1 !== 0
                  ) {
                    return (
                      <span key={index} className="text-yellow-500">
                        ☆
                      </span>
                    );
                  }
                  return (
                    <span key={index} className="text-gray-300">
                      ★
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="ml-10 mt-4">
          <p>{content}</p>
          {user?._id === userId._id && (
            <span className="text-xs ml-2 cursor-pointer text-blue-400">
              <i className="fa-solid fa-pen" onClick={handleOpen}></i>
            </span>
          )}
          {reply.length > 0 && (
            <div className="mt-5">
              <button
                className="text-blue-500 flex items-center"
                onClick={toggleReplies}
              >
                {showReplies ? "Hide replies" : "View replies"}
                <FaAngleDown
                  className={`ml-2 mt-[0.5] transition-transform ${
                    showReplies ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showReplies && (
                <div className="ml-5 mt-2">
                  {reply.map((replyval, replyIndex) => (
                    <p key={replyIndex} className="text-gray-600">
                      {replyval}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <h5 className="text-lg font-bold">Update Review</h5>
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded-md"
                value={review}
                onChange={(e) => {
                  const val = e.target.value;
                  setReview(val);
                  if (val.trim() === "") {
                    setError("Review cannot be empty!");
                  } else {
                    setError("");
                  }
                }}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button className="text-red-500" onClick={handleOpen}>
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={handleUpdate}
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

export default ReviewCard;
