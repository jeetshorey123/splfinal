import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './Schedule.css';

const Schedule = () => {
  const [activeTab, setActiveTab] = useState('show');
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [scheduleData, setScheduleData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  
  // Generate Schedule State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [numberOfTeams, setNumberOfTeams] = useState('');
  const [teams, setTeams] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState('auth'); // 'auth', 'teams', 'generate'

  // Admin Authentication for editing
  const [editAuth, setEditAuth] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [pendingEditMatch, setPendingEditMatch] = useState(null); // Store match to edit after auth

  // Load tournaments and schedules from localStorage and Supabase
  useEffect(() => {
    const savedTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    setTournaments(savedTournaments);
    
    // Also load from Supabase
    loadTournamentsFromSupabase();
  }, []);

  // Load tournaments from Supabase
  const loadTournamentsFromSupabase = async () => {
    try {
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_schedule (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (tournamentsData && tournamentsData.length > 0) {
        // Transform data for your component
        const transformedTournaments = tournamentsData.map(t => ({
          id: t.id,
          name: t.name,
          teams: [], // You can populate this if you have a teams table
          schedule: (t.tournament_schedule || []).map(s => ({
            id: s.match_id,
            round: s.round_number,
            match: s.match_number,
            team1: s.team1,
            team2: s.team2,
            date: s.match_date,
            time: s.match_time,
            venue: s.venue,
            status: s.status
          })),
          createdAt: t.created_at
        }));

        // Merge with localStorage tournaments
        const localTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
        const allTournaments = [...transformedTournaments, ...localTournaments.filter(lt => 
          !transformedTournaments.find(t => t.name === lt.name)
        )];
        
        setTournaments(allTournaments);
      }
    } catch (error) {
      console.error('Error loading tournaments from Supabase:', error);
    }
  };

  // Save tournament to Supabase
  const saveTournamentToSupabase = async (tournamentData) => {
    try {
      // 1. Save tournament
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert([{
          name: tournamentData.name,
          description: `Tournament with ${tournamentData.teams.length} teams`,
          start_date: new Date().toISOString().split('T')[0],
          total_teams: tournamentData.teams.length,
          status: 'Upcoming'
        }])
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      const tournamentId = `TOUR_${tournament.id}`;

      // 2. Save schedule matches
      const scheduleMatches = tournamentData.schedule.map((match, index) => ({
        tournament_name: tournamentData.name,
        tournament_id: tournamentId,
        match_id: `${tournamentId}_M${String(index + 1).padStart(3, '0')}`,
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
      alert(`✅ Success!\n\nTournament: ${tournamentData.name}\nMatches: ${schedule.length}\n\n✅ Saved to database!`);
      
      // Browser notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Tournament Saved! 🏆', {
            body: `${tournamentData.name} with ${schedule.length} matches has been saved successfully!`,
            icon: '/logo192.png'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Tournament Saved! 🏆', {
                body: `${tournamentData.name} saved successfully!`
              });
            }
          });
        }
      }

      return { tournament, schedule };
    } catch (error) {
      console.error('Error saving tournament to Supabase:', error);
      alert(`⚠️ Saved locally but failed to save to database: ${error.message}`);
      throw error;
    }
  };

  // Authentication
  const handleAuth = () => {
    if (adminUsername === 'jeet' && adminPassword === 'jeet') {
      setIsAuthenticated(true);
      setCurrentStep('teams');
    } else {
      alert('Invalid credentials!');
    }
  };

  // Edit Authentication
  const handleEditAuth = () => {
    if (editUsername === 'jeet' && editPassword === 'jeet') {
      setEditAuth(true);
      setEditMode(true);
      
      // If there's a pending match to edit, open it for editing
      if (pendingEditMatch) {
        setEditingMatch({...pendingEditMatch});
        setPendingEditMatch(null);
      }
    } else {
      alert('Invalid credentials!');
      setEditUsername('');
      setEditPassword('');
    }
  };

  // Handle quick edit button click
  const handleQuickEdit = (match) => {
    if (!editAuth) {
      // Store the match to edit after authentication
      setPendingEditMatch(match);
      setEditAuth(true);
    } else if (!editMode) {
      // Already authenticated but not in edit mode, store match and trigger auth
      setPendingEditMatch(match);
      handleEditAuth();
    } else {
      // Already in edit mode, directly edit the match
      handleEditMatch(match);
    }
  };

  // Handle number of teams input
  const handleTeamsCount = () => {
    const count = parseInt(numberOfTeams);
    if (count < 2 || count > 16) {
      alert('Please enter a number between 2 and 16');
      return;
    }
    const teamArray = Array.from({ length: count }, (_, i) => ({ id: i + 1, name: '' }));
    setTeams(teamArray);
    setCurrentStep('generate');
  };

  // Update team name
  const updateTeamName = (id, name) => {
    setTeams(teams.map(team => team.id === id ? { ...team, name } : team));
  };

  // Generate round-robin schedule
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
            id: `${round + 1}-${i + 1}`,
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

    // Save tournament and schedule
    const newTournament = {
      id: Date.now(),
      name: tournamentName,
      teams: teams.filter(team => team.name !== 'BYE'),
      schedule: schedule,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Supabase first
      await saveTournamentToSupabase(newTournament);

      // Also save to localStorage as backup
      const updatedTournaments = [...tournaments, newTournament];
      setTournaments(updatedTournaments);
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));

      // Reload from Supabase to get the latest data
      await loadTournamentsFromSupabase();
    } catch (error) {
      // If Supabase fails, still save locally
      const updatedTournaments = [...tournaments, newTournament];
      setTournaments(updatedTournaments);
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      
      alert(`Schedule generated and saved locally for ${tournamentName}!\n(Database sync failed, but data is safe in browser storage)`);
    }
    
    // Reset form
    setCurrentStep('auth');
    setIsAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
    setTournamentName('');
    setNumberOfTeams('');
    setTeams([]);
  };

  // Load schedule for selected tournament
  const loadSchedule = () => {
    if (!selectedTournament) {
      setScheduleData([]);
      return;
    }
    
    const tournament = tournaments.find(t => t.id === parseInt(selectedTournament));
    if (tournament) {
      setScheduleData(tournament.schedule);
    }
  };

  // Edit match details
  const handleEditMatch = (match) => {
    setEditingMatch({...match});
  };

  // Save edited match
  const saveEditedMatch = () => {
    if (!editingMatch) return;

    const updatedSchedule = scheduleData.map(match => 
      match.id === editingMatch.id ? editingMatch : match
    );
    
    const updatedTournaments = tournaments.map(tournament => 
      tournament.id === parseInt(selectedTournament) 
        ? { ...tournament, schedule: updatedSchedule }
        : tournament
    );

    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    setScheduleData(updatedSchedule);
    setEditingMatch(null);
    alert('Match updated successfully!');
  };

  // Delete match
  const deleteMatch = (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      const updatedSchedule = scheduleData.filter(match => match.id !== matchId);
      
      const updatedTournaments = tournaments.map(tournament => 
        tournament.id === parseInt(selectedTournament) 
          ? { ...tournament, schedule: updatedSchedule }
          : tournament
      );

      setTournaments(updatedTournaments);
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      setScheduleData(updatedSchedule);
      alert('Match deleted successfully!');
    }
  };

  // Add new match
  const addNewMatch = () => {
    const tournament = tournaments.find(t => t.id === parseInt(selectedTournament));
    if (!tournament) return;

    const newMatch = {
      id: `custom-${Date.now()}`,
      round: Math.max(...scheduleData.map(m => m.round), 0) + 1,
      match: 1,
      team1: tournament.teams[0]?.name || '',
      team2: tournament.teams[1]?.name || '',
      date: '',
      time: '',
      venue: '',
      status: 'Scheduled'
    };

    setEditingMatch(newMatch);
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedTournament, tournaments]);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1>Tournament Schedule</h1>
        <div className="schedule-tabs">
          <button 
            className={activeTab === 'show' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('show');
              setEditMode(false);
              setEditAuth(false);
              setPendingEditMatch(null);
            }}
          >
            Show Schedule
          </button>
          <button 
            className={activeTab === 'generate' ? 'tab-button active' : 'tab-button'}
            onClick={() => {
              setActiveTab('generate');
              setEditMode(false);
              setEditAuth(false);
              setPendingEditMatch(null);
            }}
          >
            Generate Schedule
          </button>
        </div>
      </div>

      {activeTab === 'show' && (
        <div className="show-schedule-section">
          <div className="tournament-selector">
            <label htmlFor="tournament-select">Select Tournament:</label>
            <select 
              id="tournament-select"
              value={selectedTournament} 
              onChange={(e) => {
                setSelectedTournament(e.target.value);
                setEditMode(false);
                setEditAuth(false);
                setPendingEditMatch(null);
              }}
              className="tournament-dropdown"
            >
              <option value="">Choose a tournament...</option>
              {tournaments.map(tournament => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTournament && scheduleData.length > 0 && (
            <div className="schedule-actions">
              <div className="view-actions">
                <button 
                  onClick={() => window.print()} 
                  className="print-btn"
                  title="Print Schedule"
                >
                  🖨️ Print
                </button>
                {!editAuth && (
                  <button 
                    onClick={() => setEditAuth(true)} 
                    className="edit-schedule-btn"
                    title="Edit Schedule (Admin Only)"
                  >
                    ✏️ Edit Schedule
                  </button>
                )}
              </div>
              
              {editAuth && (
                <div className="admin-controls">
                  {!editMode ? (
                    <div className="edit-auth-section">
                      <h3>🔐 Admin Authentication Required</h3>
                      <div className="auth-form-inline">
                        <input
                          type="text"
                          placeholder="Username"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="auth-input"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="auth-input"
                        />
                        <button onClick={handleEditAuth} className="auth-btn">
                          🔓 Authenticate & Edit
                        </button>
                        <button 
                          onClick={() => {
                            setEditAuth(false);
                            setEditUsername('');
                            setEditPassword('');
                            setPendingEditMatch(null);
                          }} 
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="edit-controls">
                      <div className="edit-status">
                        <span className="edit-indicator">🔧 Edit Mode Active</span>
                      </div>
                      <div className="edit-buttons">
                        <button onClick={addNewMatch} className="add-match-btn">
                          ➕ Add New Match
                        </button>
                        <button 
                          onClick={() => {
                            setEditMode(false);
                            setEditAuth(false);
                            setEditUsername('');
                            setEditPassword('');
                            setPendingEditMatch(null);
                          }}
                          className="exit-edit-btn"
                        >
                          ❌ Exit Edit Mode
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {scheduleData.length > 0 && (
            <div className="schedule-display">
              <h3>Schedule for {tournaments.find(t => t.id === parseInt(selectedTournament))?.name}</h3>
              <div className="schedule-table-container">
                <div className="schedule-table">
                  <div className="table-header">
                    <div>Round</div>
                    <div>Match</div>
                    <div>Team 1</div>
                    <div>vs</div>
                    <div>Team 2</div>
                    <div>Date</div>
                    <div>Time</div>
                    <div>Venue</div>
                    <div>Status</div>
                    <div>Edit</div>
                    {editMode && <div>Actions</div>}
                  </div>
                  {scheduleData.map(match => (
                    <div key={match.id} className="table-row">
                      <div>{match.round}</div>
                      <div>{match.match}</div>
                      <div className="team-name">{match.team1}</div>
                      <div className="vs">VS</div>
                      <div className="team-name">{match.team2}</div>
                      <div>{match.date || 'TBD'}</div>
                      <div>{match.time || 'TBD'}</div>
                      <div>{match.venue || 'TBD'}</div>
                      <div className={`status ${match.status.toLowerCase()}`}>{match.status}</div>
                      <div className="edit-column">
                        <button 
                          onClick={() => handleQuickEdit(match)}
                          className="quick-edit-btn"
                          title={!editAuth ? "Click to authenticate and edit" : !editMode ? "Click to enter edit mode" : "Edit this match"}
                        >
                          ✏️
                        </button>
                      </div>
                      {editMode && (
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEditMatch(match)}
                            className="edit-btn"
                            title="Edit Match"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => deleteMatch(match.id)}
                            className="delete-btn"
                            title="Delete Match"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTournament && scheduleData.length === 0 && (
            <div className="no-schedule">
              <p>No schedule found for the selected tournament.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="generate-schedule-section">
          {currentStep === 'auth' && (
            <div className="auth-form">
              <h3>Admin Authentication</h3>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <button onClick={handleAuth} className="auth-button">
                Authenticate
              </button>
            </div>
          )}

          {currentStep === 'teams' && (
            <div className="teams-form">
              <h3>Tournament Details</h3>
              <div className="form-group">
                <label>Tournament Name:</label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Enter tournament name"
                />
              </div>
              <div className="form-group">
                <label>Number of Teams (2-16):</label>
                <input
                  type="number"
                  min="2"
                  max="16"
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(e.target.value)}
                  placeholder="Enter number of teams"
                />
              </div>
              <button onClick={handleTeamsCount} className="next-button">
                Next
              </button>
            </div>
          )}

          {currentStep === 'generate' && (
            <div className="team-names-form">
              <h3>Enter Team Names for {tournamentName}</h3>
              <div className="teams-grid">
                {teams.map(team => (
                  <div key={team.id} className="team-input">
                    <label>Team {team.id}:</label>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeamName(team.id, e.target.value)}
                      placeholder={`Enter team ${team.id} name`}
                    />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button onClick={() => setCurrentStep('teams')} className="back-button">
                  Back
                </button>
                <button onClick={generateSchedule} className="generate-button">
                  Generate Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Edit Match Modal */}
      {editingMatch && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingMatch.id.startsWith('custom') ? 'Add New Match' : 'Edit Match'}</h3>
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Round:</label>
                  <input
                    type="number"
                    value={editingMatch.round}
                    onChange={(e) => setEditingMatch({...editingMatch, round: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Match:</label>
                  <input
                    type="number"
                    value={editingMatch.match}
                    onChange={(e) => setEditingMatch({...editingMatch, match: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Team 1:</label>
                  <select
                    value={editingMatch.team1}
                    onChange={(e) => setEditingMatch({...editingMatch, team1: e.target.value})}
                  >
                    {tournaments.find(t => t.id === parseInt(selectedTournament))?.teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Team 2:</label>
                  <select
                    value={editingMatch.team2}
                    onChange={(e) => setEditingMatch({...editingMatch, team2: e.target.value})}
                  >
                    {tournaments.find(t => t.id === parseInt(selectedTournament))?.teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={editingMatch.date}
                    onChange={(e) => setEditingMatch({...editingMatch, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={editingMatch.time}
                    onChange={(e) => setEditingMatch({...editingMatch, time: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Venue:</label>
                  <input
                    type="text"
                    value={editingMatch.venue}
                    onChange={(e) => setEditingMatch({...editingMatch, venue: e.target.value})}
                    placeholder="Enter venue"
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={editingMatch.status}
                    onChange={(e) => setEditingMatch({...editingMatch, status: e.target.value})}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={() => setEditingMatch(null)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={saveEditedMatch} className="save-btn">
                  {editingMatch.id.startsWith('custom') ? 'Add Match' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
