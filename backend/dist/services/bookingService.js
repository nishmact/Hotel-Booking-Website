"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importDefault(require("mongoose"));
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const bookingRepository_1 = __importDefault(require("../repositories/bookingRepository"));
const customError_1 = require("../error/customError");
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const notificationModel_1 = __importStar(require("../models/notificationModel"));
class BookingService {
    checkIfDateRangeAvailable(roomId, // The roomId passed to the function
    checkIn, checkOut) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the vendor and fetch only the specific room with the matching roomId
                const vendorData = yield vendorModel_1.default.findOne({ "rooms._id": roomId }, // Match the roomId
                { "rooms.$": 1 } // Only return the specific room in the rooms array
                );
                console.log("roomId...", roomId);
                console.log("vendor.........", vendorData);
                if (!vendorData || !vendorData.rooms || vendorData.rooms.length === 0) {
                    throw new Error("Room not found for the given roomId");
                }
                // Extract the specific room from vendorData
                const room = vendorData.rooms[0];
                // Generate date range from checkIn to checkOut
                const startDate = new Date(checkIn);
                const endDate = new Date(checkOut);
                const dateRange = [];
                // Generate list of dates within the range
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
                }
                // Check if any date in dateRange is already booked
                const isDateRangeAvailable = dateRange.every((date) => !room.bookedDates.includes(date));
                return isDateRangeAvailable;
            }
            catch (error) {
                console.error("Error checking date range:", error);
                throw new customError_1.CustomError("Error checking date range", 500);
            }
        });
    }
    acquireLockForDateRange(roomId, checkIn, checkOut) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorData = yield vendorModel_1.default.findOne({ "rooms._id": roomId }, // Match the roomId
                { "rooms.$": 1 } // Only return the specific room in the rooms array
                );
                console.log("vendorData:", vendorData);
                if (!vendorData) {
                    throw new customError_1.CustomError("Vendor not found", 404);
                }
                // Generate date range from checkIn to checkOut
                const startDate = new Date(checkIn);
                const endDate = new Date(checkOut);
                const dateRange = [];
                // Generate list of dates within the range
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
                }
                console.log("Generated date range:", dateRange);
                // Update the locks in the specific room within the vendor's data
                const result = yield vendorModel_1.default.updateOne({ "rooms._id": roomId }, // Find the vendor with the roomId
                {
                    $push: {
                        "rooms.$.locks": {
                            $each: dateRange.map(date => ({ date, isLocked: true }))
                        }
                    }
                });
                console.log("Vendor data after lock:", result);
            }
            catch (error) {
                console.error("Error acquiring locks for date range:", error);
                throw new customError_1.CustomError("Error acquiring locks", 500);
            }
        });
    }
    addABooking(checkIn, checkOut, vendorId, roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorIdObjectId = new mongoose_1.default.Types.ObjectId(vendorId);
                const userIdObjectId = new mongoose_1.default.Types.ObjectId(userId);
                // Generate the date range from checkIn to checkOut
                const startDate = new Date(checkIn);
                const endDate = new Date(checkOut);
                const dateRange = [];
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
                }
                // Create the booking with all necessary details
                const booking = yield bookingRepository_1.default.create({
                    checkIn,
                    checkOut,
                    vendorId: vendorIdObjectId,
                    userId: userIdObjectId,
                    bookedDates: dateRange, // Store the entire range in the booking document
                });
                // Update the specific room's bookedDates field in the vendor document
                yield vendorModel_1.default.findByIdAndUpdate(vendorId, {
                    $push: { "rooms.$[room].bookedDates": { $each: dateRange } },
                }, {
                    arrayFilters: [{ "room._id": roomId }], // Match the room to update
                });
                const newNotification = new notificationModel_1.default({
                    recipient: vendorId,
                    message: "New event Booked!",
                    type: notificationModel_1.NOTIFICATION_TYPES.BOOKING
                });
                yield newNotification.save();
                return booking;
            }
            catch (error) {
                console.error("Error creating a booking:", error);
                throw new customError_1.CustomError("Unable to create booking", 500);
            }
        });
    }
    releaseLockForDate(roomId, checkIn, checkOut) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate the date range from checkIn to checkOut
                const startDate = new Date(checkIn);
                const endDate = new Date(checkOut);
                const dateRange = [];
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
                }
                // Update the vendor document by removing locks in the specified date range for the room
                const result = yield vendorModel_1.default.updateOne({ "rooms._id": roomId }, // Match the roomId
                {
                    $pull: {
                        "rooms.$.locks": {
                            date: { $in: dateRange } // Match the dates in the date range
                        }
                    }
                });
                // Check if the update was successful
                if (result.modifiedCount === 0) {
                    throw new customError_1.CustomError("No locks found to release for the given dates", 404);
                }
            }
            catch (error) {
                console.error("Error releasing lock for dates:", error);
                throw new customError_1.CustomError("Unable to release lock for dates", 500);
            }
        });
    }
    getAllBookingsByUser(userId, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookings, totalBookings } = yield bookingRepository_1.default.findBookingsByUserId(userId, page, pageSize);
                return { bookings, totalBookings };
            }
            catch (error) {
                console.error("Error fetching booking for user:", error);
                throw new customError_1.CustomError("Unable fetch user booking", 500);
            }
        });
    }
    getAllBookingsById(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield bookingRepository_1.default.findBookingsByBookingId(bookingId);
                return bookings;
            }
            catch (error) {
                console.error("Error fetching bookings:", error);
                throw new customError_1.CustomError("Unable fetch bookings", 500);
            }
        });
    }
    updateStatusById(bookingId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield bookingRepository_1.default.getById(bookingId);
                if (!booking) {
                    throw new Error("Booking not found");
                }
                if (status === "Rejected" || status === "Cancelled") {
                    const { vendorId, checkIn, checkOut } = booking;
                    // Generate array of dates between checkIn and checkOut
                    const getDateRange = (start, end) => {
                        const dates = [];
                        let currentDate = new Date(start);
                        while (currentDate <= new Date(end)) {
                            dates.push(new Date(currentDate));
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                        return dates;
                    };
                    const checkInDate = new Date(checkIn);
                    const checkOutDate = new Date(checkOut);
                    const dateRange = getDateRange(checkInDate, checkOutDate);
                    // Remove the date range from vendor's bookedDates
                    yield vendorModel_1.default.findByIdAndUpdate(vendorId, {
                        $pull: { bookedDates: { $in: dateRange } },
                    });
                    const Payment = yield paymentModel_1.default.findOne({ bookingId: bookingId });
                    const newNotification = new notificationModel_1.default({
                        recipient: booking.userId,
                        message: "Booking is rejected By Vendor",
                        type: notificationModel_1.NOTIFICATION_TYPES.STATUS
                    });
                    yield newNotification.save();
                    if (status == "Cancelled" && Payment) {
                        const { userId } = booking;
                        const User = yield userModel_1.default.findById(userId);
                        const Admin = yield adminModel_1.default.findOne();
                        if (!User || !Admin) {
                            throw new Error("User or admin not found");
                        }
                        // Calculate the time difference
                        const currentTime = new Date();
                        const timeDifference = checkInDate.getTime() - currentTime.getTime();
                        const hoursUntilCheckIn = timeDifference / (1000 * 3600); // Convert to hours
                        // Set refund based on cancellation time
                        let refundAmount = 0;
                        if (hoursUntilCheckIn > 24) {
                            refundAmount = 500; // 100% refund
                        }
                        else if (hoursUntilCheckIn > 12) {
                            refundAmount = 250; // 50% refund
                        }
                        else {
                            refundAmount = 0; // No refund
                        }
                        User.wallet += refundAmount;
                        yield User.save();
                        Admin.wallet -= refundAmount;
                        yield Admin.save();
                        booking.refundAmount += refundAmount;
                        yield booking.save();
                        const newNotification = new notificationModel_1.default({
                            recipient: booking.vendorId,
                            message: "Booking Cancelled by user",
                            type: notificationModel_1.NOTIFICATION_TYPES.STATUS
                        });
                        yield newNotification.save();
                    }
                }
                const result = yield bookingModel_1.default.findByIdAndUpdate(bookingId, {
                    $set: { status: status },
                });
                yield vendorModel_1.default.findByIdAndUpdate(booking.vendorId, {
                    $inc: { totalBooking: 1 },
                });
                const newNotification = new notificationModel_1.default({
                    recipient: booking.userId,
                    message: "Booking Accepted by vendor",
                    type: notificationModel_1.NOTIFICATION_TYPES.STATUS
                });
                yield newNotification.save();
                return result;
            }
            catch (error) {
                console.error("Error updating status:", error);
                throw new customError_1.CustomError("Unable to update booking status", 500);
            }
        });
    }
    getAllBookingsByVendor(vendorId, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookings, totalBookings } = yield bookingRepository_1.default.findBookingsByVendorId(vendorId, page, pageSize);
                console.log(".......", bookings);
                return { bookings, totalBookings };
            }
            catch (error) {
                console.error("Error fetching booking for vendor:", error);
                throw new customError_1.CustomError("Unable fetch vendor booking", 500);
            }
        });
    }
    getAllRefunds(userId, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refund, totalRefund } = yield bookingRepository_1.default.findRefundForUser(userId, page, pageSize);
                return { refund, totalRefund };
            }
            catch (error) {
                console.error("Error fetching booking for vendor:", error);
                throw new customError_1.CustomError("Unable fetch vendor booking", 500);
            }
        });
    }
}
exports.default = new BookingService();
