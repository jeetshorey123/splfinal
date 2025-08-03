import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ScoreBoard.css';

const ScoreBoard = () => {
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [showScorecard, setShowScorecard] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    // Load data from localStorage
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

  const getTournamentMatches = () => {
    if (!selectedTournament) return [];
    return matches.filter(match => match.tournamentId === parseInt(selectedTournament));
  };

  const calculateNRR = (teamName, tournamentMatches) => {
    const teamMatches = tournamentMatches.filter(match => 
      (match.team1 === teamName || match.team2 === teamName) && match.status === 'completed'
    );
    
    if (teamMatches.length === 0) return 0;
    
    let runsFor = 0;
    let runsAgainst = 0;
    let oversFor = 0;
    let oversAgainst = 0;
    
    teamMatches.forEach(match => {
      if (match.team1 === teamName) {
        // Team played as team1
        runsFor += match.team1Score.runs || 0;
        runsAgainst += match.team2Score.runs || 0;
        oversFor += parseFloat(match.team1Score.overs) || 0;
        oversAgainst += parseFloat(match.team2Score.overs) || 0;
      } else {
        // Team played as team2
        runsFor += match.team2Score.runs || 0;
        runsAgainst += match.team1Score.runs || 0;
        oversFor += parseFloat(match.team2Score.overs) || 0;
        oversAgainst += parseFloat(match.team1Score.overs) || 0;
      }
    });
    
    // Avoid division by zero
    if (oversFor === 0 || oversAgainst === 0) return 0;
    
    const runRateFor = runsFor / oversFor;
    const runRateAgainst = runsAgainst / oversAgainst;
    
    return parseFloat((runRateFor - runRateAgainst).toFixed(3));
  };

  const calculateTeamStats = (teamName) => {
    const tournamentMatches = getTournamentMatches();
    const teamMatches = tournamentMatches.filter(match => 
      match.team1 === teamName || match.team2 === teamName
    );
    
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let points = 0;

    teamMatches.forEach(match => {
      if (match.status === 'completed') {
        if (match.winner === teamName) {
          wins++;
          points += 2; // 2 points for win
        } else if (match.winner === 'Tie' || match.winner === 'tie') {
          ties++;
          points += 1; // 1 point for tie
        } else if (match.winner && match.winner !== teamName) {
          losses++;
          // 0 points for loss
        }
      }
    });

    const nrr = calculateNRR(teamName, tournamentMatches);

    return { 
      wins, 
      losses, 
      ties,
      points, 
      played: teamMatches.length,
      nrr: nrr
    };
  };

  const getTournamentTeams = () => {
    if (!selectedTournament) return [];
    const tournament = tournaments.find(t => t.id === parseInt(selectedTournament));
    return tournament ? tournament.teams : [];
  };

  const getPositionText = (position) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = position % 100;
    return position + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const sortedTeams = getTournamentTeams()
    .map(teamName => {
      const team = teams.find(t => t.name === teamName);
      return {
        name: teamName,
        stats: calculateTeamStats(teamName),
        ...team
      };
    })
    .sort((a, b) => {
      // Sort by points first (descending)
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      // If points are equal, sort by NRR (descending)
      if (b.stats.nrr !== a.stats.nrr) {
        return b.stats.nrr - a.stats.nrr;
      }
      // If NRR is also equal, sort by wins (descending)
      if (b.stats.wins !== a.stats.wins) {
        return b.stats.wins - a.stats.wins;
      }
      // If wins are also equal, sort alphabetically by team name
      return a.name.localeCompare(b.name);
    });

  const getMatchDetails = (match) => {
    if (!match) return null;
    
    const team1Players = teams.find(t => t.name === match.team1)?.players || [];
    const team2Players = teams.find(t => t.name === match.team2)?.players || [];
    
    return {
      team1: {
        name: match.team1,
        score: match.team1Score,
        players: team1Players
      },
      team2: {
        name: match.team2,
        score: match.team2Score,
        players: team2Players
      },
      winner: match.winner,
      status: match.status,
      date: match.date
    };
  };

  return (
    <div className="score-board">
      <div className="score-board-header">
        <h1>Score Board & Points Table</h1>
        <Link to="/" className="btn-back">Back to Home</Link>
      </div>

      <div className="score-board-content">
        {tournaments.length > 0 ? (
          <>
            {/* Tournament Selection */}
            <div className="tournament-selection">
              <h2>Select Tournament</h2>
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
            </div>

            {selectedTournament && (
              <>
                {/* Points Table */}
                <div className="standings-section">
                  <h2>Points Table</h2>
                  <div className="points-info">
                    <p><strong>Points System:</strong> Win = 2 points, Loss = 0 points, Tie = 1 point</p>
                    <p><strong>Ranking:</strong> Points → Net Run Rate → Wins → Alphabetical</p>
                  </div>
                  <div className="standings-table">
                    <div className="table-header">
                      <span>Pos</span>
                      <span>Team</span>
                      <span>P</span>
                      <span>W</span>
                      <span>L</span>
                      <span>T</span>
                      <span>Pts</span>
                      <span>NRR</span>
                    </div>
                    {sortedTeams.map((team, index) => (
                      <div key={team.name} className={`table-row ${index < 4 ? 'top-four' : ''}`}>
                        <span className="position">
                          {index + 1}
                          <span className="position-text">{getPositionText(index + 1)}</span>
                        </span>
                        <span className="team-name">{team.name}</span>
                        <span>{team.stats.played}</span>
                        <span className="won">{team.stats.wins}</span>
                        <span className="lost">{team.stats.losses}</span>
                        <span className="tied">{team.stats.ties}</span>
                        <span className="points">{team.stats.points}</span>
                        <span className={`nrr ${team.stats.nrr >= 0 ? 'positive' : 'negative'}`}>
                          {team.stats.nrr > 0 ? '+' : ''}{team.stats.nrr}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tournament Summary */}
                  <div className="tournament-summary">
                    <h3>Tournament Summary</h3>
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="label">Total Teams:</span>
                        <span className="value">{sortedTeams.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Total Matches:</span>
                        <span className="value">{getTournamentMatches().length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Completed Matches:</span>
                        <span className="value">{getTournamentMatches().filter(m => m.status === 'completed').length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Current Leader:</span>
                        <span className="value leader">{sortedTeams.length > 0 ? sortedTeams[0].name : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Matches */}
                <div className="matches-section">
                  <h2>Recent Matches</h2>
                  <div className="matches-grid">
                    {getTournamentMatches().slice(-6).reverse().map(match => (
                      <div key={match.id} className={`match-card ${match.status}`}>
                        <div className="match-header">
                          <span className="match-date">
                            {new Date(match.date).toLocaleDateString()}
                          </span>
                          <span className={`match-status ${match.status}`}>
                            {match.status}
                          </span>
                        </div>
                        <div className="match-teams">
                          <div className="team-score">
                            <span className="team-name">{match.team1}</span>
                            <span className="score">
                              {match.team1Score ? 
                                `${match.team1Score.runs}/${match.team1Score.wickets} (${match.team1Score.overs} ov)` :
                                'TBD'
                              }
                            </span>
                          </div>
                          <div className="vs">vs</div>
                          <div className="team-score">
                            <span className="team-name">{match.team2}</span>
                            <span className="score">
                              {match.team2Score ? 
                                `${match.team2Score.runs}/${match.team2Score.wickets} (${match.team2Score.overs} ov)` :
                                'TBD'
                              }
                            </span>
                          </div>
                        </div>
                        {match.winner && (
                          <div className="match-result">
                            <span className="winner">
                              Winner: {match.winner}
                            </span>
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowScorecard(true);
                          }}
                          className="btn-view-scorecard"
                        >
                          View Scorecard
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Statistics */}
                <div className="stats-section">
                  <h2>Team Statistics</h2>
                  <div className="stats-grid">
                    {sortedTeams.map((team, index) => (
                      <div key={team.name} className={`team-stats-card ${index < 4 ? 'top-four' : ''}`}>
                        <div className="team-header">
                          <h3>{team.name}</h3>
                          <span className="team-position">{getPositionText(index + 1)}</span>
                        </div>
                        <div className="stats-content">
                          <div className="stat-item">
                            <span className="stat-label">Matches Played:</span>
                            <span className="stat-value">{team.stats.played}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Wins:</span>
                            <span className="stat-value won">{team.stats.wins}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Losses:</span>
                            <span className="stat-value lost">{team.stats.losses}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Ties:</span>
                            <span className="stat-value tied">{team.stats.ties}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Points:</span>
                            <span className="stat-value points">{team.stats.points}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Net Run Rate:</span>
                            <span className={`stat-value nrr ${team.stats.nrr >= 0 ? 'positive' : 'negative'}`}>
                              {team.stats.nrr > 0 ? '+' : ''}{team.stats.nrr}
                            </span>
                          </div>
                          {team.budget !== undefined && (
                            <div className="stat-item">
                              <span className="stat-label">Budget Remaining:</span>
                              <span className="stat-value">₹{team.budget.toLocaleString()}</span>
                            </div>
                          )}
                          {team.players && (
                            <div className="stat-item">
                              <span className="stat-label">Players:</span>
                              <span className="stat-value">{team.players.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-tournaments">
            <h2>No Tournaments Available</h2>
            <p>Tournaments will appear here after they are created in the Scoring section.</p>
            <Link to="/scoring" className="btn-primary">Create Tournament</Link>
          </div>
        )}

        {/* Scorecard Modal */}
        {showScorecard && selectedMatch && (
          <div className="scorecard-modal">
            <div className="scorecard-content">
              <div className="scorecard-header">
                <h2>Match Scorecard</h2>
                <button 
                  onClick={() => setShowScorecard(false)}
                  className="btn-close"
                >
                  ×
                </button>
              </div>
              
              {(() => {
                const matchDetails = getMatchDetails(selectedMatch);
                if (!matchDetails) return null;
                
                return (
                  <div className="scorecard-body">
                    <div className="match-info">
                      <h3>{matchDetails.team1.name} vs {matchDetails.team2.name}</h3>
                      <p>Date: {new Date(matchDetails.date).toLocaleDateString()}</p>
                      <p>Status: {matchDetails.status}</p>
                      {matchDetails.winner && <p>Winner: {matchDetails.winner}</p>}
                    </div>
                    
                    <div className="innings-scores">
                      <div className="innings">
                        <h4>{matchDetails.team1.name} - 1st Innings</h4>
                        <div className="score-summary">
                          <p>
                            {matchDetails.team1.score.runs}/{matchDetails.team1.score.wickets} 
                            ({matchDetails.team1.score.overs} overs)
                          </p>
                        </div>
                        <div className="players-list">
                          <h5>Playing XI:</h5>
                          <div className="players-grid">
                            {matchDetails.team1.players.map(player => (
                              <div key={player.id} className="player-item">
                                {player.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="innings">
                        <h4>{matchDetails.team2.name} - 2nd Innings</h4>
                        <div className="score-summary">
                          <p>
                            {matchDetails.team2.score.runs}/{matchDetails.team2.score.wickets} 
                            ({matchDetails.team2.score.overs} overs)
                          </p>
                        </div>
                        <div className="players-list">
                          <h5>Playing XI:</h5>
                          <div className="players-grid">
                            {matchDetails.team2.players.map(player => (
                              <div key={player.id} className="player-item">
                                {player.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard; 