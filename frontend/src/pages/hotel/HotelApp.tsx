import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import HotelSignup from "./auth/HotelSignup";
import Dashboard from "./Dashboard";
import HotelVerifyEmail from "../common/HotelVerifyEmail";
import Profile from "./profile/profile";

function HotelApp() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <ToastContainer />
      <Toaster />
      <Routes>
        {/* Using constants for paths */}
        <Route path="/signup" element={<HotelSignup />} />
        <Route path="/verify" element={<HotelVerifyEmail />} />
        <Route
          index
          path="/dashboard"
          element={
            <>
              <Dashboard />
            </>
          }
        />

        <Route
          index
          path="/view-profile"
          element={
            <>
              <Profile />
            </>
          }
        />

        {/* Add other routes as needed */}
      </Routes>
    </>
  );
}

export default HotelApp;
