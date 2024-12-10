import { useSelector } from "react-redux";
import UserRootState from "../../../redux/rootstate/UserState";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../../config/api/axiosinstance";
import Pagination from "../../common/Pagination";
import { Booking } from "../../../types/commonTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const Wallet = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [transaction, setTransaction] = useState<Booking[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    setTran(currentPage);
  }, [currentPage]);

  const setTran = async (page: number) => {
    try {
      axiosInstance
        .get(`${BASE_URL}/api/user/all-transaction-details?userId=${user?._id}&page=${page}`, {
          withCredentials: true,
        })
        .then((response) => {
          setTransaction(response.data.transaction);
          const totalPagesFromResponse = response.data.totalPages;
          setTotalPages(totalPagesFromResponse);
          const transactions = response.data.transaction;
          const total = transactions.reduce((sum: number, transaction: Booking) => {
            return sum + (transaction.refundAmount || 0);
          }, 0);

          setTotalAmount(total);
        })
        .catch((error) => {
          console.error("Error fetching transactions:", error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {user?.name}'s Wallet
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Balance:</p>
            <p className="text-xl font-bold text-gray-800">{totalAmount}</p>
          </div>
        </div>
      </div>

      {totalAmount > 0 ? (
        <div className="mx-20 mt-5 bg-white border rounded shadow p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-4 px-4 font-medium text-gray-800">Hotel</th>
                  <th className="py-4 px-4 font-medium text-gray-800">City</th>
                  <th className="py-4 px-4 font-medium text-gray-800">Mobile</th>
                  <th className="py-4 px-4 font-medium text-gray-800">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transaction.map((item, key) => (
                  <tr key={key} className="border-b">
                    <td className="py-4 px-4 text-gray-800">
                      {item?.vendorId ? item?.vendorId?.name : ""}
                    </td>
                    <td className="py-4 px-4 text-gray-800">{item?.vendorId?.city}</td>
                    <td className="py-4 px-4 text-gray-800">{item?.vendorId?.phone}</td>
                    <td className="py-4 px-4 text-gray-800">
                      {item?.refundAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transaction.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                isTable={true}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center mt-4 text-red-600 text-xl">
          No transactions made!
        </div>
      )}
    </>
  );
};

export default Wallet;
