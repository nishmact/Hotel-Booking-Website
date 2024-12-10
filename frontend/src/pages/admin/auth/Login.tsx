import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstanceAdmin } from "../../../config/api/axiosinstance";
import { useSelector, useDispatch } from "react-redux";
import { setAdminInfo } from "../../../redux/slices/AdminSlice";
import AdminRootState from "../../../redux/rootstate/AdminState";
import { validate } from "../../../validations/common/loginVal";
import { ADMIN } from "../../../config/constants/constants";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface FormValues {
  email: string;
  password: string;
}

const initialValues: FormValues = {
  email: "",
  password: "",
};

const AdminLogin = () => {
  const admin = useSelector(
    (state: AdminRootState) => state.admin?.isAdminSignedIn
  );
  console.log("DAta..", admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (admin) {
      navigate(`${ADMIN.DASHBOAR}`);
    }
  }, []);

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      axiosInstanceAdmin
        .post(`${BASE_URL}/api/admin/login`, values)
        .then((response) => {
          console.log(response);
          console.log("Hoiiiii");
          console.log(response.data);
          localStorage.setItem("adminToken", response.data.token);
          localStorage.setItem("refreshToken", response.data.refreshToken);

          console.log(
            "Admin data received from API: ",
            response.data.adminData
          );
          dispatch(setAdminInfo(response.data.adminData));
          navigate(`${ADMIN.DASHBOAR}`);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
          console.log("here", error);
        });
    },
  });

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-gray-200 p-10 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black">Admin - Login</h2>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6">
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {formik.errors.email && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {formik.errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
