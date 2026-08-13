import { Router } from 'express'
import { asyncHandler } from '../common/http.js'
import { verifyPassword } from './password.js'
import { COOKIE_NAME } from './authMiddleware.js'
import { createSessionToken, hashSessionToken } from './sessionTokens.js'

export function createAuthRouter({ adminRepository, requireAdmin, sessionDays, secureCookies }) {
  const router = Router()

  router.post('/login', asyncHandler(async (request, response) => {
    const email = String(request.body?.email || '').trim().toLowerCase()
    const password = String(request.body?.password || '')
    const admin = email ? await adminRepository.findByEmail(email) : null
    const valid = admin ? await verifyPassword(password, admin.password_hash) : false

    if (!valid) return response.status(401).json({ error: 'Invalid email or password' })

    const { rawToken, tokenHash } = createSessionToken()
    const expiresAt = new Date(Date.now() + Number(sessionDays || 7) * 24 * 60 * 60 * 1000)
    await adminRepository.createSession(admin.id, tokenHash, expiresAt)
    response.cookie(COOKIE_NAME, rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: Boolean(secureCookies),
      expires: expiresAt,
    })
    return response.json({ admin: { id: admin.id, email: admin.email } })
  }))

  router.get('/session', requireAdmin, (request, response) => {
    response.json({ admin: request.admin })
  })

  router.post('/logout', asyncHandler(async (request, response) => {
    const rawToken = request.cookies?.[COOKIE_NAME]
    if (rawToken) await adminRepository.deleteSession(hashSessionToken(rawToken))
    response.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: Boolean(secureCookies) })
    response.status(204).end()
  }))

  return router
}
