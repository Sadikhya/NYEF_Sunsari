const requiredFields = ['name', 'contact', 'address', 'business']
const optionalFields = ['social_media', 'profile_picture']

export function validateMember(body = {}) {
  const value = {}

  for (const field of requiredFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return { error: `${field} is required` }
    }
    value[field] = body[field].trim()
  }

  for (const field of optionalFields) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== 'string') {
      return { error: `${field} must be a string or null` }
    }
    value[field] = body[field]?.trim() || null
  }

  return { value }
}
