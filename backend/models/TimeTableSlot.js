import { Schema, model } from "mongoose";

const TimetableSlotSchema = new Schema({
  context: {
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true }
  },
  schedule: {
    day: [{ 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 
      required: true 
    }],
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    pattern: {
      type: String,
      enum: ['weekly', 'biweekly'],
      default: 'weekly'
    }
  },
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  room: { type: String, required: true },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial'],
    default: 'lecture'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  notes: { type: String, default: '' },
  createdBy: { type: String },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Add index for better query performance
TimetableSlotSchema.index({ 
  'context.branch': 1,
  'context.semester': 1,
  'context.section': 1,
  'schedule.day': 1,
  'schedule.startTime': 1
});

const TimetableSlot = model('TimetableSlot', TimetableSlotSchema);

export { TimetableSlot };