const API_BASE = import.meta.env.VITE_API_URL || ''

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path) || path.startsWith('/assets/')) return path
  return `${API_BASE}${path}`
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) throw new ApiError(response.status, data?.error || 'Request failed')
  return data
}

export const api = {
  async request(path, options = {}) {
    const headers = options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json', ...options.headers } : options.headers
    const body = options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      credentials: 'include',
      headers,
      body,
      signal: options.signal,
    })
    return parseResponse(response)
  },

  get(path, options) {
    return this.request(path, options)
  },

  post(path, body) {
    return this.request(path, { method: 'POST', body })
  },

  put(path, body) {
    return this.request(path, { method: 'PUT', body })
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' })
  },
}
