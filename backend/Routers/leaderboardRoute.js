import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import { login, signup } from "../controller/authController.js";
import cors from "cors";

router.use(cors());

router.post("/addPoints", signup);

router.post("/getPoints", signup);

export default router;