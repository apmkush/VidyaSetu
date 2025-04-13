import express from "express";
import { getMessages, getUsersForSidebar, sendMessage } from "../controller/messageController.js";
import message from "../models/message.js";


const router = express.Router();

router.get("/chat/users", getUsersForSidebar);
router.get("/getMessages/:id", getMessages);

router.post("/sendMessage/:id",sendMessage);

export default router;