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
const bookingService_1 = __importDefault(require("../services/bookingService"));
const customError_1 = require("../error/customError");
const handleError_1 = require("../utils/handleError");
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
class BookingController {
    bookAnEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("book an event");
                const vendorId = req.query.vendorId;
                const roomId = req.query.roomId;
                const userId = req.query.userId;
                console.log("vendorId-", vendorId);
                console.log("roomId-", roomId);
                const { checkIn, checkOut, adultCount, childCount } = req.body;
                // Check if the date range is available
                const isDateRangeAvailable = yield bookingService_1.default.checkIfDateRangeAvailable(roomId, checkIn, checkOut);
                if (!isDateRangeAvailable) {
                    throw new customError_1.CustomError("Sorry, this date range is not available!", 404);
                }
                else {
                    try {
                        yield bookingService_1.default.acquireLockForDateRange(roomId, checkIn, checkOut);
                        const booking = yield bookingService_1.default.addABooking(checkIn, checkOut, vendorId, roomId, userId);
                        yield bookingService_1.default.releaseLockForDate(roomId, checkIn, checkOut);
                        res
                            .status(201)
                            .json({ booking, message: "Booking done successfully" });
                    }
                    catch (error) {
                        if (error instanceof customError_1.CustomError && error.statusCode === 400) {
                            res.status(400).json({ message: error.message });
                        }
                        console.error("Error acquiring lock:", error);
                        res.status(400).json({
                            message: "Sorry, this date range is currently not available.",
                        });
                    }
                }
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "bookAnEvent");
            }
        });
    }
    getBookingsByUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 6;
                const { bookings, totalBookings } = yield bookingService_1.default.getAllBookingsByUser(userId, page, pageSize);
                const totalPages = Math.ceil(totalBookings / pageSize);
                res.status(201).json({ bookings, totalPages: totalPages });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getBookingsByUser");
            }
        });
    }
    getBookingsById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.query.bookingId;
                const bookings = yield bookingService_1.default.getAllBookingsById(bookingId);
                res.status(201).json({ bookings });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getBookingsById");
            }
        });
    }
    cancelBookingByUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.query.bookingId;
                const status = "Cancelled";
                const bookings = yield bookingService_1.default.updateStatusById(bookingId, status);
                res.status(201).json({ bookings });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "cancelBookingByUser");
            }
        });
    }
    getBookingsByVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorId = req.query.vendorId;
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 8;
                console.log("Fetching bookings for vendorId:", vendorId, "page:", page, "pageSize:", pageSize);
                const { bookings, totalBookings } = yield bookingService_1.default.getAllBookingsByVendor(vendorId, page, pageSize);
                const totalPages = Math.ceil(totalBookings / pageSize);
                console.log("bookings...", bookings);
                res.status(201).json({ bookings, totalPages: totalPages });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getBookingsByVendor");
            }
        });
    }
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.query.bookingId;
                const status = req.body.status;
                const bookings = yield bookingService_1.default.updateStatusById(bookingId, status);
                res.status(201).json({ bookings });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "updateStatus");
            }
        });
    }
    getRefundDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.query.userId;
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 4;
                const { refund, totalRefund } = yield bookingService_1.default.getAllRefunds(userId, page, pageSize);
                const totalPages = Math.ceil(totalRefund / pageSize);
                res.status(201).json({ transaction: refund, totalPages: totalPages });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getRefundDetails");
            }
        });
    }
    getAllBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hotel, page = 1, limit = 6 } = req.query;
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                const filter = {};
                if (hotel) {
                    filter.hotel = hotel;
                }
                const totalBookings = yield bookingModel_1.default.countDocuments(filter);
                const bookings = yield bookingModel_1.default.find(filter)
                    .populate("userId", "name email")
                    .populate("vendorId", "name phone")
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);
                res.status(200).json({
                    bookings,
                    totalBookings,
                    totalPages: Math.ceil(totalBookings / limitNumber),
                    currentPage: pageNumber,
                });
            }
            catch (error) {
                console.error("Error fetching bookings:", error);
                res.status(500).json({ message: "Failed to fetch bookings" });
            }
        });
    }
}
exports.default = new BookingController();
