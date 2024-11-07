import { Router } from "express";
const router = Router();


import authRoute from './authRoute.js';
import leaderboardRoute from './leaderboardRoute.js';
router.use(authRoute);
router.use(leaderboardRoute);


// router.use(require("./authRoute.js"));
// router.use(require("./leaderboardRoute.js"));


export default router;