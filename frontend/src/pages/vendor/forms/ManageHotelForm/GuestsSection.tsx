import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const GuestsSection = () => {
  const {
      register,
      formState: { errors },
      getValues,  // To access current form values
  } = useFormContext<HotelFormData>();

  console.log("Form values:", getValues());

  return (
      <div>
          <h2 className="text-2xl font-bold mb-3">Guests</h2>
          <div className="grid grid-cols-2 p-6 gap-5 bg-gray-300">
              <label className="text-black-700 text-sm font-semibold">
                  Adults
                  <input
                      className="border rounded w-full py-2 px-3 font-normal"
                      type="number"
                      min={1}
                      {...register("adultCount", {
                          required: "This field is required",
                      })}
                  />
                  {errors.adultCount && (
                      <span className="text-red-500 text-sm font-bold">
                          {errors.adultCount.message}
                      </span>
                  )}
              </label>
              <label className="text-black-700 text-sm font-semibold">
                  Children
                  <input
                      className="border rounded w-full py-2 px-3 font-normal"
                      type="number"
                      min={0}
                      {...register("childCount", {
                          required: "This field is required",
                      })}
                  />
                  {errors.childCount && (
                      <span className="text-red-500 text-sm font-bold">
                          {errors.childCount.message}
                      </span>
                  )}
              </label>
          </div>
      </div>
  );
};


export default GuestsSection;
