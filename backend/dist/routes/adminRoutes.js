"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = __importDefault(require("../controllers/adminController"));
const adminAuthMiddleware_1 = __importDefault(require("../middlewares/adminAuthMiddleware"));
const userController_1 = __importDefault(require("../controllers/userController"));
const vendorController_1 = __importDefault(require("../controllers/vendorController"));
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
const bookingController_1 = __importDefault(require("../controllers/bookingController"));
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const router = express_1.default.Router();
//Auth
router.post('/login', adminController_1.default.Adminlogin);
router.get('/logout', adminController_1.default.Adminlogout);
router.post('/refresh-token', adminController_1.default.createRefreshToken);
//User
router.get('/users', adminAuthMiddleware_1.default, userController_1.default.allUsers);
router.patch('/block-unblock', userController_1.default.Toggleblock);
//vendors
router.get("/vendors", adminAuthMiddleware_1.default, vendorController_1.default.getAllVendors);
router.patch('/vendorblock-unblock', vendorController_1.default.Toggleblock);
//Payment
router.get('/load-admin-data', adminController_1.default.getAdminData);
// router.get('/all-payment-details',adminAuth,PaymentController.getAllPayments);
router.get('/all-payment-details', paymentController_1.default.getAllPayments);
//dashboard
router.get("/revenue", adminController_1.default.getRevenue);
router.get("/dashboard-stats", adminController_1.default.getCounts);
router.get("/bookings", bookingController_1.default.getAllBookings);
//Notification
router.get('/admin-notifications', notificationController_1.default.getAllNotifications);
router.patch('/toggle-read', notificationController_1.default.toggleRead);
router.delete("/notification", notificationController_1.default.deleteNotification);
exports.default = router;
