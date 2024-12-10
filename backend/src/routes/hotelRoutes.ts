import express from "express";
import multer from "multer";
import hotelController from "../controllers/hotelController";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

//Auth

router.post("/signup", upload.single("logo"), hotelController.hotelSignup);
router.post("/verify", hotelController.verifyOtp);


router.get("/gethotel", hotelController.getHotel);
export default router;