import { Router } from "express";
const router = Router();
import authRoute from './authRoute.js';
import leaderboardRoute from './leaderboardRoute.js';
import pointsRoute from './PointRoute.js';
import eventRoute from './eventRoute.js';
import messageRoute from "./messageRoute.js";
import attendanceRoute from "./attendenceRoute.js";
import resultRoute from './resultRoute.js';
import assignmentRoute from './assignmentRoute.js';
import groupRoute from './groupRoute.js'; 


router.use(authRoute);
router.use(leaderboardRoute);
router.use(pointsRoute);
router.use(eventRoute);
router.use(messageRoute);
router.use(attendanceRoute);
router.use(resultRoute);
router.use(assignmentRoute);
router.use(groupRoute) ; 


export default router;