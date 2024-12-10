import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HOTEL, VENDOR } from "../../config/constants/constants";
import { useSelector } from "react-redux";
import VendorRootState from "../../redux/rootstate/VendorState";



interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = window.location;
  const navigate = useNavigate();

  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );

  useEffect(() => {
  if (!vendor) {
     navigate(`${VENDOR.LOGIN}`);
   }
  }, [vendor, navigate]);
  // State to control dropdown visibility
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);


  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full bg-blue-900 h-16 text-white p-4 flex justify-between items-center z-10 shadow-lg">
        <span className="font-bold text-2xl ">DreamNest</span>
      </header>

      <div className="flex flex-1">
        <nav className="w-64 bg-white h-full p-5 pt-10 shadow-lg">
          <aside>
            <div className="py-1">
              <NavLink
                to={HOTEL.DASHBOARD}
                className={`block py-3 transition-colors duration-300 
                  ${pathname.includes("dashboard") ? "bg-gray-300 rounded-lg p-5" : ""}
                  hover:bg-gray-200`}
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
                    pathname.includes("profile") ? "bg-gray-300 rounded-lg" : ""
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
                      to={HOTEL.VIEW_PROFILE}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      View Profile
                    </NavLink>
                    <NavLink
                      to={HOTEL.EDIT_PROFILE}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      Edit Profile
                    </NavLink>
                    <NavLink
                      to={VENDOR.CHANGE_PWD}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      Change Password
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to={VENDOR.BOOKING_HISTORY}
                className={`block py-3 ${pathname.includes("review") ? "bg-gray-300 rounded-lg" : ""}
                hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-solid fa-history mr-2"></i> Booking
                </div>
              </NavLink>

              <NavLink
                to={VENDOR.REVIEWS}
                className={`block py-3 ${pathname.includes("review") ? "bg-gray-300 rounded-lg" : ""}
                hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-regular fa-star mr-2"></i> Reviews
                </div>
              </NavLink>

              <NavLink
                to={VENDOR.NOTIFICATIONS}
                className={`block py-3 ${pathname.includes("notifications") ? "bg-gray-300 rounded-lg" : ""}
                hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-regular fa-bell mr-2"></i> Notifications
                </div>
              </NavLink>

              <NavLink
                to={VENDOR.CHAT}
                className={`block py-3 ${pathname.includes("chat") ? "bg-gray-300 rounded-lg" : ""}
                hover:bg-gray-200 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <i className="fa-regular fa-message mr-2"></i> Chat
                </div>
              </NavLink>

              <hr className="my-2 border-blue-gray-50" />

              
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
