import mongoose, { Schema, Document } from "mongoose";



interface Lock {
  date: string;
  isLocked: boolean;
}

interface Room {
  _id?: string;
  name: string;
  type: string;
  description: string;
  occupancy: {
    adults: number;
    children: number;
  };
  facilities: string[];
  pricePerNight: number;
  imageUrls: string[];
  bookedDates: string[];
  locks: Lock[];
}


export interface Vendor {
  _id: string;
  email: string;
  password: string;
  name: string;
  city: string;
  phone: number;
  country: string;
  logoUrl?: string;
  facilities: string[];
  imageUrls: string[];
  bookedDates: string[];
  isActive: boolean;
  isVerified: boolean;
  totalRating:number;
  location: {
    latitude: string;
    longitude: string;
  };
 // locks: Lock[];
  rooms: Room[]; 
}


export type HotelSearchResponse = {
  data: Vendor[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};


export interface VendorDocument extends Omit<Vendor, '_id'>, Document {
  _id: string;
  refreshToken: any;
}


const LockSchema: Schema = new Schema({
  date: { type: String, required: true },
  isLocked: { type: Boolean, default: false },
});


const RoomSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  occupancy: {
   adults: { type: Number, required: true },
    children: { type: Number, required: true },
  },
  facilities: [{ type: String, required: true }],
  pricePerNight: { type: Number, required: true },
  imageUrls: [{ type: String, required: true }],
  bookedDates: [{ type: String }],
  locks: [LockSchema],
});


// Vendor schema
const VendorSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String },
    logoUrl: { type: String, required: true },
    type: { type: String },
    bookedDates: { type: [String] },
    facilities: [{ type: String }],
    imageUrls: [{ type: String }], 
    rooms: [RoomSchema], 
    isActive: { type: Boolean },
    isVerified: { type: Boolean },
    totalRating:{type:Number,default:0},
    location: {
      latitude: { type: String },  // Changed to String
      longitude: { type: String },  // Changed to String
    },
    //locks: [LockSchema], 
  },
  { timestamps: true }
);

export default mongoose.model<VendorDocument>("Vendor", VendorSchema);
