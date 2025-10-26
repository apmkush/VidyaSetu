import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    file: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    filePublicId: {
      type: String,
      default: "",
    },
    // Enhanced readBy for delivery status
    readBy: [{
      type: Schema.Types.ObjectId, 
      ref: "User"
    }],
    // Delivery status tracking
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    // Store the time when message is delivered
    deliveredAt: {
      type: Date,
      default: null
    },
    // Store the time when message is read
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for better performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

export default model("Message", messageSchema);