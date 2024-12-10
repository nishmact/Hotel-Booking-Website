import { createSlice } from '@reduxjs/toolkit';
import { HotelData } from '../../types/hotelTypes';


export interface HotelState {
  hotelData: HotelData | null;
  isHotelSignedIn: boolean;
}

const initialState: HotelState = {
  hotelData: null,
  isHotelSignedIn: false,
};


const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    
    setHotelInfo: (state, action) => {
      state.hotelData = action.payload;
      state.isHotelSignedIn = true;
    },
    
    logout: (state) => {
      state.hotelData = null;
      state.isHotelSignedIn = false;
    },
  },
});


export const { setHotelInfo, logout } = hotelSlice.actions;
export default hotelSlice.reducer;
