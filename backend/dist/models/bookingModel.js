"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    checkIn: {
        type: String, // Change to Date if you prefer actual Date objects
        required: true
    },
    checkOut: {
        type: String, // Change to Date if you prefer actual Date objects
        required: true
    },
    bookedDates: {
        type: [String], // Array of dates in "YYYY-MM-DD" format, or you can use Date
        required: true
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    payment_status: {
        type: String,
        default: "Pending"
    },
    amount: {
        type: Number,
        default: 0
    },
    refundAmount: {
        type: Number,
        default: 0
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Booking', bookingSchema);
