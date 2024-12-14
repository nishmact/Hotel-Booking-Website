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
const customError_1 = require("../error/customError");
const hotelRepository_1 = __importDefault(require("../repositories/hotelRepository"));
class HotelService {
    signup(email, password, name, phone, city, country, logoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingVendor = yield hotelRepository_1.default.findByEmail(email);
                if (existingVendor) {
                    throw new customError_1.CustomError("Vendor already exists", 409);
                }
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(password, salt);
                const isActive = true;
                const isVerified = false;
                //const verificationRequest: boolean = false;
                const newVendor = yield hotelRepository_1.default.create({
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
                const token = jsonwebtoken_1.default.sign({ _id: newVendor._id }, process.env.JWT_SECRET);
                return { vendor: newVendor, token };
            }
            catch (error) {
                console.error("Error in signup:", error);
                throw new customError_1.CustomError("Failed to create new vendor.", 500);
            }
        });
    }
    getSingleHotel(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Hotel = yield hotelRepository_1.default.getById(hotelId);
                if (!Hotel) {
                    throw new customError_1.CustomError("Vendor not found.", 404);
                }
                return Hotel;
            }
            catch (error) {
                console.error("Error in getSingleVendor:", error);
                throw new customError_1.CustomError("Failed to retrieve vendor.", 500);
            }
        });
    }
}
exports.default = new HotelService();
