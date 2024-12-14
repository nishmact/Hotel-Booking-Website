import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "../../../redux/slices/UserSlice";
import UserRootState from "../../../redux/rootstate/UserState";
import { validate } from "../../../validations/common/loginVal";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { USER } from "../../../config/constants/constants";

const client_id = import.meta.env.VITE_CLIENT_ID || "";
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface FormValues {
  email: string;
  password: string;
}

const initialValues: FormValues = {
  email: "",
  password: "",
};

const UserLogin = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const navigate = useNavigate();
  const dispatch = useDispatch();
console.log("user....",user)
  useEffect(() => {
    if (user) {
      navigate(USER.HOME);
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      axiosInstance
        .post(`${BASE_URL}/api/user/login`, values)
        .then((response) => {
          localStorage.setItem("userToken", response.data.token);
          localStorage.setItem("userRefresh", response.data.refreshToken);
          dispatch(setUserInfo(response.data.userData));
          toast.success("Successfully logged in...!");
          navigate(`${USER.HOME}`);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
        <GoogleOAuthProvider clientId={client_id}>
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">
              User - Sign In
            </h2>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={USER.FORGOT_PWD}
                  className="text-sm text-gray-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-800"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center text-black">
              <button>
                <GoogleLogin
                  type="standard"
                  theme="filled_black"
                  size="medium"
                  ux_mode="popup"
                  width={50}
                  onSuccess={(response) => {
                    axiosInstance
                      .post(
                        "http://localhost:3000/api/user/google/login",
                        response
                      )
                      .then((res) => {
                        if (res.data) {
                          dispatch(setUserInfo(res.data.userData));
                          toast.success("Successfully logged in!");
                          navigate(`${USER.HOME}`);
                        }
                      })
                      .catch((error) => {
                        toast.error(error.response.data.error);
                      });
                  }}
                />
              </button>
            </div>

            <p className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link to={USER.SIGNUP} className="text-gray-900 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default UserLogin;
