import express from "express";
import  AdminController  from "../controllers/adminController";
import adminAuth from "../middlewares/adminAuthMiddleware";
import  UserController  from "../controllers/userController";
import  VendorController  from "../controllers/vendorController";
import  PaymentController  from "../controllers/paymentController";
import  BookingController  from "../controllers/bookingController";
import NotificationController  from "../controllers/notificationController";

const router = express.Router();


//Auth
router.post('/login' , AdminController.Adminlogin);
router.get('/logout' ,AdminController.Adminlogout);
router.post('/refresh-token' , AdminController.createRefreshToken)

//User
router.get('/users',adminAuth, UserController.allUsers);
router.patch('/block-unblock' , UserController.Toggleblock)


//vendors
router.get("/vendors",adminAuth, VendorController.getAllVendors);
router.patch('/vendorblock-unblock', VendorController.Toggleblock)

//Payment
router.get('/load-admin-data',AdminController.getAdminData)
// router.get('/all-payment-details',adminAuth,PaymentController.getAllPayments);
router.get('/all-payment-details',PaymentController.getAllPayments);

//dashboard
router.get("/revenue",AdminController.getRevenue)
router.get("/dashboard-stats",AdminController.getCounts);

router.get("/bookings",BookingController.getAllBookings)

//Notification
router.get('/admin-notifications',NotificationController.getAllNotifications);
router.patch('/toggle-read',NotificationController.toggleRead)
router.delete("/notification",NotificationController.deleteNotification)

export default router;



