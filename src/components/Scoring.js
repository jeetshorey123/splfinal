import React, { useState, useEffect } from 'react';
import './Scoring.css';

const Scoring = () => {
  // Main states
  const [step, setStep] = useState('tournament'); // tournament, match, setup, toss, scoring, scorecard
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [availableMatches, setAvailableMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Match setup states
  const [totalOvers, setTotalOvers] = useState(20);
  const [showTossModal, setShowTossModal] = useState(false);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [tossResult, setTossResult] = useState('');
  
  // Toss states
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState(''); // bat or bowl
  
  // Match states
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
  
  // Extra states
  const [showNoBallRuns, setShowNoBallRuns] = useState(false);
  
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
    setStep('setup');
  };

  const handleMatchSetupComplete = () => {
    setStep('toss');
  };

  const handleToss = () => {
    setShowTossModal(true);
  };

  const flipCoin = () => {
    setCoinFlipping(true);
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'heads' : 'tails';
      setTossResult(result);
      setCoinFlipping(false);
    }, 2000);
  };

  const handleTossWin = (team) => {
    setTossWinner(team);
  };

  const handleTossDecision = (decision) => {
    setTossDecision(decision);
    setShowTossModal(false);
    
    if (decision === 'bat') {
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

  const switchBatsmen = () => {
    const temp = striker;
    setStriker(nonStriker);
    setNonStriker(temp);
  };

  const switchInnings = () => {
    if (currentInnings === 1) {
      // End first innings
      const firstInningsTarget = (currentInnings === 1 ? team1Score.runs : team2Score.runs) + 1;
      
      setCurrentInnings(2);
      setBattingTeam(bowlingTeam);
      setBowlingTeam(battingTeam);
      
      // Reset scores for second innings
      setTeam2Score({ runs: 0, wickets: 0, overs: 0, balls: 0 });
      setCurrentOver(0);
      setCurrentBall(0);
      setCurrentOverBalls([]);
      
      // Reset players
      setStriker('Batsman 1');
      setNonStriker('Batsman 2');
      setCurrentBowler('Bowler 1');
      
      alert(`Target: ${firstInningsTarget} runs in ${totalOvers} overs`);
    } else {
      // Match completed
      setMatchCompleted(true);
      calculateMatchResult();
    }
  };

  const calculateMatchResult = () => {
    const team1Total = team1Score.runs;
    const team2Total = team2Score.runs;
    
    let result = '';
    if (team1Total > team2Total) {
      result = `${selectedMatch.team1} won by ${team1Total - team2Total} runs`;
    } else if (team2Total > team1Total) {
      result = `${selectedMatch.team2} won by ${10 - team2Score.wickets} wickets`;
    } else {
      result = 'Match tied';
    }
    
    setMatchResult(result);
  };

  const recordBall = (runs, isExtra = false, extraType = '', isWicket = false, wicketType = '') => {
    const currentTeamScore = currentInnings === 1 ? team1Score : team2Score;
    
    // Calculate runs and balls
    let totalRuns = runs;
    let ballsToAdd = 1;
    
    // Handle extras - don't count ball for NB, WD
    if (isExtra && (extraType === 'NB' || extraType === 'WD')) {
      ballsToAdd = 0; // Don't count the ball
      totalRuns = runs; // Extra run for NB/WD
    } else if (isExtra && (extraType === 'B' || extraType === 'LB')) {
      ballsToAdd = 1; // Count the ball for byes/leg byes
      totalRuns = runs; // Runs from byes/leg byes
    }
    
    // Special case: NB + runs (e.g., NB + 1 run = 2 total runs)
    if (extraType === 'NB' && runs > 1) {
      totalRuns = 1 + (runs - 1); // 1 for NB + additional runs
    }
    
    const newRuns = currentTeamScore.runs + totalRuns;
    const newBalls = currentTeamScore.balls + ballsToAdd;
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
    
    // Update batsman stats (only if not an extra that doesn't involve batsman)
    if (!isExtra || (isExtra && (extraType === 'B' || extraType === 'LB'))) {
      const updatedBatsmanStats = { ...batsmanStats };
      if (!updatedBatsmanStats[striker]) {
        updatedBatsmanStats[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: '' };
      }
      
      // Add runs to batsman (only actual runs, not extras)
      if (!isExtra) {
        updatedBatsmanStats[striker].runs += runs;
        if (runs === 4) updatedBatsmanStats[striker].fours += 1;
        if (runs === 6) updatedBatsmanStats[striker].sixes += 1;
      }
      
      // Add ball faced (only if ball is counted)
      if (ballsToAdd > 0) {
        updatedBatsmanStats[striker].balls += 1;
      }
      
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
      
      // Ask for new batsman
      setTimeout(() => {
        const newBatsman = prompt(`${striker} is out (${wicketType}). Enter new batsman name:`);
        if (newBatsman) {
          setStriker(newBatsman);
          // Initialize new batsman stats
          const newBatsmanStats = { ...updatedBatsmanStats };
          newBatsmanStats[newBatsman] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: '' };
          setBatsmanStats(newBatsmanStats);
        }
      }, 500);
    }
    
    // Update bowler stats
    const updatedBowlerStats = { ...bowlerStats };
    if (!updatedBowlerStats[currentBowler]) {
      updatedBowlerStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
    }
    
    // Add runs to bowler
    updatedBowlerStats[currentBowler].runs += totalRuns;
    
    // Add ball to bowler (only if ball is counted)
    if (ballsToAdd > 0) {
      updatedBowlerStats[currentBowler].balls += 1;
      updatedBowlerStats[currentBowler].overs = Math.floor(updatedBowlerStats[currentBowler].balls / 6) + 
                                                (updatedBowlerStats[currentBowler].balls % 6) / 10;
    }
    
    // Add wicket to bowler
    if (isWicket) {
      updatedBowlerStats[currentBowler].wickets += 1;
    }
    
    setBowlerStats(updatedBowlerStats);
    
    // Update current over display
    const ballDisplay = isWicket ? 'W' : 
                       isExtra ? `${runs}${extraType}` : 
                       runs === 0 ? '•' : runs.toString();
    setCurrentOverBalls([...currentOverBalls, ballDisplay]);
    
    // Change strike on odd runs (but not on wickets or certain extras)
    if (!isWicket && runs % 2 === 1 && !isExtra) {
      setTimeout(() => switchBatsmen(), 100);
    }
    
    // Check for over completion (6 valid balls)
    if (newBalls % 6 === 0 && ballsToAdd > 0) {
      setTimeout(() => {
        setCurrentOverBalls([]);
        // Automatically switch batsmen at end of over
        switchBatsmen();
        alert('Over completed! Batsmen have been switched automatically.');
        
        // Ask for new bowler
        const newBowler = prompt('Over completed! Enter new bowler name:');
        if (newBowler) {
          setCurrentBowler(newBowler);
          // Initialize new bowler stats if needed
          const newBowlerStats = { ...updatedBowlerStats };
          if (!newBowlerStats[newBowler]) {
            newBowlerStats[newBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
          }
          setBowlerStats(newBowlerStats);
        }
      }, 1000);
    }
    
    // Check for innings completion
    if (newWickets >= 10 || Math.floor(newBalls / 6) >= totalOvers) {
      setTimeout(() => {
        if (currentInnings === 1) {
          // First innings completed
          const target = newRuns + 1;
          alert(`First innings completed! ${battingTeam}: ${newRuns}/${newWickets}\nTarget for ${bowlingTeam}: ${target} runs`);
        } else {
          // Second innings completed - match finished
          setMatchCompleted(true);
          calculateMatchResult();
          setStep('scorecard');
        }
      }, 1000);
    }
  };

  const saveInnings = () => {
    if (currentInnings === 1) {
      // Save first innings data
      const inningsData = {
        team: battingTeam,
        score: team1Score,
        batsmanStats: batsmanStats,
        bowlerStats: bowlerStats,
        ballHistory: ballHistory
      };
      localStorage.setItem('firstInningsData', JSON.stringify(inningsData));
      alert('First innings saved successfully!');
    } else {
      // Save second innings data
      const inningsData = {
        team: battingTeam,
        score: team2Score,
        batsmanStats: batsmanStats,
        bowlerStats: bowlerStats,
        ballHistory: ballHistory
      };
      localStorage.setItem('secondInningsData', JSON.stringify(inningsData));
      alert('Second innings saved successfully!');
    }
  };

  const changeOver = () => {
    const newBowler = prompt('Enter new bowler name:');
    if (newBowler) {
      setCurrentBowler(newBowler);
      setCurrentOverBalls([]);
      switchBatsmen(); // Change strike
      
      // Initialize new bowler stats if needed
      const newBowlerStats = { ...bowlerStats };
      if (!newBowlerStats[newBowler]) {
        newBowlerStats[newBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
      }
      setBowlerStats(newBowlerStats);
    }
  };

  const handleNoBall = () => {
    setShowNoBallRuns(true);
  };

  const recordNoBallRuns = (additionalRuns) => {
    // NB = 1 (penalty) + additional runs scored by batsman
    const totalRuns = 1 + additionalRuns;
    recordBall(totalRuns, true, 'NB', false, '');
    setShowNoBallRuns(false);
  };

  const cancelNoBall = () => {
    setShowNoBallRuns(false);
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
          <span className={step === 'setup' ? 'active' : ''}>Setup</span>
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

      {/* Match Setup */}
      {step === 'setup' && (
        <div className="step-container">
          <h2>Match Setup</h2>
          <button className="back-btn" onClick={() => setStep('match')}>← Back to Matches</button>
          
          <div className="setup-container">
            <div className="match-info-card">
              <h3>{selectedMatch?.team1} vs {selectedMatch?.team2}</h3>
              <p>Match {selectedMatch?.matchNumber} - {selectedMatch?.date}</p>
            </div>

            <div className="overs-setup">
              <label className="setup-label">
                Number of Overs:
                <select 
                  value={totalOvers} 
                  onChange={(e) => setTotalOvers(parseInt(e.target.value))}
                  className="overs-select"
                >
                  <option value={5}>5 Overs</option>
                  <option value={10}>10 Overs</option>
                  <option value={15}>15 Overs</option>
                  <option value={20}>20 Overs (T20)</option>
                  <option value={25}>25 Overs</option>
                  <option value={30}>30 Overs</option>
                  <option value={40}>40 Overs</option>
                  <option value={50}>50 Overs (ODI)</option>
                </select>
              </label>
            </div>

            <div className="players-setup">
              <div className="team-setup">
                <h4>{selectedMatch?.team1} Starting Players</h4>
                <div className="player-inputs">
                  <input 
                    type="text" 
                    placeholder="Opening Batsman 1" 
                    value={striker}
                    onChange={(e) => setStriker(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Opening Batsman 2" 
                    value={nonStriker}
                    onChange={(e) => setNonStriker(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="team-setup">
                <h4>{selectedMatch?.team2} Starting Bowler</h4>
                <div className="player-inputs">
                  <input 
                    type="text" 
                    placeholder="Opening Bowler" 
                    value={currentBowler}
                    onChange={(e) => setCurrentBowler(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              className="proceed-btn" 
              onClick={handleMatchSetupComplete}
              disabled={!striker || !nonStriker || !currentBowler}
            >
              Proceed to Toss
            </button>
          </div>
        </div>
      )}

      {/* Toss */}
      {step === 'toss' && (
        <div className="step-container">
          <h2>Toss</h2>
          <button className="back-btn" onClick={() => setStep('setup')}>← Back to Setup</button>
          
          <div className="toss-container">
            <div className="match-info-card">
              <h3>{selectedMatch?.team1} vs {selectedMatch?.team2}</h3>
              <p>{totalOvers} Overs Match</p>
            </div>

            <div className="coin-toss">
              <h4>Coin Toss</h4>
              <div 
                className={`coin ${coinFlipping ? 'flipping' : ''}`}
                onClick={flipCoin}
              >
                {coinFlipping ? '🪙' : (tossResult === 'heads' ? '👑' : '⚡')}
              </div>
              {!coinFlipping && (
                <p className="coin-instruction">Click the coin to flip!</p>
              )}
              {tossResult && !coinFlipping && (
                <p className="toss-result">Result: {tossResult.toUpperCase()}</p>
              )}
            </div>

            {tossResult && !showTossModal && (
              <div className="toss-winner-selection">
                <h4>Who won the toss?</h4>
                <div className="team-buttons">
                  <button 
                    className={`team-btn ${tossWinner === selectedMatch?.team1 ? 'selected' : ''}`}
                    onClick={() => handleTossWin(selectedMatch?.team1)}
                  >
                    {selectedMatch?.team1}
                  </button>
                  <button 
                    className={`team-btn ${tossWinner === selectedMatch?.team2 ? 'selected' : ''}`}
                    onClick={() => handleTossWin(selectedMatch?.team2)}
                  >
                    {selectedMatch?.team2}
                  </button>
                </div>
              </div>
            )}

            {tossWinner && (
              <div className="toss-decision">
                <h4>{tossWinner} chooses to:</h4>
                <div className="decision-buttons">
                  <button 
                    className="decision-btn bat"
                    onClick={() => handleTossDecision('bat')}
                  >
                    🏏 Bat First
                  </button>
                  <button 
                    className="decision-btn bowl"
                    onClick={() => handleTossDecision('bowl')}
                  >
                    ⚾ Bowl First
                  </button>
                </div>
              </div>
            )}
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
              {currentInnings === 2 && (
                <div className="target-info">
                  <span className="target">Target: {team1Score.runs + 1}</span>
                  <span className="required">Need: {(team1Score.runs + 1) - team2Score.runs} runs</span>
                  <span className="balls-left">Balls left: {(totalOvers * 6) - team2Score.balls}</span>
                </div>
              )}
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
                {currentInnings === 1 && (
                  <span className="first-innings">First to bat</span>
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
              <button onClick={handleNoBall} className="no-ball-btn">No Ball +</button>
              <button onClick={() => recordBall(1, true, 'B')}>Bye</button>
              <button onClick={() => recordBall(1, true, 'LB')}>Leg Bye</button>
              <button onClick={() => recordBall(2, true, 'B')}>2 Byes</button>
              <button onClick={() => recordBall(4, true, 'B')}>4 Byes</button>
            </div>

            {/* No Ball Runs Selection Modal */}
            {showNoBallRuns && (
              <div className="nb-runs-modal">
                <div className="nb-runs-content">
                  <h4>No Ball + Additional Runs</h4>
                  <p>Select additional runs scored off the no ball:</p>
                  <div className="nb-runs-buttons">
                    <button onClick={() => recordNoBallRuns(0)} className="nb-run-btn">NB + 0</button>
                    <button onClick={() => recordNoBallRuns(1)} className="nb-run-btn">NB + 1</button>
                    <button onClick={() => recordNoBallRuns(2)} className="nb-run-btn">NB + 2</button>
                    <button onClick={() => recordNoBallRuns(3)} className="nb-run-btn">NB + 3</button>
                    <button onClick={() => recordNoBallRuns(4)} className="nb-run-btn">NB + 4</button>
                    <button onClick={() => recordNoBallRuns(5)} className="nb-run-btn">NB + 5</button>
                    <button onClick={() => recordNoBallRuns(6)} className="nb-run-btn">NB + 6</button>
                  </div>
                  <button onClick={cancelNoBall} className="cancel-nb-btn">Cancel</button>
                </div>
              </div>
            )}

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
              <button 
                className="switch-btn batsman"
                onClick={switchBatsmen}
              >
                🔄 Switch Batsmen
              </button>
              
              <button 
                className="switch-btn bowler"
                onClick={() => {
                  const newBowler = prompt('Enter new bowler name:');
                  if (newBowler) setCurrentBowler(newBowler);
                }}
              >
                🔄 Change Bowler
              </button>

              <button 
                className="change-over-btn"
                onClick={changeOver}
              >
                🏏 Change Over
              </button>

              <button 
                className="save-innings-btn"
                onClick={saveInnings}
              >
                💾 Save Innings
              </button>
              
              <button 
                className="innings-btn"
                onClick={switchInnings}
                title="Switch to next innings anytime"
              >
                🏏 Switch Innings
              </button>
              
              {currentInnings === 2 && (
                <button 
                  className="match-end-btn"
                  onClick={() => {
                    setMatchCompleted(true);
                    calculateMatchResult();
                    setStep('scorecard');
                  }}
                >
                  🏆 End Match
                </button>
              )}
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
