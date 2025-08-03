import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

import PlayerRegistration from './PlayerRegistration';

const Home = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  return (
    <div className="home">
      {/* Hero Banner with Enhanced Design */}
      <div className="hero-banner">
        {/* Animated Background Elements */}
        <div className="animated-bg">
          <div className="floating-ball ball-1">🏏</div>
          <div className="floating-ball ball-2">🏆</div>
          <div className="floating-ball ball-3">⚡</div>
          <div className="floating-ball ball-4">🎯</div>
        </div>
        
        {/* Title Sponsor Section */}
        <div className="sponsor-header">
          <div className="sponsor-badge">
            <span className="sponsor-label">Title Sponsor</span>
            <div className="sponsor-name">IMPERIAL LIFESTYLE</div>
            <div className="sponsor-tagline">Where your family is our family!</div>
          </div>
        </div>
        
        {/* Main Hero Content */}
        <div className="hero-main">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line-1">SANKALP</span>
              <span className="title-line-2">PREMIER LEAGUE</span>
            </h1>
            <p className="hero-subtitle">Experience the thrill of cricket like never before</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">8</span>
                <span className="stat-label">Teams</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Players</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Live</span>
                <span className="stat-label">Auctions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions Section */}
      <div className="quick-actions">
        <div className="section-header">
          <h2>Quick Access</h2>
          <p>Jump into the action with these popular features</p>
        </div>
        <div className="action-grid">
          <div className="action-card primary" onClick={() => setShowRegistration(true)}>
            <div className="card-icon">📝</div>
            <h3>Player Registration</h3>
            <p>Join the league and register as a player</p>
            <div className="card-arrow">→</div>
          </div>
          <Link to="/live-auction" className="action-card secondary">
            <div className="card-icon">🏆</div>
            <h3>Live Auction</h3>
            <p>Participate in exciting player auctions</p>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/scoring" className="action-card tertiary">
            <div className="card-icon">🎯</div>
            <h3>Live Scoring</h3>
            <p>Track matches and performance in real-time</p>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="features-showcase">
        <div className="section-header">
          <h2>League Features</h2>
          <p>Everything you need for the ultimate cricket experience</p>
        </div>
        <div className="features-grid-new">
          <Link to="/score-board" className="feature-card-new score">
            <div className="card-bg"></div>
            <div className="card-content">
              <div className="feature-icon-new">📊</div>
              <h3>Score Board</h3>
              <p>Live scores, standings, and match statistics</p>
            </div>
          </Link>
          <Link to="/squads" className="feature-card-new squad">
            <div className="card-bg"></div>
            <div className="card-content">
              <div className="feature-icon-new">👥</div>
              <h3>Team Squads</h3>
              <p>View team compositions and player details</p>
            </div>
          </Link>
          <Link to="/schedule" className="feature-card-new schedule">
            <div className="card-bg"></div>
            <div className="card-content">
              <div className="feature-icon-new">📅</div>
              <h3>Tournament Schedule</h3>
              <p>Generate and manage match schedules</p>
            </div>
          </Link>
          <Link to="/latest-news" className="feature-card-new news">
            <div className="card-bg"></div>
            <div className="card-content">
              <div className="feature-icon-new">�</div>
              <h3>Latest News</h3>
              <p>Stay updated with league news and updates</p>
            </div>
          </Link>
        </div>
      </div>
      {/* Sponsors Section */}
      <div className="sponsors-section">
        <div className="section-header">
          <h2>Our Sponsors</h2>
          <p>Proud partners supporting the Sankalp Premier League</p>
        </div>
        <div className="sponsors-grid">
          {[...Array(8)].map((_, i) => {
            const num = i + 1;
            const imgSrc = process.env.PUBLIC_URL + `/sponsor${num}.jpg`;
            return (
              <div key={i} className="sponsor-card">
                <img
                  src={imgSrc}
                  alt={`Sponsor ${num}`}
                  className="sponsor-logo"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-icon">�</div>
            <div className="stat-number">50+</div>
            <div className="stat-label">Matches Played</div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">👥</div>
            <div className="stat-number">200+</div>
            <div className="stat-label">Registered Players</div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">🏆</div>
            <div className="stat-number">8</div>
            <div className="stat-label">Teams Competing</div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">⚡</div>
            <div className="stat-number">Live</div>
            <div className="stat-label">Real-time Updates</div>
          </div>
        </div>
      </div>
      {showRegistration && (
        <PlayerRegistration onClose={() => setShowRegistration(false)} />
      )}
    {/* Footer Section */}
    <footer className="home-footer" style={{marginTop:40, padding:'18px 0', background:'#f8f8f8', borderTop:'1px solid #e0e0e0', textAlign:'center'}}>
      <button
        className="footer-link"
        style={{margin:'0 12px', background:'none', border:'none', color:'#007bff', cursor:'pointer', fontSize:'1em', textDecoration:'underline'}}
        onClick={() => setShowPrivacy(true)}
      >
        Privacy Policy
      </button>
      <button
        className="footer-link"
        style={{margin:'0 12px', background:'none', border:'none', color:'#007bff', cursor:'pointer', fontSize:'1em', textDecoration:'underline'}}
        onClick={() => setShowTerms(true)}
      >
        Terms &amp; Conditions
      </button>
      <button
        className="footer-link"
        style={{margin:'0 12px', background:'none', border:'none', color:'#007bff', cursor:'pointer', fontSize:'1em', textDecoration:'underline'}}
        onClick={() => window.open('https://www.sponsorpage.com', '_blank')}
      >
        Sponsor
      </button>
      <span
        className="footer-link"
        style={{margin:'0 12px', color:'#007bff', fontSize:'1em', fontWeight:500, verticalAlign:'middle'}}
      >
        Support: Jeet Shorey 9833232395
      </span>
    </footer>

    {/* Privacy Policy Modal */}
    {showPrivacy && (
      <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.35)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',borderRadius:8,padding:32,maxWidth:700,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 2px 16px #0002',position:'relative'}}>
          <button style={{position:'absolute',top:10,right:16,fontSize:22,border:'none',background:'none',cursor:'pointer'}} onClick={()=>setShowPrivacy(false)}>&times;</button>
          <h2 style={{marginBottom:8}}>🛡️ Privacy Policy</h2>
          <div style={{fontSize:'1.05em',textAlign:'left'}}>
            <b>Effective Date:</b> July 31, 2025<br/>
            <b>Organizer:</b> Jeet Shorey (shoreyjeet@gmail.com)
            <ol style={{marginTop:16}}>
              <li><b>Introduction</b><br/>Sankalp Premier League (SPL) values your privacy. This policy explains how we collect, use, and protect your personal data during the registration and participation process for SPL, including live auctions and events.</li>
              <li><b>Data We Collect</b><br/>
                <ul>
                  <li>Personal Information: Name, age, phone number, email address, address.</li>
                  <li>Cricket Information: Player role, experience, past teams/clubs.</li>
                  <li>Transaction Data: Payment details during registration or auctions (via secure third-party platforms).</li>
                  <li>Device Info: IP address, browser type (for online auction viewers or participants).</li>
                </ul>
              </li>
              <li><b>How We Use Your Data</b><br/>
                <ul>
                  <li>To manage tournament registration and player eligibility.</li>
                  <li>To conduct and display auction details (e.g. names, teams, base price).</li>
                  <li>To communicate event-related information (via email, WhatsApp, or phone).</li>
                  <li>For internal analytics and event improvements.</li>
                </ul>
              </li>
              <li><b>Data Sharing</b><br/>
                We do not sell your data. Limited data may be shared:
                <ul>
                  <li>With team managers or organizers for auction and team formation.</li>
                  <li>With payment gateways for secure processing.</li>
                  <li>With legal authorities if required by law.</li>
                </ul>
              </li>
              <li><b>Data Security</b><br/>We use secure servers, encrypted storage, and trusted platforms to protect your data. However, no system is 100% immune, so we encourage users to avoid sharing sensitive personal info beyond what's necessary.</li>
              <li><b>Your Rights</b><br/>
                You may request:
                <ul>
                  <li>Access to your data</li>
                  <li>Correction of inaccurate data</li>
                  <li>Deletion of your data (subject to event status)</li>
                </ul>
                To do so, contact: <a href="mailto:shoreyjeet@gmail.com">shoreyjeet@gmail.com</a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    )}

    {/* Terms & Conditions Modal */}
    {showTerms && (
      <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.35)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',borderRadius:8,padding:32,maxWidth:700,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 2px 16px #0002',position:'relative'}}>
          <button style={{position:'absolute',top:10,right:16,fontSize:22,border:'none',background:'none',cursor:'pointer'}} onClick={()=>setShowTerms(false)}>&times;</button>
          <h2 style={{marginBottom:8}}>📜 Terms and Conditions (T&amp;C)</h2>
          <div style={{fontSize:'1.05em',textAlign:'left'}}>
            <b>SPL – Sankalp Premier League Cricket Tournament &amp; Auction Live</b>
            <ol style={{marginTop:16}}>
              <li><b>Eligibility</b><br/>
                Open to individuals aged 16 and above.<br/>
                Players must register with accurate and verifiable details.<br/>
                Organizers reserve the right to verify identity and deny entry if rules are breached.
              </li>
              <li><b>Registration &amp; Fees</b><br/>
                Registration is only valid upon successful payment.<br/>
                Fees are non-refundable except in case of event cancellation by the organizer.
              </li>
              <li><b>Player Auction</b><br/>
                Players will be auctioned live via an online/offline platform.<br/>
                Bidding teams must follow SPL auction rules shared prior to the event.<br/>
                Final team decisions are binding.
              </li>
              <li><b>Code of Conduct</b><br/>
                Players and team members must exhibit sportsmanship on and off the field.<br/>
                Abuse, cheating, or violence will lead to disqualification.<br/>
                SPL reserves the right to ban or remove participants violating the code of conduct.
              </li>
              <li><b>Media Release</b><br/>
                By participating, you consent to:
                <ul>
                  <li>Use of your photos/videos in SPL promotions or broadcasts.</li>
                  <li>Name and team being listed on websites, social media, or streams.</li>
                </ul>
              </li>
              <li><b>Event Changes</b><br/>
                SPL reserves the right to:
                <ul>
                  <li>Reschedule matches</li>
                  <li>Change venues</li>
                  <li>Modify rules in case of unforeseen circumstances</li>
                </ul>
                All changes will be communicated through official channels (email, WhatsApp, or website).
              </li>
              <li><b>Liability</b><br/>
                SPL and its organizers are not responsible for:
                <ul>
                  <li>Personal injuries during matches</li>
                  <li>Loss or theft of personal belongings</li>
                  <li>Technical issues during live auction streams</li>
                </ul>
              </li>
              <li><b>Contact</b><br/>
                For any questions, email the organizer:<br/>
                <a href="mailto:shoreyjeet@gmail.com">shoreyjeet@gmail.com</a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Home;