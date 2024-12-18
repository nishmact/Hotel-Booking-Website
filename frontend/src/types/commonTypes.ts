import { UserData } from "./userTypes";
import { VendorData } from "./vendorTypes";

export interface Review {
  _id: string;
  userId: UserData;
  rating: number;
  content: string;
  reply: Array<string>;
  createdAt: string;
}

export interface Notification {
  _id: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  date: string;
  name: string;
  eventName: string;
  city: string;
  pin: number;
  mobile: number;
  createdAt: Date;
  vendorId: VendorData;
  userId: { name: string; phone: number };
  status: string;
  checkIn: string; 
  checkOut: string;
  payment_status: string;
  amount: number;
  refundAmount:number;
}

export interface Payment {
  _id: string;
  amount: number;
  vendorId: VendorData;
  userId: UserData;
  bookingId: Booking;
  createdAt: Date;
}

export interface VendorType {
  _id: string;
  type: string;
  status: boolean;
  image:string;
  imageUrl:string;
}

export interface Chats {
  _id:string;
  members: string[];
  recentMessage: string;
  updatedAt:Date;
  createdAt:Date;
}

export interface Messages {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  imageName: string;
  imageUrl: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedIds: string[];
  emoji: string;
  createdAt:number;
}
