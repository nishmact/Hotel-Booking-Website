import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "../../../config/api/axiosinstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setUserInfo } from "../../../redux/slices/UserSlice";
import { USER } from "../../../config/constants/constants";
import UserRootState from "../../../redux/rootstate/UserState";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

interface FormInputs {
  name: string;
  phone: string | undefined;
}

const ProfileCard = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputs, setInputs] = useState<FormInputs>({
    name: user?.name || "",
    phone: user?.phone?.toString(),
  });
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputs.name.length === 0) {
      setNameError("Name is required");
      return;
    }
    if (!/^[A-Za-z\s]+$/i.test(inputs.name)) {
      setNameError("Enter a valid name");
      return;
    }
    if (inputs?.phone?.length === 0) {
      setPhoneError("Phone is required");
      return;
    }
    if (!/^[0-9]+$/u.test(inputs.phone!)) {
      setPhoneError("Enter a valid Phone");
      return;
    }

    // Submit form data
    const formData = new FormData();
    formData.append("name", inputs.name);
    if (inputs.phone) {
      formData.append("phone", inputs.phone.toString());
    }
    if (file) {
      formData.append("image", file, file.name);
    }
    axiosInstance
      .put(`${BASE_URL}/api/user/update-profile?userid=${user?._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        toast.success("Profile updated successfully!");
        dispatch(setUserInfo(response.data));
        navigate(`${USER.PROFILE}`);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected Profile"
                className="h-40 w-40 rounded-full object-cover cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              />
            ) : user?.imageUrl ? (
              <img
                src={user?.imageUrl}
                alt="User Profile"
                className="h-40 w-40 rounded-full object-cover cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              />
            ) : (
              <label
                htmlFor="file-upload"
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
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  setFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          {user?.email && (
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-4 py-2 mb-2 text-gray-700 bg-gray-100 rounded-lg"
              placeholder="Email"
            />
          )}
          <input
            type="text"
            name="name"
            value={inputs.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:border-pink-500"
            placeholder="Name"
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          <input
            type="text"
            name="phone"
            value={inputs.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:border-pink-500"
            placeholder="Phone"
          />
          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCard;
