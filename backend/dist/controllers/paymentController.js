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
const stripe_1 = __importDefault(require("stripe"));
const paymentService_1 = __importDefault(require("../services/paymentService"));
const handleError_1 = require("../utils/handleError");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PaymentController {
    makePayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stripeSecretKey = process.env.STRIPE_KEY;
                if (!stripeSecretKey) {
                    throw new Error("Stripe secret key is not set in environment variables");
                }
                const stripe = new stripe_1.default(stripeSecretKey, {
                    apiVersion: "2024-10-28.acacia",
                });
                const { userId, bookingId, vendorId, name } = req.body;
                if (!userId || !bookingId || !vendorId || !name) {
                    throw new Error("Missing required parameters: 'name', 'userId', 'bookingId', or 'vendorId'");
                }
                const session = yield stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price_data: {
                                currency: "bdt",
                                product_data: {
                                    name: name,
                                    metadata: { vendorId, userId },
                                },
                                unit_amount: 1000 * 100,
                            },
                            quantity: 1,
                        },
                    ],
                    mode: "payment",
                    success_url: `${process.env.FRONTEND_URL}/payment-success?id=${bookingId}`,
                    cancel_url: `${process.env.FRONTEND_URL}/profile/booking-details`,
                });
                req.session.payment = { amount: 1000, userId, bookingId, vendorId };
                console.log("payment...", req.session.payment);
                console.log("Stripe session created:", session.url);
                res.send({ url: session.url });
            }
            catch (error) {
                console.error("Stripe Session Creation Error:", error);
                (0, handleError_1.handleError)(res, error, "Stripe session creation error");
            }
        });
    }
    addPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("session...", req.session.payment);
                const paymentData = req.session.payment;
                const amount = paymentData.amount;
                const userId = paymentData.userId;
                const vendorId = paymentData.vendorId;
                const bookingId = paymentData.bookingId;
                const payment = yield paymentService_1.default.addNewPayment(amount, userId, vendorId, bookingId);
                res.status(201).json({ payment });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "addPayment");
            }
        });
    }
    getAllPayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 6;
                const { payment, count } = yield paymentService_1.default.getPayments(page, pageSize);
                const totalPages = Math.ceil(count / pageSize);
                res.status(200).json({ payment, totalPages });
            }
            catch (error) {
                (0, handleError_1.handleError)(res, error, "getAllPayments");
            }
        });
    }
}
exports.default = new PaymentController();
