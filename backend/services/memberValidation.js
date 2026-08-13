function cleanOptional(value) {
  const cleaned = String(value || '').trim()
  return cleaned || null
}

function required(body, field, maxLength) {
  const value = String(body?.[field] || '').trim()
  if (!value) return { error: `${field} is required` }
  if (value.length > maxLength) return { error: `${field} is too long` }
  return { value }
}

export function validateMember(body) {
  const name = required(body, 'name', 150)
  if (name.error) return name
  const contact = required(body, 'contact', 50)
  if (contact.error) return contact
  const address = required(body, 'address', 255)
  if (address.error) return address
  const business = required(body, 'business', 255)
  if (business.error) return business

  return {
    value: {
      name: name.value,
      contact: contact.value,
      address: address.value,
      business: business.value,
      profile_picture: cleanOptional(body.profile_picture),
    },
  }
}
