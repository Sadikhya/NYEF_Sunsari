import { describe, expect, it } from 'vitest'
import { validateMember } from '../services/memberValidation.js'

const valid = {
  name: 'Sinet Rijal',
  contact: '9800000000',
  address: 'Sunsari',
  business: 'Example Business',
  social_media: null,
  profile_picture: null,
}

describe('validateMember', () => {
  it.each(['name', 'contact', 'address', 'business'])('rejects empty %s', (field) => {
    expect(validateMember({ ...valid, [field]: '  ' }).error).toBe(`${field} is required`)
  })

  it('normalizes optional empty strings to null and trims text', () => {
    expect(validateMember({ ...valid, name: ' Sinet ', social_media: '', profile_picture: ' ' }).value)
      .toEqual({ ...valid, name: 'Sinet' })
  })

  it('rejects non-string optional values', () => {
    expect(validateMember({ ...valid, social_media: 42 }).error)
      .toBe('social_media must be a string or null')
  })
})
