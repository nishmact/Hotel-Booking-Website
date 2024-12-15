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
exports.uploadUserImage = uploadUserImage;
const userModel_1 = __importDefault(require("../models/userModel"));
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_1 = require("cloudinary");
const handleError_1 = require("../utils/handleError");
const generateOtp_1 = __importDefault(require("../utils/generateOtp"));
const customError_1 = require("../error/customError");
const userService_1 = __importDefault(require("../services/userService"));
const userModel_2 = __importDefault(require("../models/userModel"));
dotenv_1.default.config();
class UserController {
    UserSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name, phone } = req.body;
                const errors = {};
                if (!email || !email.trim()) {
                    errors.email = "Email is required and cannot be empty";
                }
                else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
                    errors.email = "Invalid email format";
                }
                if (!password || !password.trim()) {
                    errors.password = "Password is required and cannot be empty";
                }
                else if (password.length < 6) {
                    errors.password = "Password must be at least 6 characters long";
                }
                if (!name || !name.trim()) {
                    errors.name = "Name is required and cannot be empty";
                }
                else if (name.length < 3) {
                    errors.name = "Name must be at least 3 characters long";
                }
                if (!phone || !phone.trim()) {
                    errors.phone = "Phone number is required and cannot be empty";
                }
                else if (!/^\d{10}$/.test(phone)) {
                    errors.phone = "Phone number must be a valid 10-digit number";
                }
                const otpCode = yield (0, generateOtp_1.default)(email);
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
                }
                else {
                    console.log("couldn't generate otp, error occcured ,please fix !!");
                    res.status(500).json({
                        message: `Server Error couldn't generate otp, error occcured ,please fix !!`,
                    });
                }
            }
            catch (error) {
                console.error("Signup error:", error);
                (0, handleError_1.handleError)(res, error, "UserSignup");
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = req.body.otp;
                const userData = req.session.user;
                const email = userData.email;
                const password = userData.password;
                const name = userData.name;
                const phone = userData.phone;
                if (!userData.otpCode) {
                    throw new customError_1.CustomError("OTP Expired...Try to resend OTP !!", 400);
                }
                const otpCode = userData.otpCode;
                if (otp === otpCode) {
                    const user = yield userService_1.default.signup(email, password, name, phone, res);
                    res.status(201).json(user);
                }
                else {
                    throw new customError_1.CustomError("Invalid otp !!", 400);
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "verifyOtp");
            }
        });
    }
    googleRegister(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("This is credential in body: ", req.body.credential);
                const token = req.body.credential;
                console.log(token);
                const decodedData = jsonwebtoken_1.default.decode(req.body.credential);
                console.log("Decoded data: ", decodedData);
                const { name, email, jti } = decodedData;
                const user = yield userService_1.default.googleSignup(email, jti, name);
                if (user) {
                    res.status(200).json({ message: "user saved successfully" });
                }
            }
            catch (error) {
                res.status(400).json({ error: "User already exists" });
            }
        });
    }
    UserLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { token, refreshToken, userData, message } = yield userService_1.default.login(email, password);
                res.cookie("jwtToken", token, { httpOnly: true });
                res.status(200).json({ token, userData, message, refreshToken });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "UserLogin");
            }
        });
    }
    googleLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decodedData = jsonwebtoken_1.default.decode(req.body.credential);
                console.log(decodedData);
                if (!decodedData) {
                    return res.status(400).json({ error: "Invalid credentials" });
                }
                const { email, jti } = decodedData;
                const password = jti;
                const { refreshToken, token, userData, message } = yield userService_1.default.gLogin(email, password);
                console.log("userData....", userData);
                // req.session.user = userData._id;
                res.cookie("jwtToken", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                });
                res.status(200).json({ refreshToken, token, userData, message });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "googleLogin");
            }
        });
    }
    UserLogout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("logout...");
                res.cookie("jwtUser", "", { maxAge: 0 });
                res.status(200).json({ message: "User logged out successfully" });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "UserLogout");
            }
        });
    }
    ResendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Resend otp");
                const userData = req.session.user;
                if (!userData) {
                    res
                        .status(400)
                        .json({ error: "Session data not found. Please sign up again." });
                    return;
                }
                const email = userData.email;
                const newOtp = yield (0, generateOtp_1.default)(email);
                console.log("newOTP...", newOtp);
                if (req.session.user) {
                    req.session.user.otpCode = newOtp;
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
    UserForgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.body.email;
                console.log(email);
                const user = yield userService_1.default.CheckExistingUSer(email);
                if (user) {
                    const otp = yield userService_1.default.generateOtpForPassword(email);
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
                }
                else {
                    res.status(400).json({ error: "User not found !!" });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "UserForgotPassword");
            }
        });
    }
    VerifyOtpForPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const ReceivedOtp = req.body.otp;
                const generatedOtp = (_a = req.session.otp) === null || _a === void 0 ? void 0 : _a.otp;
                if (!req.session.otp) {
                    throw new customError_1.CustomError("OTP Expired...Try to resend OTP !!", 400);
                }
                if (ReceivedOtp === generatedOtp) {
                    console.log("otp is correct , navigating user to update password.");
                    res.status(200).json({ message: "Otp is verified..!" });
                }
                else {
                    throw new customError_1.CustomError("Invalid OTP !!", 400);
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "VerifyOtpForPassword");
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
    ResetUserPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const password = req.body.password;
                const confirmPassword = req.body.confirm_password;
                if (password === confirmPassword) {
                    const email = (_a = req.session.otp) === null || _a === void 0 ? void 0 : _a.email;
                    console.log("email " + email);
                    const status = yield userService_1.default.ResetPassword(password, email);
                    req.session.otp = undefined;
                    res.status(200).json({ message: "Password reset successfully." });
                }
                else {
                    res.status(400).json({ error: "Passwords do not match." });
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "ResetUserPassword");
            }
        });
    }
    Home(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Home page");
        });
    }
    allUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 6, search = "" } = req.query;
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                const users = yield userService_1.default.getUsers(pageNumber, limitNumber, search.toString());
                const totalUsers = yield userService_1.default.getUsersCount();
                res.status(200).json({ users, totalUsers });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "allUsers");
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId.toString();
                const user = yield userModel_2.default.findOne({ _id: userId });
                if (user) {
                    res.status(200).json(user);
                }
                else {
                    res.status(404).json({ message: "User not found" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "An error occurred" });
            }
        });
    }
    getUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                const data = yield userService_1.default.findUser(userId);
                res.status(200).json(data);
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getUser");
            }
        });
    }
    getAllhotels(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // console.log("Request Query Params:", req.query);
                const query = constructSearchQuery(req.query); // Original search query
                const pageSize = 5;
                const pageNumber = parseInt(((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || "1", 10);
                const skip = (pageNumber - 1) * pageSize;
                //  console.log(`Skip: ${skip}, Limit: ${pageSize}`);
                let sortOptions = { "rooms.pricePerNight": 1 };
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
                const hotels = yield vendorModel_1.default
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
                const total = yield vendorModel_1.default.countDocuments(query);
                //  console.log("Total hotels count:", total);
                console.log("Hotels After Aggregate:", JSON.stringify(hotels, null, 2));
                const response = {
                    data: hotels.map((item) => (Object.assign(Object.assign({}, item.hotel), { rooms: item.rooms }))),
                    pagination: {
                        total,
                        page: pageNumber,
                        pages: Math.ceil(total / pageSize),
                    },
                };
                //  console.log("Final Response:", JSON.stringify(response, null, 2));
                res.json(response);
            }
            catch (error) {
                console.error("Error in getAllhotels:", error);
                (0, handleError_1.handleError)(res, error, "getAllhotels");
            }
        });
    }
    details(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hotelId = req.params.hotelId;
                const roomId = req.params.roomId;
                const hotel = yield vendorModel_1.default.findById(hotelId).populate("rooms");
                if (!hotel) {
                    return res.status(404).json({ error: "Hotel not found" });
                }
                const room = hotel.rooms.find((room) => { var _a; return ((_a = room._id) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
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
            }
            catch (error) {
                console.error("Error fetching hotel details:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    Toggleblock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                if (!userId) {
                    res.status(400).json({ message: "User ID is missing or invalid." });
                    return;
                }
                yield userService_1.default.toggleUserBlock(userId);
                let process = yield userModel_1.default.findOne({ _id: userId });
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
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, mobile, subject, message } = req.body;
                const data = yield userService_1.default.sendEmail(name, email, mobile, subject, message);
                res.status(200).json(data);
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "sendMessage");
            }
        });
    }
    updatePasswordController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const currentPassword = req.body.current_password;
                const newPassword = req.body.new_password;
                const userId = req.query.userid;
                let status = yield userService_1.default.checkCurrentPassword(currentPassword, userId);
                if (!status) {
                    throw new customError_1.CustomError(`Current password is wrong!`, 400);
                }
                const data = yield userService_1.default.UpdatePasswordService(newPassword, userId);
                if (!data) {
                    res
                        .status(400)
                        .json({ error: "couldn't update password..internal error." });
                }
                res.status(200).json({ message: "password updated successfully.." });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "updatePasswordController");
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Profile...");
                const { name, phone } = req.body;
                const userId = req.query.userid;
                let imageUrl = "";
                if (req.file) {
                    const buffer = yield (0, sharp_1.default)(req.file.buffer)
                        .resize({ height: 1200, width: 1200, fit: "contain" })
                        .toBuffer();
                    imageUrl = yield uploadUserImage(buffer, req.file.mimetype);
                }
                const user = yield userService_1.default.updateProfileService(name, parseInt(phone), userId, imageUrl);
                res.status(201).json(user);
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "updateProfile");
            }
        });
    }
}
function uploadUserImage(buffer, mimetype) {
    return __awaiter(this, void 0, void 0, function* () {
        const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
        const uploadResult = yield cloudinary_1.v2.uploader.upload(base64Image, {
            folder: "user_profiles",
        });
        return uploadResult.secure_url;
    });
}
const constructSearchQuery = (queryParams) => {
    let constructedQuery = {};
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
    if (queryParams.maxPrice &&
        queryParams.maxPrice.length > 0 &&
        queryParams.maxPrice[0] !== "") {
        const maxPrice = parseInt(queryParams.maxPrice[0]);
        if (!isNaN(maxPrice)) {
            constructedQuery["rooms.pricePerNight"] = { $lte: maxPrice };
        }
    }
    return constructedQuery;
};
exports.default = new UserController();
