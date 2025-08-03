import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Scoring.css';

const Scoring = () => {
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [newTournamentName, setNewTournamentName] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchSchedule, setMatchSchedule] = useState([]);
  const [showTournamentSetup, setShowTournamentSetup] = useState(true);
  const [showMatchSetup, setShowMatchSetup] = useState(false);
  const [showLiveScoring, setShowLiveScoring] = useState(false);

  // Live match scoring state
  const [currentInnings, setCurrentInnings] = useState(1);
  const [battingTeam, setBattingTeam] = useState('');
  const [bowlingTeam, setBowlingTeam] = useState('');
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [totalOvers, setTotalOvers] = useState(20);
  const [team1Score, setTeam1Score] = useState({ runs: 0, wickets: 0, overs: 0 });
  const [team2Score, setTeam2Score] = useState({ runs: 0, wickets: 0, overs: 0 });
  const [currentBatsman, setCurrentBatsman] = useState('');
  const [currentBowler, setCurrentBowler] = useState('');
  const [ballHistory, setBallHistory] = useState([]);

  useEffect(() => {
    // Load teams and tournaments from localStorage
    const savedData = localStorage.getItem('splAuctionData');
    const savedTournaments = localStorage.getItem('splTournaments');
    const savedMatches = localStorage.getItem('splMatches');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      setTeams(data.teams || []);
    }
    
    if (savedTournaments) {
      setTournaments(JSON.parse(savedTournaments));
    }
    
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    }
  }, []);

  const saveTournaments = () => {
    localStorage.setItem('splTournaments', JSON.stringify(tournaments));
  };

  const saveMatches = () => {
    localStorage.setItem('splMatches', JSON.stringify(matches));
  };

  const createTournament = () => {
    if (newTournamentName.trim()) {
      const tournament = {
        id: Date.now(),
        name: newTournamentName,
        teams: teams.map(team => team.name),
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };
      setTournaments([...tournaments, tournament]);
      setNewTournamentName('');
      saveTournaments();
    }
  };

  const generateMatchSchedule = () => {
    if (selectedTournament && teams.length >= 2) {
      const tournament = tournaments.find(t => t.id === parseInt(selectedTournament));
      if (tournament) {
        const schedule = [];
        const teamNames = tournament.teams;
        
        // Generate round-robin matches
        for (let i = 0; i < teamNames.length; i++) {
          for (let j = i + 1; j < teamNames.length; j++) {
            schedule.push({
              id: Date.now() + Math.random(),
              tournamentId: tournament.id,
              team1: teamNames[i],
              team2: teamNames[j],
              status: 'scheduled',
              date: new Date(Date.now() + schedule.length * 24 * 60 * 60 * 1000).toISOString(),
              overs: totalOvers
            });
          }
        }
        
        setMatchSchedule(schedule);
        setMatches([...matches, ...schedule]);
        saveMatches();
      }
    }
  };

  const startMatch = (match) => {
    setCurrentMatch(match);
    setBattingTeam(match.team1);
    setBowlingTeam(match.team2);
    setCurrentInnings(1);
    setCurrentOver(0);
    setCurrentBall(0);
    setTeam1Score({ runs: 0, wickets: 0, overs: 0 });
    setTeam2Score({ runs: 0, wickets: 0, overs: 0 });
    setBallHistory([]);
    setShowLiveScoring(true);
    setShowMatchSetup(false);
  };

  const recordBall = (runs, extras = 0, wicket = false, extraType = '') => {
    const currentScore = currentInnings === 1 ? team1Score : team2Score;
    const newRuns = currentScore.runs + runs + extras;
    const newWickets = wicket ? currentScore.wickets + 1 : currentScore.wickets;
    
    const ballResult = {
      over: currentOver,
      ball: currentBall + 1,
      runs: runs,
      extras: extras,
      extraType: extraType,
      wicket: wicket,
      batsman: currentBatsman,
      bowler: currentBowler,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setBallHistory([...ballHistory, ballResult]);
    
    if (currentInnings === 1) {
      setTeam1Score({ ...currentScore, runs: newRuns, wickets: newWickets });
    } else {
      setTeam2Score({ ...currentScore, runs: newRuns, wickets: newWickets });
    }
    
    // Update ball count
    if (currentBall < 5) {
      setCurrentBall(currentBall + 1);
    } else {
      setCurrentOver(currentOver + 1);
      setCurrentBall(0);
      
      // Update overs in score
      if (currentInnings === 1) {
        setTeam1Score(prev => ({ ...prev, overs: currentOver + 1 }));
      } else {
        setTeam2Score(prev => ({ ...prev, overs: currentOver + 1 }));
      }
    }
    
    // Check if innings is complete
    if (newWickets >= 10 || (currentOver >= totalOvers - 1 && currentBall >= 5)) {
      if (currentInnings === 1) {
        setCurrentInnings(2);
        setBattingTeam(currentMatch.team2);
        setBowlingTeam(currentMatch.team1);
        setCurrentOver(0);
        setCurrentBall(0);
      } else {
        // Match complete
        endMatch();
      }
    }
  };

  const endMatch = () => {
    const matchResult = {
      ...currentMatch,
      status: 'completed',
      team1Score: team1Score,
      team2Score: team2Score,
      winner: team1Score.runs > team2Score.runs ? currentMatch.team1 : 
              team2Score.runs > team1Score.runs ? currentMatch.team2 : 'Tie',
      completedAt: new Date().toISOString()
    };
    
    setMatches(matches.map(m => m.id === currentMatch.id ? matchResult : m));
    saveMatches();
    setShowLiveScoring(false);
    setCurrentMatch(null);
  };

  const getTeamPlayers = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    return team ? team.players : [];
  };

  const getCurrentScore = () => {
    return currentInnings === 1 ? team1Score : team2Score;
  };

  const getRequiredRuns = () => {
    if (currentInnings === 2) {
      return team1Score.runs - team2Score.runs + 1;
    }
    return null;
  };

  return (
    <div className="scoring">
      <div className="scoring-header">
        <h1>Cricket Tournament & Scoring</h1>
        <Link to="/" className="btn-back">Back to Home</Link>
      </div>

      <div className="scoring-content">
        {teams.length > 0 ? (
          <>
            {/* Tournament Setup */}
            {showTournamentSetup && (
              <div className="tournament-setup">
                <h2>Tournament Management</h2>
                
                <div className="create-tournament">
                  <h3>Create New Tournament</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      value={newTournamentName}
                      onChange={(e) => setNewTournamentName(e.target.value)}
                      placeholder="Enter tournament name"
                      className="tournament-input"
                    />
                    <button onClick={createTournament} className="btn-primary">
                      Create Tournament
                    </button>
                  </div>
                </div>

                {tournaments.length > 0 && (
                  <div className="tournament-selection">
                    <h3>Select Tournament</h3>
                    <select 
                      value={selectedTournament} 
                      onChange={(e) => setSelectedTournament(e.target.value)}
                      className="tournament-select"
                    >
                      <option value="">Choose a tournament...</option>
                      {tournaments.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>
                          {tournament.name} ({tournament.status})
                        </option>
                      ))}
                    </select>
                    
                    {selectedTournament && (
                      <div className="tournament-actions">
                        <div className="form-group">
                          <label>Total Overs per Innings:</label>
                          <input
                            type="number"
                            value={totalOvers}
                            onChange={(e) => setTotalOvers(parseInt(e.target.value))}
                            min="1"
                            max="50"
                            className="overs-input"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            generateMatchSchedule();
                            setShowMatchSetup(true);
                            setShowTournamentSetup(false);
                          }} 
                          className="btn-primary"
                        >
                          Generate Schedule & Start Matches
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Match Setup */}
            {showMatchSetup && (
              <div className="match-setup">
                <h2>Match Schedule</h2>
                <div className="matches-grid">
                  {matchSchedule.map(match => (
                    <div key={match.id} className="match-card">
                      <div className="match-teams">
                        <span>{match.team1}</span>
                        <span className="vs">vs</span>
                        <span>{match.team2}</span>
                      </div>
                      <div className="match-details">
                        <p>Status: {match.status}</p>
                        <p>Overs: {match.overs}</p>
                        <p>Date: {new Date(match.date).toLocaleDateString()}</p>
                      </div>
                      {match.status === 'scheduled' && (
                        <button 
                          onClick={() => startMatch(match)}
                          className="btn-primary"
                        >
                          Start Match
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setShowMatchSetup(false);
                    setShowTournamentSetup(true);
                  }} 
                  className="btn-secondary"
                >
                  Back to Tournaments
                </button>
              </div>
            )}

            {/* Live Scoring */}
            {showLiveScoring && currentMatch && (
              <div className="live-scoring">
                <div className="match-header">
                  <h2>Live Match: {currentMatch.team1} vs {currentMatch.team2}</h2>
                  <div className="match-status">
                    <span className="innings">Innings {currentInnings}</span>
                    <span className="batting">{battingTeam} batting</span>
                  </div>
                </div>

                <div className="score-display">
                  <div className="team-scores">
                    <div className="team-score">
                      <h3>{currentMatch.team1}</h3>
                      <p>{team1Score.runs}/{team1Score.wickets} ({team1Score.overs} overs)</p>
                    </div>
                    <div className="team-score">
                      <h3>{currentMatch.team2}</h3>
                      <p>{team2Score.runs}/{team2Score.wickets} ({team2Score.overs} overs)</p>
                    </div>
                  </div>
                  
                  <div className="current-status">
                    <p>Current Over: {currentOver}.{currentBall}</p>
                    {getRequiredRuns() && <p>Required: {getRequiredRuns()} runs</p>}
                  </div>
                </div>

                <div className="scoring-controls">
                  <div className="runs-buttons">
                    <h3>Runs</h3>
                    <div className="button-grid">
                      <button onClick={() => recordBall(0)} className="btn-score">0</button>
                      <button onClick={() => recordBall(1)} className="btn-score">1</button>
                      <button onClick={() => recordBall(2)} className="btn-score">2</button>
                      <button onClick={() => recordBall(3)} className="btn-score">3</button>
                      <button onClick={() => recordBall(4)} className="btn-score">4</button>
                      <button onClick={() => recordBall(6)} className="btn-score">6</button>
                    </div>
                  </div>

                  <div className="extras-buttons">
                    <h3>Extras</h3>
                    <div className="button-grid">
                      <button onClick={() => recordBall(0, 1, false, 'wide')} className="btn-extra">Wide</button>
                      <button onClick={() => recordBall(0, 1, false, 'no-ball')} className="btn-extra">No Ball</button>
                      <button onClick={() => recordBall(0, 1, false, 'bye')} className="btn-extra">Bye</button>
                      <button onClick={() => recordBall(0, 1, false, 'leg-bye')} className="btn-extra">Leg Bye</button>
                    </div>
                  </div>

                  <div className="wicket-button">
                    <h3>Wicket</h3>
                    <button onClick={() => recordBall(0, 0, true)} className="btn-wicket">
                      Wicket
                    </button>
                  </div>
                </div>

                <div className="ball-history">
                  <h3>Ball History</h3>
                  <div className="history-list">
                    {ballHistory.slice(-12).reverse().map((ball, index) => (
                      <div key={index} className="ball-item">
                        <span>{ball.over}.{ball.ball}</span>
                        <span className={`ball-result ${ball.wicket ? 'wicket' : ''}`}>
                          {ball.wicket ? 'W' : ball.runs + ball.extras}
                          {ball.extraType && ` (${ball.extraType})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="match-actions">
                  <button onClick={endMatch} className="btn-danger">End Match</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-teams">
            <h2>No Teams Available</h2>
            <p>Teams will appear here after the auction setup is completed.</p>
            <Link to="/live-auction" className="btn-primary">Start Auction</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoring; 