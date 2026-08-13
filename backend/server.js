import 'dotenv/config'
import { createAdminRepository } from './auth/adminRepository.js'
import { createDatabase, verifyDatabaseConnection } from './config/database.js'
import { createApp } from './app.js'
import { createContentRepository } from './repositories/contentRepository.js'
import { createMemberRepository } from './repositories/memberRepository.js'
import { createTeamRepository } from './repositories/teamRepository.js'

const database = createDatabase()
const app = createApp({
  adminRepository: createAdminRepository(database),
  memberRepository: createMemberRepository(database),
  teamRepository: createTeamRepository(database),
  contentRepository: createContentRepository(database),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  sessionDays: Number(process.env.SESSION_DAYS || 7),
  secureCookies: process.env.NODE_ENV === 'production',
})

const port = Number(process.env.PORT || 5000)

try {
  await verifyDatabaseConnection(database)
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
} catch (error) {
  console.error('MySQL connection failed.')
  console.error(error.message)
  await database.end()
  process.exit(1)
}
