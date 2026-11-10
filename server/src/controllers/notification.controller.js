import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { Notification } from '../models/Notification.js'

const format = (n) => ({
  id: n._id,
  type: n.type,
  title: n.title,
  body: n.body,
  read: Boolean(n.readAt),
  createdAt: n.createdAt,
  relatedEntity: n.relatedEntity,
})

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 50)

  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ userId: req.user._id, readAt: null }),
  ])

  res.json({ success: true, data: { notifications: items.map(format), unreadCount } })
})

// Small and fast: the app asks for this every 30 seconds to update the bell
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, readAt: null })
  res.json({ success: true, data: { unreadCount } })
})

export const markRead = asyncHandler(async (req, res) => {
  // Only the owner can mark their own notification
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id })
  if (!notification) throw new AppError(404, 'NOT_FOUND', 'Notification not found.')

  if (!notification.readAt) {
    notification.readAt = new Date()
    await notification.save()
  }
  res.json({ success: true, data: { notification: format(notification) } })
})

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, readAt: null },
    { readAt: new Date() }
  )
  res.json({ success: true, data: { updated: result.modifiedCount } })
})
