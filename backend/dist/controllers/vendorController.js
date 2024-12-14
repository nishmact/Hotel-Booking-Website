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
const vendorService_1 = __importDefault(require("../services/vendorService"));
const generateOtp_1 = __importDefault(require("../utils/generateOtp"));
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const customError_1 = require("../error/customError");
const cloudinary_1 = __importDefault(require("cloudinary"));
const handleError_1 = require("../utils/handleError");
const sharp_1 = __importDefault(require("sharp"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
dotenv_1.default.config();
class VendorController {
    vendorSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name, phone, city, country, latitude, longitude } = req.body;
                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
                let logoUrl = "";
                if (req.file) {
                    const buffer = yield (0, sharp_1.default)(req.file.buffer)
                        .resize({ height: 1200, width: 1200, fit: "contain" })
                        .toBuffer();
                    logoUrl = yield uploadHotelImage(buffer, req.file.mimetype);
                }
                const otpCode = yield (0, generateOtp_1.default)(email);
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
    AddRooms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description, type, pricePerNight, facilities, adultCount, childCount, } = req.body;
                const vendorId = req.params.vendorId;
                const imageFiles = req.files || [];
                let imageUrls = [];
                if (imageFiles.length > 0) {
                    imageUrls = yield uploadImages(imageFiles);
                }
                else {
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
                const updatedVendor = yield vendorModel_1.default.findByIdAndUpdate(vendorId, { $push: { rooms: roomData } }, { new: true, upsert: false });
                if (updatedVendor) {
                    res.status(200).json({ message: "Room added successfully" });
                }
                else {
                    res.status(404).json({ message: "Vendor not found" });
                }
            }
            catch (error) {
                console.error("Error adding room:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = req.body.otp;
                const vendorData = req.session.vendorData;
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
                    throw new customError_1.CustomError("OTP Expired...Try to resend OTP !!", 400);
                }
                if (otp === otpCode) {
                    const { token, vendor } = yield vendorService_1.default.signup(email, password, name, phone, country, vendorData.location.latitude, vendorData.location.longitude, city, vendorData.logoUrl);
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
    ResendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorData = req.session.vendorData;
                if (!vendorData) {
                    res
                        .status(400)
                        .json({ error: "Session data not found. Please sign up again." });
                    return;
                }
                const email = vendorData.email;
                const newOtp = yield (0, generateOtp_1.default)(email);
                if (req.session.vendorData) {
                    req.session.vendorData.otpCode = newOtp;
                }
                else {
                    console.error("Session user data is unexpectedly undefined.");
                    res.status(500).json({
                        message: "Server Error: Session user data is unexpectedly undefined.",
                    });
                    return;
                }
                res.status(200).json({ message: "New OTP sent to email" });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "ResendOtp");
            }
        });
    }
    VendorLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { refreshToken, token, vendorData, message } = yield vendorService_1.default.login(email, password);
                res.cookie("jwtToken", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                });
                res.status(200).json({ token, vendorData, message, refreshToken });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "VendorLogin");
            }
        });
    }
    VendorForgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.body.email;
                const vendor = yield vendorService_1.default.CheckExistingVendor(email);
                if (vendor) {
                    const otp = yield (0, generateOtp_1.default)(email);
                    req.session.vendorotp = { otp: otp, email: email };
                    console.log(req.session);
                    res.status(200).json({
                        message: "otp sent to vendor email for password updation request ",
                        email: email,
                    });
                }
                else {
                    res.status(400).json({ error: "Email not Registered with us !!" });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "VendorForgotPassword");
            }
        });
    }
    VerifyOtpForPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ReceivedOtp = req.body.otp;
                console.log("received otp", ReceivedOtp);
                console.log(req.session);
                const generatedOtp = req.session.vendorotp.otp;
                console.log("generated otp", generateOtp_1.default);
                if (ReceivedOtp === generatedOtp) {
                    console.log("otp is correct , navigating vendor to update password.");
                    res
                        .status(200)
                        .json({ message: "otp is correct, please update password now" });
                }
                else {
                    res.status(400).json({ Error: `otp's didn't matched..` });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "VerifyOtpForPassword");
            }
        });
    }
    ResetVendorPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const password = req.body.password;
                const confirmPassword = req.body.confirm_password;
                if (password === confirmPassword) {
                    const email = req.session.vendorotp.email;
                    const status = yield vendorService_1.default.ResetVendorPasswordService(password, email);
                    res.status(200).json({ message: "Password reset successfully." });
                }
                else {
                    res.status(400).json({ error: "Passwords do not match." });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "ResetVendorPassword");
            }
        });
    }
    PwdResendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = req.session.otp;
                if (!otp) {
                    res
                        .status(400)
                        .json({ error: "Session data not found. Please sign up again." });
                    return;
                }
                const email = otp.email;
                const newOtp = yield (0, generateOtp_1.default)(email);
                if (req.session.otp) {
                    req.session.otp.otp = newOtp;
                }
                else {
                    console.error("Session user data is unexpectedly undefined.");
                    res.status(500).json({
                        message: "Server Error: Session user data is unexpectedly undefined.",
                    });
                    return;
                }
                res.status(200).json({ message: "New OTP sent to email" });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "PwdResendOtp");
            }
        });
    }
    VendorLogout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("jwtToken");
                res.status(200).json({ message: "vendor logged out successfully" });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "VendorLogout");
            }
        });
    }
    getVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorId = req.query.vendorid;
                if (!vendorId) {
                    res.status(400).json({ error: "Vendor ID is required." });
                    return;
                }
                const data = yield vendorService_1.default.getSingleVendor(vendorId);
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
    getRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomId } = req.query;
            if (!roomId) {
                return res.status(400).json({ error: "Room ID is required" });
            }
            try {
                const vendor = yield vendorModel_1.default.findOne({ "rooms._id": roomId });
                if (!vendor) {
                    return res.status(404).json({ error: "Vendor or room not found" });
                }
                const room = vendor.rooms.find((room) => { var _a; return ((_a = room._id) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
                if (!room) {
                    return res.status(404).json({ error: "Room not found" });
                }
                res.json(room);
            }
            catch (error) {
                console.error("Error fetching room data:", error);
                return res.status(500).json({ error: "Server error" });
            }
        });
    }
    updateVendorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId } = req.params;
                const { name, city, country, phone } = req.body;
                let logoUrl = "";
                if (req.file) {
                    const buffer = yield (0, sharp_1.default)(req.file.buffer)
                        .resize({ height: 1200, width: 1200, fit: "contain" })
                        .toBuffer();
                    logoUrl = yield uploadHotelImage(buffer, req.file.mimetype);
                }
                const vendor = yield vendorModel_1.default.findById(vendorId);
                if (!vendor) {
                    res.status(404).json({ message: "Vendor not found" });
                    return;
                }
                vendor.name = name || vendor.name;
                vendor.city = city || vendor.city;
                vendor.country = country || vendor.country;
                vendor.phone = phone || vendor.phone;
                if (logoUrl)
                    vendor.logoUrl = logoUrl;
                yield vendor.save();
                res
                    .status(200)
                    .json({ message: "Vendor profile updated successfully", vendor });
            }
            catch (error) {
                console.error("Error updating vendor profile:", error);
                res
                    .status(500)
                    .json({
                    message: "An error occurred while updating the vendor profile",
                });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, roomId } = req.params;
                const updatedRoomData = req.body;
                const vendor = yield vendorModel_1.default.findById(vendorId);
                if (!vendor) {
                    res.status(404).json({ message: "Vendor not found" });
                    return;
                }
                const roomIndex = vendor.rooms.findIndex((room) => { var _a; return ((_a = room._id) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
                if (roomIndex === -1) {
                    res.status(404).json({ message: "Room not found" });
                    return;
                }
                const room = vendor.rooms[roomIndex];
                const updatedRoom = room.toObject();
                vendor.rooms[roomIndex] = Object.assign(Object.assign({}, updatedRoom), updatedRoomData);
                const files = req.files;
                if (files && files.length > 0) {
                    const newImageUrls = yield uploadImages(files);
                    vendor.rooms[roomIndex].imageUrls = [
                        ...vendor.rooms[roomIndex].imageUrls,
                        ...newImageUrls,
                    ];
                }
                yield vendor.save();
                res.status(200).json({
                    message: "Room updated successfully",
                    room: vendor.rooms[roomIndex],
                });
            }
            catch (error) {
                console.error("Error updating room:", error);
                res.status(500).json({ message: "Something went wrong" });
            }
        });
    }
    getAllVendors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 6, search = "" } = req.query;
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                // Implement search by name or other vendor properties (if necessary)
                const query = search ? { name: { $regex: search, $options: "i" } } : {};
                const vendors = yield vendorModel_1.default.find(query)
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);
                const totalVendors = yield vendorModel_1.default.countDocuments(query);
                res.status(200).json({ vendors, totalVendors });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getAllVendors");
            }
        });
    }
    Toggleblock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const VendorId = req.query.VendorId;
                if (!VendorId) {
                    throw new Error("Vendor ID is missing or invalid.");
                }
                yield vendorService_1.default.toggleVendorBlock(VendorId);
                let process = yield vendorModel_1.default.findOne({ _id: VendorId });
                res.status(200).json({
                    message: "User block status toggled successfully.",
                    process: !(process === null || process === void 0 ? void 0 : process.isActive) ? "block" : "unblock",
                });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "Toggleblock");
            }
        });
    }
    getRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorId = req.query.vendorId;
                const dateType = req.query.date;
                if (!vendorId || !mongoose_1.Types.ObjectId.isValid(vendorId)) {
                    res.status(400).json({ message: "Invalid or missing vendorId" });
                    return;
                }
                let start, end, groupBy, sortField, arrayLength = 0;
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
                        const { startOfFiveYearsAgo, endOfCurrentYear } = getLastFiveYearsRange();
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
                const revenueData = yield paymentModel_1.default.aggregate([
                    {
                        $match: {
                            vendorId: new mongoose_1.Types.ObjectId(vendorId),
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
                        }
                        else if (dateType === "month") {
                            return r._id.month === index + 1;
                        }
                        else if (dateType === "year") {
                            return (r._id.year ===
                                new Date().getFullYear() - (arrayLength - 1) + index);
                        }
                        return false;
                    });
                    return item ? item.totalRevenue : 0; // Default to 0 if no data for the expected index
                });
                res.status(200).json({ revenue: revenueArray });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getRevenue");
            }
        });
    }
}
function uploadImages(imageFiles) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadPromises = imageFiles.map((image) => __awaiter(this, void 0, void 0, function* () {
            const b64 = Buffer.from(image.buffer).toString("base64");
            let dataURI = "data:" + image.mimetype + ";base64," + b64;
            const res = yield cloudinary_1.default.v2.uploader.upload(dataURI);
            return res.url;
        }));
        const imageUrls = yield Promise.all(uploadPromises);
        return imageUrls;
    });
}
function uploadHotelImage(buffer, mimetype) {
    return __awaiter(this, void 0, void 0, function* () {
        const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
        const uploadResult = yield cloudinary_1.default.v2.uploader.upload(base64Image, {
            folder: "hotel_profiles",
        });
        return uploadResult.secure_url;
    });
}
function getCurrentWeekRange() {
    const startOfWeek = (0, moment_1.default)().startOf("isoWeek").toDate();
    const endOfWeek = (0, moment_1.default)().endOf("isoWeek").toDate();
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
exports.default = new VendorController();
