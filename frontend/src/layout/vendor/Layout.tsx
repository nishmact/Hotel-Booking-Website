import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { VENDOR } from "../../config/constants/constants";
import { axiosInstanceVendor } from "../../config/api/axiosinstance";
import { logout } from "../../redux/slices/VendorSlice";
import { useDispatch, useSelector } from "react-redux";
import VendorRootState from "../../redux/rootstate/VendorState";
import { PowerIcon } from "@heroicons/react/24/outline";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );

  const { pathname } = window.location;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!vendor) {
      navigate(`${VENDOR.LOGIN}`);
    }
  }, [vendor, navigate]);

  // State to control dropdown visibility
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile menu toggle

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    axiosInstanceVendor
      .get(`${BASE_URL}/api/vendor/logout`)
      .then(() => {
        dispatch(logout());
        navigate(`${VENDOR.LOGIN}`);
      })
      .catch((error) => {
        console.log("here", error);
      });
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility for mobile screens
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full bg-gray-900 h-16 text-white p-4 flex justify-between items-center z-10 shadow-lg">
        <span className="font-bold text-2xl">DreamNest</span>
        <button
          onClick={toggleSidebar}
          className="block lg:hidden text-white"
        >
          <i className={`fa-solid ${isSidebarOpen ? "fa-times" : "fa-bars"}`} />
        </button>
      </header>

      <div className="flex flex-1">
        <nav
          className={`w-64 bg-white h-full p-5 pt-10 shadow-lg lg:block ${isSidebarOpen ? "block" : "hidden"} lg:flex`}
        >
          <aside>
            <div className="py-1">
              <NavLink
                to={VENDOR.DASHBOARD}
                className={`block py-3 transition-colors duration-300 ${
                  pathname.includes("dashboar") ? "bg-gray-300 rounded-lg p-5" : ""
                } hover:bg-gray-200`}
              >
                <div className="flex items-center">
                  <i className="fa-solid fa-chart-line mr-2"></i> Dashboard
                </div>
              </NavLink>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className={`block py-3 w-full text-left ${
                    pathname.includes("profile") ? "bg-gray-300 rounded-lg p-5 mr-2" : ""
                  } hover:bg-gray-200 transition-colors duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i className="fa-regular fa-user mr-2"></i> Profile
                    </div>
                    <i
                      className={`fa-solid fa-chevron-down transition-transform ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    ></i>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute left-0 w-full bg-gray-100 rounded-lg mt-2 shadow-lg z-10">
                    <NavLink
                      to={VENDOR.VIEW_PROFILE}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      View Profile
                    </NavLink>
                    <NavLink
                      to={VENDOR.ADD_ROOMS}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      Add Details
                    </NavLink>
                    <NavLink
                      to={VENDOR.EDIT_PROFILE}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      Edit Profile
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to={VENDOR.BOOKING_HISTORY}
                className={`block py-3 ${
                  pathname.includes("booking") ? "bg-gray-300 rounded-lg p-4" : ""
                } hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-solid fa-history mr-2"></i> Booking
                </div>
              </NavLink>

              <NavLink
                to={VENDOR.REVIEWS}
                className={`block py-3 ${
                  pathname.includes("review") ? "bg-gray-300 rounded-lg p-4" : ""
                } hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-regular fa-star mr-2"></i> Reviews
                </div>
              </NavLink>

              <NavLink
                to={VENDOR.NOTIFICATIONS}
                className={`block py-3 ${
                  pathname.includes("notifications") ? "bg-gray-300 rounded-lg p-4" : ""
                } hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-regular fa-bell mr-2"></i> Notifications
                </div>
              </NavLink>

              <NavLink
                to={VENDOR.CHAT}
                className={`block py-3 ${
                  pathname.includes("chat") ? "bg-gray-300 rounded-lg p-4" : ""
                } hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-regular fa-message mr-2"></i> Chat
                </div>
              </NavLink>

              <hr className="my-2 border-blue-gray-50" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 py-2 w-full bg-gray-900 text-white rounded-lg px-4 hover:bg-gray-800 transition duration-300 ease-in-out"
              >
              
              <PowerIcon className="w-4 h-5 text-white" />
              <span className="text-white text-lg">Logout</span>
              </button>
            </div>
          </aside>
        </nav>

        <main className="flex-1 overflow-auto p-4 bg-blue-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
