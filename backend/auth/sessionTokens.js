import { createHash, randomBytes } from 'node:crypto'

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function createSessionToken() {
  const rawToken = randomBytes(32).toString('base64url')
  return { rawToken, tokenHash: hashSessionToken(rawToken) }
}
