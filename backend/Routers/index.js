import { Router } from "express";
const router = Router();
import authRoute from './authRoute.js';
import leaderboardRoute from './leaderboardRoute.js';
import pointsRoute from './PointRoute.js';
import eventRoute from './eventRoute.js';
import messageRoute from "./messageRoute.js";
import timetableRoute from "./timetableRoute.js";
import blogRoute from "./blogRoute.js";

router.use(authRoute);
router.use(leaderboardRoute);
router.use(pointsRoute);
router.use(eventRoute);
router.use(messageRoute);
router.use(timetableRoute);
router.use(blogRoute);


export default router;