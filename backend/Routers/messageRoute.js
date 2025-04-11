import express from "express";
import { getMessages, getUsersForSidebar, sendMessage } from "../controller/messageController.js";
import message from "../models/message.js";

console.log("messageRoute file!!");

const router = express.Router();

router.get("/chat/users", getUsersForSidebar);
router.get("/chat/:id", getMessages);

router.post("/sendMessage/:id",sendMessage);

export default router;