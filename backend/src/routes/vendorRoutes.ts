import express from "express";
import VendorController from "../controllers/vendorController";
import multer from "multer";
import BookingController from "../controllers/bookingController";
import MessageController from "../controllers/messageController";
import reviewController from "../controllers/reviewController";
import NotificationController from "../controllers/notificationController";
import vendorAuth from "../middlewares/vendorAuthMiddleware";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

//Auth

router.post("/signup", upload.single("logo"), VendorController.vendorSignup);
router.post("/verify", VendorController.verifyOtp);
router.get("/resendOtp", VendorController.ResendOtp);
router.post("/login", VendorController.VendorLogin);
router.post("/vendor-getotp", VendorController.VendorForgotPassword);
router.post("/verifyVendorotp", VendorController.VerifyOtpForPassword);
router.post("/reset-password", VendorController.ResetVendorPassword);
router.get("/pwd-resendOtp", VendorController.PwdResendOtp);
router.get("/logout", VendorController.VendorLogout);

//profile

router.get("/getvendor", vendorAuth, VendorController.getVendor);
router.get("/getroom", vendorAuth, VendorController.getRoom);
router.put(
  "/update-profile/:vendorId/:roomId",
  vendorAuth,
  upload.array("imageFiles"),
  VendorController.updateProfile
);
router.post(
  "/add-rooms/:vendorId",
  vendorAuth,
  upload.array("imageFiles", 6),
  VendorController.AddRooms
);
router.put(
  "/updatevendor/:vendorId",
  vendorAuth,
  upload.single("logo"),
  VendorController.updateVendorProfile
);

router.get(
  "/booking-details",
  BookingController.getBookingsByVendor
);
router.get(
  "/single-booking-details",
  vendorAuth,
  BookingController.getBookingsById
);
router.put(
  "/update-booking-status",
  vendorAuth,
  BookingController.updateStatus
);

//message
router.patch("/delete-for-everyone", MessageController.deleteAMessage);
router.patch("/delete-for-me", MessageController.changeViewMessage);

router.get("/getReviews", vendorAuth, reviewController.getReviews);
router.put("/add-review-reply", vendorAuth, reviewController.addReviewReply);
router.get(
  "/reviews/statistics",
  vendorAuth,
  reviewController.getReviewStatistics
);

//dashboard
router.get("/revenue", vendorAuth, VendorController.getRevenue);

router.get(
  "/vendor-notifications",
  vendorAuth,
  NotificationController.getAllNotifications
);
router.patch("/toggle-read", vendorAuth, NotificationController.toggleRead);
router.delete(
  "/notification",
  vendorAuth,
  NotificationController.deleteNotification
);

export default router;
