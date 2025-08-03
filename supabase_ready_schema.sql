-- Sankalp Premier League Database Schema - Supabase Ready
-- Updated: August 2025
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. PLAYER REGISTRATION TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS player_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE player_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_standings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE RLS POLICIES (Allow public access for now)
-- ========================================

-- Player Registrations Policies
CREATE POLICY "Allow public read access to player_registrations" ON player_registrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert to player_registrations" ON player_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to player_registrations" ON player_registrations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from player_registrations" ON player_registrations FOR DELETE USING (true);

-- Tournaments Policies
CREATE POLICY "Allow public read access to tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public insert to tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from tournaments" ON tournaments FOR DELETE USING (true);

-- Teams Policies
CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert to teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from teams" ON teams FOR DELETE USING (true);

-- Live Auctions Policies
CREATE POLICY "Allow public read access to live_auctions" ON live_auctions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to live_auctions" ON live_auctions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to live_auctions" ON live_auctions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from live_auctions" ON live_auctions FOR DELETE USING (true);

-- Auction Transactions Policies
CREATE POLICY "Allow public read access to auction_transactions" ON auction_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to auction_transactions" ON auction_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to auction_transactions" ON auction_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from auction_transactions" ON auction_transactions FOR DELETE USING (true);

-- Bid History Policies
CREATE POLICY "Allow public read access to bid_history" ON bid_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert to bid_history" ON bid_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to bid_history" ON bid_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from bid_history" ON bid_history FOR DELETE USING (true);

-- Team Squads Policies
CREATE POLICY "Allow public read access to team_squads" ON team_squads FOR SELECT USING (true);
CREATE POLICY "Allow public insert to team_squads" ON team_squads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to team_squads" ON team_squads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from team_squads" ON team_squads FOR DELETE USING (true);

-- Match Schedule Policies
CREATE POLICY "Allow public read access to match_schedule" ON match_schedule FOR SELECT USING (true);
CREATE POLICY "Allow public insert to match_schedule" ON match_schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to match_schedule" ON match_schedule FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from match_schedule" ON match_schedule FOR DELETE USING (true);

-- Match Scores Policies
CREATE POLICY "Allow public read access to match_scores" ON match_scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert to match_scores" ON match_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to match_scores" ON match_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from match_scores" ON match_scores FOR DELETE USING (true);

-- Player Statistics Policies
CREATE POLICY "Allow public read access to player_statistics" ON player_statistics FOR SELECT USING (true);
CREATE POLICY "Allow public insert to player_statistics" ON player_statistics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to player_statistics" ON player_statistics FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from player_statistics" ON player_statistics FOR DELETE USING (true);

-- Tournament Standings Policies
CREATE POLICY "Allow public read access to tournament_standings" ON tournament_standings FOR SELECT USING (true);
CREATE POLICY "Allow public insert to tournament_standings" ON tournament_standings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to tournament_standings" ON tournament_standings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from tournament_standings" ON tournament_standings FOR DELETE USING (true);
