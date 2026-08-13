# NYEF Sunsari Backend

Express + MySQL backend for the NYEF Sunsari dynamic website and single-admin CMS.

## Setup

1. Install dependencies:

   ```powershell
   cd backend
   npm install
   ```

2. Create `.env` from `.env.example` and set your database credentials plus one admin email/password.

3. Create the database and tables:

   ```powershell
   mysql -u root -p < sql/schema.sql
   ```

4. Seed the current website team/content data:

   ```powershell
   mysql -u root -p nyef_sunsari < sql/seed-content.sql
   ```

5. Seed the single admin:

   ```powershell
   npm run seed:admin
   ```

6. Start the API:

   ```powershell
   npm run dev
   ```

The backend runs on `http://localhost:5000` by default.

## API Groups

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/logout`
- `GET /api/public/members`
- `GET /api/public/team-members`
- `GET /api/public/site-content`
- Protected CRUD:
  - `/api/admin/members`
  - `/api/admin/team-members`
  - `/api/admin/site-content`

There is no admin registration route. To change the admin account, update `.env` and rerun `npm run seed:admin`.
