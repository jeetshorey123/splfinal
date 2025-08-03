import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WatchLive.css';

const WatchLive = () => {
  const youtubeChannelUrl = 'https://www.youtube.com/@PoonamSagarcharaja/streams';
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  const handleYouTubeRedirect = () => {
    window.open(youtubeChannelUrl, '_blank');
  };

  // Load tournaments and matches from local storage
  useEffect(() => {
    const savedTournaments = JSON.parse(localStorage.getItem('splTournaments') || '[]');
    const savedMatches = JSON.parse(localStorage.getItem('splMatches') || '[]');
    
    setTournaments(savedTournaments);
    
    if (savedTournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(savedTournaments[0].name);
    }
  }, []);

  // Filter upcoming matches when tournament changes
  useEffect(() => {
    if (selectedTournament) {
      const savedMatches = JSON.parse(localStorage.getItem('splMatches') || '[]');
      const tournamentMatches = savedMatches.filter(match => 
        match.tournament === selectedTournament && 
        match.status === 'scheduled'
      );
      setUpcomingMatches(tournamentMatches);
    }
  }, [selectedTournament]);

  const handleTournamentChange = (e) => {
    setSelectedTournament(e.target.value);
  };

  return (
    <div className="watch-live">
      <div className="watch-header">
        <h1>Watch Live</h1>
        <Link to="/" className="btn-back">Back to Home</Link>
      </div>

      <div className="watch-content">
        {/* YouTube Channel Redirect Section */}
        <div className="youtube-redirect-section">
          <div className="youtube-banner">
            <div className="youtube-info">
              <h2>🎥 Watch Live on YouTube</h2>
              <p>Don't miss any action! Watch all live matches and highlights on our official YouTube channel.</p>
              <button 
                onClick={handleYouTubeRedirect}
                className="youtube-btn"
              >
                <span className="youtube-icon">▶️</span>
                Watch on YouTube
              </button>
            </div>
            <div className="youtube-preview">
              <div className="youtube-placeholder">
                <span className="youtube-logo">📺</span>
                <p>Poonam Sagarcharaja</p>
                <span className="live-badge">🔴 LIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="upcoming-matches-section">
          <h2>Upcoming Matches</h2>
          
          {/* Tournament Selection */}
          <div className="tournament-selection">
            <label htmlFor="tournament-select">Select Tournament:</label>
            <select 
              id="tournament-select"
              value={selectedTournament}
              onChange={handleTournamentChange}
              className="tournament-select"
            >
              <option value="">Choose a tournament...</option>
              {tournaments.map(tournament => (
                <option key={tournament.id} value={tournament.name}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTournament ? (
            upcomingMatches.length > 0 ? (
              <div className="matches-grid">
                {upcomingMatches.map(match => (
                  <div key={match.id} className="match-card upcoming">
                    <div className="match-header">
                      <span className="upcoming-indicator">⏰ Upcoming</span>
                      <span className="match-time">{match.date}</span>
                    </div>
                    
                    <div className="match-teams">
                      <div className="team">
                        <h3>{match.team1}</h3>
                      </div>
                      
                      <div className="vs">vs</div>
                      
                      <div className="team">
                        <h3>{match.team2}</h3>
                      </div>
                    </div>
                    
                    <div className="match-info">
                      <span className="tournament-name">{selectedTournament}</span>
                      <button 
                        onClick={handleYouTubeRedirect}
                        className="reminder-btn"
                      >
                        Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-matches">
                <p>No upcoming matches found for {selectedTournament}</p>
                <button 
                  onClick={handleYouTubeRedirect}
                  className="youtube-btn-secondary"
                >
                  Check YouTube Channel
                </button>
              </div>
            )
          ) : (
            <div className="no-tournament">
              <p>Please select a tournament to view upcoming matches</p>
              {tournaments.length === 0 && (
                <div className="no-tournaments-msg">
                  <p>No tournaments available. Create a tournament in the Scoring section first.</p>
                  <Link to="/scoring" className="btn-primary">
                    Go to Scoring
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="highlights-section">
          <h2>Match Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-card" onClick={handleYouTubeRedirect}>
              <div className="highlight-thumbnail">
                <span className="play-icon">▶️</span>
              </div>
              <div className="highlight-info">
                <h3>Best Catches of the Day</h3>
                <p>Amazing fielding moments from today's matches</p>
                <span className="duration">5:23</span>
              </div>
            </div>
            
            <div className="highlight-card" onClick={handleYouTubeRedirect}>
              <div className="highlight-thumbnail">
                <span className="play-icon">▶️</span>
              </div>
              <div className="highlight-info">
                <h3>Top 10 Sixes</h3>
                <p>Monster hits that cleared the boundary</p>
                <span className="duration">8:45</span>
              </div>
            </div>
            
            <div className="highlight-card" onClick={handleYouTubeRedirect}>
              <div className="highlight-thumbnail">
                <span className="play-icon">▶️</span>
              </div>
              <div className="highlight-info">
                <h3>Bowling Masterclass</h3>
                <p>Unplayable deliveries and perfect yorkers</p>
                <span className="duration">6:12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional YouTube Call-to-Action */}
        <div className="youtube-cta">
          <div className="cta-content">
            <h3>📺 Subscribe to Our YouTube Channel</h3>
            <p>Get notified about live streams, match highlights, and exclusive content!</p>
            <button 
              onClick={handleYouTubeRedirect}
              className="subscribe-btn"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchLive; 