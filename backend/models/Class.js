import { Schema, model } from "mongoose";

const ClassSchema = new Schema({
  // Core class information
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  facultyId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  // Context information (from TimetableSlot)
  context: {
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true }
  },

  // Schedule information (from TimetableSlot)
  schedule: {
    days: [{ 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
      required: true 
    }],
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    pattern: {
      type: String,
      enum: ['weekly', 'biweekly', 'custom'],
      default: 'weekly'
    }
  },

  // Class details (from TimetableSlot)
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  classType: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar'],
    default: 'lecture'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },

  // Attendance tracking (from AttendanceModel)
  attendanceRecords: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    records: [{
      studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      status: {
        type: String,
        enum: ["present", "absent",],
        required: true,
        default: "absent"
      },
    }]
  }],

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ClassSchema.index({ 
  'context.branch': 1,
  'context.semester': 1,
  'context.section': 1,
  'schedule.days': 1,
  'schedule.startTime': 1
});

// Virtual for current status (active if within scheduled time)
ClassSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().substring(0, 5); // "HH:MM" format

  // Check if today is one of the scheduled days
  if (!this.schedule.days.includes(currentDay)) {
    return 'inactive';
  }

  // Check if current time is within class hours
  const [startHour, startMinute] = this.schedule.startTime.split(':');
  const [endHour, endMinute] = this.schedule.endTime.split(':');
  
  const classStart = new Date();
  classStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
  
  const classEnd = new Date();
  classEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

  // Handle overnight classes (rare but possible)
  if (classEnd < classStart) {
    classEnd.setDate(classEnd.getDate() + 1);
  }

  // Determine status
  if (now < classStart) {
    return 'upcoming'; // Class hasn't started yet
  } else if (now >= classStart && now <= classEnd) {
    return 'in-session'; // Class is currently happening
  } else {
    return 'completed'; // Class has ended
  }
});

const Class = model('Class', ClassSchema);
export default Class;