import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  sendGroupMessage,
  getGroupMessages,
  addMembersToGroup,
  removeMemberFromGroup,
  getStudentsForClassGroup,
  updateGroupAvatar
} from "../controller/groupController.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Group management routes
router.post("/groups", authMiddleware, createGroup);
router.get("/groups", authMiddleware, getUserGroups);
router.get("/groups/:groupId", authMiddleware, getGroupDetails);
router.get("/groups/students/class", authMiddleware, getStudentsForClassGroup);

// Group member management
router.post("/groups/:groupId/members", authMiddleware, addMembersToGroup);
router.delete("/groups/:groupId/members/:memberId", authMiddleware, removeMemberFromGroup);

// Group messaging
router.post("/groups/:groupId/messages", authMiddleware, sendGroupMessage);
router.get("/groups/:groupId/messages", authMiddleware, getGroupMessages);

// ✅ NEW: Group avatar update route
router.put("/groups/:groupId/avatar", authMiddleware, upload.single('avatar'), updateGroupAvatar);

export default router;