import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    default: ""
  },
  file: {
    type: String,
    default: ""
  },
  fileType: {
    type: String,
    default: ""
  },
  fileResourceType: {
    type: String,
    default: ""
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered'],
    default: 'sent'
  }
}, {
  timestamps: true
});

export default mongoose.model("GroupMessage", groupMessageSchema);