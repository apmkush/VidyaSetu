import { Router } from "express";
const router = Router();
import authRoute from './authRoute.js';
import leaderboardRoute from './leaderboardRoute.js';
import pointsRoute from './PointRoute.js';


router.use(authRoute);
router.use(leaderboardRoute);
router.use(pointsRoute);


export default router;