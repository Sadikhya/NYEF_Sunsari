# NYEF Sunsari Members Backend

This Express API stores NYEF Sunsari member records in MySQL. Each member has a name, contact, address, business, optional social-media URL, and optional profile-picture URL/path.

## 1. Install dependencies

Open PowerShell in the project and run:

```powershell
cd backend
npm install
```

## 2. Create the database

1. Open MySQL Workbench.
2. Open your local MySQL connection.
3. Select **File → Open SQL Script**.
4. Open `backend/sql/schema.sql`.
5. Click the lightning-bolt **Execute** button.
6. In the Navigator, refresh **Schemas** and confirm `nyef_sunsari` contains the `members` table.

The table contains `id`, `name`, `contact`, `address`, `business`, `social_media`, `profile_picture`, `created_at`, and `updated_at`.

## 3. Configure the local connection

From the `backend` directory, create your private environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace only the example password with the password used by your local MySQL connection:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_real_mysql_password
DB_NAME=nyef_sunsari
```

Never commit or share `.env`. Git is configured to ignore it.

## 4. Verify and start the API

```powershell
npm test
npm run lint
npm start
```

The API listens at `http://localhost:5000` unless `PORT` is changed.

## 5. Test it from another PowerShell window

Check API health:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Create a member:

```powershell
$member = @{
  name = 'Test Member'
  contact = '9800000000'
  address = 'Sunsari'
  business = 'Test Business'
  social_media = $null
  profile_picture = $null
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:5000/api/members `
  -ContentType 'application/json' `
  -Body $member
```

List all members:

```powershell
Invoke-RestMethod http://localhost:5000/api/members
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check whether the API is running |
| `GET` | `/api/members` | List all members, newest first |
| `GET` | `/api/members/:id` | Read one member |
| `POST` | `/api/members` | Create a member |
| `PUT` | `/api/members/:id` | Replace a member's editable fields |
| `DELETE` | `/api/members/:id` | Delete a member |

Create and update requests require non-empty `name`, `contact`, `address`, and `business` strings. `social_media` and `profile_picture` may be strings or `null`.
