import { Router } from "express";
const router = Router();
import { 
    createTimeTable, 
    getTimetableData,
    updateTimetableSlot, 
    deleteTimetableSlot 
} from "../controller/timetableController.js";
import cors from "cors";

router.use(cors());

// Timetable routes
router.post('/create-timetable', createTimeTable);  // Create new timetable slot
router.put('/update-timetable/:id', updateTimetableSlot);  // Update existing timetable slot
router.get('/get-timetable', getTimetableData);  // Get timetable data with filters
router.delete('/delete-timetable/:id' , deleteTimetableSlot) ; 

export default router;