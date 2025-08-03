import React, { useState, useEffect } from 'react';
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

  // Load tournaments and schedules from localStorage
  useEffect(() => {
    const savedTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    setTournaments(savedTournaments);
  }, []);

  // Authentication
  const handleAuth = () => {
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      setIsAuthenticated(true);
      setCurrentStep('teams');
    } else {
      alert('Invalid credentials! Username: admin, Password: admin123');
    }
  };

  // Edit Authentication
  const handleEditAuth = () => {
    if (editUsername === 'admin' && editPassword === 'admin123') {
      setEditAuth(true);
      setEditMode(true);
    } else {
      alert('Invalid credentials! Username: admin, Password: admin123');
      setEditUsername('');
      setEditPassword('');
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
  const generateSchedule = () => {
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

    const updatedTournaments = [...tournaments, newTournament];
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));

    alert(`Schedule generated successfully for ${tournamentName}!`);
    
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
            <div className="admin-controls">
              {!editAuth ? (
                <div className="edit-auth-section">
                  <h3>Admin Access Required for Editing</h3>
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
                      Enable Editing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="edit-controls">
                  <button 
                    onClick={() => setEditMode(!editMode)}
                    className={`edit-toggle-btn ${editMode ? 'active' : ''}`}
                  >
                    {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                  </button>
                  {editMode && (
                    <button onClick={addNewMatch} className="add-match-btn">
                      Add New Match
                    </button>
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
