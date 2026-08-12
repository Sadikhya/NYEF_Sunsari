import { describe, expect, it } from 'vitest'
import { pool } from '../config/database.js'

describe('database configuration', () => {
  it('exports a promise pool without opening a connection immediately', () => {
    expect(pool).toBeDefined()
    expect(typeof pool.execute).toBe('function')
  })
})
