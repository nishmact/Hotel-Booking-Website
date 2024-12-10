import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/UserSlice";
import adminReducer from "./slices/AdminSlice";
import vendorReducer from "./slices/VendorSlice";
import hotelReducer from "./slices/HotelSlice"; // Import the hotel reducer
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localstorage

const persistConfigUser = {
  key: "user",
  storage,
};
const persistConfigAdmin = {
  key: "admin",
  storage,
};
const persistConfigVendor = {
  key: "vendor",
  storage,
};
const persistConfigHotel = {
  key: "hotel",
  storage,
};

// Persist reducers for each slice
const persistedUserReducer = persistReducer(persistConfigUser, userReducer);
const persistedAdminReducer = persistReducer(persistConfigAdmin, adminReducer);
const persistedVendorReducer = persistReducer(persistConfigVendor, vendorReducer);
const persistedHotelReducer = persistReducer(persistConfigHotel, hotelReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    admin: persistedAdminReducer,
    vendor: persistedVendorReducer,
    hotel: persistedHotelReducer, // Add hotel to the store
  },
});

export const persistor = persistStore(store);
