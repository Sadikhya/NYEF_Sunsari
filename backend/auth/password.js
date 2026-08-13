import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12) {
    throw new Error('Password must be at least 12 characters')
  }
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt:${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password, passwordHash) {
  const [scheme, salt, stored] = String(passwordHash || '').split(':')
  if (scheme !== 'scrypt' || !salt || !stored) return false
  const derived = await scrypt(password, salt, KEY_LENGTH)
  const storedBuffer = Buffer.from(stored, 'hex')
  return storedBuffer.length === derived.length && timingSafeEqual(storedBuffer, derived)
}
