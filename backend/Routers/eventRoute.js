import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import {createEvent, getEvents} from "../controller/eventController.js";
import cors from "cors";

router.use(cors());

router.get('/createEvent', createEvent);
router.get('/getEvents', getEvents);

export default router;