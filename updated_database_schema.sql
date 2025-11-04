-- Sankalp Premier League Complete Database Schema
-- Updated: August 2025
-- This schema supports: Player Registration, Live Auction, Team Squads, Schedule Management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. PLAYER REGISTRATION TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS player_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT,
    age INTEGER,
    cricket_role VARCHAR(100), -- Batsman, Bowler, All-rounder, Wicket-keeper
    experience_years INTEGER DEFAULT 0,
    past_teams TEXT, -- Previous teams/clubs played for
    preferred_batting_position INTEGER,
    bowling_style VARCHAR(100), -- Right-arm fast, Left-arm spin, etc.
    batting_style VARCHAR(50), -- Right-handed, Left-handed
    base_price INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'registered', -- registered, auction_ready, sold, unsold
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. TOURNAMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    tournament_type VARCHAR(50) DEFAULT 'T20', -- T20, ODI, Test
    total_teams INTEGER DEFAULT 8,
    max_players_per_team INTEGER DEFAULT 15,
    team_budget INTEGER DEFAULT 10000,
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, registration_open, auction_scheduled, ongoing, completed
    start_date DATE,
    end_date DATE,
    venue VARCHAR(255),
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. TEAMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    owner_contact VARCHAR(20),
    team_color VARCHAR(7), -- Hex color code
    logo_url TEXT,
    current_budget DECIMAL(10,2) DEFAULT 10000.00,
    remaining_budget DECIMAL(10,2) DEFAULT 10000.00,
    players_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, name)
);

-- ========================================
-- 4. LIVE AUCTION TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS live_auctions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    auction_name VARCHAR(255) NOT NULL,
    auction_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
    current_player_id UUID,
    current_bid_amount INTEGER DEFAULT 0,
    current_bidding_team_id UUID,
    total_players_sold INTEGER DEFAULT 0,
    total_players_unsold INTEGER DEFAULT 0,
    total_amount_spent DECIMAL(12,2) DEFAULT 0.00,
    auction_settings JSONB, -- Settings like bid increment, timeout, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. AUCTION TRANSACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS auction_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auction_id UUID NOT NULL REFERENCES live_auctions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_registrations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    final_price INTEGER,
    base_price INTEGER NOT NULL,
    bid_count INTEGER DEFAULT 0,
    transaction_type VARCHAR(50) NOT NULL, -- 'sold', 'unsold', 'withdrawn'
    auction_order INTEGER, -- Order in which player was auctioned
    transaction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. BID HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bid_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auction_id UUID NOT NULL REFERENCES live_auctions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_registrations(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    bid_amount INTEGER NOT NULL,
    bid_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_winning_bid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. TEAM SQUADS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS team_squads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_registrations(id) ON DELETE CASCADE,
    player_role VARCHAR(100), -- Captain, Vice-Captain, Player
    jersey_number INTEGER,
    purchase_price INTEGER,
    is_captain BOOLEAN DEFAULT FALSE,
    is_vice_captain BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, team_id, player_id),
    UNIQUE(tournament_id, team_id, jersey_number)
);

-- ========================================
-- 8. MATCH SCHEDULE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS match_schedule (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    match_type VARCHAR(50) DEFAULT 'league', -- league, semi-final, final, qualifier
    team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    venue VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed, cancelled, postponed
    toss_winner_id UUID REFERENCES teams(id),
    toss_decision VARCHAR(20), -- bat, bowl
    match_result VARCHAR(50), -- win, tie, no_result, abandoned
    winner_team_id UUID REFERENCES teams(id),
    margin VARCHAR(100), -- "by 5 wickets", "by 25 runs", etc.
    man_of_the_match_id UUID REFERENCES player_registrations(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, match_number)
);

-- ========================================
-- 9. MATCH SCORES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS match_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES match_schedule(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    innings_number INTEGER NOT NULL, -- 1 or 2
    total_runs INTEGER DEFAULT 0,
    total_wickets INTEGER DEFAULT 0,
    total_overs DECIMAL(3,1) DEFAULT 0.0,
    run_rate DECIMAL(4,2) DEFAULT 0.00,
    target INTEGER, -- Target runs (for second innings)
    extras JSONB, -- {wides: 0, noballs: 0, byes: 0, legbyes: 0}
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, team_id, innings_number)
);

-- ========================================
-- 10. PLAYER STATISTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS player_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_registrations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Batting Stats
    matches_played INTEGER DEFAULT 0,
    innings_batted INTEGER DEFAULT 0,
    runs_scored INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    centuries INTEGER DEFAULT 0,
    half_centuries INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    batting_average DECIMAL(5,2) DEFAULT 0.00,
    strike_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Bowling Stats
    innings_bowled INTEGER DEFAULT 0,
    overs_bowled DECIMAL(4,1) DEFAULT 0.0,
    runs_conceded INTEGER DEFAULT 0,
    wickets_taken INTEGER DEFAULT 0,
    best_bowling VARCHAR(10), -- e.g., "5/23"
    economy_rate DECIMAL(4,2) DEFAULT 0.00,
    bowling_average DECIMAL(5,2) DEFAULT 0.00,
    
    -- Fielding Stats
    catches INTEGER DEFAULT 0,
    stumpings INTEGER DEFAULT 0,
    run_outs INTEGER DEFAULT 0,
    
    -- Other Stats
    man_of_the_match_awards INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- ========================================
-- 11. TOURNAMENT STANDINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS tournament_standings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    matches_tied INTEGER DEFAULT 0,
    matches_no_result INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    net_run_rate DECIMAL(5,3) DEFAULT 0.000,
    total_runs_scored INTEGER DEFAULT 0,
    total_runs_conceded INTEGER DEFAULT 0,
    total_overs_faced DECIMAL(4,1) DEFAULT 0.0,
    total_overs_bowled DECIMAL(4,1) DEFAULT 0.0,
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_player_registrations_phone ON player_registrations(phone_number);
CREATE INDEX IF NOT EXISTS idx_player_registrations_email ON player_registrations(email);
CREATE INDEX IF NOT EXISTS idx_player_registrations_status ON player_registrations(status);

CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_auction_transactions_auction_id ON auction_transactions(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_transactions_player_id ON auction_transactions(player_id);

CREATE INDEX IF NOT EXISTS idx_team_squads_tournament_id ON team_squads(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_squads_team_id ON team_squads(team_id);
CREATE INDEX IF NOT EXISTS idx_team_squads_player_id ON team_squads(player_id);

CREATE INDEX IF NOT EXISTS idx_match_schedule_tournament_id ON match_schedule(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_schedule_date ON match_schedule(match_date);
CREATE INDEX IF NOT EXISTS idx_match_schedule_status ON match_schedule(status);

CREATE INDEX IF NOT EXISTS idx_match_scores_match_id ON match_scores(match_id);
CREATE INDEX IF NOT EXISTS idx_player_statistics_tournament_id ON player_statistics(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_tournament_id ON tournament_standings(tournament_id);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_player_registrations_updated_at BEFORE UPDATE ON player_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_auctions_updated_at BEFORE UPDATE ON live_auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_squads_updated_at BEFORE UPDATE ON team_squads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_match_schedule_updated_at BEFORE UPDATE ON match_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_match_scores_updated_at BEFORE UPDATE ON match_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournament_standings_updated_at BEFORE UPDATE ON tournament_standings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- USEFUL VIEWS FOR QUICK DATA ACCESS
-- ========================================

-- View: Complete Squad Information
CREATE OR REPLACE VIEW squad_details AS
SELECT 
    t.name as tournament_name,
    tm.name as team_name,
    pr.name as player_name,
    pr.phone_number,
    pr.cricket_role,
    ts.player_role,
    ts.jersey_number,
    ts.purchase_price,
    ts.is_captain,
    ts.is_vice_captain
FROM team_squads ts
JOIN tournaments t ON ts.tournament_id = t.id
JOIN teams tm ON ts.team_id = tm.id
JOIN player_registrations pr ON ts.player_id = pr.id
WHERE ts.is_active = true
ORDER BY t.name, tm.name, ts.is_captain DESC, ts.is_vice_captain DESC, pr.name;

-- View: Match Schedule with Team Names
CREATE OR REPLACE VIEW schedule_details AS
SELECT 
    t.name as tournament_name,
    ms.match_number,
    ms.match_type,
    t1.name as team1_name,
    t2.name as team2_name,
    ms.match_date,
    ms.match_time,
    ms.venue,
    ms.status,
    winner.name as winner_team_name,
    ms.margin,
    mom.name as man_of_the_match
FROM match_schedule ms
JOIN tournaments t ON ms.tournament_id = t.id
JOIN teams t1 ON ms.team1_id = t1.id
JOIN teams t2 ON ms.team2_id = t2.id
LEFT JOIN teams winner ON ms.winner_team_id = winner.id
LEFT JOIN player_registrations mom ON ms.man_of_the_match_id = mom.id
ORDER BY t.name, ms.match_date, ms.match_time;

-- View: Auction Results
CREATE OR REPLACE VIEW auction_results AS
SELECT 
    t.name as tournament_name,
    la.auction_name,
    pr.name as player_name,
    pr.phone_number,
    pr.cricket_role,
    tm.name as team_name,
    at.base_price,
    at.final_price,
    at.transaction_type,
    at.auction_order
FROM auction_transactions at
JOIN live_auctions la ON at.auction_id = la.id
JOIN tournaments t ON la.tournament_id = t.id
JOIN player_registrations pr ON at.player_id = pr.id
LEFT JOIN teams tm ON at.team_id = tm.id
ORDER BY t.name, at.auction_order;

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Insert Sample Tournament
INSERT INTO tournaments (name, description, start_date, end_date, venue) 
VALUES ('SPL 2025', 'Sankalp Premier League 2025 Season', '2025-09-01', '2025-09-30', 'Mumbai Cricket Ground')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Teams (assuming tournament exists)
DO $$
DECLARE 
    tournament_uuid UUID;
BEGIN
    SELECT id INTO tournament_uuid FROM tournaments WHERE name = 'SPL 2025' LIMIT 1;
    
    IF tournament_uuid IS NOT NULL THEN
        INSERT INTO teams (tournament_id, name, owner_name, team_color) VALUES 
        (tournament_uuid, 'Sankalp Legends', 'Owner 1', '#FF6B35'),
        (tournament_uuid, 'Sankalp Mavericks', 'Owner 2', '#4ECDC4'),
        (tournament_uuid, 'Sankalp Strikers', 'Owner 3', '#45B7D1'),
        (tournament_uuid, 'Sankalp Thunderbolts', 'Owner 4', '#96CEB4'),
        (tournament_uuid, 'Sankalp Valiants', 'Owner 5', '#FECA57'),
        (tournament_uuid, 'Sankalp Warriors', 'Owner 6', '#FF9FF3'),
        (tournament_uuid, 'Sankalp Royals', 'Owner 7', '#54A0FF'),
        (tournament_uuid, 'Sankalp Champions', 'Owner 8', '#5F27CD')
        ON CONFLICT (tournament_id, name) DO NOTHING;
    END IF;
END $$;

INSERT INTO player_registrations (name, email, phone_number, address, cricket_role, base_price) VALUES 
('Virat Kohli', 'virat@example.com', '9999999001', 'Mumbai', 'Batsman', 2000),
('Rohit Sharma', 'rohit@example.com', '9999999002', 'Mumbai', 'Batsman', 1800),
('Rohit Sharma', 'rohit@example.com', '9999999002', 'Mumbai', 'Batsman', 1800)
('MS Dhoni', 'dhoni@example.com', '9999999003', 'Chennai', 'Wicket-keeper', 1500),

-- ========================================
-- Supabase friendly player_registrations table (simple focused table for frontend registration)
-- Fields: name, age, phone (10 digits), building, wing, flat, timestamps
-- NOTE: If you already have a comprehensive `player_registrations` table above, either adapt this
-- block or remove it. This is a minimal table for collecting registration form data.
-- ========================================

-- Enable pgcrypto (for gen_random_uuid) on Supabase if not already
create extension if not exists pgcrypto;

create table if not exists public.player_registrations_supabase (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    age integer check (age >= 5 and age <= 100),
    phone varchar(20) not null check (phone ~ '^[0-9]{10}$'),
    building text,
    wing text,
    flat text,
    created_at timestamptz default now()
);

create index if not exists idx_pr_supabase_phone on public.player_registrations_supabase(phone);

-- Row Level Security: enable and add an example anonymous insert policy
alter table public.player_registrations_supabase enable row level security;

-- Example policy: allow anonymous inserts (only if you intend to use anon key from client)
-- WARNING: this will allow anyone with your anon key to insert rows. Use carefully.
create policy "anon_insert_player_registrations" on public.player_registrations_supabase
    for insert
    using (true)
    with check (true);

-- Safer alternative (authenticated users only): uncomment and use if you require auth
-- create policy "auth_insert_player_registrations" on public.player_registrations_supabase
--   for insert
--   using (auth.role() = 'authenticated')
--   with check (auth.role() = 'authenticated');

-- Example insert
insert into public.player_registrations_supabase (name, age, phone, building, wing, flat)
values ('Test Player', 22, '9876543210', 'Sankalp 1', 'A', '101');

('Jasprit Bumrah', 'bumrah@example.com', '9999999004', 'Mumbai', 'Bowler', 1200),
('Hardik Pandya', 'hardik@example.com', '9999999005', 'Baroda', 'All-rounder', 1000)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- USEFUL FUNCTIONS
-- ========================================

-- Function to get team squad by tournament
CREATE OR REPLACE FUNCTION get_team_squad(tournament_name_param VARCHAR, team_name_param VARCHAR)
RETURNS TABLE (
    player_name VARCHAR,
    phone_number VARCHAR,
    cricket_role VARCHAR,
    player_role VARCHAR,
    jersey_number INTEGER,
    purchase_price INTEGER,
    is_captain BOOLEAN,
    is_vice_captain BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.name,
        pr.phone_number,
        pr.cricket_role,
        ts.player_role,
        ts.jersey_number,
        ts.purchase_price,
        ts.is_captain,
        ts.is_vice_captain
    FROM team_squads ts
    JOIN tournaments t ON ts.tournament_id = t.id
    JOIN teams tm ON ts.team_id = tm.id
    JOIN player_registrations pr ON ts.player_id = pr.id
    WHERE t.name = tournament_name_param 
    AND tm.name = team_name_param 
    AND ts.is_active = true
    ORDER BY ts.is_captain DESC, ts.is_vice_captain DESC, pr.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get tournament schedule
CREATE OR REPLACE FUNCTION get_tournament_schedule(tournament_name_param VARCHAR)
RETURNS TABLE (
    match_number INTEGER,
    match_type VARCHAR,
    team1_name VARCHAR,
    team2_name VARCHAR,
    match_date DATE,
    match_time TIME,
    venue VARCHAR,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.match_number,
        ms.match_type,
        t1.name,
        t2.name,
        ms.match_date,
        ms.match_time,
        ms.venue,
        ms.status
    FROM match_schedule ms
    JOIN tournaments t ON ms.tournament_id = t.id
    JOIN teams t1 ON ms.team1_id = t1.id
    JOIN teams t2 ON ms.team2_id = t2.id
    WHERE t.name = tournament_name_param
    ORDER BY ms.match_date, ms.match_time;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMPLETED: Your workflow is now supported!
-- ========================================

/*
WORKFLOW SUMMARY:
1. Player Registration → player_registrations table (name, address, phone_number)
2. Live Auction → auction_transactions table (tournament name, player sold to team, credit/price)
3. Team Squads → team_squads table linked to get teams and players by tournament name
4. Schedule → match_schedule table (match number, teams, dates, venues)

SAMPLE QUERIES:

-- Get all registered players:
SELECT name, phone_number, address, cricket_role FROM player_registrations;

-- Get auction results for a tournament:
SELECT * FROM auction_results WHERE tournament_name = 'SPL 2025';

-- Get team squad:
SELECT * FROM get_team_squad('SPL 2025', 'Sankalp Legends');

-- Get tournament schedule:
SELECT * FROM get_tournament_schedule('SPL 2025');

-- Get squads by tournament:
SELECT * FROM squad_details WHERE tournament_name = 'SPL 2025';
*/
