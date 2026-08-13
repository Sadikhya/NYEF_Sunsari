# Dynamic Website and Single-Admin CMS Design

## Goal

Convert the existing NYEF Sunsari website into a database-driven website with one secure administrator account. The administrator can manage members, team members, gallery items, important homepage content, and events/news. Published changes appear automatically on the public React website.

## Scope

The first CMS release includes:

- One predefined administrator account with login and logout
- Member listing, creation, editing, and deletion
- Team-member listing, creation, editing, deletion, categorization, ordering, and publication control
- Gallery-image upload, captioning, ordering, deletion, and publication control
- Homepage president details and message editing
- Events/news listing, creation, editing, deletion, and publication control
- Public pages that read published records from the backend
- Loading, empty, validation, authentication, and server-error states

There is no administrator registration, administrator-management screen, role system, general-purpose page builder, or rich-text editor in this release. Permanent copy on About, What We Do, Membership, and Contact remains in React unless a field is explicitly included in `site_content`.

## Architecture

The existing React application remains the public frontend and gains a route-based admin area. The existing Express backend provides public read endpoints and session-protected admin endpoints. MySQL remains the source of truth for structured content. Uploaded images are stored in a backend-managed uploads directory; MySQL stores their relative paths and metadata rather than image binaries.

The backend is divided by feature: routes receive HTTP requests, controllers translate requests and responses, validation services validate input, repositories perform parameterized SQL, and authentication middleware protects administrative mutations. Public endpoints never expose private member contact details unless the public General Members design explicitly needs them; the initial public member representation contains only name, business, social-media link, and profile picture.

## Authentication and Single-Admin Policy

The `admins` table is designed for one seeded record. The application offers login and logout but no registration, invitation, create-admin, delete-admin, or role-management endpoint.

The administrator password is stored only as a slow password hash. On successful login, the backend creates an opaque, random session token, stores only its hash in `admin_sessions`, and sends the raw token in an HTTP-only cookie. The cookie uses `SameSite=Lax`, has an explicit expiry, and uses `Secure` in production. Logout deletes the server-side session and clears the cookie. Expired sessions are rejected and may be removed during authentication checks.

All create, update, delete, upload, reorder, publish, and unpublish endpoints require a valid admin session. Login uses generic failure messages. JSON and upload size limits are enforced. State-changing requests also verify the request origin against the configured frontend origin. CORS, when needed in development, allows only that configured origin and credentials.

The initial admin is created by a command-line seed script that reads the email and password from environment variables, hashes the password, and inserts or updates the sole record. Credentials are never committed to Git or embedded in browser code.

## Data Model

### `admins`

- `id`: unsigned integer primary key
- `email`: required unique email
- `password_hash`: required string
- `created_at`, `updated_at`: timestamps

Application and seed logic enforce a single row. No public API mutates this table.

### `admin_sessions`

- `id`: unsigned integer primary key
- `admin_id`: foreign key to `admins`
- `token_hash`: required unique hash
- `expires_at`: required timestamp
- `created_at`: timestamp

### `members`

The existing table remains authoritative: `name`, `contact`, `address`, `business`, optional `social_media`, optional `profile_picture`, and timestamps. The protected admin API owns full CRUD. A separate public projection omits contact and address.

### `team_members`

- `id`: unsigned integer primary key
- `name`: required text
- `position`: required text
- `term`: optional text
- `category`: enum-like value: `executive_committee`, `past_president`, or `general_member`
- `photo_path`: optional uploaded-image path
- `display_order`: non-negative integer
- `is_published`: boolean
- `created_at`, `updated_at`: timestamps

Public results include published records ordered by category, `display_order`, then `id`.

### `gallery_items`

- `id`: unsigned integer primary key
- `image_path`: required uploaded-image path
- `caption`: optional text
- `display_order`: non-negative integer
- `is_published`: boolean
- `created_at`, `updated_at`: timestamps

### `site_content`

This release uses one homepage content record with explicit columns rather than arbitrary key/value content:

- `id`: fixed singleton identifier
- `president_name`
- `president_position`
- `president_term`
- `president_photo_path`
- `president_message`
- `focus_heading`
- `focus_description`
- `updated_at`

Explicit fields keep validation and frontend rendering predictable while covering the approved important homepage content.

### `events_news`

- `id`: unsigned integer primary key
- `type`: `event` or `news`
- `title`: required text
- `summary`: required text
- `content`: optional longer plain text
- `event_date`: optional date; required for events
- `image_path`: optional uploaded-image path
- `is_published`: boolean
- `created_at`, `updated_at`: timestamps

Public results include only published records, ordered by event date and creation date, newest first.

## API Design

Public read endpoints:

- `GET /api/public/team-members`
- `GET /api/public/members`
- `GET /api/public/gallery`
- `GET /api/public/homepage`
- `GET /api/public/events-news`
- `GET /api/public/events-news/:id`

Authentication endpoints:

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/logout`

Protected management endpoints follow REST conventions beneath `/api/admin`:

- `/members`
- `/team-members`
- `/gallery`
- `/homepage`
- `/events-news`

Collections support `GET` and `POST`; item endpoints support `GET`, `PUT`, and `DELETE`. Homepage uses `GET` and `PUT` because it is a singleton. Reordering is performed with a protected collection endpoint that accepts an ordered list of record IDs and updates all affected rows in one transaction.

Image-bearing create and update requests use `multipart/form-data`; other requests use JSON. The server accepts JPEG, PNG, and WebP files only, verifies file signatures instead of trusting extensions, generates collision-resistant filenames, and limits each image to 5 MB. Replacing or deleting a record removes an old locally managed file only after the database operation succeeds. If a database operation fails after a new file is written, the new orphan file is removed.

## Admin Interface

The admin area has a dedicated login screen and an authenticated shell with:

- Dashboard overview
- Members
- Team Members
- Gallery
- Website Content
- Events/News
- Logout

Each management screen provides a list, an add/edit form, delete confirmation, validation feedback, loading feedback, and a success/error notification. Team and gallery screens support explicit numeric ordering in the first release; drag-and-drop is not required. Publication controls prevent unfinished team, gallery, and events/news records from appearing publicly.

The frontend checks the current session when the admin area opens. A `401` response returns the user to login. Authentication state is kept in memory and confirmed by the server rather than persisted as a readable token in local storage.

## Public Website Integration

The Team page replaces its hard-coded arrays with the public team and member endpoints while preserving the current three tabs. The Gallery page replaces its fixed 18-image array with published gallery records. The Home page loads the president information, president message, focus heading, and focus description from the homepage endpoint. A public Events/News page and navigation entry display published posts.

Each dynamic section shows a stable loading state, a useful empty state, and a retryable error state. Image URLs are resolved through the backend upload path. Existing static data is migrated into the new tables so the website does not become empty when dynamic loading is enabled.

## Validation and Errors

Validation trims strings, rejects missing required fields, enforces enumerated values and lengths, validates URLs where applicable, and rejects negative or non-integer display order. IDs must be positive integers. Invalid input returns `400`, unauthenticated access returns `401`, missing records return `404`, upload-size violations return `413`, and unexpected failures return `500` without SQL, stack traces, password hashes, or filesystem paths.

Delete operations require confirmation in the UI. Database foreign keys and transactions preserve consistency. Backend logs retain enough context for diagnosis but exclude credentials, session tokens, and password values.

## Testing and Verification

Backend automated tests cover:

- Correct and incorrect login, session checks, expiry, and logout
- Rejection of every protected operation without a valid session
- CRUD, validation, missing records, publication filtering, and ordering for each resource
- Public member-field redaction
- Valid and invalid image formats, oversize images, replacement, deletion, and cleanup after failure
- SQL parameterization and transaction behavior

Frontend automated tests cover:

- Login success and failure
- Session loss and logout
- Add, edit, delete, order, and publish workflows
- Loading, empty, validation, and server-error states
- Dynamic Team, Gallery, Home, and Events/News rendering

Final verification runs backend and frontend tests and linting, creates a production frontend build, applies the schema to a clean MySQL database, seeds the sole admin, exercises each admin workflow, and confirms changes appear on public desktop and mobile views.

## Delivery Sequence

Implementation proceeds in independently testable increments:

1. Extend the schema and add safe migrations/seed tooling.
2. Add authentication and protect the existing member mutations.
3. Build the remaining repositories, validation, and APIs.
4. Add secure image upload handling.
5. Build the admin shell and each management screen.
6. Migrate current static content and connect public pages.
7. Complete end-to-end verification and document setup/demo steps.

## Success Criteria

The work is complete when the single seeded administrator can securely log in and manage all approved resources; unauthenticated users cannot mutate data; published database changes appear automatically on public pages; private member fields remain private; uploads are validated and cleaned up correctly; and the documented automated and manual checks pass.
