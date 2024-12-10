import mongoose, { Schema, Document } from "mongoose";

interface Lock {
  date: string;
  isLocked: boolean;
}

interface Room {
  roomName: string;
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

export interface Hotel {
  _id: string;
  email: string;
  password: string;
  name: string;
  city: string;
  phone: number;
  country: string;
  rooms?: Room[]; 
  logoUrl?: string; 
  isActive: boolean;
  isVerified: boolean;
}

export type HotelSearchResponse = {
  data: Hotel[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export interface HotelDocument extends Omit<Hotel, '_id'>, Document {
  _id: string; 
  refreshToken: any;
}


const LockSchema: Schema = new Schema({
  date: { type: String, required: true },
  isLocked: { type: Boolean, default: false },
});

const RoomSchema: Schema = new Schema({
  roomName: { type: String, required: true },
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


const HotelSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    logoUrl: { type: String }, 
    rooms: [RoomSchema], 
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<HotelDocument>("Hotel", HotelSchema);
