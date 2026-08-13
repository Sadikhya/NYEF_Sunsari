export function asyncHandler(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next)
}

export function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function notFound(response, label = 'Record') {
  return response.status(404).json({ error: `${label} not found` })
}
