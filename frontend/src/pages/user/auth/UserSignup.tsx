import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import UserRootState from "../../../redux/rootstate/UserState";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { toast } from "react-toastify";
import { validate } from "../../../validations/user/userRegisterVal";
import { USER } from "../../../config/constants/constants";

const client_id = import.meta.env.VITE_CLIENT_ID || "";
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface UserFormValues {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirm_password: string;
}

const initialValues: UserFormValues = {
  email: "",
  password: "",
  name: "",
  phone: "",
  confirm_password: "",
};

const UserSignup = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<UserFormValues>(initialValues);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(USER.HOME);
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      try {
        const response = await axiosInstance.post(
          `${BASE_URL}/api/user/signup`,
          formValues,
          { withCredentials: true }
        );
        if (response.data.email) {
          toast.success(response.data.message);
          navigate(`${USER.VERIFY}`);
        }
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 ">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md pt-16">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Sign Up for DreamNest
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Create an account to book the best hotels!
        </p>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.name && (
              <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.email && (
              <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.phone && (
              <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formValues.confirm_password}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.confirm_password && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.confirm_password}
              </p>
            )}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            Sign Up
          </button>
        </form>

        {/* Google Sign Up Button */}
        <div className="mt-4">
          <GoogleOAuthProvider clientId={client_id}>
            <GoogleLogin
              theme="outline"
              type="standard"
              size="medium"
              ux_mode="popup"
              onSuccess={(response) => {
                axiosInstance
                  .post(
                    `${BASE_URL}/api/user/google/register`,
                    response
                  )
                  .then((res) => {
                    if (res.data.message) {
                      toast.success(res.data.message);
                      navigate(`${USER.LOGIN}`);
                    }
                  })
                  .catch((error) => {
                    toast.error(error.response.data.error);
                  });
              }}
            />
          </GoogleOAuthProvider>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-gray-900 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;
