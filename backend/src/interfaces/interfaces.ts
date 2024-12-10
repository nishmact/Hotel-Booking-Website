
export interface HotelSession {
    email: string;
    password: string;
    name: string;
    phone: number;
    city: string;
    country: string;
    logoUrl?: string;
    otpCode?: string | undefined;
    otpSetTimestamp?: number | undefined;
  }
  
  export interface OTP {
    otp: string | undefined;
    email: string;
    otpSetTimestamp: number | undefined;
  }
  
 export interface PaymentSession {
    amount: number;
    userId: string;
    bookingId: string;
    vendorId: string;
  }
  

  export interface DecodedData {
    name: string;
    email: string;
    picture: string;
    jti: string;
  }
  
  export interface UserSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    phone: number;
    otpCode: string | undefined;
  }

  export interface VendorSession {
    email: string;
    password: string;
    name: string;
    phone: number;
    city: string;
    country: string;
    location: {
      latitude: string;
      longitude: string;
    };
    logoUrl?: string;
    otpCode?: string | undefined;
    otpSetTimestamp?: number | undefined;
    imageUrls?: string[];
  }

 