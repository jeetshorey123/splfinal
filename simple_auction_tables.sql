-- ========================================
-- SIMPLE AUCTION TABLES
-- Run this in Supabase SQL Editor
-- These tables are independent and don't rely on foreign keys
-- ========================================

-- Table 1: Simple Auctions
-- Stores basic auction information
CREATE TABLE IF NOT EXISTS simple_auctions (
    id BIGSERIAL PRIMARY KEY,
    tournament_name TEXT NOT NULL,
    auction_date TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'deleted'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Simple Teams
-- Stores team information for each auction
CREATE TABLE IF NOT EXISTS simple_teams (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL, -- Reference to simple_auctions (no FK constraint)
    team_name TEXT NOT NULL,
    total_budget BIGINT DEFAULT 10000000, -- ₹100,000 in paise
    remaining_budget BIGINT DEFAULT 10000000,
    players_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Simple Player Sales
-- Stores all player transactions (sold/unsold)
CREATE TABLE IF NOT EXISTS simple_player_sales (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL, -- Reference to simple_auctions
    player_name TEXT NOT NULL,
    player_phone TEXT, -- Optional: to track which registered player
    team_name TEXT, -- NULL for unsold players
    team_id BIGINT, -- Reference to simple_teams (NULL for unsold)
    sale_price BIGINT, -- NULL for unsold, amount in rupees for sold
    transaction_type TEXT NOT NULL DEFAULT 'sold', -- 'sold' or 'unsold'
    sale_order INTEGER, -- Order in which player was auctioned
    sale_time TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_simple_teams_auction ON simple_teams(auction_id);
CREATE INDEX IF NOT EXISTS idx_simple_sales_auction ON simple_player_sales(auction_id);
CREATE INDEX IF NOT EXISTS idx_simple_sales_team ON simple_player_sales(team_id);
CREATE INDEX IF NOT EXISTS idx_simple_sales_type ON simple_player_sales(transaction_type);

-- Enable Row Level Security (RLS)
ALTER TABLE simple_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_player_sales ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on simple_auctions" ON simple_auctions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on simple_teams" ON simple_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on simple_player_sales" ON simple_player_sales FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Insert a sample auction
-- INSERT INTO simple_auctions (tournament_name, status) 
-- VALUES ('SPL 2025', 'active');

-- Insert sample teams (replace auction_id with actual ID after creating auction)
-- INSERT INTO simple_teams (auction_id, team_name, total_budget, remaining_budget) 
-- VALUES 
--   (1, 'Mumbai Mavericks', 10000000, 10000000),
--   (1, 'Delhi Dynamos', 10000000, 10000000),
--   (1, 'Chennai Champions', 10000000, 10000000),
--   (1, 'Kolkata Knights', 10000000, 10000000);

-- Insert sample player sale
-- INSERT INTO simple_player_sales (auction_id, player_name, player_phone, team_name, team_id, sale_price, transaction_type) 
-- VALUES (1, 'Virat Kumar', '9876543210', 'Mumbai Mavericks', 1, 25000, 'sold');

-- Insert sample unsold player
-- INSERT INTO simple_player_sales (auction_id, player_name, player_phone, team_name, team_id, sale_price, transaction_type) 
-- VALUES (1, 'Rahul Sharma', '9876543211', NULL, NULL, NULL, 'unsold');
