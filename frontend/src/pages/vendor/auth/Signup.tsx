import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { validateHotel } from "../../../validations/hotel/hotelRegisterVal";
import { VENDOR } from "../../../config/constants/constants";
import { axiosInstanceVendor } from "../../../config/api/axiosinstance";
import VendorRootState from "../../../redux/rootstate/VendorState";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface VendorFormValues {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirm_password: string;
  logo: File | null;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

const initialValues: VendorFormValues = {
  email: "",
  password: "",
  name: "",
  phone: "",
  confirm_password: "",
  logo: null,
  city: "",
  country: "",
  latitude: null,
  longitude: null,
};

interface VendorValidationErrors {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  country: string;
  confirm_password?: string;
  logoUrl?: string;
}

const IndiaMap = ({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) => {
  const DefaultIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Custom Marker Icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Set the default icon for the markers
  L.Marker.prototype.options.icon = DefaultIcon;

  // Map event handling to get location coordinates when clicking
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng); // Handle location selection
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center of India
      zoom={5} // Zoom level for India
      style={{ height: "100vh", width: "100%" }} // Full page map height
      maxBounds={[
        [6.462, 68.176], // South-West boundary (India)
        [37.6, 97.4], // North-East boundary (India)
      ]}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents />
    </MapContainer>
  );
};

const Signup = () => {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendordata
  );
  const [formValues, setFormValues] = useState<VendorFormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<VendorValidationErrors>({
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
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (vendor) {
      navigate(VENDOR.DASHBOARD);
    }
  }, [vendor, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    const errors = validateHotel({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormValues((prevState) => ({
        ...prevState,
        logo: file,
      }));

      // Create a preview URL for the selected logo
      const logoUrl = URL.createObjectURL(file);
      setLogoPreview(logoUrl);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormValues({ ...formValues, latitude: lat, longitude: lng });
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

      if (formValues.latitude && formValues.longitude) {
        formData.append("latitude", formValues.latitude.toString());
        formData.append("longitude", formValues.longitude.toString());
      }

      if (formValues.logo) {
        formData.append("logo", formValues.logo);
      }

      // Debugging log to inspect formData content
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      try {
        const response = await axiosInstanceVendor.post(
          `${BASE_URL}/api/vendor/signup`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        if (response.data.email) {
          toast.success(response.data.message);
          navigate(`${VENDOR.VERIFY}`);
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "An error occurred");
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
                className="h-25 w-25  object-cover mb-4"
              />
            ) : (
              <label
                htmlFor="logo-upload" // Make sure this matches the input's id
                className="cursor-pointer h-40 w-40 flex items-center justify-center bg-gray-100 "
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
              <p className="text-sm font-bold text-red-500 mt-1">
                {formErrors.name}
              </p>
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
              <p className="text-sm font-bold text-red-500 mt-1">
                {formErrors.email}
              </p>
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
              <p className="text-sm font-bold text-red-500 mt-1">
                {formErrors.phone}
              </p>
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
                <p className="text-sm font-bold text-red-500 mt-1">
                  {formErrors.city}
                </p>
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

          {/* Location selection */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowMap((prevState) => !prevState)}
              className="w-full bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800"
            >
              {showMap ? "Close Map" : "Select Location"}
            </button>
          </div>

          {showMap && <IndiaMap onLocationSelect={handleLocationSelect} />}
          {/* Display Coordinates */}
          {formValues.latitude && formValues.longitude && (
            <p className="text-sm mt-2 text-gray-600">
              Latitude: {formValues.latitude}, Longitude: {formValues.longitude}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
