import { useEffect, useState } from "react";
import CardDataStats from "../../vendor/CardDataStats";
import { axiosInstanceAdmin } from "../../../config/api/axiosinstance";

const CountCard = () => {
  const [users, setUsers] = useState(0);
  const [vendors, setVendors] = useState(0);
  const [booking, setBooking] = useState(0);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  useEffect(() => {
    axiosInstanceAdmin
      .get(`${BASE_URL}/api/admin/dashboard-stats`)
      .then((res) => {
        console.log("response....",res.data)
        setUsers(res.data.users);
        setVendors(res.data.vendors);
        setBooking(res.data.booking);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5 mb-3">
      <CardDataStats title="Users" value={users}>
        <i
          className="fa-solid fa-users justify-center text-pink-400"
          style={{ fontSize: "36px" }}
        ></i>
      </CardDataStats>
      <CardDataStats title="Vendors" value={vendors}>
      <i className="fa-solid fa-user-tie text-pink-400" style={{ fontSize: "36px" }}></i>
    
      </CardDataStats>
      <CardDataStats title="Booking" value={booking}>
      <i className="fa-regular fa-calendar-check text-pink-400"
          style={{ fontSize: "36px" }}
        ></i>
      </CardDataStats>
    </div>
  );
};

export default CountCard;
