"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const hotelController_1 = __importDefault(require("../controllers/hotelController"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
//Auth
router.post("/signup", upload.single("logo"), hotelController_1.default.hotelSignup);
router.post("/verify", hotelController_1.default.verifyOtp);
router.get("/gethotel", hotelController_1.default.getHotel);
exports.default = router;
