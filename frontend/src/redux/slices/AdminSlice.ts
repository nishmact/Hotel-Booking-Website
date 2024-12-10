import { createSlice } from "@reduxjs/toolkit";
import { AdminData } from "../../types/adminTypes";

export interface AdminState {
  admindata: AdminData | null;
  isAdminSignedIn: boolean;
}
const initialState: AdminState = {
  admindata: null,
  isAdminSignedIn: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminInfo: (state, action) => {
      console.log("Admin info received in reducer: ", action.payload);
      state.admindata = action.payload;
      state.isAdminSignedIn = true;
    },
    logout: (state) => {
      state.admindata = null;
      state.isAdminSignedIn = false;
    },
  },
});

export const { setAdminInfo, logout } = adminSlice.actions;

export default adminSlice.reducer;
