import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { createRequireAdmin, enforceAdminOrigin } from './auth/authMiddleware.js'
import { createAuthRouter } from './auth/authRoutes.js'
import { createCrudRouter } from './routes/crudRoutes.js'
import { createContentRouter } from './routes/contentRoutes.js'
import { validateMember } from './services/memberValidation.js'
import { validateTeamMember } from './services/teamValidation.js'

export function createApp({
  adminRepository,
  memberRepository,
  teamRepository,
  contentRepository,
  frontendOrigin = 'http://localhost:5173',
  sessionDays = 7,
  secureCookies = false,
}) {
  const app = express()
  const requireAdmin = createRequireAdmin(adminRepository)

  app.use(cors({ origin: frontendOrigin, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

  app.use('/api/admin', enforceAdminOrigin(frontendOrigin))
  app.use('/api/admin', createAuthRouter({ adminRepository, requireAdmin, sessionDays, secureCookies }))

  app.get('/api/public/members', async (_request, response, next) => {
    try { response.json(await memberRepository.listPublic()) } catch (error) { next(error) }
  })
  app.get('/api/public/team-members', async (_request, response, next) => {
    try { response.json(await teamRepository.listPublic()) } catch (error) { next(error) }
  })
  app.get('/api/public/site-content', async (_request, response, next) => {
    try { response.json(await contentRepository.list()) } catch (error) { next(error) }
  })

  app.use('/api/admin/members', requireAdmin, createCrudRouter({ repository: memberRepository, validate: validateMember, label: 'Member' }))
  app.use('/api/admin/team-members', requireAdmin, createCrudRouter({ repository: teamRepository, validate: validateTeamMember, label: 'Team member' }))
  app.use('/api/admin/site-content', requireAdmin, createContentRouter(contentRepository))

  app.use((_request, response) => response.status(404).json({ error: 'Not found' }))
  app.use((error, _request, response, _next) => {
    console.error(error)
    response.status(500).json({ error: 'Internal server error' })
  })

  return app
}
