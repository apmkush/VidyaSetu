import express, { json } from "express";
import { createServer } from "http";
// import cors from "cors";
import { Server } from "socket.io";
import Message from "../models/message.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

export function getReceiverSocketId(userId) {
  return users[userId];
}

// console.log("jnadf");
// 💬 User socket mapping
const users = {};

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // User joins
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} joined with socket id ${socket.id}`);
  });

  // Handle incoming message
  // socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
  //   const newMsg = new Message({ senderId, receiverId, text });
  //   await newMsg.save();

  //   const receiverSocket = users[receiverId];
  //   if (receiverSocket) {
  //     io.to(receiverSocket).emit("receiveMessage", {
  //       senderId,
  //       text,
  //     });
  //   }
  // });

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { io, app, server };

