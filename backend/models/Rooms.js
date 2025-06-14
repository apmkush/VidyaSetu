import { Schema, model } from 'mongoose';

const RoomSchema = new Schema({
  // Basic room information
  room: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Geospatial data
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates format. Expected [longitude, latitude] with valid values.'
      }
    }
  },
  geofenceRadius: {
    type: Number, // in meters
    required: true,
    default: 50,
    min: 10, // Minimum 10 meter radius
    max: 200 // Maximum 200 meter radius
  },

  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});

// Geospatial index for location queries
RoomSchema.index({ location: '2dsphere' });

const Room = model('Room', RoomSchema);
export default Room;