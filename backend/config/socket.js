import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "../models/message.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://vidya-setu-one.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

export function getReceiverSocketId(userId) {
  return users[userId];
}

const users = {};

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // User joins
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} joined with socket id ${socket.id}`);
    io.emit("getOnlineUsers", Object.keys(users));
    
    // Update delivery status for pending messages when user comes online
    updatePendingMessageStatus(userId);
  });

  // Send message
  socket.on("sendMessage", async (message) => {
    try {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        // Update message status to delivered
        await Message.findByIdAndUpdate(message._id, {
          status: 'delivered',
          deliveredAt: new Date()
        });
        
        // Notify sender about delivery
        const senderSocketId = getReceiverSocketId(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageStatusUpdate", {
            messageId: message._id,
            status: 'delivered',
            deliveredAt: new Date()
          });
        }
        
        io.to(receiverSocketId).emit("receiveMessage", {
          ...message,
          status: 'delivered',
          deliveredAt: new Date()
        });
      }
    } catch (error) {
      console.error("Socket sendMessage error:", error);
    }
  });

  // Delete message
  socket.on("deleteMessage", async ({ messageId, receiverId }) => {
    try {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", messageId);
      }
    } catch (error) {
      console.error("Socket deleteMessage error:", error);
    }
  });

  // Message status update (read receipts)
  socket.on("messageRead", async ({ messageId, readerId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && message.senderId.toString() !== readerId) {
        await Message.findByIdAndUpdate(messageId, {
          status: 'read',
          readAt: new Date(),
          $addToSet: { readBy: readerId }
        });

        // Notify sender
        const senderSocketId = getReceiverSocketId(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageStatusUpdate", {
            messageId: message._id,
            status: 'read',
            readAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Socket messageRead error:", error);
    }
  });

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

// Helper function to update pending message status when user comes online
async function updatePendingMessageStatus(userId) {
  try {
    const pendingMessages = await Message.find({
      receiverId: userId,
      status: 'sent'
    });

    for (const message of pendingMessages) {
      await Message.findByIdAndUpdate(message._id, {
        status: 'delivered',
        deliveredAt: new Date()
      });

      // Notify sender
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: message._id,
          status: 'delivered',
          deliveredAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error("Error updating pending message status:", error);
  }
}

export { io, app, server };