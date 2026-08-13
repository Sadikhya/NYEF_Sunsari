const categories = new Set(['executive_committee', 'past_president', 'general_member'])

function cleanOptional(value) {
  const cleaned = String(value || '').trim()
  return cleaned || null
}

export function validateTeamMember(body) {
  const name = String(body?.name || '').trim()
  const position = String(body?.position || '').trim()
  const category = String(body?.category || '').trim()
  const displayOrder = Number(body?.display_order ?? 0)

  if (!name) return { error: 'name is required' }
  if (!position) return { error: 'position is required' }
  if (!categories.has(category)) return { error: 'category must be executive_committee, past_president, or general_member' }
  if (!Number.isInteger(displayOrder) || displayOrder < 0) return { error: 'display_order must be a non-negative integer' }

  return {
    value: {
      name,
      position,
      category,
      term: cleanOptional(body.term),
      business: cleanOptional(body.business),
      contact: cleanOptional(body.contact),
      address: cleanOptional(body.address),
      profile_picture: cleanOptional(body.profile_picture),
      display_order: displayOrder,
      is_published: body.is_published === false || body.is_published === 'false' ? 0 : 1,
    },
  }
}
