import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'

const valid = {
  name: 'Sinet Rijal',
  contact: '9800000000',
  address: 'Sunsari',
  business: 'Example Business',
  social_media: null,
  profile_picture: null,
}

let repository

beforeEach(() => {
  repository = {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }
})

describe('members API', () => {
  it('reports API health', async () => {
    const response = await request(createApp(repository)).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('lists members', async () => {
    repository.list.mockResolvedValue([{ id: 1, ...valid }])

    const response = await request(createApp(repository)).get('/api/members')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([{ id: 1, ...valid }])
  })

  it('returns a member by id', async () => {
    repository.findById.mockResolvedValue({ id: 7, ...valid })

    const response = await request(createApp(repository)).get('/api/members/7')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: 7, ...valid })
  })

  it('returns 404 for a missing member', async () => {
    repository.findById.mockResolvedValue(null)

    const response = await request(createApp(repository)).get('/api/members/77')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Member not found' })
  })

  it('rejects invalid numeric ids', async () => {
    const response = await request(createApp(repository)).get('/api/members/not-a-number')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid member id' })
  })

  it('creates a valid member', async () => {
    repository.create.mockResolvedValue({ id: 2, ...valid })

    const response = await request(createApp(repository)).post('/api/members').send(valid)

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ id: 2, ...valid })
    expect(repository.create).toHaveBeenCalledWith(valid)
  })

  it('rejects an invalid member', async () => {
    const response = await request(createApp(repository))
      .post('/api/members')
      .send({ ...valid, name: '' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'name is required' })
  })

  it('updates an existing member', async () => {
    repository.update.mockResolvedValue({ id: 2, ...valid, business: 'Updated' })

    const response = await request(createApp(repository))
      .put('/api/members/2')
      .send({ ...valid, business: 'Updated' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: 2, ...valid, business: 'Updated' })
  })

  it('returns 404 when updating a missing member', async () => {
    repository.update.mockResolvedValue(null)

    const response = await request(createApp(repository)).put('/api/members/2').send(valid)

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Member not found' })
  })

  it('deletes an existing member without a response body', async () => {
    repository.remove.mockResolvedValue(true)

    const response = await request(createApp(repository)).delete('/api/members/2')

    expect(response.status).toBe(204)
    expect(response.text).toBe('')
  })

  it('returns 404 when deleting a missing member', async () => {
    repository.remove.mockResolvedValue(false)

    const response = await request(createApp(repository)).delete('/api/members/2')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Member not found' })
  })

  it('hides database error details', async () => {
    repository.list.mockRejectedValue(new Error('password=secret; SQL syntax'))

    const response = await request(createApp(repository)).get('/api/members')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Internal server error' })
    expect(response.text).not.toContain('secret')
  })
})
