"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHotelImage = uploadHotelImage;
const generateOtp_1 = __importDefault(require("../utils/generateOtp"));
const dotenv_1 = __importDefault(require("dotenv"));
const customError_1 = require("../error/customError");
const cloudinary_1 = require("cloudinary");
const handleError_1 = require("../utils/handleError");
const sharp_1 = __importDefault(require("sharp"));
const hotelService_1 = __importDefault(require("../services/hotelService"));
dotenv_1.default.config();
class HotelController {
    hotelSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Hotel.......");
                const { email, password, name, phone, city, country } = req.body;
                let logoUrl = "";
                if (req.file) {
                    const buffer = yield (0, sharp_1.default)(req.file.buffer)
                        .resize({ height: 1200, width: 1200, fit: "contain" })
                        .toBuffer();
                    logoUrl = yield uploadHotelImage(buffer, req.file.mimetype);
                }
                const otpCode = yield (0, generateOtp_1.default)(email);
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
                    console.log("vendor signup..Before");
                    console.log(req.session);
                    res.status(200).json({
                        message: "OTP sent to vendor's email for verification..",
                        email: email,
                    });
                }
                else {
                    console.log("Couldn't generate OTP, an error occurred, please fix !!");
                    res.status(500).json({
                        message: `Server Error couldn't generate OTP, an error occurred, please fix !!`,
                    });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "vendorSignup");
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Hotel verify...");
                const otp = req.body.otp;
                const hotelData = req.session.hotelData;
                const email = hotelData.email;
                const password = hotelData.password;
                const name = hotelData.name;
                const phone = hotelData.phone;
                const city = hotelData.city;
                const country = hotelData.country;
                const otpCode = hotelData.otpCode;
                if (!hotelData.otpCode) {
                    throw new customError_1.CustomError("OTP Expired...Try to resend OTP !!", 400);
                }
                if (otp === otpCode) {
                    const { token, vendor } = yield hotelService_1.default.signup(email, password, name, phone, country, city, hotelData.logoUrl);
                    res.status(201).json({ vendor });
                }
                else {
                    throw new customError_1.CustomError("Invalid otp !!", 400);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getHotel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hotelId = req.query.hotelid; // or req.query.Id?.toString()
                console.log("hotelId..", hotelId);
                if (!hotelId) {
                    res.status(400).json({ error: "Vendor ID is required." });
                    return;
                }
                const data = yield hotelService_1.default.getSingleHotel(hotelId);
                if (!data) {
                    res.status(400).json({ error: "Vendor not found , error occured" });
                }
                else {
                    res.status(200).json({ data: data });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getVendor");
            }
        });
    }
}
function uploadHotelImage(buffer, mimetype) {
    return __awaiter(this, void 0, void 0, function* () {
        const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
        const uploadResult = yield cloudinary_1.v2.uploader.upload(base64Image, {
            folder: "hotel_profiles",
        });
        return uploadResult.secure_url;
    });
}
exports.default = new HotelController();
