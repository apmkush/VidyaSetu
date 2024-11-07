import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import {addPoints,getPoints} from "../controller/leaderboardController.js";
import cors from "cors";

router.use(cors());

router.put("/addPoints", addPoints);

router.get("/getPoints", getPoints);

export default router;