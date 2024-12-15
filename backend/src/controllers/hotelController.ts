import { Request, Response } from "express";
import generateOtp from "../utils/generateOtp";
import dotenv from "dotenv";
import { CustomError } from "../error/customError";
import { v2 as cloudinary } from "cloudinary";
import { handleError } from "../utils/handleError";
import sharp from "sharp";
import hotelService from "../services/hotelService";
import { HotelSession, OTP } from "../interfaces/interfaces";

dotenv.config();


declare module "express-session" {
  interface Session {
    hotelData: HotelSession;
    otp: OTP | undefined;
  }
}

class HotelController {
  async hotelSignup(req: Request, res: Response): Promise<void> {
    try {
   

      const { email, password, name, phone, city, country } = req.body;

      let logoUrl = "";

      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .resize({ height: 1200, width: 1200, fit: "contain" })
          .toBuffer();

        logoUrl = await uploadHotelImage(buffer, req.file.mimetype);
      }

      const otpCode = await generateOtp(email);

      if (otpCode !== undefined) {
        req.session.hotelData = {
          email,
          password,
          name,
          phone: parseInt(phone),
          city,
          country,
          logoUrl,
          otpCode,
          otpSetTimestamp: Date.now(),
        };

       
        res.status(200).json({
          message: "OTP sent to vendor's email for verification..",
          email: email,
        });
      } else {
        
        res.status(500).json({
          message: `Server Error couldn't generate OTP, an error occurred, please fix !!`,
        });
      }
    } catch (error) {
      handleError(res, error, "vendorSignup");
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
     
      const otp = req.body.otp;
      const hotelData = (req.session as any).hotelData;
      const email = hotelData.email;
      const password = hotelData.password;
      const name = hotelData.name;
      const phone = hotelData.phone;
      const city = hotelData.city;
      const country = hotelData.country;
      const otpCode = hotelData.otpCode;

      if (!hotelData.otpCode) {
        throw new CustomError("OTP Expired...Try to resend OTP !!", 400);
      }
      if (otp === otpCode) {
        const { token, vendor } = await hotelService.signup(
          email,
          password,
          name,
          phone,
          country,
          city,
          hotelData.logoUrl
        );

        res.status(201).json({ vendor });
      } else {
        throw new CustomError("Invalid otp !!", 400);
      }
    } catch (error) {
      throw error;
    }
  }

  async getHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId: string = req.query.hotelid as string; // or req.query.Id?.toString()
      
      if (!hotelId) {
        res.status(400).json({ error: "Vendor ID is required." });
        return;
      }

      const data = await hotelService.getSingleHotel(hotelId);
      if (!data) {
        res.status(400).json({ error: "Vendor not found , error occured" });
      } else {
        res.status(200).json({ data: data });
      }
    } catch (error) {
      handleError(res, error, "getVendor");
    }
  }
}

export async function uploadHotelImage(buffer: Buffer, mimetype: string) {
  const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: "hotel_profiles",
  });
  return uploadResult.secure_url;
}

export default new HotelController();
