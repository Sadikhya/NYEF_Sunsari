import express from 'express'
import { createMemberRouter } from './routes/memberRoutes.js'

export function createApp(memberRepository) {
  const app = express()

  app.use(express.json())
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
  app.use('/api/members', createMemberRouter(memberRepository))

  app.use((error, _request, response, _next) => {
    console.error(error)
    response.status(500).json({ error: 'Internal server error' })
  })

  return app
}
