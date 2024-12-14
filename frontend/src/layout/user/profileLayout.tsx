import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { USER } from "../../config/constants/constants";
import {
  BookmarkIcon,
  BellIcon,
  LockClosedIcon,
  PowerIcon,
  UserCircleIcon,
  WalletIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { axiosInstance } from "../../config/api/axiosinstance";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/UserSlice";
import UserState from "../../redux/rootstate/UserState";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useSelector((state: UserState) => state.user.userdata);
  console.log(user)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    axiosInstance
      .get("http://localhost:3001/api/user/logout")
      .then(() => {
        dispatch(logout());
        navigate(`${USER.LOGIN}`);
      })
      .catch((error) => {
        console.log("Error logging out:", error);
      });
  };

  return (
    <div className="flex h-screen mt-20">
      {/* Sidebar */}
      <aside
        className={`fixed bg-white border-r border-gray-300 w-64 p-4 h-full transition-transform ${
          isSidebarOpen ? "translate-x-0 z-50" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {isSidebarOpen && (
          <button className="ml-50 text-black" onClick={toggleSidebar}>
            <FiX />
          </button>
        )}
        <nav>
          <ul className="space-y-2">
            {[{
                to: USER.PROFILE,
                icon: <UserCircleIcon className="w-5 h-5" />,
                label: "Profile",
              },
              {
                to: `${USER.PROFILE}${USER.CHANGE_PWD}`,
                icon: <LockClosedIcon className="w-5 h-5" />,
                label: "Change Password",
              },
            ].map(({ to, icon, label }) => (
              <NavLink
                key={label}
                to={to}
                className={`flex items-center p-2 rounded ${
                  pathname === to ? "bg-gray-300 text-gray-900" : "text-gray-700"
                }`}
              >
                {icon}
                <span className="ml-2">{label}</span>
              </NavLink>
            ))}

            {/* Booking Details Link */}
            <Link to={`${USER.PROFILE}${USER.BOOKING_DETAILS}`}>
              <li
                className={`flex items-center p-2 rounded text-sm ${
                  pathname === `${USER.PROFILE}${USER.BOOKING_DETAILS}`
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-700"
                }`}
              >
                <BookmarkIcon className="h-5 w-5" />
                <span className="ml-2">Booking Details</span>
              </li>
            </Link>


            <Link to={`${USER.PROFILE}${USER.INBOX}`}>
              <li
                className={`flex items-center p-2 rounded text-sm ${
                  pathname === `${USER.PROFILE}${USER.INBOX}`
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-700"
                }`}
              >
                <BellIcon className="h-5 w-5" />
                <span className="ml-2">Notifications</span>
              </li>
            </Link>

            <Link to={`${USER.CHAT}`}>
              <li
                className={`flex items-center p-2 rounded text-sm ${
                  pathname === `${USER.CHAT}`
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-700"
                }`}
              >
                 <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                <span className="ml-2">Chat</span>
              </li>
            </Link>

            <Link to={`${USER.PROFILE}${USER.WALLET}`}>
              <li
                className={`flex items-center p-2 rounded text-sm ${
                  pathname === `${USER.PROFILE}${USER.WALLET}`
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-700"
                }`}
              >
                 < WalletIcon className="h-5 w-5" />
                <span className="ml-2">Wallet</span>
              </li>
            </Link>

            <hr className="my-2 border-gray-300" />

            <button
              onClick={handleLogout}
              className="flex items-center p-2 rounded-lg bg-black text-white pl-2 pr-5 hover:bg-gray-800"
            >
              <PowerIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4">
        <header className="flex items-center justify-between p-4 bg-white shadow">
          <button onClick={toggleSidebar} className="text-gray-600 lg:hidden">
            <FiMenu />
          </button>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
