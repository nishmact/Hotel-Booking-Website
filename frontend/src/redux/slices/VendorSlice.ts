import { createSlice } from "@reduxjs/toolkit";
import { VendorData } from '../../types/vendorTypes';


export interface VendorState{
    vendordata : VendorData | null;
    isVendorSignedIn: boolean;
    
}
const initialState : VendorState ={
    vendordata:null,
    isVendorSignedIn:false
}

const vendorSlice =createSlice({
    name:'vendor',
    initialState,
    reducers:{

        setVendorInfo:(state,action)=>{
            state.vendordata =action.payload  
            state.isVendorSignedIn=true          
        },       
        logout:(state)=>{
            state.vendordata=null;   
            state.isVendorSignedIn=false         
        }


    }
})

export const {setVendorInfo,logout} = vendorSlice.actions
export default vendorSlice.reducer;