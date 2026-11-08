import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['bike', 'auto', 'car', 'van'], required: true },
    make: { type: String, trim: true, maxlength: 40 },
    model: { type: String, trim: true, maxlength: 40 },
    colour: { type: String, trim: true, maxlength: 30 },
    registrationPrivate: { type: String, trim: true, uppercase: true, select: false },
    capacity: { type: Number, required: true, min: 1, max: 12 }, // passenger seats, excluding driver
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// For the owner: includes the registration number
vehicleSchema.methods.toOwnerJSON = function () {
  return {
    id: this._id,
    type: this.type,
    make: this.make,
    model: this.model,
    colour: this.colour,
    registrationPrivate: this.registrationPrivate,
    capacity: this.capacity,
    status: this.status,
    createdAt: this.createdAt,
  };
};

// For everyone else (used on ride details later): no registration number
vehicleSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    type: this.type,
    make: this.make,
    model: this.model,
    colour: this.colour,
    capacity: this.capacity,
  };
};

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);