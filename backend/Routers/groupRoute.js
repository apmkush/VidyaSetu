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
  getStudentsForClassGroup
} from "../controller/groupController.js";

const router = express.Router();

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

export default router;