"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendorController_1 = __importDefault(require("../controllers/vendorController"));
const multer_1 = __importDefault(require("multer"));
const bookingController_1 = __importDefault(require("../controllers/bookingController"));
const messageController_1 = __importDefault(require("../controllers/messageController"));
const reviewController_1 = __importDefault(require("../controllers/reviewController"));
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const vendorAuthMiddleware_1 = __importDefault(require("../middlewares/vendorAuthMiddleware"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
//Auth
router.post("/signup", upload.single("logo"), vendorController_1.default.vendorSignup);
router.post("/verify", vendorController_1.default.verifyOtp);
router.get("/resendOtp", vendorController_1.default.ResendOtp);
router.post("/login", vendorController_1.default.VendorLogin);
router.post("/vendor-getotp", vendorController_1.default.VendorForgotPassword);
router.post("/verifyVendorotp", vendorController_1.default.VerifyOtpForPassword);
router.post("/reset-password", vendorController_1.default.ResetVendorPassword);
router.get("/pwd-resendOtp", vendorController_1.default.PwdResendOtp);
router.get("/logout", vendorController_1.default.VendorLogout);
//profile
router.get("/getvendor", vendorAuthMiddleware_1.default, vendorController_1.default.getVendor);
router.get("/getroom", vendorAuthMiddleware_1.default, vendorController_1.default.getRoom);
router.put("/update-profile/:vendorId/:roomId", vendorAuthMiddleware_1.default, upload.array("imageFiles"), vendorController_1.default.updateProfile);
router.post("/add-rooms/:vendorId", vendorAuthMiddleware_1.default, upload.array("imageFiles", 6), vendorController_1.default.AddRooms);
router.put("/updatevendor/:vendorId", vendorAuthMiddleware_1.default, upload.single("logo"), vendorController_1.default.updateVendorProfile);
router.get("/booking-details", bookingController_1.default.getBookingsByVendor);
router.get("/single-booking-details", vendorAuthMiddleware_1.default, bookingController_1.default.getBookingsById);
router.put("/update-booking-status", vendorAuthMiddleware_1.default, bookingController_1.default.updateStatus);
//message
router.patch("/delete-for-everyone", messageController_1.default.deleteAMessage);
router.patch("/delete-for-me", messageController_1.default.changeViewMessage);
router.get("/getReviews", vendorAuthMiddleware_1.default, reviewController_1.default.getReviews);
router.put("/add-review-reply", vendorAuthMiddleware_1.default, reviewController_1.default.addReviewReply);
router.get("/reviews/statistics", vendorAuthMiddleware_1.default, reviewController_1.default.getReviewStatistics);
//dashboard
router.get("/revenue", vendorAuthMiddleware_1.default, vendorController_1.default.getRevenue);
router.get("/vendor-notifications", vendorAuthMiddleware_1.default, notificationController_1.default.getAllNotifications);
router.patch("/toggle-read", vendorAuthMiddleware_1.default, notificationController_1.default.toggleRead);
router.delete("/notification", vendorAuthMiddleware_1.default, notificationController_1.default.deleteNotification);
exports.default = router;
