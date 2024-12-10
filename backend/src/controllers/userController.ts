import { Request, Response } from "express";
import user from "../models/userModel";
import vendor, { HotelSearchResponse } from "../models/vendorModel";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { handleError } from "../utils/handleError";
import generateOtp from "../utils/generateOtp";
import { CustomError } from "../error/customError";
import userService from "../services/userService";
import User, { UserDocument } from "../models/userModel";
import { PipelineStage } from "mongoose";
import { DecodedData, OTP, UserSession } from "../interfaces/interfaces";

declare module "express-session" {
  interface Session {
    user: UserSession;
    otp: OTP | undefined;
  }
}
dotenv.config();

class UserController {
  async UserSignup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;
      const errors: any = {};

      if (!email || !email.trim()) {
        errors.email = "Email is required and cannot be empty";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        errors.email = "Invalid email format";
      }

      if (!password || !password.trim()) {
        errors.password = "Password is required and cannot be empty";
      } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters long";
      }

      if (!name || !name.trim()) {
        errors.name = "Name is required and cannot be empty";
      } else if (name.length < 3) {
        errors.name = "Name must be at least 3 characters long";
      }

      if (!phone || !phone.trim()) {
        errors.phone = "Phone number is required and cannot be empty";
      } else if (!/^\d{10}$/.test(phone)) {
        errors.phone = "Phone number must be a valid 10-digit number";
      }
      const otpCode = await generateOtp(email);

      if (!otpCode) {
        console.log("Not generated otp");
      }

      if (otpCode !== undefined) {
        req.session.user = {
          email: email,
          password: password,
          name: name,
          phone: parseInt(phone),
          otpCode: otpCode,
          otpSetTimestamp: Date.now(),
        };

        res.status(200).json({
          message: "OTP send to email for verification..",
          email: email,
        });
      } else {
        console.log("couldn't generate otp, error occcured ,please fix !!");
        res.status(500).json({
          message: `Server Error couldn't generate otp, error occcured ,please fix !!`,
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      handleError(res, error, "UserSignup");
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const otp = req.body.otp;
      const userData = req.session.user;
      const email = userData.email;
      const password = userData.password;
      const name = userData.name;
      const phone = userData.phone;
      if (!userData.otpCode) {
        throw new CustomError("OTP Expired...Try to resend OTP !!", 400);
      }
      const otpCode = userData.otpCode;
      if (otp === otpCode) {
        const user = await userService.signup(
          email,
          password,
          name,
          phone,
          res
        );

        res.status(201).json(user);
      } else {
        throw new CustomError("Invalid otp !!", 400);
      }
    } catch (error) {
      handleError(res, error, "verifyOtp");
    }
  }

  async googleRegister(req: Request, res: Response) {
    try {
      console.log("This is credential in body: ", req.body.credential);
      const token = req.body.credential;
      console.log(token);
      const decodedData = Jwt.decode(req.body.credential);

      console.log("Decoded data: ", decodedData);
      const { name, email, jti }: DecodedData = decodedData as DecodedData;
      const user = await userService.googleSignup(email, jti, name);

      if (user) {
        res.status(200).json({ message: "user saved successfully" });
      }
    } catch (error) {
      res.status(400).json({ error: "User already exists" });
    }
  }

  async UserLogin(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      const { token, refreshToken, userData, message } =
        await userService.login(email, password);
      res.cookie("jwtToken", token, { httpOnly: true });
      res.status(200).json({ token, userData, message, refreshToken });
    } catch (error) {
      handleError(res, error, "UserLogin");
    }
  }

  async googleLogin(req: Request, res: Response): Promise<any> {
    try {
      const decodedData = Jwt.decode(req.body.credential) as DecodedData | null;
      console.log(decodedData);

      if (!decodedData) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const { email, jti } = decodedData;
      const password = jti;
      const { refreshToken, token, userData, message } =
        await userService.gLogin(email, password);
      console.log("userData....", userData);
      // req.session.user = userData._id;
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({ refreshToken, token, userData, message });
    } catch (error) {
      handleError(res, error, "googleLogin");
    }
  }

  async UserLogout(req: Request, res: Response): Promise<void> {
    try {
      console.log("logout...");
      res.cookie("jwtUser", "", { maxAge: 0 });
      res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      handleError(res, error, "UserLogout");
    }
  }

  async ResendOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("Resend otp");
      const userData: UserSession | undefined = req.session.user;
      if (!userData) {
        res
          .status(400)
          .json({ error: "Session data not found. Please sign up again." });
        return;
      }
      const email = userData.email;
      const newOtp = await generateOtp(email);
      console.log("newOTP...", newOtp);
      if (req.session.user) {
        req.session.user.otpCode = newOtp;
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

  async UserForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email;
      console.log(email);
      const user = await userService.CheckExistingUSer(email);
      if (user) {
        const otp = await userService.generateOtpForPassword(email);
        req.session.otp = {
          otp: otp,
          email: email,
          otpSetTimestamp: Date.now(),
        };
        console.log(req.session.otp);
        res.status(200).json({
          message: "OTP sent to email for password updation request ",
          email,
        });
      } else {
        res.status(400).json({ error: "User not found !!" });
      }
    } catch (error) {
      handleError(res, error, "UserForgotPassword");
    }
  }

  async VerifyOtpForPassword(req: Request, res: Response): Promise<void> {
    try {
      const ReceivedOtp = req.body.otp;
      const generatedOtp = req.session.otp?.otp;
      if (!req.session.otp) {
        throw new CustomError("OTP Expired...Try to resend OTP !!", 400);
      }

      if (ReceivedOtp === generatedOtp) {
        console.log("otp is correct , navigating user to update password.");
        res.status(200).json({ message: "Otp is verified..!" });
      } else {
        throw new CustomError("Invalid OTP !!", 400);
      }
    } catch (error) {
      handleError(res, error, "VerifyOtpForPassword");
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

  async ResetUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const password = req.body.password;
      const confirmPassword = req.body.confirm_password;
      if (password === confirmPassword) {
        const email = req.session.otp?.email;
        console.log("email " + email);
        const status = await userService.ResetPassword(password, email!);
        req.session.otp = undefined;
        res.status(200).json({ message: "Password reset successfully." });
      } else {
        res.status(400).json({ error: "Passwords do not match." });
      }
    } catch (error) {
      handleError(res, error, "ResetUserPassword");
    }
  }

  async Home(req: Request, res: Response): Promise<void> {
    console.log("Home page");
  }

  async allUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 6, search = "" } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const users = await userService.getUsers(
        pageNumber,
        limitNumber,
        search.toString()
      );
      const totalUsers = await userService.getUsersCount();

      res.status(200).json({ users, totalUsers });
    } catch (error) {
      handleError(res, error, "allUsers");
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId.toString();

      const user = await User.findOne({ _id: userId });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  }

  async getUserData(req: Request, res: Response): Promise<void> {
    try {
      const userId: string = req.query.userId as string;

      const data = await userService.findUser(userId);
      res.status(200).json(data);
    } catch (error) {
      handleError(res, error, "getUser");
    }
  }

  async getAllhotels(req: Request, res: Response): Promise<void> {
    try {
      // console.log("Request Query Params:", req.query);

      const query = constructSearchQuery(req.query); // Original search query
    
      const pageSize = 5;
      const pageNumber = parseInt(req.query.page?.toString() || "1", 10);
      const skip = (pageNumber - 1) * pageSize;

      //  console.log(`Skip: ${skip}, Limit: ${pageSize}`);

      let sortOptions: Record<string, 1 | -1> = { "rooms.pricePerNight": 1 };
      if (req.query.sortOption) {
        switch (req.query.sortOption) {
          case "pricePerNightAsc":
            sortOptions = { "rooms.pricePerNight": 1 };
            break;
          case "pricePerNightDesc":
            sortOptions = { "rooms.pricePerNight": -1 };
            break;
        }
      }

      const hotels = await vendor
        .aggregate([
          { $match: query }, // Apply initial search query
          { $sort: sortOptions }, // Sort rooms based on price or custom sort
          { $skip: skip },
          { $limit: pageSize },
          { $unwind: { path: "$rooms", preserveNullAndEmptyArrays: true } }, // Unwind rooms to access individual room data
          { $match: query }, // Match rooms by the query (including facilities, types, etc.)
          {
            $group: {
              _id: "$_id",
              hotel: {
                $first: {
                  _id: "$_id",
                  email: "$email",
                  name: "$name",
                  phone: "$phone",
                  city: "$city",
                  country: "$country",
                  logoUrl: "$logoUrl",
                  bookedDates: "$bookedDates",
                  facilities: "$facilities",
                  imageUrls: "$imageUrls",
                  isActive: "$isActive",
                  isVerified: "$isVerified",
                  createdAt: "$createdAt",
                  updatedAt: "$updatedAt",
                },
              },
              rooms: {
                $addToSet: "$rooms", // Group rooms and add them to the result
              },
            },
          },
        ])
        .exec();

      const total = await vendor.countDocuments(query);
      //  console.log("Total hotels count:", total);
      console.log("Hotels After Aggregate:", JSON.stringify(hotels, null, 2));

      const response: HotelSearchResponse = {
        data: hotels.map((item) => ({
          ...item.hotel, // Include hotel details
          rooms: item.rooms, // Include only the filtered rooms
        })),
        pagination: {
          total,
          page: pageNumber,
          pages: Math.ceil(total / pageSize),
        },
      };

      //  console.log("Final Response:", JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error) {
      console.error("Error in getAllhotels:", error);
      handleError(res, error, "getAllhotels");
    }
  }

  async details(req: Request, res: Response): Promise<any> {
    try {
      const hotelId = req.params.hotelId;
      const roomId = req.params.roomId;

      const hotel = await vendor.findById(hotelId).populate("rooms");

      if (!hotel) {
        return res.status(404).json({ error: "Hotel not found" });
      }

      const room = hotel.rooms.find((room) => room._id?.toString() === roomId);

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Ensure that logoUrl is part of the hotel data
      const logoUrl = hotel.logoUrl;

      res.json({
        room: room,
        location: hotel.location,
        logoUrl: logoUrl,
      });
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async Toggleblock(req: Request, res: Response): Promise<void> {
    try {
      const userId: string | undefined = req.query.userId as string | undefined;
      if (!userId) {
        res.status(400).json({ message: "User ID is missing or invalid." });
        return;
      }
      await userService.toggleUserBlock(userId);
      let process = await user.findOne({ _id: userId });
      res.status(200).json({
        message: "User block status toggled successfully.",
        process: !process?.isActive ? "block" : "unblock",
      });
    } catch (error) {
      handleError(res, error, "Toggleblock");
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void>{
    try {
      
      const {name,email,mobile,subject,message}=req.body;

      const data = await userService.sendEmail(name,email,mobile,subject,message);
      res.status(200).json(data);
    } catch (error) {
      handleError(res, error, "sendMessage");
    }
  }

  async updatePasswordController(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body);
      const currentPassword = req.body.current_password;
      const newPassword = req.body.new_password;
      const userId: string = req.query.userid as string;

      let status = await userService.checkCurrentPassword(
        currentPassword,
        userId
      );

      if (!status) {
        throw new CustomError(`Current password is wrong!`, 400);
      }

      const data = await userService.UpdatePasswordService(newPassword, userId);

      if (!data) {
        res
          .status(400)
          .json({ error: "couldn't update password..internal error." });
      }
      res.status(200).json({ message: "password updated successfully.." });
    } catch (error) {
      handleError(res, error, "updatePasswordController");
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("Profile...");
      const { name, phone } = req.body;
      const userId: string = req.query.userid as string;
      let imageUrl = "";

      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .resize({ height: 1200, width: 1200, fit: "contain" })
          .toBuffer();

        imageUrl = await uploadUserImage(buffer, req.file.mimetype);
      }

      const user = await userService.updateProfileService(
        name,
        parseInt(phone),
        userId,
        imageUrl
      );
      res.status(201).json(user);
    } catch (error) {
      handleError(res, error, "updateProfile");
    }
  }
}

export async function uploadUserImage(buffer: Buffer, mimetype: string) {
  const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: "user_profiles",
  });
  return uploadResult.secure_url;
}

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  // Handling destination search (city or country)
  if (queryParams.destination && queryParams.destination.length > 0) {
    const destination = queryParams.destination[0];
    constructedQuery.$or = [
      { city: new RegExp(destination, "i") },
      { country: new RegExp(destination, "i") },
    ];
  }

  // Handling occupancy filters for adults and children
  if (queryParams.adultCount && queryParams.adultCount.length > 0) {
    const adultCount = parseInt(queryParams.adultCount[0]);
    if (!isNaN(adultCount)) {
      constructedQuery["rooms.occupancy.adults"] = { $gte: adultCount };
    }
  }
  if (queryParams.childCount && queryParams.childCount.length > 0) {
    const childCount = parseInt(queryParams.childCount[0]);
    if (!isNaN(childCount)) {
      constructedQuery["rooms.occupancy.children"] = { $gte: childCount };
    }
  }

  // Handling facilities filter (searching inside the `rooms.facilities` array)
  if (queryParams.facilities) {
    constructedQuery["rooms.facilities"] = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  // Handling types filter (nested `rooms.type`)
  if (queryParams.types) {
    constructedQuery["rooms.type"] = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  // Handling price filter (max price per night)
  if (
    queryParams.maxPrice &&
    queryParams.maxPrice.length > 0 &&
    queryParams.maxPrice[0] !== ""
  ) {
    const maxPrice = parseInt(queryParams.maxPrice[0]);
    if (!isNaN(maxPrice)) {
      constructedQuery["rooms.pricePerNight"] = { $lte: maxPrice };
    }
  }

  return constructedQuery;
};

export default new UserController();
