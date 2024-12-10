import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

interface DetailsSectionProps {
  isEditMode?: boolean;  
}

const DetailsSection: React.FC<DetailsSectionProps> = ({ isEditMode }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-3">
        {isEditMode ? "Editing" : "Add Details"}
      </h1>

      {/* Name Field */}
      <label className="text-black-700 text-sm font-bold flex-1">
        Room Name
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("name", { required: "This field is required" })}
        />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </label>

      {/* Price Per Night Field */}
      <label className="text-black-700 text-sm font-bold max-w-[50%]">
        Price Per Night
        <input
          type="number"
          min={1}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("pricePerNight", { required: "This field is required" })}
        />
        {errors.pricePerNight && (
          <span className="text-red-500">{errors.pricePerNight.message}</span>
        )}
      </label>

      {/* Description Field */}
      <label className="text-black-700 text-sm font-bold flex-1">
        Description
        <textarea
          rows={10}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("description", { required: "This field is required" })}
        />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>
    </div>
  );
};

export default DetailsSection;
