import { Router } from "express";
const router = Router();
// import { body } from "express-validator";
import  {getPointHistory}  from "../controller/PointController.js";
import cors from "cors";

router.use(cors());

router.get('/achievements/:userId', getPointHistory);

export default router;