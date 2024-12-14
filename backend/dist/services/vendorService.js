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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const vendorRepository_1 = __importDefault(require("../repositories/vendorRepository"));
const notificationModel_1 = require("../models/notificationModel");
const customError_1 = require("../error/customError");
const adminRepository_1 = __importDefault(require("../repositories/adminRepository"));
const notificationRepository_1 = __importDefault(require("../repositories/notificationRepository"));
class VendorService {
    signup(email, password, name, phone, city, latitude, longitude, country, logoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingVendor = yield vendorRepository_1.default.findByEmail(email);
                if (existingVendor) {
                    throw new customError_1.CustomError("Vendor already exists", 409);
                }
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(password, salt);
                const isActive = true;
                const isVerified = false;
                //const verificationRequest: boolean = false;
                const newVendor = yield vendorRepository_1.default.create({
                    email,
                    password: hashedPassword,
                    name,
                    phone,
                    city,
                    isActive,
                    isVerified,
                    country,
                    location: {
                        latitude, // latitude is directly assigned as a string here
                        longitude, // longitude is directly assigned as a string here
                    },
                    logoUrl,
                    // verificationRequest,
                });
                const token = jsonwebtoken_1.default.sign({ _id: newVendor._id }, process.env.JWT_SECRET);
                const Admin = yield adminRepository_1.default.findOne({});
                const adminNotification = yield notificationRepository_1.default.create({
                    recipient: Admin === null || Admin === void 0 ? void 0 : Admin._id,
                    message: `New vendor registered!`,
                    type: notificationModel_1.NOTIFICATION_TYPES.NEW_VENDOR,
                });
                return { vendor: newVendor, token };
            }
            catch (error) {
                console.error("Error in signup:", error);
                throw new customError_1.CustomError("Failed to create new vendor.", 500);
            }
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingVendor = yield vendorRepository_1.default.findByEmail(email);
                if (!existingVendor) {
                    throw new customError_1.CustomError("vendor not exists..", 404);
                }
                const passwordMatch = yield bcrypt_1.default.compare(password, existingVendor.password);
                if (!passwordMatch) {
                    throw new customError_1.CustomError("Incorrect password..", 401);
                }
                if (existingVendor.isActive === false) {
                    throw new customError_1.CustomError("Cannot login..!Blocked by Admin...", 401);
                }
                const vendorData = yield vendorRepository_1.default.findByEmail(email);
                // If the password matches, generate and return a JWT token
                const token = jsonwebtoken_1.default.sign({ _id: existingVendor._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
                let refreshToken = existingVendor.refreshToken;
                if (!refreshToken) {
                    refreshToken = jsonwebtoken_1.default.sign({ _id: existingVendor._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
                }
                existingVendor.refreshToken = refreshToken;
                yield existingVendor.save();
                return {
                    refreshToken,
                    token,
                    vendorData: existingVendor,
                    message: "Successfully logged in..",
                };
            }
            catch (error) {
                console.error("Error in login:", error);
                throw error;
            }
        });
    }
    CheckExistingVendor(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingVendor = yield vendorRepository_1.default.findByEmail(email);
                return existingVendor;
            }
            catch (error) {
                console.error("Error in CheckExistingVendor:", error);
                throw new customError_1.CustomError("Failed to check existing vendor.", 500);
            }
        });
    }
    ResetVendorPasswordService(password, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(password, salt);
                const status = yield vendorRepository_1.default.UpdateVendorPassword(hashedPassword, email);
                if (!status.success) {
                    throw new customError_1.CustomError("Failed to reset password.", 500);
                }
            }
            catch (error) {
                console.error("Error in ResetVendorPasswordService:", error);
                throw new customError_1.CustomError("Failed to reset vendor password.", 500);
            }
        });
    }
    getSingleVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Vendor = yield vendorRepository_1.default.getById(vendorId);
                if (!Vendor) {
                    throw new customError_1.CustomError("Vendor not found.", 404);
                }
                return Vendor;
            }
            catch (error) {
                console.error("Error in getSingleVendor:", error);
                throw new customError_1.CustomError("Failed to retrieve vendor.", 500);
            }
        });
    }
    toggleVendorBlock(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Vendor = yield vendorRepository_1.default.getById(vendorId);
                if (!Vendor) {
                    throw new customError_1.CustomError("Vendor not found.", 404);
                }
                Vendor.isActive = !Vendor.isActive; // Toggle the isActive field
                yield Vendor.save();
            }
            catch (error) {
                console.error("Error in toggleVendorBlock:", error);
                throw new customError_1.CustomError("Failed to toggle vendor block.", 500);
            }
        });
    }
}
exports.default = new VendorService();
