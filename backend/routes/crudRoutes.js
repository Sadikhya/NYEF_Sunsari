import { Router } from 'express'
import { asyncHandler, notFound, parseId } from '../common/http.js'

export function createCrudRouter({ repository, validate, label }) {
  const router = Router()

  router.get('/', asyncHandler(async (_request, response) => {
    response.json(await repository.listAdmin())
  }))

  router.post('/', asyncHandler(async (request, response) => {
    const result = validate(request.body)
    if (result.error) return response.status(400).json({ error: result.error })
    response.status(201).json(await repository.create(result.value))
  }))

  router.get('/:id', asyncHandler(async (request, response) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(400).json({ error: 'Invalid id' })
    const record = await repository.findById(id)
    return record ? response.json(record) : notFound(response, label)
  }))

  router.put('/:id', asyncHandler(async (request, response) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(400).json({ error: 'Invalid id' })
    const result = validate(request.body)
    if (result.error) return response.status(400).json({ error: result.error })
    const record = await repository.update(id, result.value)
    return record ? response.json(record) : notFound(response, label)
  }))

  router.delete('/:id', asyncHandler(async (request, response) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(400).json({ error: 'Invalid id' })
    const removed = await repository.remove(id)
    return removed ? response.status(204).end() : notFound(response, label)
  }))

  return router
}
