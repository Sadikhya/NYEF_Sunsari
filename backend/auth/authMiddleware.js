import { hashSessionToken } from './sessionTokens.js'

const COOKIE_NAME = 'nyef_admin'

export function createRequireAdmin(adminRepository) {
  return async (request, response, next) => {
    const rawToken = request.cookies?.[COOKIE_NAME]
    if (!rawToken) return response.status(401).json({ error: 'Authentication required' })

    const tokenHash = hashSessionToken(rawToken)
    const admin = await adminRepository.findValidSession(tokenHash)
    if (!admin) return response.status(401).json({ error: 'Authentication required' })

    request.admin = admin
    request.sessionTokenHash = tokenHash
    return next()
  }
}

export function enforceAdminOrigin(frontendOrigin) {
  return (request, response, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return next()
    const origin = request.get('origin')
    if (origin && frontendOrigin && origin !== frontendOrigin) {
      return response.status(403).json({ error: 'Origin is not allowed' })
    }
    return next()
  }
}

export { COOKIE_NAME }
