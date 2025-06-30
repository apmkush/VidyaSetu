import express from 'express';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controller/assignmetController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/get-assignments', getAssignments);
router.post('/add-assignments', createAssignment);
router.patch('/update-assignments/:id', updateAssignment);
router.delete('/delete-assignments/:id', deleteAssignment);

export default router;