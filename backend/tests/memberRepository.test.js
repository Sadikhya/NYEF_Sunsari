import { describe, expect, it, vi } from 'vitest'
import { createMemberRepository } from '../repositories/memberRepository.js'

const member = {
  name: 'Sinet Rijal',
  contact: '9800000000',
  address: 'Sunsari',
  business: 'Example Business',
  social_media: null,
  profile_picture: null,
}

describe('member repository', () => {
  it('lists newest members first', async () => {
    const rows = [{ id: 2 }, { id: 1 }]
    const database = { execute: vi.fn().mockResolvedValue([rows]) }

    expect(await createMemberRepository(database).list()).toEqual([{ id: 2 }, { id: 1 }])
    expect(database.execute).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY created_at DESC, id DESC'),
    )
  })

  it('finds a member by parameterized id', async () => {
    const database = { execute: vi.fn().mockResolvedValue([[{ id: 7 }]]) }

    expect(await createMemberRepository(database).findById(7)).toEqual({ id: 7 })
    expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [7])
  })

  it('creates and returns the inserted member', async () => {
    const database = {
      execute: vi.fn()
        .mockResolvedValueOnce([{ insertId: 9 }])
        .mockResolvedValueOnce([[{ id: 9, ...member }]]),
    }

    expect(await createMemberRepository(database).create(member)).toEqual({ id: 9, ...member })
    expect(database.execute.mock.calls[0][1]).toEqual([
      'Sinet Rijal', '9800000000', 'Sunsari', 'Example Business', null, null,
    ])
  })

  it('returns null when updating a missing member', async () => {
    const database = { execute: vi.fn().mockResolvedValue([{ affectedRows: 0 }]) }

    expect(await createMemberRepository(database).update(99, member)).toBeNull()
  })

  it('reports whether deletion removed a member', async () => {
    const database = { execute: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) }

    expect(await createMemberRepository(database).remove(3)).toBe(true)
    expect(database.execute).toHaveBeenCalledWith('DELETE FROM members WHERE id = ?', [3])
  })
})
