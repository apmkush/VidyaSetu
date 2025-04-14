import {UserModel} from "../models/user.js";
import Message from "../models/message.js";
import mongoose from "mongoose";
const { Types: { ObjectId } } = mongoose;

import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";



export const getUsersForSidebar = async (req, res) => {
  try {
    const UserId = req.body.currentUserId;
    const filteredUsers = await UserModel.find({ _id: { $ne: UserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
    // Convert all string IDs to ObjectId
  try {
    const { id: userToChatId } = req.params;
    const myId = new mongoose.Types.ObjectId(req.query.currentUserId);
    const nextId=new mongoose.Types.ObjectId(userToChatId);
    // console.log(myId);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: nextId },
        { senderId: nextId, receiverId: myId },
      ],
    });
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
        // Upload base64 file to Cloudinary with appropriate resource type
        const uploadOptions = {
          resource_type: 'auto', // ← Crucial for non-images
          folder: 'chat_files',
          use_filename: true // Automatically detect image/video/raw
        };
  
        // Add file type specific transformations if needed
        if (fileType.startsWith('image/')) {
          uploadOptions.format = 'webp'; // Optional: convert images to webp
        }
        // Add this to your upload options for videos
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
          resource_type: uploadResponse.resource_type // 'image', 'video', 'raw' etc.
        };
        console.log(fileUrl);
      }
  
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        file: fileUrl?.url, // Store the URL
        fileType: fileUrl ? fileType : null,
        fileResourceType: fileUrl?.resource_type
      });
  
      await newMessage.save();
  
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);
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
    
    // Optional: Verify the requester is the message sender
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // Optional: Add authentication check here
    // if (message.senderId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ error: "Unauthorized" });
    // }
    if (message.file) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = message.file.split('/');
        const publicIdWithExtension = urlParts.slice(urlParts.indexOf('upload') + 1).join('/');
        const publicId = publicIdWithExtension.split('.')[0]; // Remove file extension
        
        // Delete the resource from Cloudinary
        await cloudinary.uploader.destroy(publicId, {
          resource_type: message.fileResourceType || 'auto', // Use stored resource type or auto-detect
          invalidate: true // Optional: invalidate CDN cache
        });
        
        console.log(`Deleted media from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with message deletion even if Cloudinary deletion fails
      }
    }
    // Delete from database
    await Message.findByIdAndDelete(id);
    
    // Notify other clients via socket
    io.emit("messageDeleted", id);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};