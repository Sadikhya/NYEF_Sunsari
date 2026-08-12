import { Router } from 'express'
import { createMemberController } from '../controllers/memberController.js'

export function createMemberRouter(repository) {
  const router = Router()
  const controller = createMemberController(repository)

  router.get('/', controller.list)
  router.get('/:id', controller.read)
  router.post('/', controller.create)
  router.put('/:id', controller.update)
  router.delete('/:id', controller.remove)

  return router
}
