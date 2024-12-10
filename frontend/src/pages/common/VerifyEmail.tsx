import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  axiosInstance,
  axiosInstanceVendor,
} from "../../config/api/axiosinstance";
import { setUserInfo } from "../../redux/slices/UserSlice";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { validate } from "../../validations/common/otpValidation";
import { USER, VENDOR } from "../../config/constants/constants";
import { setVendorInfo } from "../../redux/slices/VendorSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface FormValues {
  otp: string;
}

const initialValues: FormValues = {
  otp: "",
};

const VerifyEmail = () => {
  const location = useLocation();
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (isTimerActive) {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [isTimerActive]);

  useEffect(() => {
    startTimer();
  }, []);

  const startTimer = () => {
    setTimer(120);
    setIsTimerActive(true);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      {
        location.pathname === VENDOR.VERIFY
          ? axiosInstanceVendor
              .post(`${BASE_URL}/api/vendor/verify`, values, {
                withCredentials: true,
              })
              .then((response) => {
                console.log(response.data);
                dispatch(setVendorInfo(response.data.vendor));
                toast.success("Successfully registered..!");
                navigate(`${VENDOR.DASHBOARD}`);
              })
              .catch((error) => {
                toast.error(error.response.data.message);
                console.log("here", error);
              })
          : axiosInstance
              .post(`${BASE_URL}/api/user/verify`, values, {
                withCredentials: true,
              })
              .then((response) => {
                console.log(response);
                dispatch(setUserInfo(response.data.user));
                toast.success("Successfully registered..!");
                navigate(`${USER.HOME}`);
              })
              .catch((error) => {
                toast.error(error.response.data.message);
                console.log("here", error);
              });
      }
    },
  });

  const handleResendOtp = async () => {
    location.pathname === VENDOR.VERIFY
      ? axiosInstanceVendor
          .get(`${BASE_URL}/api/vendor/resendOtp`, { withCredentials: true })
          .then((response) => {
            startTimer();
            console.log(response);
            toast.success(response.data.message);
          })
          .catch((error) => {
            toast.error(error.response.data.error);
            console.log("here", error);
          })
      : axiosInstance
          .get(`${BASE_URL}/api/user/resendOtp`, { withCredentials: true })
          .then((response) => {
            startTimer();
            console.log(response);
            toast.success(response.data.message);
          })
          .catch((error) => {
            toast.error(error.response.data.error);
            console.log("here", error);
          });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
          <p className="text-gray-600 mb-4">Enter the OTP sent to your email</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-gray-700 font-medium mb-1"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formik.values.otp}
              onChange={formik.handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formik.errors.otp && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.otp}</p>
            )}
          </div>

          {timer > 0 ? (
            <p className="text-gray-500 text-sm">Resend OTP in {timer}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-blue-500 hover:underline text-sm"
            >
              Resend OTP
            </button>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Verify and Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
