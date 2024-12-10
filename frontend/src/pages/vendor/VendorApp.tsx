import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { Toaster } from "react-hot-toast";
import VendorSignupForm from "./auth/Signup";
import { ToastContainer } from "react-toastify";
import VerifyEmail from "../common/VerifyEmail";
import ForgotPassword from "../common/ForgotPassword";
import VendorLoginForm from "./auth/Login";
import ResetPassword from "../common/ResetPassword";
import Profile from "./profile/Profile";
import EditProfile from "./profile/EditProfile";
import BookingHistory from "./Booking/BookingHistory";
import ViewBooking from "./Booking/ViewBooking";
import AddRooms from "./profile/AddRooms";
import EditRoom from "./profile/EditRoom";
import Chat from "./Chat";
import { Reviews } from "./Reviews";
import Dashboar from "./Dashboar";
import Notifications from "./Notifications";

function VendorApp() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader message="Please wait" />
  ) : (
    <>
      <ToastContainer />
      <Toaster />
      <Routes>
        <Route
          path="/signup"
          element={
            <>
              <VendorSignupForm />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <VendorLoginForm />
            </>
          }
        />

        <Route
          path="/chat"
          element={
            <>
              <Chat />
            </>
          }
        />

        <Route
          path="/verify"
          element={
            <>
              <VerifyEmail />
            </>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <>
              <ForgotPassword />
            </>
          }
        />

        <Route
          path="/reset-password"
          element={
            <>
              <ResetPassword />
            </>
          }
        />

        <Route
          index
          path="/reviews"
          element={
            <>
              <Reviews />
            </>
          }
        />

        <Route
          index
          path="/notifications"
          element={
            <>
              <Notifications />
            </>
          }
        />

        <Route
          index
          path="/dashboard"
          element={
            <>
              <Dashboar />
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

        <Route
          index
          path="/edit-profile"
          element={
            <>
              <EditProfile />
            </>
          }
        />

        <Route
          index
          path="/edit-room/:roomId"
          element={
            <>
              <EditRoom />
            </>
          }
        />

        <Route
          index
          path="/add-rooms"
          element={
            <>
              <AddRooms />
            </>
          }
        />

        <Route
          index
          path="/booking-history"
          element={
            <>
              <BookingHistory />
            </>
          }
        />

        <Route
          index
          path="/view-booking"
          element={
            <>
              <ViewBooking />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default VendorApp;
