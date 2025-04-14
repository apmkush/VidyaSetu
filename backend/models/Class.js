import { Schema, model } from 'mongoose';

const classSchema = new Schema({
    name: String,
    facultyId: Schema.Types.ObjectId,
    studentIds: [Schema.Types.ObjectId],
    schedule: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    radius: { // in meters
      type: Number,
      default: 50 // Default 50m radius around classroom
    }
  });
  
  // Create geospatial index for efficient queries
  classSchema.index({ location: '2dsphere' });

  export default model("Class", classSchema);