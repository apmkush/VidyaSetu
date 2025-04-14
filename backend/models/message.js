import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  file: { type: String }, // URL to the file
  fileType: { type: String }, // MIME type (e.g., 'image/jpeg', 'video/mp4')
  fileResourceType: { type: String }, // 'image', 'video', 'raw' from Cloudinary
  createdAt: { type: Date, default: Date.now }
}
);


export default model("Message", messageSchema);
