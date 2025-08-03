import React, { useState, useEffect } from 'react';
import './Scoring.css';

const Scoring = () => {
  // Main states
  const [step, setStep] = useState('tournament'); // tournament, match, toss, scoring, scorecard
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [availableMatches, setAvailableMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Toss states
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState(''); // bat or bowl
  
  // Match states
  const [totalOvers, setTotalOvers] = useState(20);
  const [battingTeam, setBattingTeam] = useState('');
  const [bowlingTeam, setBowlingTeam] = useState('');
  const [currentInnings, setCurrentInnings] = useState(1);
  
  // Live scoring states
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [team1Score, setTeam1Score] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [team2Score, setTeam2Score] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [striker, setStriker] = useState('Batsman 1');
  const [nonStriker, setNonStriker] = useState('Batsman 2');
  const [currentBowler, setCurrentBowler] = useState('Bowler 1');
  const [ballHistory, setBallHistory] = useState([]);
  const [currentOverBalls, setCurrentOverBalls] = useState([]);
  
  // Player stats
  const [batsmanStats, setBatsmanStats] = useState({});
  const [bowlerStats, setBowlerStats] = useState({});
  
  // Match completion
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [matchResult, setMatchResult] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = () => {
    const savedTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    setTournaments(savedTournaments);
  };

  const loadMatches = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === parseInt(tournamentId));
    if (tournament && tournament.schedule) {
      const matches = tournament.schedule.filter(match => 
        match.status === 'Scheduled' || match.status === 'scheduled'
      );
      setAvailableMatches(matches);
    }
  };

  const handleTournamentSelect = (tournamentId) => {
    setSelectedTournament(tournamentId);
    loadMatches(tournamentId);
    setStep('match');
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setStep('toss');
  };

  const handleTossComplete = () => {
    if (tossDecision === 'bat') {
      setBattingTeam(tossWinner);
      setBowlingTeam(tossWinner === selectedMatch.team1 ? selectedMatch.team2 : selectedMatch.team1);
    } else {
      setBowlingTeam(tossWinner);
      setBattingTeam(tossWinner === selectedMatch.team1 ? selectedMatch.team2 : selectedMatch.team1);
    }
    
    // Initialize batsman and bowler stats
    const initialBatsmanStats = {};
    const initialBowlerStats = {};
    
    // Initialize striker and non-striker for batting team
    initialBatsmanStats[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: '' };
    initialBatsmanStats[nonStriker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: '' };
    
    // Initialize current bowler
    initialBowlerStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
    
    setBatsmanStats(initialBatsmanStats);
    setBowlerStats(initialBowlerStats);
    setStep('scoring');
  };

  const recordBall = (runs, isExtra = false, extraType = '', isWicket = false, wicketType = '') => {
    const currentTeamScore = currentInnings === 1 ? team1Score : team2Score;
    const newRuns = currentTeamScore.runs + runs;
    const newBalls = isExtra ? currentTeamScore.balls : currentTeamScore.balls + 1;
    const newWickets = isWicket ? currentTeamScore.wickets + 1 : currentTeamScore.wickets;
    
    // Update team score
    const updatedScore = {
      runs: newRuns,
      wickets: newWickets,
      balls: newBalls,
      overs: Math.floor(newBalls / 6) + (newBalls % 6) / 10
    };
    
    if (currentInnings === 1) {
      setTeam1Score(updatedScore);
    } else {
      setTeam2Score(updatedScore);
    }
    
    // Update batsman stats
    if (!isExtra && !isWicket) {
      const updatedBatsmanStats = { ...batsmanStats };
      if (!updatedBatsmanStats[striker]) {
        updatedBatsmanStats[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: '' };
      }
      updatedBatsmanStats[striker].runs += runs;
      updatedBatsmanStats[striker].balls += 1;
      if (runs === 4) updatedBatsmanStats[striker].fours += 1;
      if (runs === 6) updatedBatsmanStats[striker].sixes += 1;
      setBatsmanStats(updatedBatsmanStats);
    }
    
    // Handle wicket
    if (isWicket) {
      const updatedBatsmanStats = { ...batsmanStats };
      if (!updatedBatsmanStats[striker]) {
        updatedBatsmanStats[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: '' };
      }
      updatedBatsmanStats[striker].out = true;
      updatedBatsmanStats[striker].outType = wicketType;
      setBatsmanStats(updatedBatsmanStats);
      
      // Update bowler stats for wicket
      const updatedBowlerStats = { ...bowlerStats };
      if (!updatedBowlerStats[currentBowler]) {
        updatedBowlerStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
      }
      updatedBowlerStats[currentBowler].wickets += 1;
      setBowlerStats(updatedBowlerStats);
    }
    
    // Update bowler stats
    const updatedBowlerStats = { ...bowlerStats };
    if (!updatedBowlerStats[currentBowler]) {
      updatedBowlerStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
    }
    updatedBowlerStats[currentBowler].runs += runs;
    if (!isExtra) {
      updatedBowlerStats[currentBowler].balls += 1;
      updatedBowlerStats[currentBowler].overs = Math.floor(updatedBowlerStats[currentBowler].balls / 6) + 
        (updatedBowlerStats[currentBowler].balls % 6) / 10;
    }
    setBowlerStats(updatedBowlerStats);
    
    // Record ball in history
    const ballRecord = {
      over: Math.floor(newBalls / 6),
      ballInOver: (newBalls % 6) + 1,
      runs,
      isExtra,
      extraType,
      isWicket,
      wicketType,
      striker,
      bowler: currentBowler,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setBallHistory([...ballHistory, ballRecord]);
    setCurrentOverBalls([...currentOverBalls, `${runs}${isExtra ? ` (${extraType})` : ''}${isWicket ? ' W' : ''}`]);
    
    // Change strike if odd runs
    if (runs % 2 === 1 && !isWicket) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }
    
    // Check for over completion
    if (!isExtra && newBalls % 6 === 0) {
      setCurrentOverBalls([]);
      // Change strike at end of over
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }
    
    // Check for innings completion
    if (newWickets >= 10 || Math.floor(newBalls / 6) >= totalOvers) {
      if (currentInnings === 1) {
        setCurrentInnings(2);
        // Switch teams
        const temp = battingTeam;
        setBattingTeam(bowlingTeam);
        setBowlingTeam(temp);
        setStriker('Batsman 1');
        setNonStriker('Batsman 2');
        setCurrentBowler('Bowler 1');
        setCurrentOverBalls([]);
      } else {
        // Match completed
        setMatchCompleted(true);
        generateMatchResult();
        setStep('scorecard');
      }
    }
  };

  const generateMatchResult = () => {
    if (team2Score.runs > team1Score.runs) {
      setMatchResult(`${battingTeam} won by ${team2Score.runs - team1Score.runs} runs`);
    } else if (team1Score.runs > team2Score.runs) {
      setMatchResult(`${bowlingTeam} won by ${10 - team2Score.wickets} wickets`);
    } else {
      setMatchResult('Match tied');
    }
  };

  const saveScorecard = () => {
    const scorecard = {
      matchId: selectedMatch.id,
      tournament: selectedTournament,
      team1: selectedMatch.team1,
      team2: selectedMatch.team2,
      tossWinner,
      tossDecision,
      team1Score,
      team2Score,
      batsmanStats,
      bowlerStats,
      ballHistory,
      matchResult,
      date: new Date().toISOString()
    };
    
    // Save to localStorage
    const savedScorecards = JSON.parse(localStorage.getItem('scorecards') || '[]');
    savedScorecards.push(scorecard);
    localStorage.setItem('scorecards', JSON.stringify(savedScorecards));
    
    // Update match status in tournament schedule
    const updatedTournaments = tournaments.map(tournament => {
      if (tournament.id === parseInt(selectedTournament)) {
        const updatedSchedule = tournament.schedule.map(match => {
          if (match.id === selectedMatch.id) {
            return { ...match, status: 'Completed', result: matchResult };
          }
          return match;
        });
        return { ...tournament, schedule: updatedSchedule };
      }
      return tournament;
    });
    
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    
    alert('Scorecard saved successfully!');
  };

  const resetScoring = () => {
    setStep('tournament');
    setSelectedTournament('');
    setSelectedMatch(null);
    setTossWinner('');
    setTossDecision('');
    setCurrentInnings(1);
    setTeam1Score({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setTeam2Score({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setBallHistory([]);
    setCurrentOverBalls([]);
    setBatsmanStats({});
    setBowlerStats({});
    setMatchCompleted(false);
    setMatchResult('');
  };

  return (
    <div className="scoring-container">
      <div className="scoring-header">
        <h1>🏏 Live Cricket Scoring</h1>
        <div className="step-indicator">
          <span className={step === 'tournament' ? 'active' : ''}>Tournament</span>
          <span className={step === 'match' ? 'active' : ''}>Match</span>
          <span className={step === 'toss' ? 'active' : ''}>Toss</span>
          <span className={step === 'scoring' ? 'active' : ''}>Scoring</span>
          <span className={step === 'scorecard' ? 'active' : ''}>Scorecard</span>
        </div>
      </div>

      {/* Tournament Selection */}
      {step === 'tournament' && (
        <div className="step-container">
          <h2>Select Tournament</h2>
          <div className="tournament-grid">
            {tournaments.length > 0 ? (
              tournaments.map(tournament => (
                <div 
                  key={tournament.id} 
                  className="tournament-card"
                  onClick={() => handleTournamentSelect(tournament.id)}
                >
                  <h3>{tournament.name}</h3>
                  <p>Teams: {tournament.teams?.length || 0}</p>
                  <p>Status: {tournament.status || 'Active'}</p>
                </div>
              ))
            ) : (
              <div className="no-tournaments">
                <p>No tournaments found. Please create a tournament in the Schedule section first.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Selection */}
      {step === 'match' && (
        <div className="step-container">
          <h2>Select Match</h2>
          <button className="back-btn" onClick={() => setStep('tournament')}>← Back to Tournaments</button>
          
          <div className="match-settings">
            <label>
              Total Overs:
              <select value={totalOvers} onChange={(e) => setTotalOvers(parseInt(e.target.value))}>
                <option value={5}>5 Overs</option>
                <option value={10}>10 Overs</option>
                <option value={15}>15 Overs</option>
                <option value={20}>20 Overs (T20)</option>
                <option value={50}>50 Overs (ODI)</option>
              </select>
            </label>
          </div>

          <div className="matches-grid">
            {availableMatches.length > 0 ? (
              availableMatches.map(match => (
                <div 
                  key={match.id} 
                  className="match-card"
                  onClick={() => handleMatchSelect(match)}
                >
                  <div className="match-teams">
                    <span>{match.team1}</span>
                    <span className="vs">VS</span>
                    <span>{match.team2}</span>
                  </div>
                  <p>Match {match.match || match.id}</p>
                  <p>Status: {match.status}</p>
                </div>
              ))
            ) : (
              <div className="no-matches">
                <p>No scheduled matches found for this tournament.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toss */}
      {step === 'toss' && (
        <div className="step-container">
          <h2>Toss</h2>
          <button className="back-btn" onClick={() => setStep('match')}>← Back to Matches</button>
          
          <div className="toss-container">
            <div className="match-info">
              <h3>{selectedMatch?.team1} vs {selectedMatch?.team2}</h3>
              <p>{totalOvers} Overs Match</p>
            </div>

            <div className="toss-selection">
              <div className="form-group">
                <label>Toss Winner:</label>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="tossWinner" 
                      value={selectedMatch?.team1}
                      onChange={(e) => setTossWinner(e.target.value)}
                    />
                    {selectedMatch?.team1}
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="tossWinner" 
                      value={selectedMatch?.team2}
                      onChange={(e) => setTossWinner(e.target.value)}
                    />
                    {selectedMatch?.team2}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Toss Decision:</label>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="tossDecision" 
                      value="bat"
                      onChange={(e) => setTossDecision(e.target.value)}
                    />
                    Bat First
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="tossDecision" 
                      value="bowl"
                      onChange={(e) => setTossDecision(e.target.value)}
                    />
                    Bowl First
                  </label>
                </div>
              </div>

              <button 
                className="start-match-btn"
                onClick={handleTossComplete}
                disabled={!tossWinner || !tossDecision}
              >
                Start Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Scoring */}
      {step === 'scoring' && (
        <div className="step-container">
          <h2>Live Scoring</h2>
          
          <div className="match-header">
            <div className="teams-info">
              <h3>{selectedMatch?.team1} vs {selectedMatch?.team2}</h3>
              <p>Toss: {tossWinner} won and chose to {tossDecision}</p>
            </div>
            
            <div className="innings-indicator">
              <span>Innings {currentInnings} of 2</span>
            </div>
          </div>

          <div className="scoreboard">
            <div className="team-score">
              <h4>{battingTeam} (Batting)</h4>
              <div className="score-display">
                <span className="runs">{currentInnings === 1 ? team1Score.runs : team2Score.runs}</span>
                <span className="wickets">/{currentInnings === 1 ? team1Score.wickets : team2Score.wickets}</span>
                <span className="overs">({Math.floor((currentInnings === 1 ? team1Score.balls : team2Score.balls) / 6)}.{(currentInnings === 1 ? team1Score.balls : team2Score.balls) % 6})</span>
              </div>
            </div>
            
            <div className="team-score">
              <h4>{bowlingTeam} (Bowling)</h4>
              <div className="score-display">
                {currentInnings === 2 && (
                  <>
                    <span className="runs">{team1Score.runs}</span>
                    <span className="wickets">/{team1Score.wickets}</span>
                    <span className="overs">({Math.floor(team1Score.balls / 6)}.{team1Score.balls % 6})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="current-players">
            <div className="batsmen">
              <h4>Current Batsmen</h4>
              <div className="player-info">
                <span>⭐ {striker} (Strike)</span>
                <span>{batsmanStats[striker]?.runs || 0} ({batsmanStats[striker]?.balls || 0})</span>
              </div>
              <div className="player-info">
                <span>{nonStriker}</span>
                <span>{batsmanStats[nonStriker]?.runs || 0} ({batsmanStats[nonStriker]?.balls || 0})</span>
              </div>
            </div>
            
            <div className="bowler">
              <h4>Current Bowler</h4>
              <div className="player-info">
                <span>{currentBowler}</span>
                <span>{bowlerStats[currentBowler]?.runs || 0}/{bowlerStats[currentBowler]?.wickets || 0} ({Math.floor((bowlerStats[currentBowler]?.balls || 0) / 6)}.{(bowlerStats[currentBowler]?.balls || 0) % 6})</span>
              </div>
            </div>
          </div>

          <div className="current-over">
            <h4>This Over: {currentOverBalls.join(' ')}</h4>
          </div>

          <div className="player-controls">
            <div className="control-group">
              <label>Change Striker:</label>
              <input 
                type="text" 
                value={striker} 
                onChange={(e) => setStriker(e.target.value)}
                placeholder="Striker name"
              />
            </div>
            <div className="control-group">
              <label>Change Non-Striker:</label>
              <input 
                type="text" 
                value={nonStriker} 
                onChange={(e) => setNonStriker(e.target.value)}
                placeholder="Non-striker name"
              />
            </div>
            <div className="control-group">
              <label>Change Bowler:</label>
              <input 
                type="text" 
                value={currentBowler} 
                onChange={(e) => setCurrentBowler(e.target.value)}
                placeholder="Bowler name"
              />
            </div>
          </div>

          <div className="scoring-buttons">
            <h4>Score Runs</h4>
            <div className="runs-buttons">
              {[0, 1, 2, 3, 4, 5, 6].map(runs => (
                <button 
                  key={runs}
                  className={`run-btn ${runs === 4 ? 'four' : runs === 6 ? 'six' : ''}`}
                  onClick={() => recordBall(runs)}
                >
                  {runs}
                </button>
              ))}
            </div>

            <h4>Extras</h4>
            <div className="extras-buttons">
              <button onClick={() => recordBall(1, true, 'WD')}>Wide</button>
              <button onClick={() => recordBall(1, true, 'NB')}>No Ball</button>
              <button onClick={() => recordBall(1, true, 'B')}>Bye</button>
              <button onClick={() => recordBall(1, true, 'LB')}>Leg Bye</button>
            </div>

            <h4>Wickets</h4>
            <div className="wicket-buttons">
              <button onClick={() => recordBall(0, false, '', true, 'Bowled')}>Bowled</button>
              <button onClick={() => recordBall(0, false, '', true, 'Caught')}>Caught</button>
              <button onClick={() => recordBall(0, false, '', true, 'LBW')}>LBW</button>
              <button onClick={() => recordBall(0, false, '', true, 'Run Out')}>Run Out</button>
              <button onClick={() => recordBall(0, false, '', true, 'Stumped')}>Stumped</button>
              <button onClick={() => recordBall(0, false, '', true, 'Hit Wicket')}>Hit Wicket</button>
            </div>

            <div className="action-buttons">
              <button onClick={() => {
                const temp = striker;
                setStriker(nonStriker);
                setNonStriker(temp);
              }}>
                Switch Strike
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scorecard */}
      {step === 'scorecard' && (
        <div className="step-container">
          <h2>Match Scorecard</h2>
          
          <div className="match-result">
            <h3>{matchResult}</h3>
          </div>

          <div className="scorecard-container">
            <div className="team-scorecard">
              <h4>{selectedMatch?.team1} - {team1Score.runs}/{team1Score.wickets} ({Math.floor(team1Score.balls / 6)}.{team1Score.balls % 6} overs)</h4>
              <table className="batting-table">
                <thead>
                  <tr>
                    <th>Batsman</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                    <th>Out</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(batsmanStats).map(([name, stats]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{stats.runs}</td>
                      <td>{stats.balls}</td>
                      <td>{stats.fours}</td>
                      <td>{stats.sixes}</td>
                      <td>{stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}</td>
                      <td>{stats.out ? stats.outType : 'Not Out'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="team-scorecard">
              <h4>{selectedMatch?.team2} - {team2Score.runs}/{team2Score.wickets} ({Math.floor(team2Score.balls / 6)}.{team2Score.balls % 6} overs)</h4>
              <table className="bowling-table">
                <thead>
                  <tr>
                    <th>Bowler</th>
                    <th>Overs</th>
                    <th>Runs</th>
                    <th>Wickets</th>
                    <th>Economy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bowlerStats).map(([name, stats]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{Math.floor(stats.balls / 6)}.{stats.balls % 6}</td>
                      <td>{stats.runs}</td>
                      <td>{stats.wickets}</td>
                      <td>{stats.balls > 0 ? ((stats.runs / stats.balls) * 6).toFixed(1) : '0.0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="scorecard-actions">
            <button className="save-btn" onClick={saveScorecard}>
              Save Scorecard
            </button>
            <button className="new-match-btn" onClick={resetScoring}>
              Score New Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoring;
