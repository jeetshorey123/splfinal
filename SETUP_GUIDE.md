# Supabase Setup Guide for SPL Player Registration

## Issues Fixed
✅ Updated `src/config/supabase.js` to use environment variables  
✅ Updated `src/components/supabaseClient.js` to use environment variables  
✅ Fixed table name in `createPlayer` function to use `player_registrations_supabase`  
✅ Server code already using correct table name  

## Required Steps to Complete Setup

### 1. Get Your Supabase Keys
1. Go to your Supabase project: https://kyknunxxyjfpzdvamnqb.supabase.co
2. Go to **Settings** → **API**
3. Copy the following keys:
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update Environment Files

#### Update `.env` (client)
Replace `REPLACE_WITH_YOUR_ANON_PUBLIC_KEY` with your actual anon public key:
```
REACT_APP_SUPABASE_URL=https://kyknunxxyjfpzdvamnqb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ANON_KEY_HERE...
REACT_APP_SYNC_SERVER_URL=http://localhost:4000
```

#### Update `server/.env` (server)
Replace `REPLACE_WITH_YOUR_SERVICE_ROLE_KEY` with your actual service role key:
```
SUPABASE_URL=https://kyknunxxyjfpzdvamnqb.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_SERVICE_ROLE_KEY_HERE...
PORT=4000
ALLOW_ALL_ORIGINS=true
```

### 3. Run the SQL Schema
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Copy the entire contents of `supabase_complete_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to create all tables, policies, and sample data

### 4. Test the Connection
After updating the keys, run these commands:

```bash
# Start the sync server (from project root)
cd server
npm start

# In another terminal, start the React app (from project root)
npm start
```

### 5. Verify Registration Works
1. Open http://localhost:3000
2. Click the **Register** button in the navbar
3. Fill out the registration form
4. Submit the form
5. You should see a success popup
6. Check your Supabase dashboard → **Table Editor** → `player_registrations_supabase` to see the new registration

## Database Tables Created
The schema includes:
- `player_registrations_supabase` - For the registration form (main table)
- `tournaments`, `teams`, `players` - For full SPL management
- `live_auctions`, `auction_transactions` - For auction functionality  
- `match_schedule`, `match_scores` - For match management
- Plus views, functions, and sample data

## Troubleshooting
- If you get "Failed to fetch" errors, check your anon key
- If server sync fails, check your service role key  
- Make sure to restart the React app after updating the .env file
- Check browser console for detailed error messages