import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  semester: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8'] // Assuming 8 semesters
  },
  subject: {
    type:String,
    required: true
  },
  Batch:{
    type:Number,
    required:true
  },
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    grade: {
      type: String,
      required: true,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Result', ResultSchema);