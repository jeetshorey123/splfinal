Server sync helper
==================

This small Express server provides a POST /sync endpoint that will insert posted records into the
`player_registrations_supabase` table using the Supabase service_role key (server-side admin key).

Why use this?
- The Supabase service_role key must never be exposed in client-side bundles. Using a server endpoint keeps the key private while allowing the client to request syncs for locally-saved registrations.

Setup (local)
-------------
1. Copy `.env.example` to `.env` inside the `server/` folder and paste your service role key into `SUPABASE_SERVICE_ROLE`.

2. Install dependencies and start the server:

```powershell
cd server
npm install
npm start
```

By default the server listens on port 4000. The front-end will POST to `http://localhost:4000/sync`.

How the front-end uses it
- The front-end `PlayerRegistration` component will POST an array of locally-stored registrations to `/sync`.
- If the server inserts records successfully the server responds with `{ ok: true, inserted: N }` and the front-end will remove the synced items from localStorage.

Security
--------
This helper is intentionally minimal. If you deploy it publicly, protect the endpoint using one of:
- a short-lived signed token from your server-side auth
- a host-level allowlist / firewall
- require authentication and only allow the user who created the registration to sync
