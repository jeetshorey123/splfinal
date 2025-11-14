# 🎯 Live Auction Setup Guide - COMPLETE

## ✅ Project Status: RUNNING
- **Server**: http://localhost:3000
- **Network**: http://192.168.29.63:3000
- **Status**: Compiled successfully with minor warnings (safe to ignore)

---

## 🚀 How to Use the System

### **Step 1: Create an Auction with Custom Budget**

1. **Go to Admin Panel**: http://localhost:3000/admin
2. **Login**:
   - Username: `jeet`
   - Password: `jeet`

3. **Create New Auction**:
   - **Tournament**: Select from dropdown (or leave empty)
   - **Auction Name**: Enter tournament name (e.g., "SPL 2025")
   - **Budget Per Team (₹)**: Enter the amount each team should get
     - Example: `100000` for ₹1,00,000
     - Example: `200000` for ₹2,00,000
     - Example: `500000` for ₹5,00,000
   
4. **Click "Start Auction"**
   - ✅ Creates auction in `simple_auctions` table
   - ✅ Creates 4 teams automatically:
     - Team A with your specified budget
     - Team B with your specified budget
     - Team C with your specified budget
     - Team D with your specified budget
   - ✅ All teams get the SAME budget (as you requested)

### **Step 2: View Live Auction Feed**

1. **Go to Live Auction View**: http://localhost:3000/live-auction-public
   - Or click **"Auction"** in the navbar

2. **Select Tournament**:
   - Choose from the dropdown menu
   - Shows all active auctions

3. **Watch Live Updates**:
   - Team purses with remaining budgets
   - Sold players feed (real-time)
   - Unsold players list

### **Step 3: Conduct the Auction (Admin)**

1. **In Admin Panel**, scroll down to auction controls
2. **Sell a Player**:
   - Select player from registered players
   - Select team
   - Enter sale price
   - Click "Mark as SOLD"
   
3. **Live Auction View Updates Automatically**:
   - ✅ Team's remaining budget decreases
   - ✅ Player appears in "Players Sold" table
   - ✅ Players count increases
   - ✅ Last 3 sales are highlighted in green

4. **Mark Player as Unsold**:
   - Select player
   - Click "Mark as UNSOLD"
   - ✅ Appears in unsold section on live view

---

## 📊 Budget Configuration

### **How Budget Works:**

1. **Creating Auction**:
   ```
   Budget Per Team: 100000
   
   Creates:
   - Team A: ₹100,000 (total_budget: 100000, remaining_budget: 100000)
   - Team B: ₹100,000 (total_budget: 100000, remaining_budget: 100000)
   - Team C: ₹100,000 (total_budget: 100000, remaining_budget: 100000)
   - Team D: ₹100,000 (total_budget: 100000, remaining_budget: 100000)
   ```

2. **During Auction**:
   - When you sell a player for ₹5,000 to Team A:
     - Team A remaining_budget: ₹100,000 → ₹95,000
     - Team A players_count: 0 → 1
   
3. **Live View Shows**:
   - Remaining Budget: ₹95,000
   - Players: 1
   - Spent: ₹5,000

### **All Teams Get Same Budget**:
✅ As requested, all 4 teams always get the exact same budget
- You enter it once when creating the auction
- All teams start with that amount
- Each team's budget decreases independently when they buy players

---

## 🔄 Real-Time Updates (Supabase Connection)

### **Connected Tables:**
1. **simple_auctions** - Stores auction info
2. **simple_teams** - Stores team budgets and player counts
3. **simple_player_sales** - Stores all sold/unsold transactions

### **Live Subscriptions Active:**
```javascript
// Teams budget updates
supabase.channel('simple_teams_changes')
  → Triggers when: Admin sells player, budgets change
  → Updates: Team cards with new remaining budget

// Player sales updates
supabase.channel('simple_sales_changes')
  → Triggers when: Admin sells/unsolds player
  → Updates: Sold players table, unsold players list
```

### **What Happens When Admin Sells a Player:**
1. Admin clicks "Mark as SOLD" → Database updated
2. Supabase sends real-time event to all connected clients
3. Live Auction View receives event
4. Component re-fetches data from Supabase
5. UI updates automatically with new:
   - Team remaining budget
   - New player in sold list
   - Updated player count
   - Highlighted as recent sale (green)

---

## 🎨 Live Auction View Features

### **Team Purses Section**:
- Shows all 4 teams in a grid
- For each team displays:
  - Team name
  - Remaining budget (₹)
  - Number of players bought
  - Amount spent

### **Players Sold Section**:
- Table format showing:
  - Player number
  - Player name and phone
  - Team that bought them
  - Sale price
  - Time of sale
- **Last 3 sales highlighted in green** with animation
- Most recent sales appear first

### **Unsold Players Section**:
- Grid of unsold players
- Shows player name and phone
- Only visible if there are unsold players

---

## 📱 Testing Real-Time Updates

### **Test Scenario:**

1. **Open TWO browser windows side by side**:
   - Window 1: Admin Panel (http://localhost:3000/admin)
   - Window 2: Live Auction (http://localhost:3000/live-auction-public)

2. **In Admin Panel (Window 1)**:
   - Create auction with ₹100,000 per team
   - Select the auction

3. **In Live Auction (Window 2)**:
   - Select the same auction from dropdown
   - See all teams with ₹100,000 budget

4. **Sell a Player (Window 1)**:
   - Select a player
   - Select Team A
   - Enter price: 5000
   - Click "Mark as SOLD"

5. **Watch Window 2 Update Automatically**:
   - ✅ Team A budget: ₹100,000 → ₹95,000
   - ✅ Player appears in sold list (highlighted green)
   - ✅ Team A players count: 0 → 1
   - ✅ Team A spent: ₹0 → ₹5,000

---

## 🎯 Example Budget Configurations

### **Small Tournament:**
```
Budget Per Team: 50000
Result: Each team gets ₹50,000
```

### **Medium Tournament:**
```
Budget Per Team: 100000
Result: Each team gets ₹1,00,000
```

### **Large Tournament:**
```
Budget Per Team: 500000
Result: Each team gets ₹5,00,000
```

### **Custom Tournament:**
```
Budget Per Team: 250000
Result: Each team gets ₹2,50,000
```

**Note:** The budget field accepts any positive number. Enter the amount in rupees (not paise).

---

## 🔧 Database Schema

### **simple_auctions Table:**
```sql
id               BIGSERIAL PRIMARY KEY
tournament_name  TEXT NOT NULL
status           TEXT DEFAULT 'active'
auction_date     TIMESTAMP DEFAULT NOW()
created_at       TIMESTAMP DEFAULT NOW()
```

### **simple_teams Table:**
```sql
id               BIGSERIAL PRIMARY KEY
auction_id       BIGINT NOT NULL
team_name        TEXT NOT NULL
total_budget     BIGINT (stores budget in rupees)
remaining_budget BIGINT (decreases when players bought)
players_count    INTEGER (increases when players bought)
created_at       TIMESTAMP DEFAULT NOW()
```

### **simple_player_sales Table:**
```sql
id               BIGSERIAL PRIMARY KEY
auction_id       BIGINT NOT NULL
player_name      TEXT NOT NULL
player_phone     TEXT
team_name        TEXT (NULL for unsold)
team_id          BIGINT (NULL for unsold)
sale_price       BIGINT (NULL for unsold)
transaction_type TEXT ('sold' or 'unsold')
sale_order       INTEGER
sale_time        TIMESTAMP DEFAULT NOW()
created_at       TIMESTAMP DEFAULT NOW()
```

---

## 🎬 Complete Workflow

### **Before Auction:**
1. Register players in "Player Registration" page
2. Create auction with custom budget per team
3. Share live auction link with audience

### **During Auction:**
1. Admin opens `/admin` panel
2. Audience opens `/live-auction-public` (or clicks "Auction" in navbar)
3. Audience selects tournament from dropdown
4. Admin starts selling players:
   - Select player
   - Select team
   - Enter price
   - Mark as SOLD
5. **Audience sees updates in real-time** without refreshing!

### **After Auction:**
1. All data stored in Supabase
2. Can view sold players list
3. Can see final team budgets
4. Can generate reports

---

## 🚨 Important Notes

1. **Budget is Same for All Teams**: 
   - ✅ All 4 teams get the exact budget you enter
   - ✅ Each team's budget decreases independently during auction

2. **Real-Time Updates**:
   - ✅ Works automatically via Supabase subscriptions
   - ✅ No page refresh needed
   - ✅ Multiple viewers can watch simultaneously

3. **Budget Validation**:
   - ✅ Admin can't sell player for more than team's remaining budget
   - ✅ Alert shown if budget insufficient

4. **Team Names are Fixed**:
   - Always: Team A, Team B, Team C, Team D
   - Created automatically when auction starts

---

## 📞 URLs

- **Admin Panel**: http://localhost:3000/admin
- **Live Auction**: http://localhost:3000/live-auction-public
- **Player Registration**: http://localhost:3000/register
- **Home**: http://localhost:3000

---

## ✅ Summary of Changes

1. ✅ Added `team_budget` field to auction creation form
2. ✅ Budget input shows in admin panel (3-column grid)
3. ✅ All 4 teams get the SAME budget (as requested)
4. ✅ Budget is used when creating teams in Supabase
5. ✅ Live auction view fetches and displays budgets from Supabase
6. ✅ Real-time updates work via Supabase subscriptions
7. ✅ Teams show remaining budget, spent amount, and player count
8. ✅ Project running on http://localhost:3000

**Everything is connected to Supabase and working in real-time!** 🎉
