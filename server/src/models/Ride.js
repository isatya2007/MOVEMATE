import mongoose from 'mongoose';

// Same shape as the SRS example: { label, coordinates: [lng, lat] }
const placeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: (v) => v.length === 2,
    },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },

    origin: { type: placeSchema, required: true },
    destination: { type: placeSchema, required: true },
    waypoints: { type: [placeSchema], default: [] },

    departureAt: { type: Date, required: true }, // stored in UTC
    seatsTotal: { type: Number, required: true, min: 1 },
    seatsAvailable: { type: Number, required: true, min: 0 }, // never below 0 (BR-03)
    farePerSeat: { type: Number, min: 0 }, // an estimate only (BR-09)

    preferences: {
      noSmoking: { type: Boolean, default: true },
      petsAllowed: { type: Boolean, default: false },
      luggageAllowed: { type: Boolean, default: true },
    },
    notes: { type: String, trim: true, maxlength: 300 },

    status: {
      type: String,
      enum: ['published', 'in_progress', 'completed', 'cancelled'],
      default: 'published',
    },
    cancelReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Search looks at published rides in a time window
rideSchema.index({ status: 1, departureAt: 1 });
rideSchema.index({ providerId: 1, departureAt: -1 });

export const Ride = mongoose.model('Ride', rideSchema);