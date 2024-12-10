import { useSelector } from "react-redux";
import AdminRootState from "../../../redux/rootstate/AdminState";
import { axiosInstanceAdmin } from "../../../config/api/axiosinstance";
import { useEffect, useState } from "react";
import { AdminData } from "../../../types/adminTypes";
import { Payment } from "../../../types/commonTypes";
import Pagination from "../../../components/common/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

function Wallet() {
  const admin = useSelector((state: AdminRootState) => state.admin.admindata);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [adminData, setAdminData] = useState<AdminData>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage]);

  const formatDate = (createdAt: Date) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US");
  };

  const fetchPayments = async (page: number) => {
    axiosInstanceAdmin
      .get(`${BASE_URL}/api/admin/all-payment-details?page=${page}`, { withCredentials: true })
      .then((response) => {
        setPayments(response.data.payment);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching payments", error);
      });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    axiosInstanceAdmin
      .get(`${BASE_URL}/api/admin/load-admin-data?adminId=${admin?._id}`, { withCredentials: true })
      .then((response) => {
        setAdminData(response.data.adminData);
      })
      .catch((error) => {
        console.error("Error loading admin data", error);
      });
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 overflow-x-auto">
      <h1 className="text-2xl font-bold text-black my-4 md:my-10">Wallet</h1>
      
      <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 mx-auto max-w-md">
        <div className="border-b border-gray-700 pb-2 text-center">
          <p className="uppercase text-sm">Amount</p>
          <p className="text-3xl mt-2">₹{adminData?.wallet}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Payment ID</th>
              <th className="px-4 py-2 border-b">User</th>
              <th className="px-4 py-2 border-b">Vendor</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((item, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="px-4 py-2">{item._id}</td>
                <td className="px-4 py-2">{item?.userId?.name}</td>
                <td className="px-4 py-2">{item?.vendorId?.name}</td>
                <td className="px-4 py-2">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-2">{item?.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            isTable={true}
          />
        )}
      </div>
    </div>
  );
}

export default Wallet;
