import ReactDOM from "react-dom/client";
import ErrorBoundary from "./pages/ErrorBoundary";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import React from "react";
import VendorApp from "./pages/vendor/VendorApp";
import AdminApp from "./pages/admin/AdminApp";
import AdminLogin from "./pages/admin/auth/Login";
import AdminPrivateRoute from "./pages/admin/AdminPrivateRoute";
import { ADMIN } from "./config/constants/constants";
import UsersList from "./pages/admin/profile/UsersList";
import VendorList from "./pages/admin/profile/VendorList";
import { SearchContextProvider } from "./contexts/SearchContext";
import HotelApp from "./pages/hotel/HotelApp";
import Wallet from "./pages/admin/profile/Wallet";
import Dashboar from "./pages/admin/profile/Dashboar";
import Bookings from "./pages/admin/profile/Bookings";
import Notifications from "./pages/admin/profile/Notifications";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/error" element={<ErrorBoundary />} />

      <Route path="/*" element={<App />} errorElement={<ErrorBoundary />} />

      <Route path="/admin" element={<AdminApp />}>
        <Route index={true} path="/admin" element={<AdminLogin />} />
        <Route path="" element={<AdminPrivateRoute />}>
          <Route path={ADMIN.DASHBOAR} element={<Dashboar />} />
          <Route path={ADMIN.USERS} element={<UsersList />} />
          <Route path={ADMIN.VENDORS} element={<VendorList />} />
          <Route path={ADMIN.BOOKINGS} element={<Bookings />} />
          <Route path={ADMIN.WALLET} element={<Wallet />} />
          <Route path={ADMIN.INBOX} element={<Notifications />} />
        </Route>
      </Route>

      {/* Vendor and Hotel Routes */}
      <Route path="/vendor/*" element={<VendorApp />} />
      <Route path="/hotel/*" element={<HotelApp />} />
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <React.StrictMode>
        <SearchContextProvider>
          <RouterProvider router={router} />
        </SearchContextProvider>
      </React.StrictMode>
    </PersistGate>
  </Provider>
);
