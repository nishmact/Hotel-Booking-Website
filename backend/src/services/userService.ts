import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository";
import generateUserTokenAndSetCookie from "../utils/generateUserToken";
import { CustomError } from "../error/customError";
import { Response } from "express";
import { UserDocument } from "../models/userModel";
import generateOtp from "../utils/generateOtp";
import { NOTIFICATION_TYPES } from "../models/notificationModel";
import adminRepository from "../repositories/adminRepository";
import notificationRepository from "../repositories/notificationRepository";
import mongoose, { Schema } from "mongoose";
import nodemailer from 'nodemailer';

interface LoginResponse {
  userData: UserDocument;
  message: string;
  token: string;
  refreshToken: string;
}

class UserService {
  async signup(
    email: string,
    password: string,
    name: string,
    phone: number, 
    res: Response
  ): Promise<object> {
    try {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomError("User already exists", 404);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const isActive: boolean = true;
      const newUser = await userRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        isActive,
      });

      generateUserTokenAndSetCookie(newUser._id, res);

      const Admin = await adminRepository.findOne({});
      const adminNotification = await notificationRepository.create({
        recipient: Admin?._id as Schema.Types.ObjectId | undefined, 
        message: `New user registered!`,
        type: NOTIFICATION_TYPES.NEW_USER,
      })

      return { user: newUser };
    } catch (error) {
      console.error("Error in signup:", error);
      throw new CustomError("Failed to sign up new user.", 500);
    }
  }

  async googleSignup(
    email: string,
    password: string,
    name: string,
  ): Promise<object> {
    try {
      console.log("pasword.....",password)
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomError("User already exists", 404);
      }
      const isActive: boolean = true;
      const newUser = await userRepository.create({
        email,
        password,
        name,
        isActive,
      });
  
      return { user: newUser };
    } catch (error) {
      console.error("Error in googleSignup:", error);
      throw new CustomError("Failed to sign up with Google.", 500);
    }
  }


  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const existingUser = await userRepository.findByEmail(email);
      if (!existingUser) {
        throw new CustomError("User not exists..", 404);
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!passwordMatch) {
        throw new CustomError("Incorrect password..", 401);
      }

      if (!existingUser.isActive) {
        throw new CustomError("Blocked by Admin..", 404);
      }

      const token = jwt.sign(
        { _id: existingUser._id },
        process.env.JWT_SECRET!,
        {
          expiresIn: "24h",
        }
      );

      let refreshToken = jwt.sign(
        { _id: existingUser._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );
      existingUser.refreshToken = refreshToken;

      await existingUser.save();
      return {
        refreshToken,
        token,
        userData: existingUser,
        message: "Successfully logged in..",
      };
    } catch (error) {
      console.error("Error in login:", error);

      throw new CustomError("Failed to log in.", 500);
    }
  }


  async CheckExistingUSer(email: string) {
    try {
      const existingUser = await userRepository.findByEmail(email);
      return existingUser;
    } catch (error) {
      console.error("Error in CheckExistingUSer:", error)
      throw new CustomError("Failed to check existing user.", 500);
    }
  }

  async generateOtpForPassword(email: string) {
    try {
      const otpCode = await generateOtp(email);
      if (!otpCode) {
        throw new CustomError("Failed to generate OTP.", 500)
      }
      return otpCode; 
    } catch (error) {
      console.error("Error in generateOtpForPassword:", error)
    throw new CustomError("Failed to generate OTP for password reset.", 500);
    }
  }


  async ResetPassword(password: string, email: string) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const status = await userRepository.UpdatePassword(hashedPassword, email);
      if (!status.success) {
        throw new Error(status.message);
      }
    } catch (error) {
      console.error("Error in ResetPassword:", error)
      throw new CustomError("Failed to reset password.", 500);
    }
  }


  async gLogin(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log("in service", email, password);
      const existingUser = await userRepository.findByEmail(email);
      if (!existingUser) {
        throw new CustomError("User not exists..", 404);
      }
      if (existingUser.isActive === false) {
        throw new CustomError("Blocked by Admin..", 404);
      }
      const token = jwt.sign(
        { _id: existingUser._id },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      let refreshToken = jwt.sign(
        { _id: existingUser._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );
      existingUser.refreshToken = refreshToken;

      await existingUser.save();
      return {
        refreshToken,
        token,
        userData: existingUser,
        message: "Successfully logged in..",
      };
    } catch (error) {
      console.error("Error in gLogin:", error);
      throw new CustomError("Failed to log in.", 500);
    }
  }

  async getUsers(page: number, limit: number, search: string) {
    try {
      const users = await userRepository.findAllUsers(page, limit, search);
      return users;
    } catch (error) {
      console.error("Error in getUsers:", error)
      throw new CustomError("Failed to get users.", 500);
    }
  }

  async getUsersCount() {
    try {
      const total = await userRepository.countDocuments();
      return total;
    } catch (error) {
      console.error("Error in getUsersCount:", error)
      throw new CustomError("Failed to get users count.", 500); 
    }
  }

  async toggleUserBlock(userId: string): Promise<any> {
    try {
      const user = await userRepository.getById(userId);
      if (!user) {
        throw new CustomError("User not found.", 404)
      }

      user.isActive = !user.isActive; // Toggle the isActive field
      await user.save();
     
    } catch (error) {
      console.error("Error in toggleUserBlock:", error)
      throw new CustomError("Failed to toggle user block.", 500);
    }
  }

  async updateProfileService(
    name: string,
    phone: number,
    userId: string,
    imageUrl: string
  ) {
    try {
      const existingUser = await userRepository.getById(userId);
      if (!existingUser) {
        throw new CustomError("User not found", 404);
      }
      
      const update = {
        name: name || existingUser.name,
        phone: phone || existingUser.phone,
        imageUrl: imageUrl || existingUser.imageUrl,
      };
      const result = await userRepository.update(userId, update);
      const userData = await userRepository.getById(userId);
      return userData;
    } catch (error) {
      console.error("Error in updateProfileService:", error)
      throw new CustomError("Failed to update profile.", 500);
    }
  }

  async checkCurrentPassword(currentpassword: string, userId: string) {
    try {
      const existingUser = await userRepository.getById(userId);

      if (!existingUser) {
        throw new CustomError("user not found", 404);
      }

      const passwordMatch = await bcrypt.compare(
        currentpassword,
        existingUser.password
      );
      if (!passwordMatch) {
        throw new CustomError("Password doesn't match", 401);
      }

      return passwordMatch;
    } catch (error) {
      console.error("Error in checkCurrentPassword:", error)
      throw new CustomError("Failed to check current password.", 500); 
    }
  }

  async UpdatePasswordService(newPassword: string, userId: string) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const existingUser = await userRepository.getById(userId);
      if (!existingUser) {
        throw new CustomError("user not found", 404);
      }
      const email = existingUser.email;

      const updatedValue = await userRepository.UpdatePassword(
        hashedPassword,
        email
      );
      if (updatedValue) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in UpdatePasswordService:", error)
    throw new CustomError("Failed to update password.", 500);
    }
  }

  async findUser(userId: string) {
    try {
      const user = await userRepository.getById(userId);
      if (!user) {
        throw new CustomError("User not found.", 404);
      }
      return user;
    } catch (error) {
      console.error("Error in findUser:", error);
      throw new CustomError("Failed to find user.", 500);
    }
  }

  async sendEmail(name:string,email:string,mobile:string,subject:string,message:string) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.USER_NAME,
            pass: process.env.USER_PASSWORD,
        },
    });
    const mailOptions = {
        from: `${name} <${email}>`,
        to: process.env.SEND_EMAIL,
        subject: subject,
        text: `${message}\n\nName:${name}\nMobile:${mobile}`,
    };
    console.log(mailOptions)

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true
    } catch (error) {
      throw new CustomError("Error sending email! Try after sometimes...", 500); 
    }
  }


}

export default new UserService();
