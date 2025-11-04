require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json({ limit: '1mb' }));

// CORS configuration: allow specific origins or allow all when ALLOW_ALL_ORIGINS=true
const allowAll = String(process.env.ALLOW_ALL_ORIGINS || 'true').toLowerCase() === 'true';
if (allowAll) {
  // reflect request origin and allow credentials — suitable for local dev
  app.use(cors({ origin: true }));
} else {
  // Restrict to known origins when running in production
  const allowedOrigins = [
    'http://localhost:3000',
  ];
  app.use(cors({ origin: allowedOrigins }));
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE; // MUST be set in server/.env (do NOT commit this to VCS)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment. Create server/.env with these values.');
  // we still start but endpoints will return 500
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE || '');

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// root - friendly message so browser visiting / doesn't show "Cannot GET /"
app.get('/', (req, res) => {
  res.type('html').send(`
    <html><head><meta charset="utf-8"><title>SPL Sync Server</title></head>
    <body style="font-family:system-ui,Segoe UI,Arial;line-height:1.6;padding:24px;">
      <h2>SPL Sync Server</h2>
      <p>This server exposes the following endpoints:</p>
      <ul>
        <li><strong>GET /health</strong> — returns JSON to indicate server is up.</li>
        <li><strong>POST /sync</strong> — accept a registration object or array and insert into <code>player_registrations_supabase</code> using the Supabase service_role key.</li>
      </ul>
      <p>Use the front-end client to POST synced registrations or call the endpoints directly.</p>
    </body></html>
  `);
});

// POST /sync
// Accepts either a single registration object or an array of objects
app.post('/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: 'empty body' });

    const records = Array.isArray(payload) ? payload : [payload];

    // Insert into player_registrations_supabase table
    const { data, error } = await supabaseAdmin
      .from('player_registrations_supabase')
      .insert(records)
      .select();

    if (error) {
      console.error('Supabase insert error (admin):', error);
      return res.status(500).json({ error: error.message || error });
    }

    return res.json({ ok: true, inserted: data?.length ?? 0, rows: data });
  } catch (err) {
    console.error('Sync endpoint error:', err);
    return res.status(500).json({ error: err.message || 'internal error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Sync server listening on http://localhost:${port}`));
