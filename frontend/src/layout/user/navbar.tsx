import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "../../config/api/axiosinstance";
import { logout } from "../../redux/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import { USER } from "../../config/constants/constants";
import UserRootState from "../../redux/rootstate/UserState";
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon from react-icons
const BASE_URL = import.meta.env.VITE_BASE_URL || "";
const NavbarComponent = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State to manage mobile menu toggle

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    axiosInstance
      .get(`${BASE_URL}/api/user/logout`)
      .then(() => {
        dispatch(logout());
        navigate(`${USER.LOGIN}`);
        setIsMobileMenuOpen(false); // Close mobile menu after logout
      })
      .catch((error) => {
        console.log("Logout error:", error);
      });
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false); // Close the mobile menu when an item is clicked
  };

  const navList = (
    <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
      <li>
        <Link
          to={USER.HOME}
          className={`p-2 font-bold ${
            isScrolled ? "text-white" : "text-black"
          } ${location.pathname === USER.HOME ? "underline" : ""}`}
          onClick={handleMenuClick}
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          to={USER.SEARCH}
          className={`p-2 font-bold ${
            isScrolled ? "text-white" : "text-black"
          } ${location.pathname === USER.SEARCH ? "underline" : ""}`}
          onClick={handleMenuClick}
        >
          Hotels
        </Link>
      </li>
      <li>
        <Link
          to={USER.ABOUT}
          className={`p-2 font-bold ${
            isScrolled ? "text-white" : "text-black"
          } ${location.pathname === USER.ABOUT ? "underline" : ""}`}
          onClick={handleMenuClick}
        >
          About
        </Link>
      </li>
      <li>
        <Link
          to={USER.CONTACT}
          className={`p-2 font-bold ${
            isScrolled ? "text-white" : "text-black"
          } ${location.pathname === USER.CONTACT ? "underline" : ""}`}
          onClick={handleMenuClick}
        >
          Contact
        </Link>
      </li>
    </ul>
  );

  return (
    <nav
      className={`w-full fixed z-10 px-4 py-3 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900 shadow-lg" // White 2px border and shadow on scroll
          : "bg-black-600 shadow-lg " // Dark 2px border without shadow when not scrolled
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to={USER.HOME} className="flex items-center gap-2">
          <img
            src={
              isScrolled
                ? "/imgs/blacklogo.jpg"
                : "/imgs/whitelogo.jpg"
            } // Change logo based on scroll state
            alt="DreamNest Logo"
            className="h-10 w-10" // Adjust the logo size as needed
          />
          <h1
            className={`text-2xl font-bold ${
              isScrolled ? "text-white" : "text-black"
            }`}
          >
            DreamNest
          </h1>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Toggle menu visibility
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex">{navList}</div>

        {/* Mobile Menu (shown when isMobileMenuOpen is true) */}
        <div
          className={`lg:hidden absolute top-16 left-0 w-full bg-blue-500 shadow-lg ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          {navList}

          {/* Profile and Logout buttons inside mobile menu */}
          <div className="flex flex-col items-center mt-4">
            {user ? (
              <>
                <Link to={`${USER.PROFILE}`} onClick={handleMenuClick}>
                  <img
                    className="w-8 h-8 rounded-full cursor-pointer"
                    src={user?.imageUrl || "/imgs/user-default.svg"}
                    alt={user?.name}
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className={`bg-transparent p-2 mt-2 hover:bg-white hover:text-blue-500 ${
                    isScrolled ? "text-white" : "text-black"
                  }`}
                >
                  <FaSignOutAlt className="text-xl" /> {/* Logout Icon */}
                </button>
              </>
            ) : (
              <>
                <Link to={USER.LOGIN} onClick={handleMenuClick}>
                  <button
                    className={`bg-transparent text-black p-2 hover:bg-white hover:text-gray-900 ${
                      isScrolled ? "text-white" : "text-black"
                    }`}
                  >
                    Login
                  </button>
                </Link>
                <Link to={USER.SIGNUP} onClick={handleMenuClick}>
                  <button
                    className={`bg-transparent text-black p-2 border-2 border-blue-500 hover:bg-white hover:text-blue-500 mt-2 ${
                      isScrolled ? "text-white" : "text-black"
                    }`}
                  >
                    Create account
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop profile and logout buttons */}
        <div className="hidden lg:flex gap-2">
          {user ? (
            <>
              <Link to={`${USER.PROFILE}`}>
                <img
                  className="w-8 h-8 rounded-full cursor-pointer"
                  src={user?.imageUrl || "/imgs/user-default.svg"}
                  alt={user?.name}
                />
              </Link>
              <button
                onClick={handleLogout}
                className={`bg-transparent text-black p-2 hover:bg-white hover:text-blue-500 ${
                  isScrolled ? "text-white" : "text-black"
                }`}
              >
                <FaSignOutAlt className="text-xl" /> {/* Logout Icon */}
              </button>
            </>
          ) : (
            <>
              <Link to={USER.LOGIN}>
                <button
                  className={`bg-transparent text-black p-2 hover:bg-white hover:text-gray-500 ${
                    isScrolled ? "text-white" : "text-black"
                  }`}
                >
                  Login
                </button>
              </Link>
              <Link to={USER.SIGNUP}>
                <button
                  className={`bg-transparent text-black p-2 border-2 border-gray-700 hover:bg-white hover:text-gray-500 ${
                    isScrolled ? "text-white" : "text-black"
                  }`}
                >
                  Create account
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;
