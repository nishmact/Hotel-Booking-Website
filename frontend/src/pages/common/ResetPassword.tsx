import { useFormik } from "formik";
import { toast } from "react-toastify";
import { validate } from "../../validations/common/resetPassword";
import { axiosInstance, axiosInstanceVendor } from "../../config/api/axiosinstance";
import { useNavigate } from "react-router-dom";
import { USER, VENDOR } from "../../config/constants/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

interface FormValues {
  password: string;
  confirm_password: string;
}

const initialValues: FormValues = {
  password: "",
  confirm_password: "",
};

const ResetPassword = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values: unknown) => {
      console.log(values);
      {
        location.pathname === VENDOR.RESET_PWD
          ? axiosInstanceVendor
              .post(`${BASE_URL}/api/vendor/reset-password`, values, { withCredentials: true })
              .then((response) => {
                
                toast.success(response.data.message);
                navigate(`${VENDOR.LOGIN}`);
              })
              .catch((error) => {
                toast.error(error.response.data.error);
                console.log("here", error);
              })
          : axiosInstance
              .post(`${BASE_URL}/api/user/reset-password`, values, { withCredentials: true })
              .then((response) => {
                console.log(response);
                toast.success(response.data.message);
                navigate(`${USER.LOGIN}`);
              })
              .catch((error) => {
                toast.error(error.response.data.error);
                console.log("here", error);
              });
      }
    },
  });
  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start items-center justify-center bg-gray-100">
      {/* Right Section with Form */}
      <div className="w-full md:w-1/2  md:mt-20 md:mb-20 mb-20">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-6">
            Reset Password
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                New Password
              </label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                onChange={formik.handleChange}
                value={formik.values.password}
                name="password"
              />
              {formik.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium"
              >
                Confirm Password
              </label>
              <input
                id="confirm_password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                onChange={formik.handleChange}
                value={formik.values.confirm_password}
                name="confirm_password"
              />
              {formik.errors.confirm_password && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.confirm_password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
