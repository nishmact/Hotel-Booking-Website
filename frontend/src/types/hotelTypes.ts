export interface HotelData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    isActive: boolean;
    isVerified: boolean;
    rooms: Array<{
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
      locks: Array<{ date: string; isLocked: boolean }>;
    }>;
    logoUrl?: string;
  }