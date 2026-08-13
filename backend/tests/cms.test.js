import request from 'supertest'
import { describe, expect, test, vi } from 'vitest'
import { createApp } from '../app.js'
import { hashPassword } from '../auth/password.js'
import { verifyDatabaseConnection } from '../config/database.js'
import { createTeamRepository } from '../repositories/teamRepository.js'
import { isMainScript } from '../scripts/seedAdmin.js'
import { validateMember } from '../services/memberValidation.js'
import { validateTeamMember } from '../services/teamValidation.js'

function createDependencies(adminRepositoryOverrides = {}) {
  const adminRepository = {
    findByEmail: vi.fn(),
    createSession: vi.fn(),
    findValidSession: vi.fn(),
    deleteSession: vi.fn(),
    ...adminRepositoryOverrides,
  }
  const memberRepository = {
    listPublic: vi.fn().mockResolvedValue([{ id: 1, name: 'Ada', business: 'Studio', profile_picture: null }]),
    listAdmin: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 1, name: 'Ada' }),
    update: vi.fn(),
    remove: vi.fn(),
  }
  const teamRepository = {
    listPublic: vi.fn().mockResolvedValue([{ id: 1, name: 'Ada', position: 'President', category: 'executive_committee' }]),
    listAdmin: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 1, name: 'Ada' }),
    update: vi.fn(),
    remove: vi.fn(),
  }
  const contentRepository = {
    list: vi.fn().mockResolvedValue([{ content_key: 'hero', title: 'Hero', body: 'Copy', image_url: null }]),
    findByKey: vi.fn(),
    upsert: vi.fn().mockResolvedValue({ content_key: 'hero', title: 'Hero', body: 'Copy', image_url: null }),
    remove: vi.fn(),
  }

  return { adminRepository, memberRepository, teamRepository, contentRepository, frontendOrigin: 'http://localhost:5173' }
}

describe('CMS backend', () => {
  test('detects the seed script entrypoint on Windows paths', () => {
    expect(isMainScript('file:///C:/NYEF-Sunsari/backend/scripts/seedAdmin.js', 'C:\\NYEF-Sunsari\\backend\\scripts\\seedAdmin.js')).toBe(true)
  })

  test('verifies and logs a successful MySQL connection', async () => {
    const database = { execute: vi.fn().mockResolvedValue([[{ connected: 1 }]]) }
    const logger = { log: vi.fn() }

    await verifyDatabaseConnection(database, logger)

    expect(database.execute).toHaveBeenCalledWith('SELECT 1 AS connected')
    expect(logger.log).toHaveBeenCalledWith('MySQL Connected Successfully')
  })

  test('validates required member fields', () => {
    expect(validateMember({ name: 'Ada' })).toEqual({ error: 'contact is required' })
    expect(validateMember({ name: 'Ada', contact: '9800', address: 'Itahari', business: 'Studio' }).value).toMatchObject({
      name: 'Ada',
      contact: '9800',
      address: 'Itahari',
      business: 'Studio',
    })
  })

  test('validates team category and publication fields', () => {
    expect(validateTeamMember({ name: 'Ada', position: 'President', category: 'unknown' })).toEqual({
      error: 'category must be executive_committee, past_president, or general_member',
    })
    expect(validateTeamMember({ name: 'Ada', position: 'President', category: 'executive_committee', is_published: 'false' }).value.is_published).toBe(0)
  })

  test('public team listing includes team details and automatic role ordering', async () => {
    const database = { execute: vi.fn().mockResolvedValue([[]]) }
    const repository = createTeamRepository(database)

    await repository.listPublic()

    const [sql] = database.execute.mock.calls[0]
    expect(sql).toContain('contact')
    expect(sql).toContain('address')
    expect(sql).toContain('business')
    expect(sql).toContain('PRESIDENT')
    expect(sql).toContain('IMMEDIATE PAST PRESIDENT')
    expect(sql).toContain('VICE PRESIDENT')
    expect(sql).toContain('EXECUTIVE MEMBER')
  })

  test('returns the public member projection without private contact fields', async () => {
    const dependencies = createDependencies()
    const response = await request(createApp(dependencies)).get('/api/public/members')

    expect(response.status).toBe(200)
    expect(response.body[0]).toEqual({ id: 1, name: 'Ada', business: 'Studio', profile_picture: null })
    expect(response.body[0]).not.toHaveProperty('contact')
    expect(response.body[0]).not.toHaveProperty('address')
  })

  test('rejects protected member mutations without login', async () => {
    const response = await request(createApp(createDependencies())).post('/api/admin/members').send({
      name: 'Ada',
      contact: '9800',
      address: 'Itahari',
      business: 'Studio',
    })

    expect(response.status).toBe(401)
  })

  test('logs in with an HTTP-only admin session cookie', async () => {
    const passwordHash = await hashPassword('correct-password-123')
    const dependencies = createDependencies({
      findByEmail: vi.fn().mockResolvedValue({ id: 1, email: 'admin@example.com', password_hash: passwordHash }),
    })

    const response = await request(createApp(dependencies))
      .post('/api/admin/login')
      .set('Origin', 'http://localhost:5173')
      .send({ email: 'admin@example.com', password: 'correct-password-123' })

    expect(response.status).toBe(200)
    expect(response.headers['set-cookie'][0]).toContain('nyef_admin=')
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
    expect(dependencies.adminRepository.createSession).toHaveBeenCalled()
  })
})
