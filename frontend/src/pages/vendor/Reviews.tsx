import { useEffect, useState, FormEvent } from "react";
import { useSelector } from "react-redux";
import VendorRootState from "../../redux/rootstate/VendorState";
import Layout from "../../layout/vendor/Layout";
import { axiosInstanceVendor } from "../../config/api/axiosinstance";
import { toast } from "react-toastify";
import { FaAngleDown } from "react-icons/fa";
import Pagination from "../../components/common/Pagination";
import { Review } from "../../types/commonTypes";
import { format } from "timeago.js";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export const Reviews = () => {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );

  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [replyVisibility, setReplyVisibility] = useState<Record<string, boolean>>({}); // New state

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  const fetchReviews = async (page: number) => {
    try {
      const response = await axiosInstanceVendor.get(
        `${BASE_URL}/api/vendor/getReviews?vendorId=${vendor?._id}&page=${page}`,
        { withCredentials: true }
      );
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching reviews", error);
    }
  };

  useEffect(() => {
    axiosInstanceVendor
      .get(`${BASE_URL}/api/vendor/reviews/statistics?vendorId=${vendor?._id}`)
      .then((res) => setStats(res.data.percentages))
      .catch((error) => console.error(error));
  }, []);

  const handleOpen = (reviewId: string) => {
    setCurrentReviewId(reviewId);
    setOpen(true);
  };

  const handleReplySubmit = async (
    e: FormEvent<HTMLFormElement>,
    reviewId: string
  ) => {
    e.preventDefault();
    try {
      const response = await axiosInstanceVendor.put(
        `${BASE_URL}/api/vendor/add-review-reply?&reviewId=${reviewId}`,
        { content },
        { withCredentials: true }
      );
      if (response.data.vendorData) {
        setOpen(false);
        toast.success("Reply added Successfully!");
        fetchReviews(currentPage); // Refresh reviews after adding a reply
      }
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const toggleReplies = (reviewId: string) => {
    setReplyVisibility((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId], // Toggle visibility
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="bg-white p-10">
        {reviews.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row justify-between gap-2 m-10">
              <div className="flex flex-col items-start w-full">
                <h2 className="text-2xl font-bold">Customer reviews & ratings</h2>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-yellow-500">
                    {"⭐".repeat(Math.ceil(vendor?.totalRating || 0))}
                  </div>
                  <p className="ms-2 text-sm text-gray-500"></p>
                </div>
              </div>

              <div className="w-full mt-4">
                {[5, 4, 3, 2, 1].map((rating, idx) => (
                  <div className="flex items-center mt-2" key={idx}>
                    <span className="text-sm text-blue-600">{rating} star</span>
                    <div className="w-2/4 h-2 mx-4 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-yellow-500 rounded"
                        style={{ width: `${stats[5 - rating] || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stats[5 - rating] || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {reviews.map((review, index) => (
              <div key={index} className="m-10">
                <hr className="border-gray-300" />
                <div className="flex flex-col md:flex-row gap-8 mt-6">
                  <div className="md:w-1/2">
                    <h3 className="font-bold">{review.userId.name}</h3>
                    <div className="text-yellow-500 mt-1">
                      {"⭐".repeat(review.rating)}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {format(review.createdAt)}
                    </p>
                    <p className="text-gray-700 mt-2">{review.content}</p>
                  </div>
                  <div className="md:w-1/2">
                    <button
                      className="text-sm text-blue-600 flex items-center"
                      onClick={() => toggleReplies(review._id)}
                    >
                      {replyVisibility[review._id] ? "Hide replies" : "View replies"}
                      <FaAngleDown
                        className={`ml-1 transform ${
                          replyVisibility[review._id] ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    {replyVisibility[review._id] &&
                      review.reply?.map((reply, idx) => (
                        <p key={idx} className="text-gray-600 text-sm mt-2">
                          {reply}
                        </p>
                      ))}
                  </div>
                  <button
                    onClick={() => handleOpen(review._id)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Give Reply
                  </button>
                </div>
              </div>
            ))}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              isTable={false}
            />
          </>
        ) : (
          <p className="text-center text-red-500 mt-4">No reviews added yet!</p>
        )}

        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Add Reply</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReplySubmit(e, currentReviewId);
                }}
              >
                <textarea
                  className="w-full p-2 border rounded mb-4"
                  rows={4}
                  placeholder="Type your reply"
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
