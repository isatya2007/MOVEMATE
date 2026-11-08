import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from '../services/api.js'
import { AuthContext } from './authContextValue.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // If a token is saved we must check it before deciding "logged in or not"
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  // On first load: if there is a saved token, ask the server who we are
  useEffect(() => {
    if (!tokenStore.get()) return
    let cancelled = false

    api('/users/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // api.js fires this when the server says the session has expired
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('movemate:logout', onLogout)
    return () => window.removeEventListener('movemate:logout', onLogout)
  }, [])

  const login = useCallback(async (identifier, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { identifier, password } })
    tokenStore.set(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (form) => {
    const data = await api('/auth/register', { method: 'POST', body: form })
    tokenStore.set(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Even if the server cannot be reached, we still log out on this device
    }
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
