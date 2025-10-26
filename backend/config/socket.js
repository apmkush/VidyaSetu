 import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "../models/message.js";
import Group from "../models/Group.js";

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
const userGroups = {}; // Track which groups users are in

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // User joins
  socket.on("join", async (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} joined with socket id ${socket.id}`);
    
    // Join user to their groups
    try {
      const groups = await Group.find({ members: userId });
      groups.forEach(group => {
        socket.join(`group_${group._id}`);
      });
      userGroups[userId] = groups.map(g => g._id.toString());
    } catch (error) {
      console.error("Error joining user to groups:", error);
    }
    
    io.emit("getOnlineUsers", Object.keys(users));
    updatePendingMessageStatus(userId);
  });

  // Join a specific group
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User joined group: ${groupId}`);
  });

  // Leave a group
  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`User left group: ${groupId}`);
  });

  // Send individual message
  socket.on("sendMessage", async (message) => {
    try {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        await Message.findByIdAndUpdate(message._id, {
          status: 'delivered',
          deliveredAt: new Date()
        });
        
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

  // Send group message
  socket.on("sendGroupMessage", async (message) => {
    try {
      // Emit to all members in the group
      io.to(`group_${message.groupId}`).emit("receiveGroupMessage", {
        ...message,
        status: 'delivered'
      });
      
      console.log(`Group message sent to group: ${message.groupId}`);
    } catch (error) {
      console.error("Socket sendGroupMessage error:", error);
    }
  });

  // Delete individual message
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

  // Delete group message
  socket.on("deleteGroupMessage", async ({ messageId, groupId }) => {
    try {
      io.to(`group_${groupId}`).emit("groupMessageDeleted", messageId);
    } catch (error) {
      console.error("Socket deleteGroupMessage error:", error);
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

  // Group created - notify members
  socket.on("groupCreated", (group) => {
    group.members.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("newGroup", group);
      }
    });
  });

  // Member added to group
  socket.on("memberAdded", ({ groupId, memberId }) => {
    const memberSocketId = getReceiverSocketId(memberId);
    if (memberSocketId) {
      io.to(memberSocketId).emit("addedToGroup", groupId);
    }
  });

  // Member removed from group
  socket.on("memberRemoved", ({ groupId, memberId }) => {
    const memberSocketId = getReceiverSocketId(memberId);
    if (memberSocketId) {
      io.to(memberSocketId).emit("removedFromGroup", groupId);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        delete userGroups[userId];
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