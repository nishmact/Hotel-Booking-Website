import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import vendorRepository from "../repositories/vendorRepository";
import { HotelDocument } from "../models/hotelModel";
import { CustomError } from "../error/customError";
import hotelRepository from "../repositories/hotelRepository";


class HotelService {
  async signup(
    email: string,
    password: string,
    name: string,
    phone: number,
    city: string,
    country: string,
    logoUrl: string
  ) {
    try {
      const existingVendor = await hotelRepository.findByEmail(email);
      if (existingVendor) {
        throw new CustomError("Vendor already exists", 409);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const isActive: boolean = true;
      const isVerified: boolean = false;
      //const verificationRequest: boolean = false;

      const newVendor = await hotelRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        city,
        isActive,
        isVerified,
        country,
        logoUrl,
        // verificationRequest,
      });
      const token = jwt.sign({ _id: newVendor._id }, process.env.JWT_SECRET!);

      return { vendor: newVendor, token };
    } catch (error) {
      console.error("Error in signup:", error);
      throw new CustomError("Failed to create new vendor.", 500);
    }
  }

  async getSingleHotel(hotelId: string): Promise<HotelDocument> {
    try {
      const Hotel = await hotelRepository.getById(hotelId);
      if (!Hotel) {
        throw new CustomError("Vendor not found.", 404);
      }
      return Hotel;
    } catch (error) {
      console.error("Error in getSingleVendor:", error);
      throw new CustomError("Failed to retrieve vendor.", 500);
    }
  }


}

export default new HotelService();
