// Define the Lock interface if not already defined
interface Lock {
  date: string;
  isLocked: boolean;
}

// Define the RoomData interface
export interface RoomData {
  _id: string;
  name: string;
  pricePerNight: number;
  occupancy?: { // This is part of the room data
    adults: number;
    children: number;
  };
  description: string;
  facilities: string[];
  imageUrls: string[];
}

// Update VendorData to include RoomData in the rooms field
export interface VendorData {
  _id: string;
  email: string;
  password: string;
  name: string;
  city: string;
  phone: number;
  country: string;
  description: string;
  type: string;
  logoUrl?: string;
  facilities: string[];
  pricePerNight: number;
  imageUrls: string[];
  lastUpdated: Date;
  isActive: boolean;
  isVerified: boolean;
  locks: Lock[];
  bookedDates: Array<string>;
  rooms: RoomData[];  // Add rooms field of type RoomData[]
  totalRating:number;
}
