import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { ADMIN } from "../../config/constants/constants";
import { PowerIcon } from "@heroicons/react/24/outline";
import { axiosInstanceAdmin } from "../../config/api/axiosinstance";
import { logout } from "../../redux/slices/AdminSlice";
import { useDispatch } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const path = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    axiosInstanceAdmin
      .get(`${BASE_URL}/api/admin/logout`)
      .then(() => {
        dispatch(logout());
        navigate(`${ADMIN.LOGIN}`);
      })
      .catch((error) => {
        console.log("here", error);
      });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed top navbar */}
      <header className="w-full bg-black h-16 text-white p-4 flex justify-between items-center z-10">
        <button className="text-2xl p-2 sm:hidden" onClick={toggleSidebar}>
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <span className="font-bold">Admin Panel</span>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav
          className={`bg-white h-full p-4 w-60 transition-transform border-r border-gray-300 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"} 
          sm:translate-x-0`}
        >
          <div className="py-1">
            {/* Dashboard Link */}
            <NavLink
              to={ADMIN.DASHBOAR}
              className={`block py-3 transition-colors duration-300 p-2
                ${
                  path.pathname === ADMIN.DASHBOAR
                    ? "bg-gray-300 rounded-lg p-3"
                    : ""
                }
                hover:bg-gray-200`}
            >
              <div className="flex items-center">
                <i className="fa-solid fa-chart-line mr-2"></i>
                Dashboard
              </div>
            </NavLink>

            {/* Users Link */}
            <NavLink
              to={ADMIN.USERS}
              className={`block py-3 transition-colors duration-300 p-2 
                ${path.pathname === ADMIN.USERS ? "bg-gray-300 rounded-md" : ""}
                hover:bg-gray-200 rounded-md`}
            >
              <div className="flex items-center">
                <i className="fa-solid fa-users mr-2"></i>
                Users
              </div>
            </NavLink>

            <NavLink
              to={ADMIN.VENDORS}
              className={`block py-3 transition-colors duration-300 p-2 
                ${
                  path.pathname === ADMIN.VENDORS
                    ? "bg-gray-300 rounded-md"
                    : ""
                }
                hover:bg-gray-200 rounded-md`}
            >
              <div className="flex items-center">
                <i className="fa-solid fa-users mr-2"></i>
                Vendors
              </div>
            </NavLink>

            <NavLink
              to={ADMIN.BOOKINGS}
              className={`block py-3 transition-colors duration-300 p-2 
    ${path.pathname === ADMIN.BOOKINGS ? "bg-gray-300 rounded-md" : ""}
    hover:bg-gray-200 rounded-md`}
            >
              <div className="flex items-center">
                <i className="fa-solid fa-calendar-check mr-2"></i>
                Bookings
              </div>
            </NavLink>

            <NavLink
              to={ADMIN.INBOX}
              className={`block py-3 transition-colors duration-300 p-2 
   ${path.pathname === ADMIN.INBOX ? "bg-gray-300 rounded-md" : ""}
    hover:bg-gray-200 rounded-md`}
            >
              <div className="flex items-center">
                <i className="fa-solid fa-bell mr-2"></i>{" "}
                {/* Bell icon for notifications */}
                Notifications
              </div>
            </NavLink>

            <NavLink
              to={ADMIN.WALLET}
              className={`block py-3 transition-colors duration-300 p-2 
               ${path.pathname === ADMIN.WALLET ? "bg-gray-300 rounded-md" : ""}
                hover:bg-gray-200 rounded-md`}
            >
              <div className="flex items-center">
                <i className="fa-solid fa-wallet mr-2"></i>
                Wallet
              </div>
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center p-2 rounded-lg bg-black text-white pl-2 pr-5 mt-4 gap-2 hover:bg-gray-800"
            >
              <PowerIcon className="w-4 h-5 text-white" />
              <span className="text-white text-lg">Logout</span>
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-grow p-4 bg-gray-100 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
