import { validateMember } from '../services/memberValidation.js'

function parseId(rawId) {
  const id = Number(rawId)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function createMemberController(repository) {
  return {
    list: async (_request, response) => response.json(await repository.list()),

    read: async (request, response) => {
      const id = parseId(request.params.id)
      if (!id) return response.status(400).json({ error: 'Invalid member id' })

      const member = await repository.findById(id)
      return member
        ? response.json(member)
        : response.status(404).json({ error: 'Member not found' })
    },

    create: async (request, response) => {
      const result = validateMember(request.body)
      if (result.error) return response.status(400).json({ error: result.error })

      return response.status(201).json(await repository.create(result.value))
    },

    update: async (request, response) => {
      const id = parseId(request.params.id)
      if (!id) return response.status(400).json({ error: 'Invalid member id' })

      const result = validateMember(request.body)
      if (result.error) return response.status(400).json({ error: result.error })

      const member = await repository.update(id, result.value)
      return member
        ? response.json(member)
        : response.status(404).json({ error: 'Member not found' })
    },

    remove: async (request, response) => {
      const id = parseId(request.params.id)
      if (!id) return response.status(400).json({ error: 'Invalid member id' })

      return await repository.remove(id)
        ? response.status(204).send()
        : response.status(404).json({ error: 'Member not found' })
    },
  }
}
