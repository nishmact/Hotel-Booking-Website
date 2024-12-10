import { useState, useEffect } from "react";
import { axiosInstanceAdmin } from "../../../config/api/axiosinstance";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const TABLE_HEAD = ["User", "Hotel", "CheckIn", "CheckOut", "Status"];

const UsersTable = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const fetchBookings = (currentPage: number) => {
    const url = `${BASE_URL}/api/admin/bookings?page=${currentPage}`;

    axiosInstanceAdmin
      .get(url)
      .then((response) => {
        console.log("API Response:", response.data);
        setBookings(response.data.bookings);
        setTotalPages(Math.ceil(response.data.totalBookings / 6)); // Assuming 6 items per page
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="w-full">
      {/* Bookings Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="p-4 border-b border-gray-200 text-left text-gray-600 font-medium"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(bookings) && bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {booking.userId?.name || "Unknown User"}
                        </p>
                        <p className="text-gray-600">{booking.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {booking.vendorId?.name || "Unknown User"}
                        </p>
                        <p className="text-gray-600">
                          {booking.vendorId?.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <p className="text-gray-800">
                      {booking.checkIn
                        ? new Date(booking.checkIn).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <p className="text-gray-800">
                      {booking.checkOut
                        ? new Date(booking.checkOut).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Unknown"}
                    </p>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${
                        booking.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="p-4 text-center">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className={`px-4 py-1 text-sm font-medium text-white rounded ${
              page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-pink-500"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-4 py-1 text-sm font-medium text-white rounded ${
              page === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-pink-500"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
