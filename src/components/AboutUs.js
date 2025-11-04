import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

const AboutUs = () => {
  React.useEffect(() => {
    const themeAudio = new window.Audio('/sankalp-premier-league.mp3');
    themeAudio.volume = 1.0;
    themeAudio.play().catch(() => {});
    return () => {
      themeAudio.pause();
      themeAudio.currentTime = 0;
    };
  }, []);
  return (
    <div className="about-us">
      <div className="about-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/spl.jpg" alt="SPL Logo" className="spl-logo" />
            <h1>About Sankalp Premier League</h1>
          </div>
          <Link to="/" className="btn-back">Back to Home</Link>
        </div>
      </div>

      <div className="about-content">
        {/* Hero Section with Main Image */}
        <div className="hero-section">
          <div className="hero-image">
            <img src="/aboutusteam.jpg" alt="SPL Hero" className="hero-img" />
          </div>
          <div className="hero-content">
            <h2>Welcome to SPL</h2>
            <p>
              Sankalp Premier League (SPL) is a revolutionary cricket league that brings together 
              the excitement of live auctions, strategic team building, and competitive gameplay. 
              Our platform offers a unique blend of fantasy cricket and real-time auction dynamics, 
              creating an immersive experience for cricket enthusiasts.
            </p>
          </div>
        </div>

        {/* Features Section with Image */}
        <div className="features-section">
          <div className="section-image">
            <img src="/aboutus2.jpg" alt="SPL Features" className="section-img" />
          </div>
          <div className="features-content">
            <h2>Our Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Live Auctions</h3>
                <p>Experience the thrill of real-time player auctions with dynamic bidding and strategic team building.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Team Management</h3>
                <p>Build and manage your dream team with a budget of ₹10,000 and compete against other teams.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Performance Tracking</h3>
                <p>Track player statistics, team performance, and maintain detailed scoring records.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3>Interactive Experience</h3>
                <p>Engage with live matches, real-time updates, and comprehensive league management.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section with Image */}
        <div className="mission-section">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              At SPL, we believe in making cricket more accessible and engaging for everyone. 
              Our mission is to create a platform where fans can experience the excitement of 
              team ownership, strategic decision-making, and competitive gameplay in a fun and 
              interactive environment.
            </p>
          </div>
          <div className="section-image">
            <img src="/aboutus3.jpg" alt="SPL Mission" className="section-img" />
          </div>
        </div>

        {/* How It Works Section with Image */}
        <div className="how-it-works">
          <div className="section-image">
            <img src="/aboutus4.jpg" alt="How SPL Works" className="section-img" />
          </div>
          <div className="steps-content">
            <h2>How It Works</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Create Teams</h3>
                <p>Set up your teams and prepare for the auction with a ₹10,000 budget.</p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Upload Players</h3>
                <p>Upload your player list via Excel file with names and base prices.</p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Live Auction</h3>
                <p>Participate in real-time auctions to acquire your favorite players.</p>
              </div>

              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Track Performance</h3>
                <p>Monitor player statistics and team performance throughout the season.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Experience Section with Image */}
        <div className="tournament-section">
          <div className="tournament-content">
            <h2>Tournament Experience</h2>
            <p>
              Experience the thrill of competitive cricket with our comprehensive tournament system. 
              From auction to finals, every moment is designed to keep you engaged and excited. 
              Watch your team grow, strategize for matches, and celebrate victories together.
            </p>
          </div>
          <div className="section-image">
            <img src="/aboutus5.jpg" alt="SPL Tournament" className="section-img" />
          </div>
        </div>

        {/* Meet Our Team Section */}
        <div className="team-section">
          <h2>Meet Our Team</h2>
          <div className="team-member">
            <div className="member-image">
              <img src="/aboutus6.jpg" alt="Mr. Ashish Pandey" className="member-img" />
            </div>
            <div className="member-info">
              <h3>Mr. Ashish Pandey</h3>
              <p className="member-role">Auctioneer & Commentator</p>
              <p className="member-description">
                Meet the charismatic voice behind SPL auctions and matches! Mr. Ashish Pandey brings 
                years of experience in cricket commentary and auctioneering. His dynamic personality 
                and deep knowledge of the game make every auction session and match commentary an 
                unforgettable experience. With his engaging style and professional approach, he ensures 
                that every moment of SPL is filled with excitement and entertainment.
              </p>
              <div className="member-quote">
                <em>"Cricket is not just a game, it's an emotion that brings people together."</em>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="contact-section">
          <h2>Get Started Today</h2>
          <p>Ready to experience the excitement of Sankalp Premier League?</p>
          <div className="cta-buttons">
            <Link to="/live-auction" className="btn-primary">Start Auction</Link>
            <Link to="/score-board" className="btn-secondary">View Scoreboard</Link>
            <Link to="/scoring" className="btn-tertiary">Create Tournament</Link>
          </div>
        </div>
      </div>
      {/* Photo gallery stacked below description */}
      <div className="container-wide photos-panel">
        <h2 className="section-header">Gallery</h2>
        <div className="photos-list panel">
          <img src="/aboutusteam.jpg" alt="SPL Team" />
          <img src="/aboutus2.jpg" alt="Features" />
          <img src="/aboutus3.jpg" alt="Mission" />
          <img src="/aboutus4.jpg" alt="How it works" />
          <img src="/aboutus5.jpg" alt="Tournament" />
          <img src="/aboutus6.jpg" alt="Team" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 