import { Router } from "express";
const router = Router();
import authRoute from './authRoute.js';
import leaderboardRoute from './leaderboardRoute.js';
import pointsRoute from './PointRoute.js';
import eventRoute from './eventRoute.js';
import messageRoute from "./messageRoute.js";


router.use(authRoute);
router.use(leaderboardRoute);
router.use(pointsRoute);
router.use(eventRoute);
router.use(messageRoute);



export default router;