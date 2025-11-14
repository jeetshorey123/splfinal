# Save Tournament and Schedule to Supabase

## SQL Queries for Saving Tournament & Schedule

### 1. Insert Tournament
```sql
-- Save a new tournament
INSERT INTO tournaments (name, description, start_date, end_date, total_teams, status)
VALUES (
    'Sankalp Premier League 2025',
    'Annual cricket tournament with knockout format',
    '2025-08-10',
    '2025-08-13',
    4,
    'Upcoming'
)
RETURNING id, name, created_at;
```

### 2. Insert Schedule Matches (All 4 Matches)
```sql
-- Match 1: Team 1 vs Team 2
INSERT INTO tournament_schedule (
    tournament_name, 
    tournament_id, 
    match_id, 
    round_number, 
    match_number, 
    team1, 
    team2, 
    match_date, 
    match_time,
    venue, 
    status
) VALUES (
    'Sankalp Premier League 2025',
    'SPL_2025',
    'SPL_2025_M001',
    1,
    1,
    'Team 1',
    'Team 2',
    '2025-08-10',
    '18:00',
    'SPL Stadium',
    'Scheduled'
);

-- Match 2: Team 3 vs Team 4
INSERT INTO tournament_schedule (
    tournament_name, 
    tournament_id, 
    match_id, 
    round_number, 
    match_number, 
    team1, 
    team2, 
    match_date, 
    match_time,
    venue, 
    status
) VALUES (
    'Sankalp Premier League 2025',
    'SPL_2025',
    'SPL_2025_M002',
    1,
    2,
    'Team 3',
    'Team 4',
    '2025-08-11',
    '18:00',
    'SPL Stadium',
    'Scheduled'
);

-- Match 3: Loser of Match 1 vs Winner of Match 2 (Playoff/Eliminator)
INSERT INTO tournament_schedule (
    tournament_name, 
    tournament_id, 
    match_id, 
    round_number, 
    match_number, 
    team1, 
    team2, 
    match_date, 
    match_time,
    venue, 
    status
) VALUES (
    'Sankalp Premier League 2025',
    'SPL_2025',
    'SPL_2025_M003',
    2,
    1,
    'Loser of Match 1',
    'Winner of Match 2',
    '2025-08-12',
    '18:00',
    'SPL Stadium',
    'Scheduled'
);

-- Match 4: Winner of Match 1 vs Winner of Match 3 (Final)
INSERT INTO tournament_schedule (
    tournament_name, 
    tournament_id, 
    match_id, 
    round_number, 
    match_number, 
    team1, 
    team2, 
    match_date, 
    match_time,
    venue, 
    status
) VALUES (
    'Sankalp Premier League 2025',
    'SPL_2025',
    'SPL_2025_M004',
    3,
    1,
    'Winner of Match 1',
    'Winner of Match 3',
    '2025-08-13',
    '18:00',
    'SPL Stadium',
    'Scheduled'
);
```

## JavaScript Code for Schedule.js (Supabase Integration)

### Add this to your Schedule.js component:

```javascript
import { supabase } from '../config/supabase';

// Save tournament to Supabase
const saveTournamentToSupabase = async (tournamentData) => {
  try {
    // 1. Save tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert([{
        name: tournamentData.name,
        description: tournamentData.description || `Tournament with ${tournamentData.teams.length} teams`,
        start_date: new Date().toISOString().split('T')[0],
        total_teams: tournamentData.teams.length,
        status: 'Upcoming'
      }])
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    // 2. Save schedule matches
    const scheduleMatches = tournamentData.schedule.map(match => ({
      tournament_name: tournamentData.name,
      tournament_id: `TOUR_${tournament.id}`,
      match_id: match.id,
      round_number: match.round,
      match_number: match.match,
      team1: match.team1,
      team2: match.team2,
      match_date: match.date || null,
      match_time: match.time || null,
      venue: match.venue || 'TBD',
      status: match.status || 'Scheduled'
    }));

    const { data: schedule, error: scheduleError } = await supabase
      .from('tournament_schedule')
      .insert(scheduleMatches)
      .select();

    if (scheduleError) throw scheduleError;

    // 3. Show success notification
    alert(`✅ Success! Tournament "${tournamentData.name}" saved to database with ${schedule.length} matches!`);
    
    // Optional: Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Tournament Saved!', {
        body: `${tournamentData.name} has been successfully saved to the database.`,
        icon: '/logo192.png'
      });
    }

    return { tournament, schedule };
  } catch (error) {
    console.error('Error saving tournament to Supabase:', error);
    alert(`❌ Error: ${error.message}`);
    throw error;
  }
};

// Update your generateSchedule function to save to Supabase
const generateSchedule = async () => {
  if (!tournamentName.trim()) {
    alert('Please enter tournament name');
    return;
  }
  
  const emptyTeams = teams.filter(team => !team.name.trim());
  if (emptyTeams.length > 0) {
    alert('Please fill in all team names');
    return;
  }

  const schedule = [];
  const teamList = [...teams];
  const rounds = teamList.length % 2 === 0 ? teamList.length - 1 : teamList.length;
  
  if (teamList.length % 2 === 1) {
    teamList.push({ id: 'bye', name: 'BYE' });
  }

  for (let round = 0; round < rounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < teamList.length / 2; i++) {
      const team1 = teamList[i];
      const team2 = teamList[teamList.length - 1 - i];
      
      if (team1.name !== 'BYE' && team2.name !== 'BYE') {
        roundMatches.push({
          id: `${Date.now()}_${round + 1}_${i + 1}`,
          round: round + 1,
          match: i + 1,
          team1: team1.name,
          team2: team2.name,
          date: '',
          time: '',
          venue: '',
          status: 'Scheduled'
        });
      }
    }
    if (roundMatches.length > 0) {
      schedule.push(...roundMatches);
    }
    
    // Rotate teams (keep first team fixed)
    const temp = teamList[1];
    for (let i = 1; i < teamList.length - 1; i++) {
      teamList[i] = teamList[i + 1];
    }
    teamList[teamList.length - 1] = temp;
  }

  // Create tournament object
  const newTournament = {
    id: Date.now(),
    name: tournamentName,
    teams: teams.filter(team => team.name !== 'BYE'),
    schedule: schedule,
    createdAt: new Date().toISOString()
  };

  try {
    // Save to Supabase
    await saveTournamentToSupabase(newTournament);

    // Also save to localStorage as backup
    const updatedTournaments = [...tournaments, newTournament];
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));

    alert(`✅ Schedule generated and saved successfully for ${tournamentName}!`);
    
    // Reset form
    setCurrentStep('auth');
    setIsAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
    setTournamentName('');
    setNumberOfTeams('');
    setTeams([]);
  } catch (error) {
    alert(`Generated schedule locally, but failed to save to database: ${error.message}`);
  }
};
```

## Complete Tournament Save Function with 4 Knockout Matches

```javascript
// Save 4-match knockout tournament to Supabase
const saveKnockoutTournament = async (tournamentName, teams) => {
  try {
    // 1. Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert([{
        name: tournamentName,
        description: 'Knockout tournament format',
        start_date: '2025-08-10',
        end_date: '2025-08-13',
        total_teams: 4,
        status: 'Upcoming'
      }])
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    const tournamentId = `TOUR_${tournament.id}`;

    // 2. Create 4 matches
    const matches = [
      {
        tournament_name: tournamentName,
        tournament_id: tournamentId,
        match_id: `${tournamentId}_M001`,
        round_number: 1,
        match_number: 1,
        team1: teams[0]?.name || 'Team 1',
        team2: teams[1]?.name || 'Team 2',
        match_date: '2025-08-10',
        match_time: '18:00:00',
        venue: 'SPL Stadium',
        status: 'Scheduled'
      },
      {
        tournament_name: tournamentName,
        tournament_id: tournamentId,
        match_id: `${tournamentId}_M002`,
        round_number: 1,
        match_number: 2,
        team1: teams[2]?.name || 'Team 3',
        team2: teams[3]?.name || 'Team 4',
        match_date: '2025-08-11',
        match_time: '18:00:00',
        venue: 'SPL Stadium',
        status: 'Scheduled'
      },
      {
        tournament_name: tournamentName,
        tournament_id: tournamentId,
        match_id: `${tournamentId}_M003`,
        round_number: 2,
        match_number: 1,
        team1: 'Loser of Match 1',
        team2: 'Winner of Match 2',
        match_date: '2025-08-12',
        match_time: '18:00:00',
        venue: 'SPL Stadium',
        status: 'Scheduled'
      },
      {
        tournament_name: tournamentName,
        tournament_id: tournamentId,
        match_id: `${tournamentId}_M004`,
        round_number: 3,
        match_number: 1,
        team1: 'Winner of Match 1',
        team2: 'Winner of Match 3',
        match_date: '2025-08-13',
        match_time: '18:00:00',
        venue: 'SPL Stadium',
        status: 'Scheduled'
      }
    ];

    const { data: schedule, error: scheduleError } = await supabase
      .from('tournament_schedule')
      .insert(matches)
      .select();

    if (scheduleError) throw scheduleError;

    // 3. Success notification
    alert(`🎉 Success!\n\nTournament: ${tournamentName}\nMatches Created: ${schedule.length}\n\n✅ Saved to database!`);

    // Browser notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Tournament Saved! 🏆', {
          body: `${tournamentName} with ${schedule.length} matches has been saved successfully!`,
          icon: '/logo192.png',
          badge: '/logo192.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Tournament Saved! 🏆', {
              body: `${tournamentName} saved successfully!`
            });
          }
        });
      }
    }

    return { tournament, schedule };
  } catch (error) {
    console.error('Error saving tournament:', error);
    alert(`❌ Error saving tournament: ${error.message}`);
    throw error;
  }
};
```

## Load Tournament Schedule from Supabase

```javascript
// Load tournaments from Supabase
const loadTournamentsFromSupabase = async () => {
  try {
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        tournament_schedule (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for your component
    const transformedTournaments = tournaments.map(t => ({
      id: t.id,
      name: t.name,
      teams: [], // You can populate this if you have a teams table
      schedule: t.tournament_schedule || [],
      createdAt: t.created_at
    }));

    setTournaments(transformedTournaments);
    return transformedTournaments;
  } catch (error) {
    console.error('Error loading tournaments:', error);
    alert(`Error loading tournaments: ${error.message}`);
    return [];
  }
};

// Call this in useEffect
useEffect(() => {
  loadTournamentsFromSupabase();
}, []);
```

## Usage Example

```javascript
// When generating a 4-team knockout tournament
const handleGenerateKnockout = async () => {
  if (teams.length !== 4) {
    alert('Knockout format requires exactly 4 teams');
    return;
  }

  await saveKnockoutTournament(tournamentName, teams);
};
```

## Notification Styles

Add this CSS for better notification appearance:

```css
/* Add to your Schedule.css */
.notification-success {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease;
  z-index: 10000;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Tournament Format Explanation

### Match Structure (4-Match Knockout):
1. **Match 1** (Semi-Final 1): Team 1 vs Team 2
2. **Match 2** (Semi-Final 2): Team 3 vs Team 4
3. **Match 3** (Eliminator/3rd Place): Loser of Match 1 vs Winner of Match 2
4. **Match 4** (Final): Winner of Match 1 vs Winner of Match 3

This creates a proper knockout tournament structure!
