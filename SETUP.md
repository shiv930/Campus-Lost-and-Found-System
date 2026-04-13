# Campus Lost & Found — Bansal Group of Institutes

Full-stack web app: **React + Tailwind + Axios** (client), **Node + Express + MongoDB/Mongoose** (server), **JWT + bcrypt** authentication.

## Folder structure

```
campus-lost-found/
├── client/                 # React (Vite) frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Layout, ProtectedRoute
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Home, Login, Register, reports, matches, claim, admin
│   │   ├── utils/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                 # Express API
│   ├── config/             # multer upload config
│   ├── middleware/         # JWT auth, admin guard
│   ├── models/             # User, LostItem, FoundItem, Claim
│   ├── routes/             # auth, lost, found, match, claim, admin
│   ├── utils/              # text similarity for matching
│   ├── uploads/            # stored images (gitignored except .gitkeep)
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── SETUP.md
└── .gitignore
```

## Prerequisites

1. **Node.js** 18+ ([nodejs.org](https://nodejs.org/))
2. **MongoDB** running locally or a **MongoDB Atlas** connection string

## Step-by-step setup

### 1. MongoDB

- **Local:** start `mongod` (default `mongodb://127.0.0.1:27017`)
- **Atlas:** create a cluster, get a connection URI, and allow your IP

### 2. Backend environment

```bash
cd server
copy .env.example .env
```

Edit `server/.env`:

| Variable        | Purpose |
|----------------|---------|
| `PORT`         | API port (default `5000`) |
| `MONGODB_URI`  | Mongo connection string |
| `JWT_SECRET`   | Long random string for signing tokens |
| `CLIENT_ORIGIN`| Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `ADMIN_EMAILS` | Comma-separated emails that receive **admin** role on **register** |

### 3. Install and run the API

```bash
cd server
npm install
npm run dev
```

You should see: `Server listening on http://localhost:5000`.

Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Frontend environment (optional)

For local development, **Vite proxies** `/api` and `/uploads` to port `5000`, so you often need **no** client `.env`.

If the client is hosted separately from the API, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Install and run the client

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 6. Create an admin user

Register with an email listed in `ADMIN_EMAILS` in `server/.env` (e.g. `admin@bgi.edu.in`). That account gets the **admin** role and can open **Admin** in the nav.

---

## API endpoints (as specified)

| Method | Path | Auth | Description |
|--------|------|------|----------------|
| `POST` | `/api/auth/register` | No | Register; admin if email ∈ `ADMIN_EMAILS` |
| `POST` | `/api/auth/login` | No | Login → JWT |
| `POST` | `/api/lost` | Yes | Create lost item; runs matching; may set status `matched` |
| `POST` | `/api/found` | Yes | Multipart: fields + optional `image` |
| `GET` | `/api/match/:lostId` | Yes | Owner (or admin): ranked matches; **no** `hiddenIdentifier` |
| `POST` | `/api/claim` | Yes | Body: `lostItemId`, `foundItemId`, `explanation`, `hiddenIdentifierGuess` |
| `GET` | `/api/admin/all` | Admin | Dashboard payload + query filters |

**Additional helpers (used by the UI):**

- `GET /api/lost/mine` — current user’s lost reports (search/filter)
- `GET /api/found/browse` — public listing of found items (search/filter; secrets stripped)
- `GET /api/claim/mine` — user’s claims
- `PATCH /api/admin/claims/:id` — manual approve/reject
- `PATCH /api/admin/items/:type(found|lost)/:id` — mark **returned**

---

## Security notes

- Passwords hashed with **bcrypt** (cost 12).
- **JWT** required for protected routes; **admin** routes check role.
- **`hiddenIdentifier`** is stored on the server only; API responses for found items **never** include it (including admin list — privacy by design).

---

## Production build

```bash
cd client
npm run build
```

Serve the `client/dist` folder with any static host, set `VITE_API_URL` at build time to your API URL, and configure the API `CLIENT_ORIGIN` and `MONGODB_URI` for production.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| CORS errors | `CLIENT_ORIGIN` matches the exact browser origin (including port). |
| Mongo connection | `MONGODB_URI`, firewall / Atlas IP allowlist. |
| 401 on routes | Token in `Authorization: Bearer …`; not expired. |
| Image 404 | API running; request image via same host as API or set `VITE_API_URL`. |
