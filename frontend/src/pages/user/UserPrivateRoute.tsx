import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import UserRootState from "../../redux/rootstate/UserState";
import { USER } from "../../config/constants/constants";
import { logout } from "../../redux/slices/UserSlice";

const UserPrivateRoute = () => {
  const user = useSelector((state: UserRootState) => state.user.userdata);
  const dispatch = useDispatch();
  console.log("User data: ", user); 
  // Dispatch logout if user is inactive
  useEffect(() => {
    if (user?.isActive === false) {
      dispatch(logout());
    }
  }, [user?.isActive, dispatch]);

  // Check if the user is inactive and redirect if true
  if (user?.isActive === false) {
    return <Navigate to={USER.LOGIN} replace />;
  }

  // If the user is active, render the child routes
  return <Outlet />;
};

export default UserPrivateRoute;
