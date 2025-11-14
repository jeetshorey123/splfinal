# Simple Auction System - Migration Guide

## Problem
Your current auction system uses complex foreign key relationships that cause errors when player IDs don't exist in the referenced tables.

## Solution
Create **3 new simple tables** that store auction data independently without foreign key constraints.

---

## STEP 1: Create New Tables in Supabase

Go to your Supabase SQL Editor and run the SQL from `simple_auction_tables.sql`:

### Table 1: `simple_auctions`
Stores basic auction/tournament information.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Auto-incrementing ID |
| tournament_name | TEXT | Name of tournament/auction |
| auction_date | TIMESTAMP | When auction was created |
| status | TEXT | 'active', 'completed', 'deleted' |

### Table 2: `simple_teams`
Stores team information for each auction.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Auto-incrementing ID |
| auction_id | BIGINT | Links to simple_auctions (no FK) |
| team_name | TEXT | Name of team |
| total_budget | BIGINT | Starting budget (₹100,000) |
| remaining_budget | BIGINT | Current budget left |
| players_count | INTEGER | Number of players bought |

### Table 3: `simple_player_sales`
Stores all player transactions (sold/unsold).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Auto-incrementing ID |
| auction_id | BIGINT | Links to simple_auctions |
| player_name | TEXT | Player's full name |
| player_phone | TEXT | Player's phone (optional) |
| team_name | TEXT | Team name (NULL if unsold) |
| team_id | BIGINT | Team ID (NULL if unsold) |
| sale_price | BIGINT | Amount sold for (NULL if unsold) |
| transaction_type | TEXT | 'sold' or 'unsold' |
| sale_order | INTEGER | Order of auction |
| sale_time | TIMESTAMP | When transaction happened |

---

## STEP 2: How the System Works

### Creating a New Auction

**Current:** Select tournament from dropdown
**New:** Enter tournament name directly

```javascript
// When you enter tournament name and click "Create Auction"
// 1. Create auction record
INSERT INTO simple_auctions (tournament_name, status) 
VALUES ('SPL 2025', 'active');

// 2. Create teams for this auction
INSERT INTO simple_teams (auction_id, team_name, total_budget, remaining_budget) 
VALUES 
  (1, 'Mumbai Mavericks', 10000000, 10000000),
  (1, 'Delhi Dynamos', 10000000, 10000000),
  (1, 'Chennai Champions', 10000000, 10000000);
```

### Selling a Player (Manual Entry)

**When you click SOLD button:**

```javascript
// 1. Insert sale record
INSERT INTO simple_player_sales (
  auction_id, 
  player_name, 
  player_phone, 
  team_name, 
  team_id, 
  sale_price, 
  transaction_type
) VALUES (
  1,                    -- Current auction ID
  'Virat Kumar',        -- From dropdown
  '9876543210',         -- From player data
  'Mumbai Mavericks',   -- Selected team
  5,                    -- Selected team ID
  25000,                -- Amount entered
  'sold'
);

// 2. Update team budget
UPDATE simple_teams 
SET remaining_budget = remaining_budget - 25000,
    players_count = players_count + 1
WHERE id = 5 AND auction_id = 1;
```

### Marking Player Unsold

**When you click UNSOLD button:**

```javascript
INSERT INTO simple_player_sales (
  auction_id, 
  player_name, 
  player_phone, 
  transaction_type
) VALUES (
  1,
  'Rahul Sharma',
  '9876543211',
  'unsold'
);
// team_name, team_id, sale_price are NULL
```

### Deleting a Sale (Undo)

```javascript
// Delete the record
DELETE FROM simple_player_sales WHERE id = 123;

// Restore team budget
UPDATE simple_teams 
SET remaining_budget = remaining_budget + 25000,
    players_count = players_count - 1
WHERE id = 5;
```

---

## STEP 3: Benefits of New System

✅ **No Foreign Key Errors**: Player doesn't need to exist in another table  
✅ **Simple Data Entry**: Just player name + amount + team  
✅ **Keep Old Data**: Old tables remain untouched  
✅ **Easy Queries**: All auction data in one place  
✅ **Independent Records**: Can delete/edit without cascade issues  

---

## STEP 4: What Changes in UI

### Auction Tab
- Remove "Select Tournament" dropdown
- Add "Tournament Name" text input
- When creating auction, also create teams with ₹100,000 budget

### Manual Entry
- Player dropdown: Shows name + phone from `player_registrations_supabase`
- Amount input: Sale price
- Team dropdown: Shows teams from `simple_teams` for current auction
- SOLD button: Saves to `simple_player_sales` with team info
- UNSOLD button: Saves to `simple_player_sales` without team info

### Sold Players List
Shows records from `simple_player_sales` where:
- `auction_id` = current auction
- `transaction_type` = 'sold'
- Displays: player_name, team_name, sale_price
- Delete button restores budget

---

## STEP 5: Sample Data Flow

### Example: Selling a Player

**Input:**
- Tournament Name: "SPL 2025" (auction_id: 1)
- Player: "Virat Kumar" (from dropdown)
- Team: "Mumbai Mavericks" (team_id: 5)
- Amount: ₹25,000

**Database Records:**

```sql
-- simple_player_sales table
id | auction_id | player_name  | player_phone | team_name          | team_id | sale_price | transaction_type
1  | 1          | Virat Kumar  | 9876543210   | Mumbai Mavericks   | 5       | 25000      | sold

-- simple_teams table (after update)
id | auction_id | team_name          | total_budget | remaining_budget | players_count
5  | 1          | Mumbai Mavericks   | 10000000     | 9975000          | 1
```

---

## STEP 6: Query Examples

### Get all sold players for current auction
```sql
SELECT * FROM simple_player_sales 
WHERE auction_id = 1 
AND transaction_type = 'sold'
ORDER BY sale_time DESC;
```

### Get team budget status
```sql
SELECT team_name, remaining_budget, players_count 
FROM simple_teams 
WHERE auction_id = 1;
```

### Get auction summary
```sql
SELECT 
  t.team_name,
  t.remaining_budget,
  COUNT(s.id) as players_bought,
  SUM(s.sale_price) as total_spent
FROM simple_teams t
LEFT JOIN simple_player_sales s ON s.team_id = t.id AND s.transaction_type = 'sold'
WHERE t.auction_id = 1
GROUP BY t.id, t.team_name, t.remaining_budget;
```

---

## STEP 7: Migration Checklist

1. ✅ Run SQL to create 3 new tables
2. ⏳ Update auction creation to use `simple_auctions` and `simple_teams`
3. ⏳ Update manual entry SOLD to use `simple_player_sales`
4. ⏳ Update manual entry UNSOLD to use `simple_player_sales`
5. ⏳ Update delete/undo to work with new tables
6. ⏳ Update sold players list to query `simple_player_sales`
7. ⏳ Test complete auction flow

---

## Questions?

**Q: What happens to my old data?**  
A: Nothing! Old tables (`tournaments`, `teams`, `auction_transactions`, etc.) remain untouched.

**Q: Do I need to migrate old data?**  
A: No, you can keep using old tables for historical data. New auctions use new tables.

**Q: Can I use player registration table?**  
A: Yes! The dropdown still shows players from `player_registrations_supabase`, but we only store the name/phone in sales record.

**Q: What if same player name exists twice?**  
A: Use `player_phone` to distinguish them in the dropdown.

---

**Ready to implement? Let me know and I'll update the Admin.js code!**
