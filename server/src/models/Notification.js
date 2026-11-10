import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['ride_request', 'request_accepted', 'request_rejected', 'request_cancelled', 'ride_cancelled'],
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 300 },
    readAt: { type: Date }, // empty = not read yet
    relatedEntity: {
      kind: { type: String, enum: ['ride', 'ride_request'] },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
)

// "my notifications, unread first" is the question we ask most often
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 })
// old notifications are removed automatically after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

export const Notification = mongoose.model('Notification', notificationSchema)