import { Schema, model } from 'mongoose';

const auraPointsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  auraPointsHistory: [
    {
      points: {
        type: Number, // Aura points for the achievement
        required: true,
      },
      date: {
        type: Date,   // Date and time when the points were achieved
        default: Date.now,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PointsHistory = model('PointsHistory', auraPointsSchema);

export default PointsHistory;
