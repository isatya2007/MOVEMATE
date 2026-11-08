import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },

    profile: {
      bio: { type: String, maxlength: 300, default: '' },
      photoUrl: { type: String, default: '' },
    },
    community: {
      name: { type: String, trim: true, maxlength: 80, default: '' },
    },

    // Trust signals, not safety guarantees (SRS FR-SAFE-05)
    verificationStatus: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      community: { type: String, enum: ['none', 'pending', 'verified'], default: 'none' },
    },

    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    accountStatus: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
    consentAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// What the logged-in user sees about themselves
userSchema.methods.toSelf = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    profile: this.profile,
    community: this.community,
    verificationStatus: this.verificationStatus,
    role: this.role,
    createdAt: this.createdAt,
  };
};

// What other users see (phone and email stay private by default)
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    profile: this.profile,
    community: this.community,
    verificationStatus: this.verificationStatus,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);