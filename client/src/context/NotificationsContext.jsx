import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { NotificationsContext } from './notificationsContextValue.js'

const CHECK_EVERY_MS = 30000

// Keeps the number on the bell up to date: it asks the server every 30 seconds
// (only while the tab is visible) and again whenever you come back to the tab.
export function NotificationsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    function check() {
      if (document.visibilityState !== 'visible') return
      api('/notifications/unread-count')
        .then((data) => {
          if (!cancelled) setUnreadCount(data.unreadCount)
        })
        .catch(() => {
          // The bell is a nice extra. If it cannot update, it stays quiet.
        })
    }

    check()
    const timer = setInterval(check, CHECK_EVERY_MS)
    document.addEventListener('visibilitychange', check)

    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])

  const value = useMemo(() => ({ unreadCount, setUnreadCount }), [unreadCount])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}