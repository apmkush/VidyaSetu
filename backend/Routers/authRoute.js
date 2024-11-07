import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import { login, signup } from "../controller/authController.js";
import cors from "cors";

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

// router.get("/reset-password/:id/:token", resetPassword);

export default router;