import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import vendorRepository from "../repositories/vendorRepository";
import { NOTIFICATION_TYPES } from "../models/notificationModel";
import { CustomError } from "../error/customError";
import { VendorDocument } from "../models/vendorModel";
import adminRepository from "../repositories/adminRepository";
import notificationRepository from "../repositories/notificationRepository";
import mongoose, { Schema } from "mongoose";

interface LoginResponse {
  token: string;
  vendorData: object;
  message: string;
  refreshToken: string;
}


class VendorService {
  async signup(
    email: string,
    password: string,
    name: string,
    phone: number,
    city: string,
    latitude: string,
    longitude: string,
    country: string,
    logoUrl: string
  ) {
    try {
      const existingVendor = await vendorRepository.findByEmail(email);
      if (existingVendor) {
        throw new CustomError("Vendor already exists", 409);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const isActive: boolean = true;
      const isVerified: boolean = false;
      //const verificationRequest: boolean = false;
      
      const newVendor = await vendorRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        city,
        isActive,
        isVerified,
        country,
        location: {
          latitude,    // latitude is directly assigned as a string here
          longitude,   // longitude is directly assigned as a string here
        },
        logoUrl,
        // verificationRequest,
      });
      const token = jwt.sign({ _id: newVendor._id }, process.env.JWT_SECRET!);

      const Admin = await adminRepository.findOne({});
      const adminNotification = await notificationRepository.create({
        recipient: Admin?._id as Schema.Types.ObjectId | undefined,
        message: `New vendor registered!`,
        type: NOTIFICATION_TYPES.NEW_VENDOR,
      });

      return { vendor: newVendor, token };
    } catch (error) {
      console.error("Error in signup:", error);
      throw new CustomError("Failed to create new vendor.", 500);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const existingVendor = await vendorRepository.findByEmail(email);
      if (!existingVendor) {
        throw new CustomError("vendor not exists..", 404);
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingVendor.password
      );

      if (!passwordMatch) {
        throw new CustomError("Incorrect password..", 401);
      }

      if (existingVendor.isActive === false) {
        throw new CustomError("Cannot login..!Blocked by Admin...", 401);
      }

      const vendorData = await vendorRepository.findByEmail(email);

      // If the password matches, generate and return a JWT token
      const token = jwt.sign(
        { _id: existingVendor._id },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      let refreshToken = existingVendor.refreshToken;

      if (!refreshToken) {
        refreshToken = jwt.sign(
          { _id: existingVendor._id },
          process.env.JWT_REFRESH_SECRET!,
          { expiresIn: "7d" }
        );
      }

      existingVendor.refreshToken = refreshToken;
      await existingVendor.save();
      return {
        refreshToken,
        token,
        vendorData: existingVendor,
        message: "Successfully logged in..",
      };
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  async CheckExistingVendor(email: string) {
    try {
      const existingVendor = await vendorRepository.findByEmail(email);
      return existingVendor;
    } catch (error) {
      console.error("Error in CheckExistingVendor:", error);
      throw new CustomError("Failed to check existing vendor.", 500);
    }
  }

  async ResetVendorPasswordService(password: string, email: string) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const status = await vendorRepository.UpdateVendorPassword(
        hashedPassword,
        email
      );
      if (!status.success) {
        throw new CustomError("Failed to reset password.", 500);
      }
    } catch (error) {
      console.error("Error in ResetVendorPasswordService:", error);
      throw new CustomError("Failed to reset vendor password.", 500);
    }
  }

  async getSingleVendor(vendorId: string): Promise<VendorDocument> {
    try {
      const Vendor = await vendorRepository.getById(vendorId);
      if (!Vendor) {
        throw new CustomError("Vendor not found.", 404);
      }
      return Vendor;
    } catch (error) {
      console.error("Error in getSingleVendor:", error);
      throw new CustomError("Failed to retrieve vendor.", 500);
    }
  }

  async toggleVendorBlock(vendorId: string): Promise<void> {
    try {
      const Vendor = await vendorRepository.getById(vendorId);
      if (!Vendor) {
        throw new CustomError("Vendor not found.", 404);
      }

      Vendor.isActive = !Vendor.isActive; // Toggle the isActive field
      await Vendor.save();
    } catch (error) {
      console.error("Error in toggleVendorBlock:", error);
      throw new CustomError("Failed to toggle vendor block.", 500);
    }
  }
}

export default new VendorService();
