import { Router } from "express";
const router = Router();

router.use(require("./authRoute.js"));


export default router;