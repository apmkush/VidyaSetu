import express from "express";
import cors from "cors";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { 
  getUsersForSidebar, 
  getMessages, 
  sendMessage, 
  deleteMessage, 
  getUnreadCount, 
  markAsRead,
  updateMessageStatus
} from "../controller/messageController.js";

const router = express.Router();
router.use(cors());

// Existing routes
router.get("/chat/users", authMiddleware, getUsersForSidebar);
router.get("/getMessages/:id", authMiddleware, getMessages);
router.delete("/DeleteMsg/:id", authMiddleware, deleteMessage);
router.post("/sendMessage/:id", authMiddleware, sendMessage);
router.get("/chat/unread/:userId", authMiddleware, getUnreadCount);
router.post("/chat/markRead/:userId", authMiddleware, markAsRead);

// NEW: Route for updating message status
router.patch("/message/:messageId/status", authMiddleware, updateMessageStatus);

export default router;