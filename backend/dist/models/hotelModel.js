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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LockSchema = new mongoose_1.Schema({
    date: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
});
const RoomSchema = new mongoose_1.Schema({
    roomName: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    occupancy: {
        adults: { type: Number, required: true },
        children: { type: Number, required: true },
    },
    facilities: [{ type: String, required: true }],
    pricePerNight: { type: Number, required: true },
    imageUrls: [{ type: String, required: true }],
    bookedDates: [{ type: String }],
    locks: [LockSchema],
});
const HotelSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    logoUrl: { type: String },
    rooms: [RoomSchema],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Hotel", HotelSchema);
