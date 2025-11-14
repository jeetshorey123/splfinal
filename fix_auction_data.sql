-- ========================================
-- FIX EXISTING AUCTION DATA
-- Run this in Supabase SQL Editor
-- ========================================

-- Option 1: DELETE ALL OLD DATA AND START FRESH
-- WARNING: This will delete ALL auction data!
-- Uncomment the lines below to use this option:

-- DELETE FROM simple_player_sales;
-- DELETE FROM simple_teams;
-- DELETE FROM simple_auctions;

-- ========================================
-- Option 2: UPDATE EXISTING TEAMS
-- This will update the team names and budgets for the existing auction
-- ========================================

-- First, let's see what auctions exist:
SELECT * FROM simple_auctions;

-- To update team names and budgets for a specific auction (replace auction_id with your actual ID):
-- Replace 'YOUR_AUCTION_ID' with the actual auction ID from the query above

-- Update Team Names and Budgets
UPDATE simple_teams 
SET 
  team_name = CASE 
    WHEN team_name = 'JB' THEN 'Team A'
    WHEN team_name = 'JH' THEN 'Team B'
    WHEN team_name = 'KJK' THEN 'Team C'
    WHEN team_name = 'MJJ' THEN 'Team D'
    ELSE team_name
  END,
  total_budget = 100000,
  remaining_budget = 100000,
  players_count = 0
WHERE auction_id = (SELECT id FROM simple_auctions WHERE status = 'active' LIMIT 1);

-- Also update player sales to reflect new team names
UPDATE simple_player_sales
SET 
  team_name = CASE 
    WHEN team_name = 'JB' THEN 'Team A'
    WHEN team_name = 'JH' THEN 'Team B'
    WHEN team_name = 'KJK' THEN 'Team C'
    WHEN team_name = 'MJJ' THEN 'Team D'
    ELSE team_name
  END
WHERE auction_id = (SELECT id FROM simple_auctions WHERE status = 'active' LIMIT 1);

-- ========================================
-- Option 3: RECOMMENDED - Clean Start
-- Delete old data and create fresh auction from Admin panel
-- ========================================

-- Step 1: Run this to delete all old data
DELETE FROM simple_player_sales;
DELETE FROM simple_teams;
DELETE FROM simple_auctions;

-- Step 2: Go to Admin panel
-- Step 3: Click "Create Auction"
-- Step 4: Enter tournament name (e.g., "aa" or "SPL 2025")
-- Step 5: It will automatically create 4 teams with ₹100,000 each

-- Verify the data after creation:
SELECT 
  a.tournament_name,
  t.team_name,
  t.total_budget,
  t.remaining_budget,
  t.players_count
FROM simple_auctions a
JOIN simple_teams t ON a.id = t.auction_id
WHERE a.status = 'active'
ORDER BY t.team_name;
