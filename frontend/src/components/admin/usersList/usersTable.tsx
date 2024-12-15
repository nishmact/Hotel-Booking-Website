import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { axiosInstanceAdmin } from "../../../config/api/axiosinstance";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateUserStatus } from "../../../redux/slices/UserSlice";
import { ADMIN } from "../../../config/constants/constants";
import { UserData } from "../../../types/userTypes";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const TABLE_HEAD = ["User", "Phone", "Status", "Action"];

const UsersTable = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState<UserData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get("page");
    const searchParam = queryParams.get("search");
    setPage(pageParam ? parseInt(pageParam, 10) : 1);
    setSearch(searchParam || "");
    fetchData(pageParam, searchParam);
  }, [location.search]);

  const fetchData = (pageParam?: string | null, searchParam?: string | null) => {
    axiosInstanceAdmin
      .get(`${BASE_URL}/api/admin/users?page=${pageParam || page}&search=${searchParam || search}`)
      .then((response) => {
        console.log("usrs...",response.data.users)
        setUsers(response.data.users);
        setTotalPages(Math.ceil(response.data.totalUsers / 6));
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  const handleBlock = (userId: string) => {
    axiosInstanceAdmin
      .patch(`${BASE_URL}/api/admin/block-unblock?userId=${userId}`)
      .then((response) => {
        const { process, message } = response.data;
  
       
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? { ...user, isActive: process !== "block" }
              : user
          )
        );
  
      
       dispatch(updateUserStatus({ userId, isActive: process !== "block" }));
  
        toast.success(message);
  
        if (process === "block") {
       
          navigate(`${ADMIN.USERS}`);
        }
      })
      .catch((error) => {
        console.error("Error blocking/unblocking user:", error);
      });
  };

  const handleSearch = () => {
    navigate(`${ADMIN.USERS}?page=${page}&search=${search}`);
  };

  return (
    <div className="w-full h-full bg-white shadow rounded-lg">
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Users List</h2>
            <p className="text-sm text-gray-500">See information about all members</p>
          </div>
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyUp={handleSearch}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <MagnifyingGlassIcon className="absolute top-2.5 left-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="px-4 py-2 text-sm font-medium text-gray-700">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                    <img
                        src={user.imageUrl || "/imgs/user-default.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-sm text-gray-700">{user.phone}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleBlock(user._id)}
                      className={`px-4 py-1 text-sm font-medium text-white rounded ${
                        user.isActive ? "bg-pink-500 hover:bg-pink-600" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {user.isActive ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="px-4 py-2 text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`${ADMIN.USERS}?page=${page - 1 > 0 ? page - 1 : 1}&search=${search}`)}
            className="px-4 py-1 text-sm font-medium text-pink-600 border border-pink-500 rounded hover:bg-pink-100"
          >
            Previous
          </button>
          <button
            onClick={() =>
              navigate(`${ADMIN.USERS}?page=${page + 1 <= totalPages! ? page + 1 : totalPages}&search=${search}`)
            }
            className="px-4 py-1 text-sm font-medium text-pink-600 border border-pink-500 rounded hover:bg-pink-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
