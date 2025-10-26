import {UserModel} from "../models/user.js";
import Message from "../models/message.js";
import Group from "../models/Group.js";
import mongoose from "mongoose";
const { Types: { ObjectId } } = mongoose;

import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const UserId = req.user._id;
    const filteredUsers = await UserModel.find({ _id: { $ne: UserId } }).select("-password");

    // Get user's groups
    const userGroups = await Group.find({ members: UserId })
      .populate('members', 'name email profilePic userRole')
      .populate('admins', 'name email profilePic')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      users: filteredUsers,
      groups: userGroups
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = new mongoose.Types.ObjectId(req.query.currentUserId);
    const nextId = new mongoose.Types.ObjectId(userToChatId);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: nextId },
        { senderId: nextId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, file, senderId, fileType } = req.body;
    const { id: receiverId } = req.params;

    let fileUrl;
    if (file) {
      const uploadOptions = {
        resource_type: 'auto',
        folder: 'chat_files',
        use_filename: true
      };

      if (fileType.startsWith('image/')) {
        uploadOptions.format = 'webp';
      }
      if (fileType.startsWith('video/')) {
        uploadOptions.transformation = [
          { quality: 'auto' },
          { format: 'mp4' },
          { codec: 'h264' }
        ];
      }

      const uploadResponse = await cloudinary.uploader.upload(
        `data:${fileType};base64,${file}`,
        uploadOptions
      );
      
      fileUrl = {
        url: uploadResponse.secure_url,
        resource_type: uploadResponse.resource_type
      };
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      file: fileUrl?.url,
      fileType: fileUrl ? fileType : null,
      fileResourceType: fileUrl?.resource_type,
      status: 'sent'
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      newMessage.status = 'delivered';
      newMessage.deliveredAt = new Date();
      await newMessage.save();

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: 'delivered',
          deliveredAt: newMessage.deliveredAt
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete message endpoint
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    if (message.file) {
      try {
        const urlParts = message.file.split('/');
        const publicIdWithExtension = urlParts.slice(urlParts.indexOf('upload') + 1).join('/');
        const publicId = publicIdWithExtension.split('.')[0];
        
        await cloudinary.uploader.destroy(publicId, {
          resource_type: message.fileResourceType || 'auto',
          invalidate: true
        });
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }
    }
    
    await Message.findByIdAndDelete(id);
    
    io.emit("messageDeleted", id);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const unreadCount = await Message.countDocuments({
      senderId: targetUserId,
      receiverId: currentUserId,
      readBy: { $ne: currentUserId }
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const updatedMessages = await Message.updateMany(
      {
        senderId: targetUserId,
        receiverId: currentUserId,
        readBy: { $ne: currentUserId }
      },
      {
        $addToSet: { readBy: currentUserId },
        $set: { 
          status: 'read',
          readAt: new Date()
        }
      }
    );

    const messages = await Message.find({
      senderId: targetUserId,
      receiverId: currentUserId,
      readBy: currentUserId
    });

    messages.forEach(message => {
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: message._id,
          status: 'read',
          readAt: message.readAt
        });
      }
    });

    res.status(200).json({ success: true, updatedCount: updatedMessages.modifiedCount });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const updates = { status };
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
    } else if (status === 'read') {
      updates.readAt = new Date();
      updates.readBy = [req.user._id];
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updates,
      { new: true }
    );

    const senderSocketId = getReceiverSocketId(updatedMessage.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdate", {
        messageId: updatedMessage._id,
        status: updatedMessage.status,
        deliveredAt: updatedMessage.deliveredAt,
        readAt: updatedMessage.readAt
      });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({ error: "Failed to update message status" });
  }
};