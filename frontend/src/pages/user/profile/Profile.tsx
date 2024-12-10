import { Routes, Route, Navigate } from "react-router-dom";
import { USER } from "../../../config/constants/constants";
import Layout from "../../../layout/user/profileLayout";
import { useSelector } from "react-redux";
import UserRootState from "../../../redux/rootstate/UserState";
import ProfileCard from "../../../components/user/profile/ProfileCard";
import ChangePassword from "../../../components/user/profile/ChangePassword";
import BookingDetails from "../../../components/user/profile/BookingDetails";
import SingleBooking from "../../../components/user/profile/SingleBooking";
import Wallet from "../../../components/user/profile/Wallet";
import Notification from "../../../components/user/profile/Notification";

const Profile: React.FC = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  return (
    <>
      {!user ? (
        <Navigate to={`${USER.LOGIN}`} replace />
      ) : (
        <Layout>
          <div className="flex-1 bg-white mt-10">
            <div
              // className="overflow-y-scroll"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              <Routes>
                <Route path="/" element={<ProfileCard />} />
                <Route path={USER.CHANGE_PWD} element={<ChangePassword />} />
                <Route
                  path={USER.BOOKING_DETAILS}
                  element={<BookingDetails />}
                />
                 <Route path={USER.WALLET} element={<Wallet />} />
                <Route path={USER.BOOKING} element={<SingleBooking />} />
                <Route path={USER.INBOX} element={<Notification />} />
              </Routes>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default Profile;
