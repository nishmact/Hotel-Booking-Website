import { useEffect, useState } from "react";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { useSelector } from "react-redux";
import UserRootState from "../../../redux/rootstate/UserState";
import { Link } from "react-router-dom";
import Pagination from "../../common/Pagination";
import { USER } from "../../../config/constants/constants";
import { Booking } from "../../../types/commonTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const BookingDetails = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const fetchBookings = async (page: number) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/api/user/get-bookings?userId=${user?._id}&page=${page}`,
        { withCredentials: true }
      );
      console.log("booking datas.....", response.data.bookings);
      setBookings(response.data.bookings);
      const totalPagesFromResponse = response.data.totalPages;
      setTotalPages(totalPagesFromResponse);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {bookings.length === 0 ? (
        <div className="text-center mt-4">
          <h5 className="text-red-500">No bookings made!</h5>
        </div>
      ) : (
        <div className="rounded-sm border border-stroke mx-20 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto overflow-x-auto">
              <thead>
                <tr className="bg-gray-400 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Hotel
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    City
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    CheckIn
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    CheckOut
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Payment Status
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((item, key) => (
                  <tr key={key}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-pink-300 dark:text-white">
                        <Link
                          to={`${USER.VIEW_VENDOR}?id=${item?.vendorId?._id}`}
                        >
                          {item?.vendorId?.name}
                        </Link>
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item?.vendorId?.city}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(item.checkIn).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(item.checkOut).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          item.status === "Accepted"
                            ? "bg-green-200 text-green-500"
                            : item.status === "Rejected"
                            ? "bg-red-200 text-red-500"
                            : item.status === "Cancelled"
                            ? "bg-red-200 text-red-500"
                            : "bg-blue-200 text-blue-500"
                        }`}
                      >
                        {item.status}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          item.payment_status === "Completed"
                            ? "bg-green-200 text-green-400"
                            : item.payment_status === "Rejected"
                            ? "bg-red-200 text-red-400"
                            : "bg-blue-300 text-blue-400"
                        }`}
                      >
                        {item.payment_status}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <Link
                          to={`${USER.PROFILE}${USER.BOOKING}?id=${item._id}`}
                        >
                          <button className="hover:text-primary">
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                fill=""
                              />
                              <path
                                d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                isTable={true}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetails;
