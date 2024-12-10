import express from "express";
import UserController from "../controllers/userController";
import multer from "multer";
import BookingController from "../controllers/bookingController";
import PaymentController from "../controllers/paymentController";
import VendorController from "../controllers/vendorController";
import MessageController from "../controllers/messageController";
import ReviewController from "../controllers/reviewController";
import NotificationController from "../controllers/notificationController";
import userAuth from "../middlewares/userAuthMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

//Auth
router.post("/signup", UserController.UserSignup);
router.post("/verify", UserController.verifyOtp);
router.get("/logout", UserController.UserLogout);
router.get("/resendOtp", UserController.ResendOtp);
router.post("/login", UserController.UserLogin);
router.post("/google/register", UserController.googleRegister);
router.post("/google/login", UserController.googleLogin);
router.get("/pwd-resendOtp", UserController.PwdResendOtp);
router.post("/verify-otp", UserController.VerifyOtpForPassword);
router.post("/getotp", UserController.UserForgotPassword);
router.post("/reset-password", UserController.ResetUserPassword);
router.get("/", UserController.Home);

router.get("/user-profile/:userId",userAuth, UserController.getUser);
router.get("/search", UserController.getAllhotels);
router.get("/details/:hotelId/:roomId", UserController.details);

router.get("/getvendor", VendorController.getVendor);

router.post("/book-an-event",userAuth, BookingController.bookAnEvent);
router.get("/get-bookings",userAuth, BookingController.getBookingsByUser);
router.get("/single-booking",userAuth, BookingController.getBookingsById);
router.put("/cancel-booking",userAuth, BookingController.cancelBookingByUser);
router.post("/create-checkout-session", PaymentController.makePayment);
router.post("/add-payment", PaymentController.addPayment);
router.get("/all-transaction-details", BookingController.getRefundDetails);

router.put(
  "/update-profile",
  upload.single("image"),
  UserController.updateProfile
);
router.post("/update-password", UserController.updatePasswordController);

router.patch("/delete-for-everyone", MessageController.deleteAMessage);
router.patch("/delete-for-me", MessageController.changeViewMessage);
router.get("/getUserData", UserController.getUserData);

router.patch("/toggle-read", NotificationController.toggleRead);
router.get("/user-notifications", NotificationController.getAllNotifications);
router.delete("/notification", NotificationController.deleteNotification);
router.get("/notification-count",  NotificationController.getCount);

router.post("/send-message",UserController.sendMessage)

router.post("/addVendorReview", ReviewController.addReview);
router.get("/getReviews",userAuth, ReviewController.getReviews);
router.patch("/update-review",  ReviewController.updateReview);

export default router;
