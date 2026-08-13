import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { createDatabase } from '../config/database.js'
import { hashPassword } from '../auth/password.js'

export async function seedAdmin(database, { email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('ADMIN_EMAIL is required')
  const passwordHash = await hashPassword(password)
  const connection = await database.getConnection()

  try {
    await connection.beginTransaction()
    await connection.execute('DELETE FROM admin_sessions')
    await connection.execute('DELETE FROM admins')
    await connection.execute('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [normalizedEmail, passwordHash])
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export function isMainScript(moduleUrl, argvPath = process.argv[1]) {
  return moduleUrl === pathToFileURL(argvPath).href
}

if (isMainScript(import.meta.url)) {
  const database = createDatabase()
  seedAdmin(database, { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
    .then(async () => {
      await database.end()
      console.log('Seeded one admin account.')
    })
    .catch(async (error) => {
      await database.end()
      console.error(error.message)
      process.exit(1)
    })
}
