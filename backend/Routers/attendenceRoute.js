import { Router } from "express";
const router = Router();
import {
    Mark_attendence,
    createClassSchedule, 
    getClassSchedules,
    getActiveClasses,
    updateClassSchedule, 
    deleteClassSchedule,
    getRooms,
    getTeachers } from "../controller/attendenceController.js";
import cors from "cors";

router.use(cors());

router.post('/Mark_attendence', Mark_attendence);
router.post('/create-timetable', createClassSchedule);  // Create new timetable slot
router.put('/update-timetable/:id', updateClassSchedule);  // Update existing timetable slot
router.get('/get-timetable', getClassSchedules);  // Get timetable data with filters
router.get('/get-activeClasses/:id', getActiveClasses);  
router.get('/get-rooms', getRooms);  // Get timetable data with filters
router.get('/get-teachers', getTeachers);  // Get timetable data with filters
router.delete('/delete-timetable/:id' , deleteClassSchedule) ; 

export default router;