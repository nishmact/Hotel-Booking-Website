import { Request, Response } from "express";
import VendorService from "../services/vendorService";
import generateOtp from "../utils/generateOtp";
import Vendor from "../models/vendorModel";
import dotenv from "dotenv";
import { CustomError } from "../error/customError";
import cloudinary from "cloudinary";
import { handleError } from "../utils/handleError";
import sharp from "sharp";
import moment from "moment";
import { Types } from "mongoose";
import payment from "../models/paymentModel";
import { OTP, VendorSession } from "../interfaces/interfaces";

dotenv.config();

declare module "express-session" {
  interface Session {
    vendorData: VendorSession;
    otp: OTP | undefined;
  }
}

class VendorController {
  async vendorSignup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, city, country, latitude, longitude } = req.body;
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      
      let logoUrl = "";

      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .resize({ height: 1200, width: 1200, fit: "contain" })
          .toBuffer();

        logoUrl = await uploadHotelImage(buffer, req.file.mimetype);
      }

      const otpCode = await generateOtp(email);

      if (otpCode !== undefined) {
        req.session.vendorData = {
          email,
          password,
          name,
          phone: parseInt(phone),
          city,
          country,
          location: {
            latitude,    
            longitude,   
          },
          otpCode,
          logoUrl,
          otpSetTimestamp: Date.now(),
        };

        req.session.vendorData = {
          email,
          password,
          name,
          phone: parseInt(phone),
          city,
          country,
          location: {
            latitude,    
            longitude,   
          },
          otpCode,
          logoUrl,
          otpSetTimestamp: Date.now(),
        };
        
        
        res.status(200).json({
          message: "OTP sent to vendor's email for verification..",
          email: email,
        });
      } else {
        console.log("Couldn't generate OTP, an error occurred, please fix !!");
        res.status(500).json({
          message: `Server Error couldn't generate OTP, an error occurred, please fix !!`,
        });
      }
    } catch (error) {
      handleError(res, error, "vendorSignup");
    }
  }

  async AddRooms(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        type,
        pricePerNight,
        facilities,
        adultCount,
        childCount,
      } = req.body;
      const vendorId = req.params.vendorId;

      const imageFiles = (req.files as Express.Multer.File[]) || [];
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      } else {
        console.log("No images uploaded.");
      }

      const roomData = {
        name,
        type,
        description,
        facilities,
        pricePerNight: Number(pricePerNight),
        occupancy: {
          adults: Number(adultCount),
          children: Number(childCount),
        },
        imageUrls,
      };

      const updatedVendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $push: { rooms: roomData } },
        { new: true, upsert: false }
      );

      if (updatedVendor) {
        res.status(200).json({ message: "Room added successfully" });
      } else {
        res.status(404).json({ message: "Vendor not found" });
      }
    } catch (error) {
      console.error("Error adding room:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const otp = req.body.otp;
      const vendorData = (req.session as any).vendorData;
      const email = vendorData.email;
      const password = vendorData.password;
      const name = vendorData.name;
      const phone = vendorData.phone;
      const city = vendorData.city;
      const country = vendorData.country;
      const latitude = vendorData.location.latitude;
      const longitude = vendorData.location.longitude;      
      const otpCode = vendorData.otpCode;

      if (!vendorData.otpCode) {
        throw new CustomError("OTP Expired...Try to resend OTP !!", 400);
      }

      if (otp === otpCode) {
        const { token, vendor } = await VendorService.signup(
          email,
          password,
          name,
          phone,
          country,
          vendorData.location.latitude,
          vendorData.location.longitude,
          city,
          vendorData.logoUrl
        );

        res.status(201).json({ vendor });
      } else {
        throw new CustomError("Invalid otp !!", 400);
      }
    } catch (error) {
      throw error;
    }
  }

  async ResendOtp(req: Request, res: Response): Promise<void> {
    try {
      const vendorData: VendorSession | undefined = req.session.vendorData;
      if (!vendorData) {
        res
          .status(400)
          .json({ error: "Session data not found. Please sign up again." });
        return;
      }
      const email = vendorData.email;
      const newOtp = await generateOtp(email);
      if (req.session.vendorData) {
        req.session.vendorData.otpCode = newOtp;
      } else {
        console.error("Session user data is unexpectedly undefined.");
        res.status(500).json({
          message: "Server Error: Session user data is unexpectedly undefined.",
        });
        return;
      }
      res.status(200).json({ message: "New OTP sent to email" });
    } catch (error) {
      handleError(res, error, "ResendOtp");
    }
  }

  async VendorLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { refreshToken, token, vendorData, message } =
        await VendorService.login(email, password);
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({ token, vendorData, message, refreshToken });
    } catch (error) {
      handleError(res, error, "VendorLogin");
    }
  }

  async VendorForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email;
      const vendor = await VendorService.CheckExistingVendor(email);
      if (vendor) {
        const otp = await generateOtp(email);
        (req.session as any).vendorotp = { otp: otp, email: email };
        console.log(req.session);
        res.status(200).json({
          message: "otp sent to vendor email for password updation request ",
          email: email,
        });
      } else {
        res.status(400).json({ error: "Email not Registered with us !!" });
      }
    } catch (error) {
      handleError(res, error, "VendorForgotPassword");
    }
  }

  async VerifyOtpForPassword(req: Request, res: Response): Promise<void> {
    try {
      const ReceivedOtp = req.body.otp;
      console.log("received otp", ReceivedOtp);
      console.log(req.session);
      const generatedOtp = (req.session as any).vendorotp.otp;
      console.log("generated otp", generateOtp);

      if (ReceivedOtp === generatedOtp) {
        console.log("otp is correct , navigating vendor to update password.");
        res
          .status(200)
          .json({ message: "otp is correct, please update password now" });
      } else {
        res.status(400).json({ Error: `otp's didn't matched..` });
      }
    } catch (error) {
      handleError(res, error, "VerifyOtpForPassword");
    }
  }

  async ResetVendorPassword(req: Request, res: Response): Promise<void> {
    try {
      const password = req.body.password;
      const confirmPassword = req.body.confirm_password;
      if (password === confirmPassword) {
        const email = (req.session as any).vendorotp.email;
        const status = await VendorService.ResetVendorPasswordService(
          password,
          email
        );
        res.status(200).json({ message: "Password reset successfully." });
      } else {
        res.status(400).json({ error: "Passwords do not match." });
      }
    } catch (error) {
      handleError(res, error, "ResetVendorPassword");
    }
  }

  async PwdResendOtp(req: Request, res: Response): Promise<void> {
    try {
      const otp: OTP | undefined = req.session.otp;
      if (!otp) {
        res
          .status(400)
          .json({ error: "Session data not found. Please sign up again." });
        return;
      }
      const email = otp.email;
      const newOtp = await generateOtp(email);
      if (req.session.otp) {
        req.session.otp.otp = newOtp;
      } else {
        console.error("Session user data is unexpectedly undefined.");
        res.status(500).json({
          message: "Server Error: Session user data is unexpectedly undefined.",
        });
        return;
      }
      res.status(200).json({ message: "New OTP sent to email" });
    } catch (error) {
      handleError(res, error, "PwdResendOtp");
    }
  }

  async VendorLogout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("jwtToken");
      res.status(200).json({ message: "vendor logged out successfully" });
    } catch (error) {
      handleError(res, error, "VendorLogout");
    }
  }

  async getVendor(req: Request, res: Response): Promise<void> {
    try {
      const vendorId: string = req.query.vendorid as string;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required." });
        return;
      }

      const data = await VendorService.getSingleVendor(vendorId);
      if (!data) {
        res.status(400).json({ error: "Vendor not found , error occured" });
      } else {
        res.status(200).json({ data: data });
      }
    } catch (error) {
      handleError(res, error, "getVendor");
    }
  }

  async getRoom(req: Request, res: Response): Promise<any> {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    try {
      const vendor = await Vendor.findOne({ "rooms._id": roomId });

      if (!vendor) {
        return res.status(404).json({ error: "Vendor or room not found" });
      }

      const room = vendor.rooms.find((room) => room._id?.toString() === roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json(room);
    } catch (error) {
      console.error("Error fetching room data:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async updateVendorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { name, city, country, phone } = req.body;
      let logoUrl = "";

      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .resize({ height: 1200, width: 1200, fit: "contain" })
          .toBuffer();

        logoUrl = await uploadHotelImage(buffer, req.file.mimetype);
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        res.status(404).json({ message: "Vendor not found" });
        return;
      }

      vendor.name = name || vendor.name;
      vendor.city = city || vendor.city;
      vendor.country = country || vendor.country;
      vendor.phone = phone || vendor.phone;
      if (logoUrl) vendor.logoUrl = logoUrl;

      await vendor.save();

      res
        .status(200)
        .json({ message: "Vendor profile updated successfully", vendor });
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      res
        .status(500)
        .json({
          message: "An error occurred while updating the vendor profile",
        });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, roomId } = req.params;
      const updatedRoomData = req.body;

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        res.status(404).json({ message: "Vendor not found" });
        return;
      }

      const roomIndex = vendor.rooms.findIndex(
        (room) => room._id?.toString() === roomId
      );
      if (roomIndex === -1) {
        res.status(404).json({ message: "Room not found" });
        return;
      }

      const room = vendor.rooms[roomIndex] as any;
      const updatedRoom = room.toObject();
      vendor.rooms[roomIndex] = {
        ...updatedRoom,
        ...updatedRoomData,
      };

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const newImageUrls = await uploadImages(files);
        vendor.rooms[roomIndex].imageUrls = [
          ...vendor.rooms[roomIndex].imageUrls,
          ...newImageUrls,
        ];
      }

      await vendor.save();

      res.status(200).json({
        message: "Room updated successfully",
        room: vendor.rooms[roomIndex],
      });
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  async getAllVendors(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 6, search = "" } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      // Implement search by name or other vendor properties (if necessary)
      const query = search ? { name: { $regex: search, $options: "i" } } : {};

      const vendors = await Vendor.find(query)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      const totalVendors = await Vendor.countDocuments(query);

      res.status(200).json({ vendors, totalVendors });
    } catch (error) {
      handleError(res, error, "getAllVendors");
    }
  }

  async Toggleblock(req: Request, res: Response): Promise<void> {
    try {
      const VendorId: string | undefined = req.query.VendorId as
        | string
        | undefined;
      if (!VendorId) {
        throw new Error("Vendor ID is missing or invalid.");
      }

      await VendorService.toggleVendorBlock(VendorId);
      let process = await Vendor.findOne({ _id: VendorId });
      res.status(200).json({
        message: "User block status toggled successfully.",
        process: !process?.isActive ? "block" : "unblock",
      });
    } catch (error) {
      handleError(res, error, "Toggleblock");
    }
  }

  async getRevenue(req: Request, res: Response): Promise<void> {
    try {
      const vendorId = req.query.vendorId as string;
      const dateType = req.query.date as string;

      if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
        res.status(400).json({ message: "Invalid or missing vendorId" });
        return;
      }

      let start,
        end,
        groupBy,
        sortField,
        arrayLength = 0;

      switch (dateType) {
        case "week":
          const { startOfWeek, endOfWeek } = getCurrentWeekRange();
          start = startOfWeek;
          end = endOfWeek;
          groupBy = { day: { $dayOfMonth: "$createdAt" } }; // Group by day
          sortField = "day"; // Sort by day
          arrayLength = 7;
          break;
        case "month":
          const { startOfYear, endOfYear } = getCurrentYearRange();
          start = startOfYear;
          end = endOfYear;
          groupBy = { month: { $month: "$createdAt" } }; // Group by month
          sortField = "month"; // Sort by month
          arrayLength = 12;
          break;
        case "year":
          const { startOfFiveYearsAgo, endOfCurrentYear } =
            getLastFiveYearsRange();
          start = startOfFiveYearsAgo;
          end = endOfCurrentYear;
          groupBy = { year: { $year: "$createdAt" } }; // Group by year
          sortField = "year"; // Sort by year
          arrayLength = 5;
          break;
        default:
          res.status(400).json({ message: "Invalid date parameter" });
          return;
      }

      const revenueData = await payment.aggregate([
        {
          $match: {
            vendorId: new Types.ObjectId(vendorId),
            createdAt: {
              $gte: start,
              $lt: end,
            },
          },
        },
        {
          $group: {
            _id: groupBy,
            totalRevenue: { $sum: "$amount" },
          },
        },
        {
          $sort: { [`_id.${sortField}`]: 1 },
        },
      ]);
      const revenueArray = Array.from({ length: arrayLength }, (_, index) => {
        const item = revenueData.find((r) => {
          if (dateType === "week") {
            return r._id.day === index + 1;
          } else if (dateType === "month") {
            return r._id.month === index + 1;
          } else if (dateType === "year") {
            return (
              r._id.year ===
              new Date().getFullYear() - (arrayLength - 1) + index
            );
          }
          return false;
        });
        return item ? item.totalRevenue : 0; // Default to 0 if no data for the expected index
      });

      res.status(200).json({ revenue: revenueArray });
    } catch (error) {
      handleError(res, error, "getRevenue");
    }
  }
}

async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export async function uploadHotelImage(buffer: Buffer, mimetype: string) {
  const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const uploadResult = await cloudinary.v2.uploader.upload(base64Image, {
    folder: "hotel_profiles",
  });
  return uploadResult.secure_url;
}

function getCurrentWeekRange() {
  const startOfWeek = moment().startOf("isoWeek").toDate();
  const endOfWeek = moment().endOf("isoWeek").toDate();
  return { startOfWeek, endOfWeek };
}

// Function to get current year range
function getCurrentYearRange() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1);
  return { startOfYear, endOfYear };
}

// Function to calculate the last five years' range
function getLastFiveYearsRange() {
  const currentYear = new Date().getFullYear();
  const startOfFiveYearsAgo = new Date(currentYear - 5, 0, 1);
  const endOfCurrentYear = new Date(currentYear + 1, 0, 1);
  return { startOfFiveYearsAgo, endOfCurrentYear };
}

export default new VendorController();
