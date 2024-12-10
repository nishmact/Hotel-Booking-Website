import { axiosInstance, axiosInstanceVendor } from "../../config/api/axiosinstance";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import {
  validateEmailValue,
  validateOTP,
} from "../../validations/common/forgotPassword";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { USER, VENDOR } from "../../config/constants/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

interface EmailValue {
  email: string;
}

const emailInitialValues: EmailValue = {
  email: "",
};

interface OTPValue {
  otp: string;
}

const otpInitialValues: OTPValue = {
  otp: "",
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpButtonClicked, setOtpButtonClicked] = useState(false);

  const startOtpTimer = () => {
    setOtpTimer(120);

    const countdown = setInterval(() => {
      setOtpTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    setTimeout(() => {
      clearInterval(countdown);
      setOtpTimer(0);
    }, 120000);
  };

  const formik = useFormik({
    initialValues: emailInitialValues,
    validate: validateEmailValue,
    onSubmit: (values) => {
      {
        location.pathname === VENDOR.FORGOT_PWD
          ? axiosInstanceVendor
              .post(`${BASE_URL}/api/vendor/vendor-getotp`, values, { withCredentials: true })
              .then((response) => {
                startOtpTimer();
                setOtpButtonClicked(true);
                console.log(response);
                toast.success(response.data.message);
              })
              .catch((error) => {
                toast.error(error.response.data.error);
                console.log("here", error);
              })
          : axiosInstance
              .post(`${BASE_URL}/api/user/getotp`, values, { withCredentials: true })
              .then((response) => {
                console.log(response);
                startOtpTimer();
                setOtpButtonClicked(true);
                toast.success(response.data.message);
              })
              .catch((error) => {
                toast.error(error.response.data.error);
                console.log("here", error);
              });
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: otpInitialValues,
    validate: validateOTP,
    onSubmit: (values) => {
      {
        location.pathname === VENDOR.FORGOT_PWD
          ? axiosInstanceVendor
              .post(`${BASE_URL}/api/vendor/verifyVendorotp`, values, { withCredentials: true })
              .then((response) => {
                console.log(response);
                toast.success(response.data.message);
                navigate(`${VENDOR.RESET_PWD}`);
              })
              .catch((error) => {
                toast.error(error.response.data.error);
                console.log("here", error);
              })
          : axiosInstance
              .post(`${BASE_URL}/api/user/verify-otp`, values, { withCredentials: true })
              .then((response) => {
                console.log(response);
                toast.success(response.data.message);
                navigate(`${USER.RESET_PWD}`);
              })
              .catch((error) => {
                toast.error(error.response.data.message);
                console.log("here", error);
              });
      }
    },
  });

  const handleResendOtp=async()=>{
    location.pathname === VENDOR.VERIFY
          ? axiosInstanceVendor
              .get(`${BASE_URL}/api/vendor/pwd-resendOtp`,{ withCredentials: true })
              .then((response) => {
                startOtpTimer();
                console.log(response);
                toast.success(response.data.message);
                
              })
              .catch((error) => {
                toast.error(error.response.data.message);
                console.log("here", error);
              })
          : axiosInstance
              .get(`${BASE_URL}/api/user/pwd-resendOtp`, { withCredentials: true })
              .then((response) => {
                startOtpTimer();
                console.log(response);
                toast.success(response.data.message);
              })
              .catch((error) => {
                toast.error(error.response.data.message);
                console.log("here", error);
              });
  }
  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start bg-gray-100 items-center justify-center ">
      <div className="w-full md:w-1/2 mt-10 md:mt-20 md:mb-20 mb-20">
        <div className="w-96  m-auto bg-white p-10">
          <div className="mt-10 rounded-none text-center">
            <h4 className="text-black text-4xl">Forgot Password</h4>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex items-center">
                <input
                  type="email"
                  name="email"
                  onChange={formik.handleChange}
                  className="w-full p-2 rounded bg-gray-100"
                  placeholder="Email"
                />
                <button
                  type="submit"
                  disabled={!!(otpButtonClicked && otpTimer > 0)}
                  className="ml-2 p-2 bg-blue-500 text-white rounded"
                >
                  OTP
                </button>
              </div>
              {formik.errors.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )}
              {otpButtonClicked && otpTimer > 0 && (
                <p className="text-sm text-red-500">
                  Resend OTP in {otpTimer}s
                </p>
              )}
              {otpButtonClicked && otpTimer === 0 && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-blue-500 text-sm"
                >
                  Resend OTP
                </button>
              )}
            </form>

            <form onSubmit={otpFormik.handleSubmit}>
              <input
                type="text"
                name="otp"
                onChange={otpFormik.handleChange}
                className="w-full p-2 rounded bg-gray-100"
                placeholder="Enter OTP"
              />
              {otpFormik.errors.otp && (
                <p className="text-sm text-red-500">{otpFormik.errors.otp}</p>
              )}

              <button
                type="submit"
                className="mt-3 w-full p-2 bg-blue-500 text-white rounded"
              >
                Verify OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
