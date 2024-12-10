import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { validate } from "../../../validations/common/changePwdValidation";
import { useSelector } from "react-redux";
import UserRootState from "../../../redux/rootstate/UserState";
import { useState } from "react";
import { USER } from "../../../config/constants/constants";
import { axiosInstance } from "../../../config/api/axiosinstance";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface FormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const initialValues: FormValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const ChangePassword = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<FormValues>(initialValues);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      try {
        await axiosInstance.post(
          `${BASE_URL}/api/user/update-password?userid=${user?._id}`,
          formValues,
          { withCredentials: true }
        );
        toast.success("Password updated Successfully!");
        setFormValues(initialValues);
        setFormErrors(initialValues);
        navigate(`${USER.PROFILE}`);
      } catch (error) {
        //toast.error(error.response?.data?.message || "Error updating password");
        console.log("here", error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Change Password</h2>
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="current_password"
          >
            Current Password
          </label>
          <input
            type="password"
            name="current_password"
            id="current_password"
            className={`mt-1 p-2 border ${
              formErrors.current_password ? "border-red-500" : "border-gray-300"
            } rounded-md w-full`}
            onChange={handleChange}
            value={formValues.current_password}
          />
          {formErrors.current_password && (
            <p className="text-red-500 text-sm">
              {formErrors.current_password}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="new_password"
          >
            New Password
          </label>
          <input
            type="password"
            name="new_password"
            id="new_password"
            className={`mt-1 p-2 border ${
              formErrors.new_password ? "border-red-500" : "border-gray-300"
            } rounded-md w-full`}
            onChange={handleChange}
            value={formValues.new_password}
          />
          {formErrors.new_password && (
            <p className="text-red-500 text-sm">{formErrors.new_password}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="confirm_password"
          >
            Confirm Password
          </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            className={`mt-1 p-2 border ${
              formErrors.confirm_password ? "border-red-500" : "border-gray-300"
            } rounded-md w-full`}
            onChange={handleChange}
            value={formValues.confirm_password}
          />
          {formErrors.confirm_password && (
            <p className="text-red-500 text-sm">
              {formErrors.confirm_password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition duration-200"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
