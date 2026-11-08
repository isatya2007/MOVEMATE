// One place that talks to the backend.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const TOKEN_KEY = 'movemate_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// Every failed request becomes an ApiError with the backend's code, message and field details
export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

// [{ field: 'email', message: '...' }]  ->  { email: '...' }
export function getFieldErrors(error) {
  const result = {}
  for (const item of error?.details || []) {
    if (item.field && !result[item.field]) result[item.field] = item.message
  }
  return result
}

export async function api(path, { method = 'GET', body, params } = {}) {
  let url = BASE_URL + path
  if (params) {
    const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    if (clean.length) url += '?' + new URLSearchParams(clean).toString()
  }

  const token = tokenStore.get()
  let res
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.')
  }

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const err = json?.error
    // Session expired or invalid: forget the token and tell the app to log out
    if (res.status === 401 && ['INVALID_TOKEN', 'UNAUTHENTICATED'].includes(err?.code)) {
      tokenStore.clear()
      window.dispatchEvent(new Event('movemate:logout'))
    }
    throw new ApiError(res.status, err?.code || 'ERROR', err?.message || 'Something went wrong.', err?.details || [])
  }

  return json.data
}
