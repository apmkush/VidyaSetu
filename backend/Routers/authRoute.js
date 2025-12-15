import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import {authMiddleware} from '../middlewares/authMiddleware.js';
import { login, signup, verifyotp, sendotp, resetPassword, updateMode, getTheme, googleLogin, getUserProfile, updateUserProfile } from "../controller/authController.js";
import cors from "cors";
import { updateAssignment } from "../controller/assignmetController.js";

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
router.post("/update-theme",authMiddleware, updateMode);
router.get("/google-login", googleLogin);
router.get("/user/profile", authMiddleware, getUserProfile);
router.post("/user/profile", authMiddleware, updateUserProfile);

export default router;