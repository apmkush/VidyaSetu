import express from "express";
import { getMessages, getUsersForSidebar, sendMessage,deleteMessage } from "../controller/messageController.js";


const router = express.Router();

router.get("/chat/users", getUsersForSidebar);
router.get("/getMessages/:id", getMessages);
router.delete("/DeleteMsg/:id", deleteMessage);

router.post("/sendMessage/:id",sendMessage);

export default router;