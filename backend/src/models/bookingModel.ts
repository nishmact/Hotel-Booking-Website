import { Document, Schema, model } from "mongoose";

export interface bookingDocument extends Document {
    checkIn: string;  // Or Date if you prefer
    checkOut: string; // Or Date if you prefer
    bookedDates: string[];
    name?: string;
    city?: string;     // Optional if you no longer need it
    pin?: number;      // Optional if you no longer need it
    mobile?: number;   // Optional if you no longer need it
    createdAt: Date;
    vendorId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    status: string;
    payment_status: string;
    amount: number;
    refundAmount: number;
}

const bookingSchema = new Schema<bookingDocument>({

    checkIn: {
        type: String,  // Change to Date if you prefer actual Date objects
        required: true
    },
    checkOut: {
        type: String,  // Change to Date if you prefer actual Date objects
        required: true
    },
    bookedDates: { // Add bookedDates as an array
        type: [String], // Array of dates in "YYYY-MM-DD" format, or you can use Date
        required: true
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
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

export default model<bookingDocument>('Booking', bookingSchema);
