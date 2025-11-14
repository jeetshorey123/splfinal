-- SPL Database Schema
-- Created: August 3, 2025
-- Tables for Player Registration, Auctions, Schedule, and Scorecards

-- ========================================
-- 1. PLAYERS REGISTERED TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS players_registered (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    phone VARCHAR(20) NOT NULL,
    building VARCHAR(100),
    wing VARCHAR(10),
    flat VARCHAR(20),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_registered_name ON players_registered(name);
CREATE INDEX IF NOT EXISTS idx_players_registered_phone ON players_registered(phone);
CREATE INDEX IF NOT EXISTS idx_players_registered_building ON players_registered(building);

-- ========================================
-- 2. AUCTION TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS auction (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auction_name VARCHAR(255) NOT NULL,
    auction_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    team_name VARCHAR(255),
    sold_price INTEGER DEFAULT 0,
    auction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auction_auction_name ON auction(auction_name);
CREATE INDEX IF NOT EXISTS idx_auction_auction_id ON auction(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_player_name ON auction(player_name);
CREATE INDEX IF NOT EXISTS idx_auction_team_name ON auction(team_name);

-- ========================================
-- 3. TOURNAMENT SCHEDULE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS tournament_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_name VARCHAR(255) NOT NULL,
    tournament_id VARCHAR(100),
    match_id VARCHAR(100) NOT NULL UNIQUE, -- Made UNIQUE for foreign key reference
    round_number INTEGER,
    match_number INTEGER,
    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,
    match_date DATE,
    match_time TIME,
    venue VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Live, Completed, Postponed, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_tournament_name ON tournament_schedule(tournament_name);
CREATE INDEX IF NOT EXISTS idx_schedule_tournament_id ON tournament_schedule(tournament_id);
CREATE INDEX IF NOT EXISTS idx_schedule_match_date ON tournament_schedule(match_date);
CREATE INDEX IF NOT EXISTS idx_schedule_status ON tournament_schedule(status);

-- ========================================
-- 4. TOURNAMENTS TABLE (Create before scorecard for proper referencing)
-- ========================================
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    start_date DATE,
    end_date DATE,
    total_teams INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Upcoming', -- Upcoming, Ongoing, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. SCORECARD TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS scorecard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_name VARCHAR(255) NOT NULL,
    tournament_id VARCHAR(100),
    match_id VARCHAR(100) NOT NULL,
    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,
    
    -- Team 1 Score Details
    team1_score INTEGER DEFAULT 0,
    team1_wickets INTEGER DEFAULT 0,
    team1_overs DECIMAL(4,1) DEFAULT 0.0,
    team1_extras INTEGER DEFAULT 0,
    
    -- Team 2 Score Details
    team2_score INTEGER DEFAULT 0,
    team2_wickets INTEGER DEFAULT 0,
    team2_overs DECIMAL(4,1) DEFAULT 0.0,
    team2_extras INTEGER DEFAULT 0,
    
    -- Match Result
    winning_team VARCHAR(255),
    match_result VARCHAR(500), -- Win by X runs/wickets, Draw, etc.
    man_of_match VARCHAR(255),
    
    -- Match Details
    toss_winner VARCHAR(255),
    toss_decision VARCHAR(20), -- Bat/Bowl
    match_status VARCHAR(50) DEFAULT 'Not Started', -- Not Started, In Progress, Completed, Abandoned
    
    -- Additional Details
    match_date DATE,
    venue VARCHAR(255),
    umpire1 VARCHAR(255),
    umpire2 VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key reference to schedule (now properly referenced)
    CONSTRAINT fk_scorecard_schedule 
        FOREIGN KEY (match_id) 
        REFERENCES tournament_schedule(match_id) 
        ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecard_tournament_name ON scorecard(tournament_name);
CREATE INDEX IF NOT EXISTS idx_scorecard_tournament_id ON scorecard(tournament_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_match_id ON scorecard(match_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_winning_team ON scorecard(winning_team);
CREATE INDEX IF NOT EXISTS idx_scorecard_match_status ON scorecard(match_status);

-- ========================================
-- 6. PLAYER BATTING STATS TABLE (Optional - for detailed scorecards)
-- ========================================
CREATE TABLE IF NOT EXISTS batting_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scorecard_id UUID NOT NULL REFERENCES scorecard(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    runs_scored INTEGER DEFAULT 0,
    balls_faced INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    strike_rate DECIMAL(5,2) DEFAULT 0.00,
    dismissal_type VARCHAR(100), -- Bowled, Caught, LBW, Run Out, etc.
    bowler_name VARCHAR(255),
    fielder_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. PLAYER BOWLING STATS TABLE (Optional - for detailed scorecards)
-- ========================================
CREATE TABLE IF NOT EXISTS bowling_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scorecard_id UUID NOT NULL REFERENCES scorecard(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    overs_bowled DECIMAL(4,1) DEFAULT 0.0,
    runs_given INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    maidens INTEGER DEFAULT 0,
    economy_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INSERT SAMPLE DATA (Optional)
-- ========================================

-- Sample Players
INSERT INTO players_registered (name, age, phone, building, wing, flat) VALUES
('Virat Kohli', 35, '9876543210', 'Royal Enclave', 'A', '101'),
('MS Dhoni', 42, '9876543211', 'Captain Heights', 'B', '205'),
('Rohit Sharma', 37, '9876543212', 'Hitman Towers', 'C', '303'),
('Jasprit Bumrah', 30, '9876543213', 'Pace Paradise', 'A', '150'),
('Hardik Pandya', 30, '9876543214', 'All Rounder Arena', 'B', '75')
ON CONFLICT DO NOTHING;

-- Sample Tournament
INSERT INTO tournaments (name, description, total_teams, status) VALUES
('Sankalp Premier League 2025', 'Annual cricket tournament', 8, 'Upcoming')
ON CONFLICT (name) DO NOTHING;

-- Sample Schedule Data with Knockout/Playoff Format
INSERT INTO tournament_schedule (tournament_name, tournament_id, match_id, round_number, match_number, team1, team2, match_date, venue, status) VALUES
-- Initial Matches
('Sankalp Premier League 2025', 'SPL_2025', 'SPL_2025_M001', 1, 1, 'Team 1', 'Team 2', '2025-08-10', 'SPL Stadium', 'Scheduled'),
('Sankalp Premier League 2025', 'SPL_2025', 'SPL_2025_M002', 1, 2, 'Team 3', 'Team 4', '2025-08-11', 'SPL Stadium', 'Scheduled'),
-- Semi-Finals / Playoff Matches
('Sankalp Premier League 2025', 'SPL_2025', 'SPL_2025_M003', 2, 1, 'Loser of Match 1', 'Winner of Match 2', '2025-08-12', 'SPL Stadium', 'Scheduled'),
-- Final Match
('Sankalp Premier League 2025', 'SPL_2025', 'SPL_2025_M004', 3, 1, 'Winner of Match 1', 'Winner of Match 3', '2025-08-13', 'SPL Stadium', 'Scheduled')
ON CONFLICT (match_id) DO NOTHING;

-- Sample Auction Data
INSERT INTO auction (auction_name, auction_id, player_name, team_name, sold_price) VALUES
('SPL 2025 Auction', 'SPL_2025_001', 'Virat Kohli', 'Mumbai Indians', 15000000),
('SPL 2025 Auction', 'SPL_2025_001', 'MS Dhoni', 'Chennai Super Kings', 12000000),
('SPL 2025 Auction', 'SPL_2025_001', 'Rohit Sharma', 'Mumbai Indians', 16000000)
ON CONFLICT DO NOTHING;

-- Sample Scorecard Data
INSERT INTO scorecard (tournament_name, tournament_id, match_id, team1, team2, team1_score, team1_wickets, team1_overs, team2_score, team2_wickets, team2_overs, winning_team, match_result, match_status, match_date, venue) VALUES
('Sankalp Premier League 2025', 'SPL_2025', 'SPL_2025_M001', 'Mumbai Indians', 'Chennai Super Kings', 180, 6, 20.0, 175, 8, 20.0, 'Mumbai Indians', 'Mumbai Indians won by 5 runs', 'Completed', '2025-08-10', 'SPL Stadium')
ON CONFLICT DO NOTHING;

-- ========================================
-- VIEWS FOR EASY DATA ACCESS
-- ========================================

-- View for complete auction results
CREATE OR REPLACE VIEW auction_results AS
SELECT 
    auction_name,
    auction_id,
    player_name,
    team_name,
    sold_price,
    auction_date
FROM auction
ORDER BY auction_date DESC, sold_price DESC;

-- View for tournament standings (based on scorecard)
CREATE OR REPLACE VIEW tournament_standings AS
SELECT 
    tournament_name,
    winning_team AS team_name,
    COUNT(*) AS matches_won
FROM scorecard
WHERE match_status = 'Completed' AND winning_team IS NOT NULL
GROUP BY tournament_name, winning_team
ORDER BY tournament_name, matches_won DESC;

-- View for complete schedule with results
CREATE OR REPLACE VIEW schedule_with_results AS
SELECT 
    ts.tournament_name,
    ts.match_id,
    ts.round_number,
    ts.match_number,
    ts.team1,
    ts.team2,
    ts.match_date,
    ts.match_time,
    ts.venue,
    ts.status,
    sc.team1_score,
    sc.team1_wickets,
    sc.team1_overs,
    sc.team2_score,
    sc.team2_wickets,
    sc.team2_overs,
    sc.winning_team,
    sc.match_result
FROM tournament_schedule ts
LEFT JOIN scorecard sc ON ts.match_id = sc.match_id
ORDER BY ts.tournament_name, ts.match_date, ts.match_time;

-- View for player statistics across tournaments
CREATE OR REPLACE VIEW player_statistics AS
SELECT 
    bs.player_name,
    bs.team_name,
    COUNT(bs.scorecard_id) as matches_played,
    SUM(bs.runs_scored) as total_runs,
    AVG(bs.runs_scored) as avg_runs,
    SUM(bs.fours) as total_fours,
    SUM(bs.sixes) as total_sixes,
    AVG(bs.strike_rate) as avg_strike_rate
FROM batting_stats bs
GROUP BY bs.player_name, bs.team_name
ORDER BY total_runs DESC;

-- ========================================
-- FUNCTIONS FOR DATA VALIDATION
-- ========================================

-- Function to validate phone number
CREATE OR REPLACE FUNCTION validate_phone_number() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.phone !~ '^[0-9]{10}$' THEN
        RAISE EXCEPTION 'Phone number must be exactly 10 digits';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate match_id
CREATE OR REPLACE FUNCTION generate_match_id() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_id IS NULL OR NEW.match_id = '' THEN
        NEW.match_id := NEW.tournament_id || '_M' || LPAD(NEW.round_number::text, 2, '0') || LPAD(NEW.match_number::text, 2, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for phone validation
CREATE TRIGGER validate_player_phone
    BEFORE INSERT OR UPDATE ON players_registered
    FOR EACH ROW
    EXECUTE FUNCTION validate_phone_number();

-- Trigger for auto-generating match_id
CREATE TRIGGER auto_generate_match_id
    BEFORE INSERT OR UPDATE ON tournament_schedule
    FOR EACH ROW
    EXECUTE FUNCTION generate_match_id();

-- ========================================
-- HELPFUL QUERIES FOR TESTING
-- ========================================

-- Check all tables are created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('players_registered', 'auction', 'tournament_schedule', 'scorecard', 'batting_stats', 'bowling_stats', 'tournaments');

-- Check foreign key constraints
-- SELECT conname, conrelid::regclass AS table_name, confrelid::regclass AS referenced_table FROM pg_constraint WHERE contype = 'f';

-- Test data retrieval
-- SELECT * FROM auction_results LIMIT 5;
-- SELECT * FROM tournament_standings;
-- SELECT * FROM schedule_with_results LIMIT 5;

COMMENT ON TABLE players_registered IS 'Stores player registration data from PlayerRegistration.js';
COMMENT ON TABLE auction IS 'Stores auction results from LiveAuction.js';
COMMENT ON TABLE tournament_schedule IS 'Stores tournament schedule from Schedule.js';
COMMENT ON TABLE scorecard IS 'Stores match scorecards for each tournament';
COMMENT ON TABLE batting_stats IS 'Detailed batting statistics for each match';
COMMENT ON TABLE bowling_stats IS 'Detailed bowling statistics for each match';
COMMENT ON TABLE tournaments IS 'Master tournament information';

-- ========================================
-- SECURITY SETUP (Uncomment if using Supabase RLS)
-- ========================================

-- Enable Row Level Security
-- ALTER TABLE players_registered ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE auction ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tournament_schedule ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scorecard ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
-- CREATE POLICY "Public read access" ON players_registered FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON auction FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON tournament_schedule FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON scorecard FOR SELECT USING (true);

-- Create policies for authenticated insert/update
-- CREATE POLICY "Authenticated users can insert" ON players_registered FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can update" ON players_registered FOR UPDATE USING (auth.role() = 'authenticated');
