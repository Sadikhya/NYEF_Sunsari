# Dynamic Website and Single-Admin CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure single-admin CMS whose member, team, gallery, homepage, and events/news data automatically powers the public NYEF Sunsari website.

**Architecture:** Extend the existing Express/MySQL backend with feature-specific repositories, validators, controllers, and routers assembled through one dependency container. Store opaque hashed admin sessions in MySQL and locally uploaded images on disk, then add a React admin shell and a small API client while replacing hard-coded public data with public API reads.

**Tech Stack:** Node.js, Express 5, MySQL 8, `mysql2`, `bcryptjs`, `cookie-parser`, `cors`, `multer`, `file-type`, React 19, Vite 8, Tailwind CSS 4, Vitest, Supertest, Testing Library

## Global Constraints

- Exactly one seeded administrator; no registration, role, invitation, or administrator-management feature.
- Passwords use a slow hash; raw session tokens never enter MySQL or browser-readable storage.
- Admin mutations require a valid HTTP-only cookie and an allowed request origin.
- Uploaded images accept only verified JPEG, PNG, or WebP files up to 5 MB.
- MySQL stores image paths and metadata, not image binaries.
- Public member responses omit `contact` and `address`.
- Team categories are `executive_committee`, `past_president`, and `general_member`.
- About, What We Do, Membership, and Contact copy stays static in this release.
- Preserve existing user changes and public styling unless a task explicitly changes them.

## File Structure

- `backend/app.js`: assemble middleware and feature routers from injected dependencies.
- `backend/server.js`: construct production repositories, upload service, and application.
- `backend/sql/schema.sql`: idempotent complete schema and initial singleton homepage row.
- `backend/scripts/seedAdmin.js`: seed or replace the sole admin from environment variables.
- `backend/auth/`: password, session-token, middleware, repository, controller, and router code.
- `backend/common/`: shared ID parsing, async error handling, CRUD controller helpers, and validation utilities.
- `backend/features/<feature>/`: repository, validation, controller, and route files for team, gallery, homepage, and events/news.
- `backend/uploads/`: runtime upload root; contents ignored except `.gitkeep`.
- `backend/tests/`: unit/API tests and shared fake dependencies.
- `react/src/api/client.js`: credentialed JSON/multipart API client and normalized API errors.
- `react/src/hooks/useResource.js`: public resource loading state.
- `react/src/admin/`: authentication provider, shell, reusable CRUD UI, and management pages.
- `react/src/pages/EventsNewsPage.jsx`: public events/news listing.
- Existing public pages: replace hard-coded data with API-backed rendering.

---

### Task 1: Schema, dependencies, configuration, and single-admin seed

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/package-lock.json`
- Modify: `backend/sql/schema.sql`
- Modify: `backend/.env.example`
- Modify: `backend/.gitignore`
- Create: `backend/scripts/seedAdmin.js`
- Create: `backend/auth/password.js`
- Create: `backend/tests/seedAdmin.test.js`

**Interfaces:**
- Produces: `hashPassword(password): Promise<string>` and `verifyPassword(password, hash): Promise<boolean>`.
- Produces: `seedAdmin(database, { email, password }): Promise<void>`; deletes existing admins and inserts one inside a transaction.
- Produces environment values `FRONTEND_ORIGIN`, `SESSION_DAYS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `UPLOAD_DIR`.

- [ ] **Step 1: Write failing password and seed tests**

```js
it('stores one normalized admin with a non-plain-text password', async () => {
  await seedAdmin(database, { email: ' ADMIN@EXAMPLE.COM ', password: 'Correct horse 123!' })
  expect(connection.execute).toHaveBeenCalledWith('DELETE FROM admins')
  expect(connection.execute).toHaveBeenCalledWith(
    'INSERT INTO admins (email, password_hash) VALUES (?, ?)',
    ['admin@example.com', expect.not.stringContaining('Correct horse 123!')],
  )
  expect(connection.commit).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- seedAdmin.test.js` from `backend/`  
Expected: FAIL because `seedAdmin` and password helpers do not exist.

- [ ] **Step 3: Install runtime dependencies and add the seed script**

Run: `npm install bcryptjs cookie-parser cors multer file-type` from `backend/`.

Add `"seed:admin": "node scripts/seedAdmin.js"` to scripts. Implement bcrypt with cost 12 and reject passwords shorter than 12 characters. Implement the seed transaction with `getConnection()`, `beginTransaction()`, `DELETE FROM admin_sessions`, `DELETE FROM admins`, one insert, commit, rollback on error, and `release()` in `finally`.

- [ ] **Step 4: Extend the idempotent schema**

Add `admins`, `admin_sessions`, `team_members`, `gallery_items`, `site_content`, and `events_news` exactly as specified. Use foreign-key cascade from sessions to admins, indexes on `token_hash`, publication/order columns, and this singleton seed:

```sql
INSERT INTO site_content (
  id, president_name, president_position, president_term,
  president_photo_path, president_message, focus_heading, focus_description
) VALUES (1, 'Mr. Sinet Rijal', 'President, NYEF Sunsari', '2026-2027',
  '/assets/team/sinetrijal.jpg',
  'Your involvement is what makes NYEF Sunsari strong. I thank all predecessors for their visionary leadership and thank all of you for keeping the spirit alive. While we are still in our early years, we are laying down strong foundations for the future. Let’s grow together, evolve as an impactful chapter, and create an entrepreneurial community that uplifts the nation.',
  'Our Key Focus Areas',
  'We create tangible value for our members and community through strategic initiatives.'
) ON DUPLICATE KEY UPDATE id = id;
```

- [ ] **Step 5: Document secrets and ignore uploads**

Set example values without real credentials and add `uploads/*` plus `!uploads/.gitkeep` to the backend ignore file.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- seedAdmin.test.js` from `backend/`  
Expected: PASS.  
Commit: `feat: add CMS schema and single-admin seed`

### Task 2: Authentication, session cookies, origin checks, and app assembly

**Files:**
- Create: `backend/auth/sessionTokens.js`
- Create: `backend/auth/adminRepository.js`
- Create: `backend/auth/authMiddleware.js`
- Create: `backend/auth/authController.js`
- Create: `backend/auth/authRoutes.js`
- Create: `backend/common/asyncHandler.js`
- Modify: `backend/app.js`
- Modify: `backend/server.js`
- Create: `backend/tests/auth.test.js`

**Interfaces:**
- Produces: `createSessionToken(): { rawToken: string, tokenHash: string }` using 32 random bytes and SHA-256.
- Produces: `createAdminRepository(database)` with `findByEmail`, `createSession`, `findValidSession`, and `deleteSession`.
- Produces: `createRequireAdmin({ adminRepository, now }): RequestHandler` setting `request.admin` and `request.sessionToken`.
- Changes: `createApp(dependencies)` where dependencies contain repositories, `frontendOrigin`, `sessionDays`, `upload`, and `uploadsPath`.

- [ ] **Step 1: Write failing authentication API tests**

```js
it('logs in with an HTTP-only session cookie', async () => {
  adminRepository.findByEmail.mockResolvedValue({ id: 1, email: 'admin@example.com', password_hash: hash })
  const response = await request(createApp(dependencies))
    .post('/api/admin/login')
    .set('Origin', 'http://localhost:5173')
    .send({ email: 'admin@example.com', password: validPassword })
  expect(response.status).toBe(200)
  expect(response.headers['set-cookie'][0]).toMatch(/nyef_admin=/)
  expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/)
})

it('rejects a protected mutation without a session', async () => {
  const response = await request(createApp(dependencies)).post('/api/admin/members').send(validMember)
  expect(response.status).toBe(401)
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- auth.test.js` from `backend/`  
Expected: FAIL with missing authentication modules/routes.

- [ ] **Step 3: Implement token hashing and the admin repository**

Use `randomBytes(32).toString('base64url')` for raw tokens and `createHash('sha256')` for stored hashes. Query only non-expired sessions joined to the admin. Never log or return `password_hash` or `token_hash`.

- [ ] **Step 4: Implement login, session, logout, and origin enforcement**

Login validates normalized email and non-empty password, returns generic `401 { error: 'Invalid email or password' }`, creates the session, and sets `nyef_admin`. Session returns `{ admin: { id, email } }`. Logout deletes the hashed presented token and clears the cookie. Reject state-changing `/api/admin/*` requests whose `Origin` is present and differs from `frontendOrigin` with `403`.

- [ ] **Step 5: Refactor app and server assembly**

Configure JSON at `1mb`, cookies, credentialed single-origin CORS, `/uploads` static serving, health, auth routes, public routes, protected admin routes, a `404` JSON handler, and the existing safe `500` handler. Adapt existing member tests to pass `{ memberRepository }` inside the dependency object.

- [ ] **Step 6: Run authentication and regression tests, then commit**

Run: `npm test -- auth.test.js members.test.js` from `backend/`  
Expected: PASS.  
Commit: `feat: add single-admin session authentication`

### Task 3: Separate public and protected member APIs

**Files:**
- Modify: `backend/repositories/memberRepository.js`
- Modify: `backend/controllers/memberController.js`
- Modify: `backend/routes/memberRoutes.js`
- Modify: `backend/app.js`
- Modify: `backend/tests/memberRepository.test.js`
- Modify: `backend/tests/members.test.js`

**Interfaces:**
- Produces: `memberRepository.listPublic(): Promise<PublicMember[]>` selecting `id`, `name`, `business`, `social_media`, and `profile_picture` only.
- Public: `GET /api/public/members`.
- Protected: CRUD beneath `/api/admin/members`.

- [ ] **Step 1: Write failing privacy and authorization tests**

```js
it('returns only the public member projection', async () => {
  repository.listPublic.mockResolvedValue([{ id: 1, name: 'A', business: 'B', social_media: null, profile_picture: null }])
  const response = await request(createApp(dependencies)).get('/api/public/members')
  expect(response.body[0]).not.toHaveProperty('contact')
  expect(response.body[0]).not.toHaveProperty('address')
})
```

Also assert every POST, PUT, and DELETE under `/api/admin/members` returns `401` without a session and succeeds with the authentication middleware stubbed as valid.

- [ ] **Step 2: Run member tests and confirm failure**

Run: `npm test -- members.test.js memberRepository.test.js` from `backend/`  
Expected: FAIL because the split routes and `listPublic` do not exist.

- [ ] **Step 3: Implement the public projection and route split**

Keep full reads and mutations under the admin router. Use an explicit public SELECT—never map full records after reading them—to prevent accidental private-field exposure.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- members.test.js memberRepository.test.js` from `backend/`  
Expected: PASS.  
Commit: `feat: protect member management and add public listing`

### Task 4: Team-member backend with publication and transactional ordering

**Files:**
- Create: `backend/features/team/teamValidation.js`
- Create: `backend/features/team/teamRepository.js`
- Create: `backend/features/team/teamController.js`
- Create: `backend/features/team/teamRoutes.js`
- Modify: `backend/app.js`
- Modify: `backend/server.js`
- Create: `backend/tests/teamValidation.test.js`
- Create: `backend/tests/teamRepository.test.js`
- Create: `backend/tests/team.test.js`

**Interfaces:**
- Produces: `validateTeamMember(body)` returning normalized `name`, `position`, `term`, `category`, `photo_path`, `display_order`, and `is_published`.
- Produces repository methods `listAdmin`, `listPublished`, `findById`, `create`, `update`, `remove`, and `reorder(ids)`.
- Public: `GET /api/public/team-members`.
- Protected: CRUD plus `PUT /api/admin/team-members/order` with `{ ids: number[] }`.

- [ ] **Step 1: Write failing validation, repository, and API tests**

Test all three category values, rejection of invalid category/order/boolean, published filtering, deterministic ordering, CRUD status codes, duplicate/missing reorder IDs, rollback after an update failure, and authentication on mutations.

```js
expect(validateTeamMember({ ...valid, category: 'unknown' })).toEqual({
  error: 'category must be executive_committee, past_president, or general_member',
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- teamValidation.test.js teamRepository.test.js team.test.js` from `backend/`.

- [ ] **Step 3: Implement validator and parameterized repository**

Use explicit field arrays rather than `Object.values`. `listPublished` filters `is_published = 1` and orders with `FIELD(category, 'executive_committee', 'past_president', 'general_member'), display_order, id`. Reorder validates that the supplied IDs exactly match existing IDs and updates them in a transaction.

- [ ] **Step 4: Implement controllers/routes and wire dependencies**

Return `201`, `200`, `204`, `400`, and `404` consistently with the members API. Define `/order` before `/:id`.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- teamValidation.test.js teamRepository.test.js team.test.js` from `backend/`  
Expected: PASS.  
Commit: `feat: add dynamic team member API`

### Task 5: Secure image storage and gallery backend

**Files:**
- Create: `backend/uploads/.gitkeep`
- Create: `backend/services/imageStorage.js`
- Create: `backend/features/gallery/galleryValidation.js`
- Create: `backend/features/gallery/galleryRepository.js`
- Create: `backend/features/gallery/galleryController.js`
- Create: `backend/features/gallery/galleryRoutes.js`
- Modify: `backend/app.js`
- Modify: `backend/server.js`
- Create: `backend/tests/imageStorage.test.js`
- Create: `backend/tests/gallery.test.js`

**Interfaces:**
- Produces: `createImageStorage({ uploadRoot })` with `middleware(fieldName)`, `finalize(tempFile): Promise<string>`, and `remove(relativePath): Promise<void>`.
- Produces gallery repository CRUD, `listPublished`, and transactional `reorder(ids)`.
- Public: `GET /api/public/gallery`.
- Protected: multipart CRUD and `PUT /api/admin/gallery/order`.

- [ ] **Step 1: Write failing upload and gallery tests**

Create tiny fixture buffers for valid JPEG, PNG, WebP, and disguised text. Assert a valid image receives a random safe name, disguised/oversize files return `400`/`413`, paths cannot escape the upload root, public reads filter unpublished records, and failed database creates remove newly finalized files.

```js
const response = await agent.post('/api/admin/gallery')
  .field('caption', 'Founders meetup')
  .field('display_order', '0')
  .field('is_published', 'true')
  .attach('image', validPngBuffer, 'photo.png')
expect(response.status).toBe(201)
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- imageStorage.test.js gallery.test.js` from `backend/`.

- [ ] **Step 3: Implement verified storage**

Let Multer buffer at most 5 MB, detect the signature with `fileTypeFromBuffer`, accept only `image/jpeg`, `image/png`, and `image/webp`, generate `randomUUID()` filenames, and use `path.resolve` containment checks before deletion. Convert Multer size failures to `413 { error: 'Image must be 5 MB or smaller' }`.

- [ ] **Step 4: Implement gallery CRUD, cleanup, and ordering**

Require an image on create. On replacement, finalize the new image, update MySQL, then remove the old managed image; remove the new image on repository failure. On delete, delete the row first and then its managed file. Return public URLs beginning `/uploads/`.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- imageStorage.test.js gallery.test.js` from `backend/`  
Expected: PASS.  
Commit: `feat: add secure gallery image management`

### Task 6: Homepage and events/news backend

**Files:**
- Create: `backend/features/homepage/homepageValidation.js`
- Create: `backend/features/homepage/homepageRepository.js`
- Create: `backend/features/homepage/homepageController.js`
- Create: `backend/features/homepage/homepageRoutes.js`
- Create: `backend/features/posts/postValidation.js`
- Create: `backend/features/posts/postRepository.js`
- Create: `backend/features/posts/postController.js`
- Create: `backend/features/posts/postRoutes.js`
- Modify: `backend/app.js`
- Modify: `backend/server.js`
- Create: `backend/tests/homepage.test.js`
- Create: `backend/tests/posts.test.js`

**Interfaces:**
- Homepage repository: `read()` and `update(content)` for row `id = 1`.
- Posts repository: `listAdmin`, `listPublished`, `findPublishedById`, `findById`, `create`, `update`, and `remove`.
- Public: `GET /api/public/homepage`, `GET /api/public/events-news`, `GET /api/public/events-news/:id`.
- Protected: `GET|PUT /api/admin/homepage` and CRUD `/api/admin/events-news`.

- [ ] **Step 1: Write failing homepage and post tests**

Test required president/focus fields, optional president image, image replacement cleanup, event date required only for `type: 'event'`, valid ISO date parsing, published filtering, unpublished item `404`, CRUD, auth, and safe errors.

```js
expect(validatePost({ ...validPost, type: 'event', event_date: null })).toEqual({
  error: 'event_date is required for an event',
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- homepage.test.js posts.test.js` from `backend/`.

- [ ] **Step 3: Implement the singleton homepage feature**

Use explicit UPDATE columns with `WHERE id = 1`. Accept optional multipart `president_photo`; retain the old path if absent and apply the same finalize/update/cleanup sequence as gallery.

- [ ] **Step 4: Implement events/news**

Normalize `type`, text, date, publication boolean, and image path. Allow an optional multipart `image`. Public list/read queries include only published rows and sort by `COALESCE(event_date, DATE(created_at)) DESC, created_at DESC, id DESC`.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- homepage.test.js posts.test.js` from `backend/`  
Expected: PASS.  
Commit: `feat: add homepage and events news APIs`

### Task 7: Migrate current static content and document backend operation

**Files:**
- Create: `backend/sql/seed-content.sql`
- Modify: `backend/README.md`
- Create: `backend/tests/schema.test.js`

**Interfaces:**
- Produces an idempotent content seed using stable natural matching for existing team and gallery assets.
- Documents schema application, admin seed, upload directory, development origins, and startup commands.

- [ ] **Step 1: Write a failing schema/seed contract test**

Read both SQL files and assert every table, the singleton homepage insert, all 18 gallery paths, 13 executive members, five past presidents, publication flags, and unique/idempotent insert guards exist.

- [ ] **Step 2: Run the test and confirm failure**

Run: `npm test -- schema.test.js` from `backend/`.

- [ ] **Step 3: Add the idempotent content seed**

Insert the current `TeamPage.jsx` people and `/assets/gallery/1.jpg` through `/assets/gallery/18.jpg` as published records with sequential order. Use `INSERT ... SELECT ... WHERE NOT EXISTS` so rerunning does not duplicate content.

- [ ] **Step 4: Update backend documentation**

Document: install, create `.env`, execute `schema.sql`, execute `seed-content.sql`, run `npm run seed:admin`, start, API groups, supported upload types/limit, and how to rotate the sole admin password by rerunning the seed command.

- [ ] **Step 5: Run all backend checks and commit**

Run: `npm test` and `npm run lint` from `backend/`  
Expected: all pass.  
Commit: `docs: add CMS data migration and setup guide`

### Task 8: Frontend API client, routing, and public loading primitives

**Files:**
- Create: `react/src/api/client.js`
- Create: `react/src/hooks/useResource.js`
- Create: `react/src/components/ResourceState.jsx`
- Modify: `react/src/App.jsx`
- Modify: `react/src/components/Header.jsx`
- Create: `react/src/api/client.test.js`
- Create: `react/src/hooks/useResource.test.jsx`

**Interfaces:**
- Produces: `api.request(path, { method = 'GET', body, signal } = {})`, `api.json(...)`, and `api.form(...)`; all use `credentials: 'include'` and throw `ApiError(status, message)`.
- Produces: `useResource(path)` returning `{ data, loading, error, reload }` with aborted-request protection.
- Adds application pages `events-news`, `admin-login`, and `admin` without introducing a router dependency.

- [ ] **Step 1: Write failing API and hook tests**

```js
expect(fetch).toHaveBeenCalledWith('/api/public/gallery', expect.objectContaining({ credentials: 'include' }))
expect(result.current).toMatchObject({ loading: false, data: [{ id: 1 }], error: null })
```

Test JSON errors, `204`, multipart bodies without manually setting `Content-Type`, reload, and unmount cancellation.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- client.test.js useResource.test.jsx` from `react/`.

- [ ] **Step 3: Implement client and loading primitives**

Resolve API base from `VITE_API_URL` with an empty same-origin default. `ResourceState` renders accessible loading, empty, error, and retry UI without owning data fetching.

- [ ] **Step 4: Extend navigation and page selection**

Add Events/News to desktop/mobile public navigation. Recognize admin pages in `App`, but do not show admin login in the public header. Preserve current button navigation and scroll behavior.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- client.test.js useResource.test.jsx App.test.jsx` from `react/`  
Expected: PASS.  
Commit: `feat: add frontend API and dynamic page foundations`

### Task 9: Dynamic public Team, Gallery, Home, and Events/News pages

**Files:**
- Modify: `react/src/pages/TeamPage.jsx`
- Modify: `react/src/pages/GalleryPage.jsx`
- Modify: `react/src/pages/HomePage.jsx`
- Create: `react/src/pages/EventsNewsPage.jsx`
- Modify: `react/src/App.jsx`
- Modify: `react/src/App.test.jsx`
- Create: `react/src/pages/PublicDynamicPages.test.jsx`

**Interfaces:**
- Consumes the five `/api/public/*` endpoints through `useResource`.
- Produces the current three Team tabs, API gallery grid, dynamic president/focus content, and public published post list.

- [ ] **Step 1: Replace static expectations with failing API-backed tests**

Mock `fetch` by URL. Verify categories map to the current tab IDs, general members use the public member projection, captions become image alt text, homepage fields replace static values, unpublished posts are absent from fixtures/results, and each page exposes loading/error/empty UI.

```jsx
await user.click(screen.getByRole('button', { name: /gallery/i }))
expect(await screen.findByRole('img', { name: 'Founders meetup' })).toHaveAttribute(
  'src', 'http://localhost:5000/uploads/gallery.png',
)
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- PublicDynamicPages.test.jsx App.test.jsx` from `react/`.

- [ ] **Step 3: Implement dynamic pages**

Keep the existing visual components and layout. Map backend snake_case fields explicitly. Use `VITE_API_URL` only for `/uploads/` paths; leave `/assets/` migration paths same-origin. Preserve the current first executive member feature treatment.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- PublicDynamicPages.test.jsx App.test.jsx` from `react/`  
Expected: PASS.  
Commit: `feat: load public website content from CMS API`

### Task 10: Admin authentication provider, login, and shell

**Files:**
- Create: `react/src/admin/AdminAuthContext.jsx`
- Create: `react/src/admin/AdminLoginPage.jsx`
- Create: `react/src/admin/AdminShell.jsx`
- Create: `react/src/admin/AdminOverview.jsx`
- Modify: `react/src/App.jsx`
- Create: `react/src/admin/AdminAuth.test.jsx`

**Interfaces:**
- Produces: `AdminAuthProvider` and `useAdminAuth()` returning `{ admin, checking, login, logout }`.
- `login(email, password)` calls `/api/admin/login`; logout always clears local auth state after attempting `/api/admin/logout`.
- `AdminShell` accepts `activeSection` and `onNavigate` and redirects unauthenticated users to `admin-login`.

- [ ] **Step 1: Write failing login/session/logout tests**

Test initial session check, valid login, generic invalid-login feedback, authenticated shell, logout, and a later API `401` clearing auth and returning to login.

```jsx
await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
await user.type(screen.getByLabelText(/password/i), 'Correct horse 123!')
await user.click(screen.getByRole('button', { name: /log in/i }))
expect(await screen.findByText(/dashboard overview/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run focused test and confirm failure**

Run: `npm test -- AdminAuth.test.jsx` from `react/`.

- [ ] **Step 3: Implement auth state and accessible login**

Use password inputs, disabled submitting state, field labels, inline server error, no credential persistence, and no admin-registration link. The provider calls `/api/admin/session` once when entering the admin area.

- [ ] **Step 4: Implement responsive admin shell**

Add Overview, Members, Team Members, Gallery, Website Content, Events/News, and Logout navigation. Keep it visually separate from the public Header/Footer.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- AdminAuth.test.jsx App.test.jsx` from `react/`  
Expected: PASS.  
Commit: `feat: add admin login and dashboard shell`

### Task 11: Members and team management screens

**Files:**
- Create: `react/src/admin/components/ConfirmDialog.jsx`
- Create: `react/src/admin/components/AdminNotice.jsx`
- Create: `react/src/admin/components/ResourceTable.jsx`
- Create: `react/src/admin/pages/MembersAdminPage.jsx`
- Create: `react/src/admin/pages/TeamAdminPage.jsx`
- Modify: `react/src/admin/AdminShell.jsx`
- Create: `react/src/admin/pages/MembersAdminPage.test.jsx`
- Create: `react/src/admin/pages/TeamAdminPage.test.jsx`

**Interfaces:**
- Member form sends exact existing fields: `name`, `contact`, `address`, `business`, `social_media`, `profile_picture`.
- Team form sends multipart fields: `name`, `position`, `term`, `category`, `display_order`, `is_published`, and optional `photo`.
- Both pages reload after successful mutation and call the auth invalidation callback on `401`.

- [ ] **Step 1: Write failing member workflow tests**

Test list, add, edit, delete confirmation/cancel, validation message, server error, empty state, and button disabled while saving.

- [ ] **Step 2: Write failing team workflow tests**

Test category labels, image selection, add/edit/delete, publication toggle, numeric order changes, `PUT /order`, validation, and preview of existing photo.

- [ ] **Step 3: Run focused tests and confirm failure**

Run: `npm test -- MembersAdminPage.test.jsx TeamAdminPage.test.jsx` from `react/`.

- [ ] **Step 4: Implement reusable feedback/table/dialog components and Members page**

Make the confirmation dialog keyboard accessible with a labelled heading, Cancel as the initial safe action, Escape handling, and focus restoration. Render member contact/address only inside the authenticated page.

- [ ] **Step 5: Implement Team page**

Use a select for the three fixed categories, checkbox for publication, number input with minimum 0, file input accepting `.jpg,.jpeg,.png,.webp`, and explicit Move Up/Move Down controls that persist the full ID order.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- MembersAdminPage.test.jsx TeamAdminPage.test.jsx` from `react/`  
Expected: PASS.  
Commit: `feat: add member and team admin management`

### Task 12: Gallery, homepage, and events/news management screens

**Files:**
- Create: `react/src/admin/pages/GalleryAdminPage.jsx`
- Create: `react/src/admin/pages/HomepageAdminPage.jsx`
- Create: `react/src/admin/pages/PostsAdminPage.jsx`
- Modify: `react/src/admin/AdminShell.jsx`
- Create: `react/src/admin/pages/GalleryAdminPage.test.jsx`
- Create: `react/src/admin/pages/HomepageAdminPage.test.jsx`
- Create: `react/src/admin/pages/PostsAdminPage.test.jsx`

**Interfaces:**
- Gallery uses multipart `image`, `caption`, `display_order`, and `is_published` plus `/order`.
- Homepage uses multipart president/focus fields and optional `president_photo`.
- Posts use multipart `type`, `title`, `summary`, `content`, `event_date`, `is_published`, and optional `image`.

- [ ] **Step 1: Write failing gallery workflow tests**

Test required image on create, preview, caption, publish toggle, order controls, delete confirmation, accepted types, and surfaced `413` message.

- [ ] **Step 2: Write failing homepage workflow tests**

Test initial values, edit/save, optional photo replacement, required fields, success notification, and API error preservation of entered values.

- [ ] **Step 3: Write failing events/news workflow tests**

Test event/news type switching, conditional event-date requirement, add/edit/delete, image preview, publication toggle, empty state, and server errors.

- [ ] **Step 4: Run focused tests and confirm failure**

Run: `npm test -- GalleryAdminPage.test.jsx HomepageAdminPage.test.jsx PostsAdminPage.test.jsx` from `react/`.

- [ ] **Step 5: Implement all three management pages**

Reuse the shared notice, table, and confirmation components. Revoke object preview URLs on replacement/unmount. Send booleans as `true`/`false` strings in multipart forms and omit unchanged file fields.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- GalleryAdminPage.test.jsx HomepageAdminPage.test.jsx PostsAdminPage.test.jsx` from `react/`  
Expected: PASS.  
Commit: `feat: complete CMS content management screens`

### Task 13: Full verification, production wiring, and demonstration guide

**Files:**
- Modify: `react/vite.config.js`
- Modify: `react/README.md`
- Modify: `backend/README.md`
- Create: `docs/admin-guide.md`
- Modify: tests only if verification reveals an actual regression requiring a targeted test first.

**Interfaces:**
- Vite development proxy forwards `/api` and `/uploads` to `http://localhost:5000`.
- Admin guide documents login, every CRUD workflow, publication behavior, supported images, password rotation, and the supervisor demonstration checklist.

- [ ] **Step 1: Add development proxy and documentation tests/checks**

Add a small config test or exported config assertion confirming both proxy entries. Document exact PowerShell commands for backend/frontend startup and database initialization.

- [ ] **Step 2: Run complete automated verification**

Run from `backend/`: `npm test` then `npm run lint`.  
Run from `react/`: `npm test` then `npm run lint` then `npm run build`.  
Expected: every command exits 0; the build produces `react/dist`.

- [ ] **Step 3: Apply and smoke-test against a clean MySQL database**

Execute `schema.sql` and `seed-content.sql`, set non-committed `ADMIN_EMAIL` and `ADMIN_PASSWORD`, run `npm run seed:admin`, start both apps, and verify health, login, logout, one CRUD cycle per resource, image replacement, publication filtering, and public member redaction.

- [ ] **Step 4: Verify the complete browser story**

At desktop and mobile widths: log in; create/edit/reorder/publish/unpublish/delete each supported resource; verify Team, Gallery, Home, and Events/News immediately reflect published changes; verify an unauthenticated admin URL returns to login; verify invalid and oversize uploads show useful errors.

- [ ] **Step 5: Write the admin and supervisor demonstration guide**

Include the sequence: log in, add a member, add/reorder a team member, upload/publish a gallery item, update the president message, publish an event, open each public page, log out, and demonstrate that protected operations are unavailable.

- [ ] **Step 6: Final regression run and commit**

Repeat all commands from Step 2 after documentation/config changes.  
Commit: `docs: add CMS operations and demonstration guide`
