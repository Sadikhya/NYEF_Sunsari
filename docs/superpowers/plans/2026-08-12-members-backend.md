# Members Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tested Express and MySQL REST API that stores and manages NYEF Sunsari members with name, contact, address, business, social media, and profile picture fields.

**Architecture:** Keep the React application unchanged and create an independent `backend/` Node.js package. Export the Express application separately from the listening server so Supertest can exercise real routes while a small injectable repository boundary isolates API behavior from MySQL in unit tests.

**Tech Stack:** Node.js, Express, MySQL 8, mysql2, dotenv, Vitest, Supertest

## Global Constraints

- Member fields are `name`, `contact`, `address`, `business`, `social_media`, and `profile_picture`.
- `name`, `contact`, `address`, and `business` are required non-empty strings.
- `social_media` and `profile_picture` accept a string or `null`.
- Profile pictures are stored as an optional URL/path string; binary upload handling is out of scope.
- SQL values must use placeholders.
- Database credentials must remain in an uncommitted `backend/.env`.
- Do not modify the existing React application during this phase.

---

### Task 1: Backend package, configuration, and database schema

**Files:**
- Create: `backend/package.json`
- Create: `backend/.gitignore`
- Create: `backend/.env.example`
- Create: `backend/config/database.js`
- Create: `backend/sql/schema.sql`
- Test: `backend/tests/database.test.js`

**Interfaces:**
- Consumes: environment variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
- Produces: `pool` from `config/database.js`, exposing mysql2 promise-pool methods including `execute(sql, params)`.

- [ ] **Step 1: Create the backend package manifest and install its locked dependencies**

```json
{
  "name": "nyef-sunsari-backend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js",
    "test": "vitest run",
    "lint": "oxlint ."
  },
  "dependencies": {
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "mysql2": "^3.15.3"
  },
  "devDependencies": {
    "oxlint": "^1.75.0",
    "supertest": "^7.1.4",
    "vitest": "^4.1.0"
  }
}
```

Run: `cd backend && npm install`

- [ ] **Step 2: Write the failing database configuration test**

```js
import { describe, expect, it } from 'vitest'
import { pool } from '../config/database.js'

describe('database configuration', () => {
  it('exports a promise pool without opening a connection immediately', () => {
    expect(pool).toBeDefined()
    expect(typeof pool.execute).toBe('function')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails because the module is missing**

Run: `cd backend && npm test -- tests/database.test.js`

Expected: FAIL with an import error for `config/database.js`.

- [ ] **Step 4: Add database configuration, environment documentation, and ignore rules**

Create `backend/config/database.js`:

```js
import 'dotenv/config'
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'nyef_sunsari',
  waitForConnections: true,
  connectionLimit: 10,
})
```

Create `backend/.env.example`:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=replace_with_your_mysql_password
DB_NAME=nyef_sunsari
```

Create `backend/.gitignore`:

```gitignore
node_modules/
.env
coverage/
```

- [ ] **Step 5: Define the database and members table**

Create `backend/sql/schema.sql`:

```sql
CREATE DATABASE IF NOT EXISTS nyef_sunsari
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nyef_sunsari;

CREATE TABLE IF NOT EXISTS members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  business VARCHAR(255) NOT NULL,
  social_media VARCHAR(500) NULL,
  profile_picture VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

- [ ] **Step 6: Run the focused test and lint check**

Run: `cd backend && npm test -- tests/database.test.js && npm run lint`

Expected: one passing test and zero lint errors.

- [ ] **Step 7: Commit the package and schema**

```bash
git add backend/package.json backend/package-lock.json backend/.gitignore backend/.env.example backend/config/database.js backend/sql/schema.sql backend/tests/database.test.js
git commit -m "feat: configure members database"
```

---

### Task 2: Member repository and validation

**Files:**
- Create: `backend/repositories/memberRepository.js`
- Create: `backend/services/memberValidation.js`
- Test: `backend/tests/memberRepository.test.js`
- Test: `backend/tests/memberValidation.test.js`

**Interfaces:**
- Consumes: a database object with `execute(sql, params)`.
- Produces: `createMemberRepository(database)` with `list()`, `findById(id)`, `create(member)`, `update(id, member)`, and `remove(id)` methods.
- Produces: `validateMember(body)` returning `{ value }` or `{ error }`.

- [ ] **Step 1: Write failing validation tests**

```js
import { describe, expect, it } from 'vitest'
import { validateMember } from '../services/memberValidation.js'

const valid = {
  name: 'Sinet Rijal', contact: '9800000000', address: 'Sunsari',
  business: 'Example Business', social_media: null, profile_picture: null,
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
```

- [ ] **Step 2: Run validation tests and confirm the missing-module failure**

Run: `cd backend && npm test -- tests/memberValidation.test.js`

Expected: FAIL importing `services/memberValidation.js`.

- [ ] **Step 3: Implement minimal member validation**

```js
const requiredFields = ['name', 'contact', 'address', 'business']
const optionalFields = ['social_media', 'profile_picture']

export function validateMember(body = {}) {
  const value = {}
  for (const field of requiredFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) return { error: `${field} is required` }
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
```

- [ ] **Step 4: Run validation tests and confirm they pass**

Run: `cd backend && npm test -- tests/memberValidation.test.js`

Expected: all validation tests PASS.

- [ ] **Step 5: Write failing repository tests that verify behavior and parameterized SQL**

```js
import { describe, expect, it, vi } from 'vitest'
import { createMemberRepository } from '../repositories/memberRepository.js'

const member = {
  name: 'Sinet Rijal', contact: '9800000000', address: 'Sunsari',
  business: 'Example Business', social_media: null, profile_picture: null,
}

describe('member repository', () => {
  it('lists newest members first', async () => {
    const rows = [{ id: 2 }, { id: 1 }]
    const database = { execute: vi.fn().mockResolvedValue([rows]) }
    expect(await createMemberRepository(database).list()).toBe(rows)
    expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('ORDER BY created_at DESC, id DESC'))
  })

  it('finds a member by parameterized id', async () => {
    const database = { execute: vi.fn().mockResolvedValue([[{ id: 7 }]]) }
    expect(await createMemberRepository(database).findById(7)).toEqual({ id: 7 })
    expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [7])
  })

  it('creates and returns the inserted member', async () => {
    const database = { execute: vi.fn().mockResolvedValueOnce([{ insertId: 9 }]).mockResolvedValueOnce([[{ id: 9, ...member }]]) }
    expect(await createMemberRepository(database).create(member)).toEqual({ id: 9, ...member })
    expect(database.execute.mock.calls[0][1]).toEqual(Object.values(member))
  })

  it('returns null when updating a missing member', async () => {
    const database = { execute: vi.fn().mockResolvedValue([{ affectedRows: 0 }]) }
    expect(await createMemberRepository(database).update(99, member)).toBeNull()
  })

  it('reports whether deletion removed a member', async () => {
    const database = { execute: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) }
    expect(await createMemberRepository(database).remove(3)).toBe(true)
    expect(database.execute).toHaveBeenCalledWith('DELETE FROM members WHERE id = ?', [3])
  })
})
```

- [ ] **Step 6: Run repository tests and confirm the missing-module failure**

Run: `cd backend && npm test -- tests/memberRepository.test.js`

Expected: FAIL importing `repositories/memberRepository.js`.

- [ ] **Step 7: Implement the repository**

```js
const columns = 'id, name, contact, address, business, social_media, profile_picture, created_at, updated_at'

export function createMemberRepository(database) {
  async function findById(id) {
    const [rows] = await database.execute(`SELECT ${columns} FROM members WHERE id = ?`, [id])
    return rows[0] ?? null
  }

  return {
    async list() {
      const [rows] = await database.execute(`SELECT ${columns} FROM members ORDER BY created_at DESC, id DESC`)
      return rows
    },
    findById,
    async create(member) {
      const values = Object.values(member)
      const [result] = await database.execute(
        'INSERT INTO members (name, contact, address, business, social_media, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
        values,
      )
      return findById(result.insertId)
    },
    async update(id, member) {
      const [result] = await database.execute(
        'UPDATE members SET name = ?, contact = ?, address = ?, business = ?, social_media = ?, profile_picture = ? WHERE id = ?',
        [...Object.values(member), id],
      )
      return result.affectedRows ? findById(id) : null
    },
    async remove(id) {
      const [result] = await database.execute('DELETE FROM members WHERE id = ?', [id])
      return result.affectedRows > 0
    },
  }
}
```

- [ ] **Step 8: Run all Task 2 tests and lint**

Run: `cd backend && npm test -- tests/memberValidation.test.js tests/memberRepository.test.js && npm run lint`

Expected: all tests pass and lint reports zero errors.

- [ ] **Step 9: Commit repository and validation behavior**

```bash
git add backend/repositories backend/services backend/tests/memberRepository.test.js backend/tests/memberValidation.test.js
git commit -m "feat: add member persistence and validation"
```

---

### Task 3: Members REST API and server

**Files:**
- Create: `backend/controllers/memberController.js`
- Create: `backend/routes/memberRoutes.js`
- Create: `backend/app.js`
- Create: `backend/server.js`
- Test: `backend/tests/members.test.js`

**Interfaces:**
- Consumes: a member repository matching Task 2's five-method interface.
- Produces: `createApp(memberRepository)` returning an Express application.
- Produces: REST endpoints `GET /api/health` and CRUD routes under `/api/members`.

- [ ] **Step 1: Write failing API behavior tests**

```js
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'

const valid = {
  name: 'Sinet Rijal', contact: '9800000000', address: 'Sunsari',
  business: 'Example Business', social_media: null, profile_picture: null,
}

let repository
beforeEach(() => {
  repository = {
    list: vi.fn(), findById: vi.fn(), create: vi.fn(),
    update: vi.fn(), remove: vi.fn(),
  }
})

describe('members API', () => {
  it('reports API health', async () => {
    const response = await request(createApp(repository)).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('lists members', async () => {
    repository.list.mockResolvedValue([{ id: 1, ...valid }])
    const response = await request(createApp(repository)).get('/api/members')
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('returns 404 for a missing member', async () => {
    repository.findById.mockResolvedValue(null)
    const response = await request(createApp(repository)).get('/api/members/77')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Member not found' })
  })

  it('rejects invalid numeric ids', async () => {
    const response = await request(createApp(repository)).get('/api/members/not-a-number')
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid member id' })
  })

  it('creates a valid member', async () => {
    repository.create.mockResolvedValue({ id: 2, ...valid })
    const response = await request(createApp(repository)).post('/api/members').send(valid)
    expect(response.status).toBe(201)
    expect(response.body.id).toBe(2)
    expect(repository.create).toHaveBeenCalledWith(valid)
  })

  it('rejects an invalid member', async () => {
    const response = await request(createApp(repository)).post('/api/members').send({ ...valid, name: '' })
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'name is required' })
  })

  it('updates an existing member', async () => {
    repository.update.mockResolvedValue({ id: 2, ...valid, business: 'Updated' })
    const response = await request(createApp(repository)).put('/api/members/2').send({ ...valid, business: 'Updated' })
    expect(response.status).toBe(200)
    expect(response.body.business).toBe('Updated')
  })

  it('returns 404 when updating a missing member', async () => {
    repository.update.mockResolvedValue(null)
    expect((await request(createApp(repository)).put('/api/members/2').send(valid)).status).toBe(404)
  })

  it('deletes an existing member without a response body', async () => {
    repository.remove.mockResolvedValue(true)
    const response = await request(createApp(repository)).delete('/api/members/2')
    expect(response.status).toBe(204)
    expect(response.text).toBe('')
  })

  it('returns 404 when deleting a missing member', async () => {
    repository.remove.mockResolvedValue(false)
    expect((await request(createApp(repository)).delete('/api/members/2')).status).toBe(404)
  })

  it('hides database error details', async () => {
    repository.list.mockRejectedValue(new Error('password=secret; SQL syntax'))
    const response = await request(createApp(repository)).get('/api/members')
    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Internal server error' })
    expect(response.text).not.toContain('secret')
  })
})
```

- [ ] **Step 2: Run the API tests and confirm the missing-app failure**

Run: `cd backend && npm test -- tests/members.test.js`

Expected: FAIL importing `app.js`.

- [ ] **Step 3: Implement the controller and routes**

Create `backend/controllers/memberController.js`:

```js
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
      return member ? response.json(member) : response.status(404).json({ error: 'Member not found' })
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
      return member ? response.json(member) : response.status(404).json({ error: 'Member not found' })
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
```

Create `backend/routes/memberRoutes.js`:

```js
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
```

- [ ] **Step 4: Implement the application and safe error boundary**

Create `backend/app.js`:

```js
import express from 'express'
import { createMemberRouter } from './routes/memberRoutes.js'

export function createApp(memberRepository) {
  const app = express()
  app.use(express.json())
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
  app.use('/api/members', createMemberRouter(memberRepository))
  app.use((error, _request, response, _next) => {
    console.error(error)
    response.status(500).json({ error: 'Internal server error' })
  })
  return app
}
```

- [ ] **Step 5: Add the production server entrypoint**

Create `backend/server.js`:

```js
import 'dotenv/config'
import { createApp } from './app.js'
import { pool } from './config/database.js'
import { createMemberRepository } from './repositories/memberRepository.js'

const port = Number(process.env.PORT ?? 5000)
const app = createApp(createMemberRepository(pool))

app.listen(port, () => {
  console.log(`NYEF Sunsari API listening on port ${port}`)
})
```

- [ ] **Step 6: Run the API tests and confirm they pass**

Run: `cd backend && npm test -- tests/members.test.js`

Expected: 11 passing API tests.

- [ ] **Step 7: Run the complete backend verification suite**

Run: `cd backend && npm test && npm run lint`

Expected: all tests pass and lint reports zero errors.

- [ ] **Step 8: Commit the REST API**

```bash
git add backend/app.js backend/server.js backend/controllers backend/routes backend/tests/members.test.js
git commit -m "feat: add members REST API"
```

---

### Task 4: Local MySQL integration and manual smoke test

**Files:**
- Create locally, do not commit: `backend/.env`
- Modify: `backend/README.md`

**Interfaces:**
- Consumes: a running MySQL 8 server and the schema from `backend/sql/schema.sql`.
- Produces: a locally running API at `http://localhost:5000` and documented setup commands.

- [ ] **Step 1: Create the local database in MySQL Workbench**

Open `backend/sql/schema.sql` in MySQL Workbench, connect to the local MySQL server, and execute the entire script. Confirm that the `nyef_sunsari.members` table contains all nine columns from the design.

- [ ] **Step 2: Create local configuration from the example**

Run: `cd backend && Copy-Item .env.example .env`

Edit only `backend/.env` and replace `DB_PASSWORD` with the local MySQL password. Keep `DB_NAME=nyef_sunsari`.

- [ ] **Step 3: Add exact setup and smoke-test instructions to the backend README**

Create `backend/README.md` with installation, schema import, `.env` setup, `npm test`, `npm start`, and these PowerShell examples:

```powershell
Invoke-RestMethod http://localhost:5000/api/health

$member = @{
  name = 'Test Member'
  contact = '9800000000'
  address = 'Sunsari'
  business = 'Test Business'
  social_media = $null
  profile_picture = $null
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/members -ContentType 'application/json' -Body $member
Invoke-RestMethod http://localhost:5000/api/members
```

- [ ] **Step 4: Start the server and execute the smoke test**

Run in terminal one: `cd backend && npm start`

Run the README health, create-member, and list-members commands in terminal two.

Expected: health returns `status: ok`; create returns a record with an integer `id`; list includes that member and every requested field.

- [ ] **Step 5: Re-run automated verification**

Run: `cd backend && npm test && npm run lint`

Expected: all tests pass and lint reports zero errors.

- [ ] **Step 6: Commit documentation only**

```bash
git add backend/README.md
git commit -m "docs: add members backend setup guide"
```

Do not add `backend/.env` to Git.
