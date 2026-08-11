# Members Backend Design

## Scope

Build the members backend before beginning the Admin section. This phase adds a MySQL data model and a Node.js/Express REST API for member records. It does not change the existing React frontend and does not implement image uploading.

## Technology

- Node.js and Express for the HTTP API
- MySQL, managed locally through MySQL Workbench
- `mysql2` for parameterized database queries
- `dotenv` for local database configuration
- Vitest and Supertest for API tests

## Project Structure

The existing `react/` application remains unchanged. A new `backend/` directory will contain the API:

```text
backend/
├── config/database.js
├── controllers/memberController.js
├── routes/memberRoutes.js
├── sql/schema.sql
├── tests/members.test.js
├── .env.example
├── package.json
└── server.js
```

Database connection code, request handling, routing, schema definition, and tests remain separate so each responsibility can be changed independently.

## Members Table

The `members` table contains the fields requested by the project supervisor plus identifiers and timestamps needed by the application:

| Column | MySQL type | Rules |
|---|---|---|
| `id` | `INT UNSIGNED` | Primary key, auto-increment |
| `name` | `VARCHAR(150)` | Required |
| `contact` | `VARCHAR(50)` | Required; text preserves country codes and leading zeroes |
| `address` | `VARCHAR(255)` | Required |
| `business` | `VARCHAR(255)` | Required |
| `social_media` | `VARCHAR(500)` | Nullable; stores a URL for this initial version |
| `profile_picture` | `VARCHAR(500)` | Nullable; reserved for a future image URL or path |
| `created_at` | `TIMESTAMP` | Set automatically when inserted |
| `updated_at` | `TIMESTAMP` | Updated automatically when changed |

No image binary is stored in MySQL. This phase accepts an optional text value for `profile_picture`, but it does not receive, process, or save uploaded files.

## REST API

The API exposes these endpoints under `/api/members`:

- `POST /api/members` creates a member.
- `GET /api/members` returns all members, newest first.
- `GET /api/members/:id` returns one member or `404`.
- `PUT /api/members/:id` updates one member or returns `404`.
- `DELETE /api/members/:id` deletes one member or returns `404`.
- `GET /api/health` confirms that the API is running.

Create and update requests use JSON. `name`, `contact`, `address`, and `business` must be non-empty strings. `social_media` and `profile_picture` may be strings or `null`. SQL queries use placeholders rather than interpolated input.

## Responses and Errors

Successful responses use JSON and appropriate status codes: `201` for creation, `200` for reads and updates, and `204` for deletion. Invalid input returns `400`, missing records return `404`, and unexpected database failures return `500` without exposing credentials or SQL details.

## Configuration

Database credentials remain in an uncommitted `backend/.env`. A committed `.env.example` documents `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. The backend ignores `.env` and generated dependencies.

## Testing

Automated tests cover input validation, list/read/create/update/delete behavior, missing-record responses, and database-error responses. The SQL schema will also be checked manually in MySQL Workbench before connecting the API.

## Deferred Admin Phase

The Admin section begins only after this API and schema work correctly. It will add authenticated admin access and a React interface for listing, creating, editing, and deleting members. Profile-picture upload handling remains deferred until separately approved.
