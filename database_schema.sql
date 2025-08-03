-- Sankalp Premier League Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    budget INTEGER DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_price INTEGER DEFAULT 100,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, sold, unsold
    sold_price INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
    total_overs INTEGER DEFAULT 20,
    teams JSONB, -- Array of team names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,
    team1_score JSONB, -- {runs: 0, wickets: 0, overs: 0}
    team2_score JSONB, -- {runs: 0, wickets: 0, overs: 0}
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed
    winner VARCHAR(255),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
    teams JSONB, -- Array of team objects with budget
    players JSONB, -- Array of player objects
    sold_players JSONB, -- Array of sold player objects
    unsold_players JSONB, -- Array of unsold player objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction history table
CREATE TABLE IF NOT EXISTS auction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    sold_to VARCHAR(255),
    price INTEGER,
    action VARCHAR(50) NOT NULL, -- sold, unsold, bid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_auction_history_auction_id ON auction_history(auction_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (you can modify these based on your security needs)
CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to auctions" ON auctions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to auction_history" ON auction_history FOR SELECT USING (true);

-- Create policies for insert/update/delete (you can modify these based on your security needs)
CREATE POLICY "Allow public insert to teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow public insert to players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from players" ON players FOR DELETE USING (true);

CREATE POLICY "Allow public insert to tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from tournaments" ON tournaments FOR DELETE USING (true);

CREATE POLICY "Allow public insert to matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from matches" ON matches FOR DELETE USING (true);

CREATE POLICY "Allow public insert to auctions" ON auctions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to auctions" ON auctions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from auctions" ON auctions FOR DELETE USING (true);

CREATE POLICY "Allow public insert to auction_history" ON auction_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to auction_history" ON auction_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete from auction_history" ON auction_history FOR DELETE USING (true);

-- Insert sample data (optional)
INSERT INTO teams (name, budget) VALUES 
('Mumbai Indians', 10000),
('Chennai Super Kings', 10000),
('Royal Challengers Bangalore', 10000),
('Kolkata Knight Riders', 10000)
ON CONFLICT (name) DO NOTHING;

INSERT INTO players (name, base_price) VALUES 
('Virat Kohli', 2000),
('Rohit Sharma', 1800),
('MS Dhoni', 1500),
('KL Rahul', 1200),
('Jasprit Bumrah', 1000),
('Ravindra Jadeja', 800),
('Hardik Pandya', 900),
('Rishabh Pant', 700)
ON CONFLICT DO NOTHING; 