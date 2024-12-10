import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HotelRootState from "../../../redux/rootstate/HotelState";
import { axiosInstanceHotel } from "../../../config/api/axiosinstance";
import { toast } from "react-toastify";
import { validateHotel } from "../../../validations/hotel/hotelRegisterVal";
import { HOTEL } from "../../../config/constants/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface HotelFormValues {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirm_password: string;
  logo: File | null;
  city: string;
  country: string;
}

const initialValues: HotelFormValues = {
  email: "",
  password: "",
  name: "",
  phone: "",
  confirm_password: "",
  logo: null,
  city: "",
  country: "",
};

interface HotelValidationErrors {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  country: string;
  confirm_password?: string;
  logoUrl?: string;
}

const HotelSignup = () => {
  const hotel = useSelector((state: HotelRootState) => state.hotel.hotelData);
  const [formValues, setFormValues] = useState<HotelFormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<HotelValidationErrors>({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    country: "",
    confirm_password: "",
    logoUrl: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null); // State for logo preview
  const navigate = useNavigate();

  useEffect(() => {
    if (hotel) {
      navigate(HOTEL.HOME);
    }
  }, [hotel, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    const errors = validateHotel({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormValues({ ...formValues, logo: file });

      // Create a preview URL for the selected logo
      const logoUrl = URL.createObjectURL(file);
      setLogoPreview(logoUrl);
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateHotel(formValues);
    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      const formData = new FormData();
      formData.append("email", formValues.email);
      formData.append("password", formValues.password);
      formData.append("name", formValues.name);
      formData.append("phone", formValues.phone);
      formData.append("confirm_password", formValues.confirm_password);
      formData.append("city", formValues.city);
      formData.append("country", formValues.country);
      if (formValues.logo) formData.append("logo", formValues.logo);

      try {
        const response = await axiosInstanceHotel.post(
          `${BASE_URL}/api/hotel/signup`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.data.email) {
          console.log("hotel frontend")
          toast.success(response.data.message);
          navigate(`${HOTEL.VERIFY}`);
        }
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl pt-4">
        {" "}
        {/* Increased width */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Registration</h2>
        <form onSubmit={submitHandler} className="space-y-4">
          {/* Logo Upload Field */}
          <div className="flex justify-center">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            ) : (
              <label
                htmlFor="logo-upload" // Make sure this matches the input's id
                className="cursor-pointer h-40 w-40 flex items-center justify-center bg-gray-100 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-12 w-12 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </label>
            )}
          </div>

          <input
            type="file"
            name="logo"
            id="logo-upload"
            onChange={handleLogoChange}
            className="hidden"
          />
          {formErrors.logoUrl && (
            <p className="text-sm text-red-500 mt-1">{formErrors.logoUrl}</p>
          )}

          {/* Hotel Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Hotel Name
            </label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.name && (
              <p className="text-sm font-bold text-red-500 mt-1">{formErrors.name}</p>
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
              <p className="text-sm font-bold text-red-500 mt-1">{formErrors.email}</p>
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
              <p className="text-sm font-bold text-red-500 mt-1">{formErrors.phone}</p>
            )}
          </div>

          {/* City and Country Fields in a Row */}
          <div className="flex space-x-4">
            {/* City Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formValues.city}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.city && (
                <p className="text-sm font-bold text-red-500 mt-1">{formErrors.city}</p>
              )}
            </div>

            {/* Country Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formValues.country}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.country && (
                <p className="text-sm font-bold text-red-500 mt-1">
                  {formErrors.country}
                </p>
              )}
            </div>
          </div>

          {/* Password and Confirm Password Fields */}
          <div className="flex space-x-4">
            <div className="flex-1">
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
                <p className="text-sm font-bold text-red-500 mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div className="flex-1">
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
                <p className="text-sm font-bold text-red-500 mt-1">
                  {formErrors.confirm_password}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default HotelSignup;
