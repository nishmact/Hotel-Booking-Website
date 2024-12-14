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
const hotelModel_1 = __importDefault(require("../models/hotelModel"));
const hotelModel_2 = __importDefault(require("../models/hotelModel"));
const baseRepository_1 = require("./baseRepository");
class HotelRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(hotelModel_1.default);
    }
    findAllHotels(page, limit, search, category, location, sortValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = {};
                if (search && search.trim()) {
                    query.name = { $regex: new RegExp(search, "i") };
                }
                if (category && category.trim()) {
                    const categories = category.split(",").map((c) => c.trim());
                    query.hotel_type = { $in: categories };
                }
                if (location && location.trim()) {
                    const locations = location.split(",").map((l) => l.trim());
                    query.city = { $in: locations };
                }
                const validSortValue = sortValue === 1 || sortValue === 1 ? sortValue : -1;
                const hotels = yield hotelModel_2.default
                    .find(query)
                    .sort({ totalRating: validSortValue })
                    .skip((page - 1) * limit)
                    .limit(limit);
                console.log(hotels);
                return hotels;
            }
            catch (error) {
                throw error;
            }
        });
    }
    UpdateHotelPassword(password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield hotelModel_1.default.updateOne({ email: mail }, { password: password });
                if (result.modifiedCount === 1) {
                    return {
                        success: true,
                        message: "Hotel Password updated successfully.",
                    };
                }
                else {
                    return {
                        success: false,
                        message: "Hotel not found or password not updated.",
                    };
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    UpdatePassword(password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield hotelModel_1.default.updateOne({ email: mail }, { password: password });
                if (result.modifiedCount === 1) {
                    return { success: true, message: "Password updated successfully." };
                }
                else {
                    return {
                        success: false,
                        message: "User not found or password not updated.",
                    };
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    requestForVerification(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield hotelModel_2.default.findByIdAndUpdate(hotelId, {
                $set: { verificationRequest: true },
            });
            return data;
        });
    }
    updateVerificationStatus(hotelId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield hotelModel_2.default.findByIdAndUpdate(hotelId, {
                $set: { verificationRequest: false, isVerified: status === "Accepted" },
            });
            return data;
        });
    }
    findAllLocations() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield hotelModel_2.default.distinct("city");
        });
    }
}
exports.default = new HotelRepository();
