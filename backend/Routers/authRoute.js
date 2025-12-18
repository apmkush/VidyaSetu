import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import {authMiddleware} from '../middlewares/authMiddleware.js';
import { login, signup, verifyotp, sendotp, resetPassword, updateMode, getTheme, googleLogin, getUserProfile, updateUserProfile } from "../controller/authController.js";
import cors from "cors";
import multer from "multer";
import { updateAssignment } from "../controller/assignmetController.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.use(cors());

router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  login
);


router.post("/singup", signup);
router.post("/verify-otp", verifyotp);
router.post("/send-otp", sendotp);
router.post("/reset-password", resetPassword);
router.get("/get-theme",authMiddleware, getTheme);
router.get("/update-theme",authMiddleware, updateMode);
router.options("/google-login", cors()); // Handle CORS preflight
router.post("/google-login", cors(), googleLogin); // Also add CORS to this specific route
router.get("/user/profile", authMiddleware, getUserProfile);
router.post("/user/profile", authMiddleware, upload.single('profileImage'), updateUserProfile);

export default router;