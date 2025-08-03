-- Supabase Views and Sample Data
-- Run this AFTER running the main schema file

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
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Insert Sample Tournament
INSERT INTO tournaments (name, description, start_date, end_date, venue) 
VALUES ('SPL 2025', 'Sankalp Premier League 2025 Season', '2025-09-01', '2025-09-30', 'Mumbai Cricket Ground')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Teams (using the tournament we just created)
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

-- Insert Sample Players
INSERT INTO player_registrations (name, email, phone_number, address, cricket_role, base_price) VALUES 
('Virat Kohli', 'virat@example.com', '9999999001', 'Mumbai, Maharashtra', 'Batsman', 2000),
('Rohit Sharma', 'rohit@example.com', '9999999002', 'Mumbai, Maharashtra', 'Batsman', 1800),
('MS Dhoni', 'dhoni@example.com', '9999999003', 'Chennai, Tamil Nadu', 'Wicket-keeper', 1500),
('Jasprit Bumrah', 'bumrah@example.com', '9999999004', 'Mumbai, Maharashtra', 'Bowler', 1200),
('Hardik Pandya', 'hardik@example.com', '9999999005', 'Baroda, Gujarat', 'All-rounder', 1000),
('Ravindra Jadeja', 'jadeja@example.com', '9999999006', 'Rajkot, Gujarat', 'All-rounder', 900),
('KL Rahul', 'rahul@example.com', '9999999007', 'Bangalore, Karnataka', 'Batsman', 800),
('Rishabh Pant', 'pant@example.com', '9999999008', 'Delhi, India', 'Wicket-keeper', 700),
('Shikhar Dhawan', 'dhawan@example.com', '9999999009', 'Delhi, India', 'Batsman', 600),
('Yuzvendra Chahal', 'chahal@example.com', '9999999010', 'Haryana, India', 'Bowler', 500),
('Mohammed Shami', 'shami@example.com', '9999999011', 'Uttar Pradesh, India', 'Bowler', 450),
('Shreyas Iyer', 'iyer@example.com', '9999999012', 'Mumbai, Maharashtra', 'Batsman', 400),
('Prithvi Shaw', 'shaw@example.com', '9999999013', 'Mumbai, Maharashtra', 'Batsman', 350),
('Ishan Kishan', 'kishan@example.com', '9999999014', 'Jharkhand, India', 'Wicket-keeper', 300),
('Deepak Chahar', 'chahar@example.com', '9999999015', 'Rajasthan, India', 'Bowler', 250),
('Suryakumar Yadav', 'surya@example.com', '9999999016', 'Mumbai, Maharashtra', 'Batsman', 200)
ON CONFLICT (email) DO NOTHING;

-- Create a sample auction
DO $$
DECLARE 
    tournament_uuid UUID;
    auction_uuid UUID;
BEGIN
    SELECT id INTO tournament_uuid FROM tournaments WHERE name = 'SPL 2025' LIMIT 1;
    
    IF tournament_uuid IS NOT NULL THEN
        INSERT INTO live_auctions (tournament_id, auction_name, auction_date, status)
        VALUES (tournament_uuid, 'SPL 2025 Player Auction', '2025-08-15 10:00:00+00', 'completed')
        RETURNING id INTO auction_uuid;
        
        -- Add some sample auction transactions
        INSERT INTO auction_transactions (auction_id, player_id, team_id, base_price, final_price, transaction_type, auction_order)
        SELECT 
            auction_uuid,
            pr.id,
            t.id,
            pr.base_price,
            pr.base_price + (RANDOM() * 1000)::INTEGER,
            'sold',
            ROW_NUMBER() OVER (ORDER BY RANDOM())
        FROM player_registrations pr
        CROSS JOIN (SELECT id FROM teams WHERE tournament_id = tournament_uuid ORDER BY RANDOM() LIMIT 1) t
        WHERE pr.email IN ('virat@example.com', 'rohit@example.com', 'dhoni@example.com', 'bumrah@example.com', 'hardik@example.com')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert sample squads based on auction results
DO $$
DECLARE 
    tournament_uuid UUID;
BEGIN
    SELECT id INTO tournament_uuid FROM tournaments WHERE name = 'SPL 2025' LIMIT 1;
    
    IF tournament_uuid IS NOT NULL THEN
        INSERT INTO team_squads (tournament_id, team_id, player_id, jersey_number, purchase_price, is_captain)
        SELECT 
            tournament_uuid,
            at.team_id,
            at.player_id,
            ROW_NUMBER() OVER (PARTITION BY at.team_id ORDER BY at.final_price DESC),
            at.final_price,
            ROW_NUMBER() OVER (PARTITION BY at.team_id ORDER BY at.final_price DESC) = 1
        FROM auction_transactions at
        JOIN live_auctions la ON at.auction_id = la.id
        WHERE la.tournament_id = tournament_uuid AND at.transaction_type = 'sold'
        ON CONFLICT (tournament_id, team_id, player_id) DO NOTHING;
    END IF;
END $$;

-- Create sample match schedule
DO $$
DECLARE 
    tournament_uuid UUID;
    team_ids UUID[];
    i INTEGER;
    j INTEGER;
    match_num INTEGER := 1;
    match_date DATE := '2025-09-01';
BEGIN
    SELECT id INTO tournament_uuid FROM tournaments WHERE name = 'SPL 2025' LIMIT 1;
    
    IF tournament_uuid IS NOT NULL THEN
        -- Get all team IDs for this tournament
        SELECT ARRAY(SELECT id FROM teams WHERE tournament_id = tournament_uuid ORDER BY name) INTO team_ids;
        
        -- Generate round-robin matches
        FOR i IN 1..array_length(team_ids, 1) LOOP
            FOR j IN (i+1)..array_length(team_ids, 1) LOOP
                INSERT INTO match_schedule (
                    tournament_id, 
                    match_number, 
                    team1_id, 
                    team2_id, 
                    match_date, 
                    match_time, 
                    venue
                ) VALUES (
                    tournament_uuid,
                    match_num,
                    team_ids[i],
                    team_ids[j],
                    match_date,
                    '14:00:00',
                    'Mumbai Cricket Ground'
                )
                ON CONFLICT (tournament_id, match_number) DO NOTHING;
                
                match_num := match_num + 1;
                
                -- Increment date every 2 matches
                IF match_num % 2 = 1 THEN
                    match_date := match_date + INTERVAL '1 day';
                END IF;
            END LOOP;
        END LOOP;
    END IF;
END $$;
