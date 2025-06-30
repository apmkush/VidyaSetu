import { Router } from "express";
const router = Router();

import {authMiddleware} from '../middlewares/authMiddleware.js';
import {getResult, GetStudents,SubmitResult,getPDF} from '../controller/resultController.js';
import cors from "cors";


router.use(cors());

// console.log("hello")
router.get('/subjects/students',authMiddleware,GetStudents);
router.post('/submit-results',authMiddleware,SubmitResult);
router.get('/get-result',authMiddleware,getResult);
router.get('/get-transcript/pdf',authMiddleware,getPDF);

export default router;