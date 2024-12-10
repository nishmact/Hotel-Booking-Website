import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { useSearchContext } from "../../../../contexts/SearchContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserRootState from "../../../../redux/rootstate/UserState";
import { USER } from "../../../../config/constants/constants";
import { axiosInstance } from "../../../../config/api/axiosinstance";
import { toast } from "react-toastify";
import VendorRootState from "../../../../redux/rootstate/VendorState";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

type Props = {
  hotelId: string;
  pricePerNight: number;
};

type GuestInfoFormData = {
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
};

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const vendor = useSelector((state: VendorRootState) => state.vendor.vendordata);

  console.log("vendor///////",vendor)
  console.log(vendor?._id)
  const search = useSearchContext();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adultCount: search.adultCount,
      childCount: search.childCount,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const onSignInClick = (data: GuestInfoFormData) => {
    search.saveSearchValues("", data.checkIn, data.checkOut, data.adultCount, data.childCount);
    navigate("/login", { state: { from: location } });
  };

  const submitHandler = async (data: GuestInfoFormData) => {
    if (Object.keys(errors).length === 0) {
      try {
        const vendorId = vendor?._id;
        console.log("vendorId....",vendorId)
        console.log("hotelId....",hotelId)
        console.log("userId",user?._id)
        const response = await axiosInstance.post(
          `${BASE_URL}/api/user/book-an-event?vendorId=${vendorId}&roomId=${hotelId}&userId=${user?._id}`,
          data,
          { withCredentials: true }
        );
        console.log("''''''''''''''",response);
        toast.success(response.data.message);
        navigate(`${USER.PROFILE}${USER.BOOKING_DETAILS}`);
      } catch (error: any) {
        // Check if error response exists and it's a custom error
        if (error.response && error.response.data) {
          toast.error(error.response.data.message || "An error occurredddd");
        } else {
          toast.error("An unexpected error occurred");
        }
        console.error("Error:", error);
      }
    }
  };
  

  return (
    <div className="ml-10 flex flex-col p-4 bg-gray-400 gap-4">
      <h3 className="text-md font-bold">₹{pricePerNight}</h3>
      <form onSubmit={user ? handleSubmit(submitHandler) : handleSubmit(onSignInClick)}>
        <div className="grid grid-cols-1 gap-4 items-center">
          <div>
            <DatePicker
              required
              selected={checkIn}
              onChange={(date) => setValue("checkIn", date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="min-w-full bg-white p-2 focus:outline-none"
              wrapperClassName="min-w-full"
            />
          </div>
          <div>
            <DatePicker
              required
              selected={checkOut}
              onChange={(date) => setValue("checkOut", date as Date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || minDate} // Ensure check-out is after check-in
              maxDate={maxDate}
              placeholderText="Check-out Date"
              className="min-w-full bg-white p-2 focus:outline-none"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="flex bg-white px-2 py-1 gap-2">
            <label className="items-center flex">
              Adults:
              <input
                className="w-full p-1 focus:outline-none font-bold"
                type="number"
                min={1}
                max={20}
                {...register("adultCount", {
                  required: "This field is required",
                  min: {
                    value: 1,
                    message: "There must be at least one adult",
                  },
                  valueAsNumber: true,
                })}
              />
            </label>
            <label className="items-center flex">
              Children:
              <input
                className="w-full p-1 focus:outline-none font-bold"
                type="number"
                min={0}
                max={20}
                {...register("childCount", {
                  valueAsNumber: true,
                })}
              />
            </label>
            {errors.adultCount && (
              <span className="text-red-500 font-semibold text-sm">
                {errors.adultCount.message}
              </span>
            )}
          </div>
          <button type="submit" className="bg-gray-900 text-white h-full p-2 font-bold hover:bg-gray-700 text-xl">
            {user ? "Book Now" : "Sign in to Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestInfoForm;
