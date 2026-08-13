import { Router } from 'express'
import { asyncHandler, notFound } from '../common/http.js'
import { validateContent } from '../services/contentValidation.js'

export function createContentRouter(repository) {
  const router = Router()

  router.get('/', asyncHandler(async (_request, response) => {
    response.json(await repository.list())
  }))

  router.post('/', asyncHandler(async (request, response) => {
    const result = validateContent(request.body)
    if (result.error) return response.status(400).json({ error: result.error })
    response.status(201).json(await repository.upsert(result.value))
  }))

  router.put('/:key', asyncHandler(async (request, response) => {
    const result = validateContent({ ...request.body, content_key: request.params.key })
    if (result.error) return response.status(400).json({ error: result.error })
    response.json(await repository.upsert(result.value))
  }))

  router.delete('/:key', asyncHandler(async (request, response) => {
    const removed = await repository.remove(request.params.key)
    return removed ? response.status(204).end() : notFound(response, 'Content')
  }))

  return router
}
