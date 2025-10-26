import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  isClassGroup: {
    type: Boolean,
    default: false
  },
  classInfo: {
    branch: String,
    semester: Number,
    section: String,
    batchYear: Number
  },
  avatar: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

export default mongoose.model("Group", groupSchema);