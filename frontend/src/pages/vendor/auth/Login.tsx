import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstanceVendor } from "../../../config/api/axiosinstance";
import { useSelector, useDispatch } from "react-redux";
import { setVendorInfo } from "../../../redux/slices/VendorSlice";
import VendorRootState from "../../../redux/rootstate/VendorState";
import { useFormik } from "formik";
import { validate } from "../../../validations/common/loginVal";
import { toast } from "react-toastify";
import { USER, VENDOR } from "../../../config/constants/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface FormValues {
  email: string;
  password: string;
}

const initialValues: FormValues = {
  email: "",
  password: "",
};

const VendorLoginForm = () => {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );

  console.log("vendor.....",vendor)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (vendor) {
      navigate(`${VENDOR.DASHBOARD}`);
    }
  }, [vendor, navigate]);

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      axiosInstanceVendor
        .post(`${BASE_URL}/api/vendor/login`, values)
        .then((response) => {
          console.log(response);
          toast.success("Successfully logged in!");
          localStorage.setItem("vendorToken", response.data.token);
          localStorage.setItem("vendorRefresh", response.data.refreshToken);
          dispatch(setVendorInfo(response.data.vendorData));
          navigate(`${VENDOR.DASHBOARD}`);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
          console.log("here", error);
        });
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      {/* Form Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md pt-10 ">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Vendor - Sign In
        </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                {formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                />
                {formik.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <Link to={VENDOR.FORGOT_PWD} className="text-sm text-black hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div>
            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link to={VENDOR.SIGNUP} className="text-black hover:underline">
                Sign up
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-gray-500">
              Are you a user?{" "}
              <Link to={USER.LOGIN} className="text-black hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
   
  );
};

export default VendorLoginForm;
