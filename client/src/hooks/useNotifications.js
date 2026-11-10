import { useContext } from 'react'
import { NotificationsContext } from '../context/notificationsContextValue.js'

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}