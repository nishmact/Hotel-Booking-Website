import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import TypeSection from "./TypeSection";
import ImagesSection from "./ImagesSection";
import FacilitiesSection from "./FacilitiesSection";
import { toast } from "react-toastify";
import { VENDOR } from "../../../../config/constants/constants";
import { useNavigate } from "react-router-dom";
import { axiosInstanceVendor } from "../../../../config/api/axiosinstance";
import { useSelector } from "react-redux";
import VendorRootState from "../../../../redux/rootstate/VendorState";
import GuestsSection from "./GuestsSection";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export interface RoomData {
  _id: string;
  name: string;
  pricePerNight: number;
  adultCount: number;
  childCount: number;
  description: string;
  facilities: string[];
  imageUrls: string[];
  occupancy?: {
    adults: number;
    children: number;
  };
}

export type HotelFormData = {
  _id?: string;
  name: string;
  logoUrl: string;
  city: string;
  country: string;
  description: string;
  type: string;
  pricePerNight: string;
  facilities: string[];
  imageFiles: File[];
  imageUrls: string[];
  adultCount: string;
  childCount: string;
  rooms: RoomData[];
  occupancy?: {
    adults: number;
    children: number;
  };
};

type ManageHotelFormProps = {
  initialData?: HotelFormData;
  isEditMode?: boolean;
};

const ManageHotelForm = ({ initialData, isEditMode = false }: ManageHotelFormProps) => {
  const vendor = useSelector((state: VendorRootState) => state.vendor.vendordata);
  const navigate = useNavigate();

  const formMethods = useForm<HotelFormData>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          pricePerNight: initialData.pricePerNight,
          facilities: initialData.facilities,
          imageFiles: [],
          imageUrls: initialData.imageUrls,
          adultCount: initialData.occupancy?.adults?.toString() || "", // Directly from occupancy
          childCount: initialData.occupancy?.children?.toString() || "", // Directly from occupancy
          description: initialData.description,
          rooms: initialData.rooms,
        }
      : {},
    mode: "onSubmit",
  });
  
  

  const { handleSubmit, setValue } = formMethods;

  useEffect(() => {
    if (initialData) {
      console.log("Initial Data:", initialData); 
      Object.keys(initialData).forEach((key) => {
        setValue(key as keyof HotelFormData, initialData[key as keyof HotelFormData]);
      });
    }
  }, [initialData, setValue]);
  

  const onSubmit = handleSubmit(async (formDataJson: HotelFormData) => {
    if (!vendor || !vendor._id) {
      toast.error("Vendor ID is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("name", formDataJson.name);
    formData.append("type", formDataJson.type);
    formData.append("pricePerNight", formDataJson.pricePerNight);
    formData.append("adultCount", formDataJson.adultCount);
    formData.append("childCount", formDataJson.childCount);
    formData.append("description", formDataJson.description);

    if (formDataJson.facilities) {
      formDataJson.facilities.forEach((facility, index) => {
        formData.append(`facilities[${index}]`, facility);
      });
    }

    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    if (formDataJson.imageFiles) {
      formDataJson.imageFiles.forEach((imageFile) => {
        formData.append("imageFiles", imageFile);
      });
    }

    try {
      const url = isEditMode && initialData?._id
        ? `${BASE_URL}/api/vendor/update-profile/${vendor._id}/${initialData._id}`
        : `${BASE_URL}/api/vendor/add-rooms/${vendor._id}`;
      const method = isEditMode ? "put" : "post";

      const response = await axiosInstanceVendor[method](url, formData, {
        withCredentials: true,
      });

      if (response.data.message) {
        toast.success(response.data.message);
        navigate(isEditMode ? VENDOR.EDIT_PROFILE : VENDOR.VIEW_PROFILE);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save hotel data.");
    }
  });

  return (
    <div className="px-8 py-4 shadow-lg rounded-lg bg-gray-100 max-w-6xl mx-auto mt-10 mb-10">
      <FormProvider {...formMethods}>
        <form className="flex flex-col gap-10" onSubmit={onSubmit}>
          <DetailsSection isEditMode={isEditMode} />
          <TypeSection />
          <FacilitiesSection />
          <GuestsSection />
          <ImagesSection existingImageUrls={initialData?.imageUrls || []} />

          <span className="flex justify-end">
            <button className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500">
              {isEditMode ? "Update" : "Save"}
            </button>
          </span>
        </form>
      </FormProvider>
    </div>
  );
};

export default ManageHotelForm;
