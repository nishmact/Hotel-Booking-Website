// App.tsx
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarComponent from "./layout/user/navbar";
import UserLogin from "./pages/user/auth/Login";
import UserSignup from "./pages/user/auth/UserSignup";
import Home from "./pages/home/Home";
import UserPrivateRoute from "./pages/user/UserPrivateRoute";
import VerifyEmail from "./pages/common/VerifyEmail";
import ForgotPassword from "./pages/common/ForgotPassword";
import ResetPassword from "./pages/common/ResetPassword";
import { USER } from "./config/constants/constants";
import { Toaster } from "react-hot-toast";
import Loader from "./components/common/Loader";
import Search from "./pages/home/Search";
import Layout from "./layout/user/Layout";
import Detail from "./pages/home/Detail";
import Profile from "./pages/user/profile/Profile";
import PaymentSuccess from "./pages/home/PaymentSuccess";
import About from "./pages/home/About";
import Chat from "./pages/user/profile/Chat";
import Contact from "./pages/home/Contact";

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster />
      <ToastContainer />
      {!(
        pathname == USER.LOGIN ||
        pathname == USER.SIGNUP ||
        pathname == USER.VERIFY ||
        pathname.includes(USER.FORGOT_PWD) ||
        pathname.includes(USER.RESET_PWD)
      ) && (
        <div className="fixed top-0 left-0 w-full z-10 ">
          <NavbarComponent />
        </div>
      )}

      <Routes>
        <Route path="" element={<UserPrivateRoute />}>
          <Route path={USER.HOME} element={<Home />} />
          <Route path="/user-profile" element={<Profile />} />
          <Route
            path="/search"
            element={
              <Layout>
                <Search />
              </Layout>
            }
          />
          <Route
            path="/detail/:hotelId/:roomId"
            element={
              <Layout>
                <Detail />
              </Layout>
            }
          />
          <Route path={`${USER.PROFILE}/*`} element={<Profile />} />
          <Route path={USER.ABOUT} element={<About />} />
          <Route path={USER.CONTACT} element={<Contact/>} />
          <Route path={USER.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
          <Route path={USER.CHAT} element={<Chat />} />
        </Route>

        <Route path={USER.LOGIN} element={<UserLogin />} />
        <Route path={USER.VERIFY} element={<VerifyEmail />} />
        <Route path={USER.FORGOT_PWD} element={<ForgotPassword />} />
        <Route path={USER.RESET_PWD} element={<ResetPassword />} />
        <Route path={USER.SIGNUP} element={<UserSignup />} />
      </Routes>
    </>
  );
};

export default App;
