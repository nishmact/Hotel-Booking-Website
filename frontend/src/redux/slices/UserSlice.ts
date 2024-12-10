import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserData } from '../../types/userTypes'; // Ensure this path is correct

// Define the UserData interface if not already defined
// interface UserData {
//   name: string;
//   email: string;
//   _id: string;
//   isActive: boolean;
//   image: string;
//   phone: string;
//   imageUrl: string;
//   favourite: Array<string>;
// }

// State shape for the user slice
export interface UserState {
  userdata: UserData | null;
  isUserSignedIn: boolean;
}

const initialState: UserState = {
  userdata: null,
  isUserSignedIn: false,
};

// Create the slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set user info
    setUserInfo: (state, action: PayloadAction<UserData>) => {
      state.userdata = action.payload;
      state.isUserSignedIn = true;
    },
    // Action to clear user info (logout)
    logout: (state) => {
      state.userdata = null;
      state.isUserSignedIn = false;
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; isActive: boolean }>) => {
      console.log("Action received: ", action.payload);
      if (state.userdata && state.userdata._id === action.payload.userId) {
        state.userdata.isActive = action.payload.isActive;
      }
    },
    
    
  },
});

// Export the actions and reducer
export const { setUserInfo, logout, updateUserStatus } = userSlice.actions;
export default userSlice.reducer;
