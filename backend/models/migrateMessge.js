// migrateMessages.js
import { connect, Types } from 'mongoose';
import Message from "../models/message.js"; // Import your Message model

async function migrateIds() {
  try {
    // await connect('mongodb://localhost:27017/your-db-name');
    
    const messages = await Message.find({});
    console.log(messages);
    
    for (const msg of messages) {
      // Skip if already converted
      if (typeof msg.senderId === 'string') {
        msg.senderId = new Types.ObjectId(msg.senderId);
      }
      if (typeof msg.receiverId === 'string') {
        msg.receiverId = new Types.ObjectId(msg.receiverId);
      }
      await msg.save();
      console.log(msg);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateIds();