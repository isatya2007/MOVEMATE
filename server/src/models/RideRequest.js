import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    coordinates: { type: [Number], required: true, validate: (v) => v.length === 2 }, // [lng, lat]
  },
  { _id: false }
);

const rideRequestSchema = new mongoose.Schema(
  {
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    pickup: { type: placeSchema, required: true },
    dropoff: { type: placeSchema, required: true },
    passengerCount: { type: Number, required: true, min: 1, max: 8 },
    message: { type: String, trim: true, maxlength: 200 },

    // FR-RIDE-06
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    rejectReason: { type: String },
    cancelReason: { type: String },
    respondedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

rideRequestSchema.index({ rideId: 1, status: 1 });
rideRequestSchema.index({ requesterId: 1, createdAt: -1 });

export const RideRequest = mongoose.model('RideRequest', rideRequestSchema);