# Supabase Setup Guide for Sankalp Premier League

## Prerequisites
- A Supabase account (free tier available at https://supabase.com)
- Your project URL and API keys (already provided)

## Step 1: Create Database Tables

1. Go to your Supabase dashboard: https://wnwabwghxbjtmdbujxjz.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Create a new query and paste the contents of `database_schema.sql`
4. Click **Run** to execute the SQL and create all tables

## Step 2: Verify Tables Created

1. Go to **Table Editor** in the left sidebar
2. You should see the following tables:
   - `teams`
   - `players`
   - `tournaments`
   - `matches`
   - `auctions`
   - `auction_history`

## Step 3: Check Sample Data

After running the schema, you should see:
- 4 sample teams (Mumbai Indians, Chennai Super Kings, etc.)
- 8 sample players (Virat Kohli, Rohit Sharma, etc.)

## Step 4: Test Database Connection

The application is already configured with your Supabase credentials. You can test the connection by:

1. Starting your React application: `npm start`
2. Navigate to any page that uses database operations
3. Check the browser console for any connection errors

## Environment Variables

The application uses the following environment variables (already configured in `src/config/supabase.js`):

```javascript
SUPABASE_URL=https://wnwabwghxbjtmdbujxjz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2Fid2doeGJqdG1kYnVqeGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzcwNzQsImV4cCI6MjA2OTQ1MzA3NH0.jf6ADsIRXJYuw_8KLfyHgoj8vRDjfndlpVH68VPFF-c
```

## Database Schema Overview

### Teams Table
- `id`: Unique identifier (UUID)
- `name`: Team name (unique)
- `budget`: Team budget (default: 10000)
- `created_at`, `updated_at`: Timestamps

### Players Table
- `id`: Unique identifier (UUID)
- `name`: Player name
- `base_price`: Player base price
- `team_id`: Reference to team (if sold)
- `status`: available/sold/unsold
- `sold_price`: Price at which player was sold

### Tournaments Table
- `id`: Unique identifier (UUID)
- `name`: Tournament name
- `status`: active/completed/cancelled
- `total_overs`: Number of overs per match
- `teams`: JSON array of team names

### Matches Table
- `id`: Unique identifier (UUID)
- `tournament_id`: Reference to tournament
- `team1`, `team2`: Team names
- `team1_score`, `team2_score`: JSON score objects
- `status`: scheduled/live/completed
- `winner`: Winning team name

### Auctions Table
- `id`: Unique identifier (UUID)
- `name`: Auction name
- `status`: active/completed/cancelled
- `teams`: JSON array of team objects
- `players`: JSON array of player objects
- `sold_players`, `unsold_players`: JSON arrays

### Auction History Table
- `id`: Unique identifier (UUID)
- `auction_id`: Reference to auction
- `player_name`: Player name
- `sold_to`: Team that bought the player
- `price`: Sale price
- `action`: sold/unsold/bid

## Security Features

- **Row Level Security (RLS)** is enabled on all tables
- **Public read/write policies** are configured for development
- **Indexes** are created for better query performance
- **Triggers** automatically update `updated_at` timestamps

## API Usage

The application includes helper functions in `src/config/supabase.js`:

```javascript
import { dbHelpers } from './config/supabase'

// Get all teams
const teams = await dbHelpers.getTeams()

// Create a new tournament
const tournament = await dbHelpers.createTournament({
  name: 'IPL 2024',
  total_overs: 20,
  teams: ['Mumbai Indians', 'Chennai Super Kings']
})

// Get matches for a tournament
const matches = await dbHelpers.getMatches(tournamentId)
```

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check if your Supabase URL and API key are correct
2. **Table Not Found**: Make sure you've run the `database_schema.sql` file
3. **Permission Denied**: Check Row Level Security policies in Supabase dashboard
4. **CORS Error**: Ensure your domain is added to Supabase allowed origins

### Getting Help:

- Check Supabase documentation: https://supabase.com/docs
- View your project logs in the Supabase dashboard
- Check browser console for detailed error messages

## Next Steps

1. **Customize Security**: Modify RLS policies based on your authentication needs
2. **Add Authentication**: Implement user authentication using Supabase Auth
3. **Real-time Features**: Enable real-time subscriptions for live updates
4. **File Storage**: Use Supabase Storage for player images and documents
5. **Backup**: Set up automated backups in Supabase dashboard 