import { useEffect, useState } from "react";
import Layout from "../../../layout/vendor/Layout";
import { HotelFormData } from "../forms/ManageHotelForm/ManageHotelForm";
import { axiosInstanceVendor } from "../../../config/api/axiosinstance";
import { useSelector } from "react-redux";
import VendorRootState from "../../../redux/rootstate/VendorState";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook for routing
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";


const EditProfile = () => {
  const vendor = useSelector((state: VendorRootState) => state.vendor.vendordata);
  const [vendorData, setVendorData] = useState<HotelFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);


  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    city?: string;
    country?: string;
  }>({});

  const navigate = useNavigate(); // Initialize the navigate hook

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendor?._id) return;

      try {
        const response = await axiosInstanceVendor.get(
          `${BASE_URL}/api/vendor/getvendor?vendorid=${vendor._id}`
        );
        setVendorData(response.data.data);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setError("Failed to fetch vendor data. Please try again.");
      }
    };

    fetchVendorData();
  }, [vendor?._id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({ ...prevData, [name]: value } as HotelFormData));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLogoFile(e.target.files[0]);
    }
  };


  const validateFields = () => {
    const errors: { name?: string; city?: string; country?: string } = {};
  
    // Validate name
    if (!vendorData?.name || vendorData.name.trim().length === 0) {
      errors.name = "Name cannot be empty or whitespace only.";
    } else if (vendorData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }
  
    // Validate city
    if (!vendorData?.city || vendorData.city.trim().length === 0) {
      errors.city = "City cannot be empty or whitespace only.";
    } else if (vendorData.city.trim().length < 2) {
      errors.city = "City must be at least 2 characters long.";
    }
  
    // Validate country
    if (!vendorData?.country || vendorData.country.trim().length === 0) {
      errors.country = "Country cannot be empty or whitespace only.";
    } else if (vendorData.country.trim().length < 2) {
      errors.country = "Country must be at least 2 characters long.";
    }
  
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }
    if (!vendor || !vendor._id) {
      toast.error("Vendor ID is missing. Please log in again.");
      return;
    }
    if (!vendorData?.name || !vendorData?.city || !vendorData?.country) {
      alert("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", vendorData.name);
      formData.append("city", vendorData.city);
      formData.append("country", vendorData.country);

      if (logoFile) {
        formData.append("logo", logoFile);  // Add logo file if provided
      }

      // Send PUT request to update the vendor profile
      await axiosInstanceVendor.put(
        `${BASE_URL}/api/vendor/updatevendor/${vendor._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating vendor data:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (roomId: string) => {
    // Navigate to the EditRoom page with the room ID
    navigate(`/vendor/edit-room/${roomId}`);
  };

  if (!vendorData) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="flex flex-col items-center">
        {/* Display selected logo file if available, otherwise current logo */}
        <img
          src={logoFile ? URL.createObjectURL(logoFile) : vendorData.logoUrl}
          alt={vendorData.name}
          className="w-24 h-24 object-cover rounded-full mb-4"
        />
        {error && <p className="text-red-500">{error}</p>}

        {isEditing ? (
          <form className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
            {/* Form Fields */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                Hotel Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={vendorData.name}
                onChange={handleChange}
                className={`w-full border p-2 rounded-md ${
                  validationErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Vendor Name"
              />
              {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="city">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={vendorData.city}
                onChange={handleChange}
                className={`w-full border p-2 rounded-md ${
                  validationErrors.city ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="City"
              />
              {validationErrors.city && <p className="text-red-500">{validationErrors.city}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="country">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={vendorData.country}
                onChange={handleChange}
                className={`w-full border p-2 rounded-md ${
                  validationErrors.country ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Country"
              />
              {validationErrors.country && <p className="text-red-500">{validationErrors.country}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="logo">
                Logo
              </label>
              <input
                type="file"
                id="logo"
                onChange={handleFileChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleSave}
                className={`bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-400 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-400"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{vendorData.name}</h1>
            <p className="text-lg text-gray-500">
              {vendorData.city}, {vendorData.country}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-400"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Rooms Section */}
      <h2 className="text-2xl font-semibold mt-6"></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendorData.rooms?.map((room, index) => (
          <div
            key={index}
            onClick={() => handleRoomClick(room._id)} // Pass room ID to the edit page
            className="cursor-pointer border border-gray-300 p-4 rounded-md shadow-md hover:shadow-lg transition"
          >
            <img
              src={room.imageUrls[0] || "https://via.placeholder.com/300"}
              alt={room.name}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <h3 className="text-lg font-bold">{room.name}</h3>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default EditProfile;
