import React from 'react';
import { Link } from 'react-router-dom';
import './LatestNews.css';

const LatestNews = () => {
  const newsArticles = [
    {
      id: 1,
      title: 'SPL Season 1 Concludes with a Thrilling Finale',
      excerpt: 'Sankalp Legends are the 2025 SPL champions! Prateek scored the most runs and was named Player of the Match.',
      category: 'Tournament',
      date: '2025-06-01',
      readTime: '2 min read',
      image: '/aboutus.jpg',
      isImage: true,
      fullArticle: `The much-anticipated Season 1 of the Sankalp Premier League (SPL) concluded in grand style on January 26, 2025, delivering a spectacular display of cricketing talent and sportsmanship. The finals saw Sankalp Legends clinch the championship title after a fierce battle against Sankalp Warriors. The match, held in front of an energetic crowd, was filled with gripping moments and brilliant performances from both sides.\n\nSankalp Legends emerged victorious with a well-rounded team performance, showcasing depth in both batting and bowling. Leading from the front was Prateek Gond, whose consistent excellence throughout the tournament earned him the prestigious *Man of the Tournament* award. His all-round skills and match-winning contributions played a pivotal role in the Legends’ journey to the title.\n\nSPL Season 1 has set a high benchmark, creating a platform for budding talent and community engagement. Fans now eagerly await what Season 2 will bring to the cricketing arena.`
    },
    // Optionally, keep other news below
    {
      id: 2,
      title: 'Mumbai Indians Dominate Opening Match',
      excerpt: 'Mumbai Indians started their campaign with a spectacular win against Chennai Super Kings, scoring 185/6 in their 20 overs.',
      category: 'Match Report',
      date: '2024-01-15',
      readTime: '3 min read',
      image: '🏏'
    },
    {
      id: 3,
      title: 'New Auction System Revolutionizes Team Building',
      excerpt: 'The innovative live auction system has transformed how teams are built, with real-time bidding creating unprecedented excitement.',
      category: 'Feature',
      date: '2024-01-14',
      readTime: '5 min read',
      image: '🏆'
    },
    {
      id: 4,
      title: 'Player Performance Tracking Gets Major Update',
      excerpt: 'Enhanced statistics tracking now includes detailed player analytics, making team management more strategic than ever.',
      category: 'Technology',
      date: '2024-01-13',
      readTime: '4 min read',
      image: '📊'
    },
    {
      id: 5,
      title: 'Record Breaking Opening Ceremony',
      excerpt: 'The SPL opening ceremony witnessed record attendance with spectacular performances and team introductions.',
      category: 'Event',
      date: '2024-01-12',
      readTime: '2 min read',
      image: '🎉'
    },
    {
      id: 6,
      title: 'Fantasy Cricket Integration Announced',
      excerpt: 'SPL announces integration with fantasy cricket platforms, allowing fans to create their dream teams.',
      category: 'Announcement',
      date: '2024-01-11',
      readTime: '3 min read',
      image: '🎮'
    },
    {
      id: 7,
      title: 'Team Strategies Revealed',
      excerpt: 'Coaches and team managers share their strategies for the upcoming season and auction tactics.',
      category: 'Strategy',
      date: '2024-01-10',
      readTime: '6 min read',
      image: '🧠'
    }
  ];

  const featuredNews = newsArticles[0];
  const [showFullArticle, setShowFullArticle] = React.useState(false);

  // SPL Season 1 Teams Data
  const splTeams = [
    {
      name: 'Sankalp Mavericks',
      players: [
        'Ajay seth', 'Nilesh Sharma', 'Rishi', 'Pratham', 'Kartik gond', 'ankit jha', 'Jatin Toshniwal', 'AJIT KUMAR', 'Deepak dama'
      ]
    },
    {
      name: 'Sankalp Thunderbolts',
      players: [
        'Nitin Shorey', 'Rishabh Singh', 'Nilesh Vishwakarma', 'Deep Dama', 'Sahil Rastogi', 'Rupesh singh', 'Nikhil Waghela', 'aayan', 'Amit Bhardwaj'
      ]
    },
    {
      name: 'Sankalp Warriors',
      players: [
        'Aryan Singh', 'Jignesh Mehta', 'Pramod Rane', 'Hait dama', 'Anuj Doshi', 'Kailash jain', 'tanish shetty', 'Monish Shastri', 'manish sharma'
      ]
    },
    {
      name: 'Sankalp Legends',
      players: [
        'Yuvraj Singh', 'Viraj singh', 'Aaryan mistry', 'Kalash', 'Ankur', 'Sunil Bohra', 'navin', 'prakash kadam', 'omkar'
      ]
    },
    {
      name: 'Sankalp Strikers',
      players: [
        'Jeet shorey', 'gopal reejhwai', 'Jimmy mehta', 'Mitesh Mistry', 'Veer dama', 'Girish kabra', 'Aryan Singh', 'Nikunj Toshniwal', 'manoj mishra'
      ]
    },
    {
      name: 'Sankalp Valliants',
      players: [
        'Sadashiva Devadiga', 'Harish Jetli', 'meet dama', 'PARTH DOSHI', 'VIVEK MEHRA', 'Abhishek seth', 'Mihir Makwana', 'Rakesh singh', 'Lakshank Furiya'
      ]
    }
  ];

  const [showTeams, setShowTeams] = React.useState(false);
  const [openTeamIdx, setOpenTeamIdx] = React.useState(null);
  const audioRef = React.useRef(null);

  // Map team names to anthem file names (must match files in public/)
  const teamAnthemFiles = {
    'Sankalp Mavericks': 'sankalp-mavericks2.mp3',
    'Sankalp Thunderbolts': 'sankalp-thunderbolts.mp3',
    'Sankalp Warriors': 'sankalp-valiants-event.mp3',
    'Sankalp Legends': 'sankalp-legends.mp3',
    'Sankalp Strikers': 'sankalp-strikers-(remastered).mp3',
    'Sankalp Valliants': 'sankalp-valiants-event.mp3',
  };

  // Play anthem when a team is opened
  React.useEffect(() => {
    if (openTeamIdx !== null && splTeams[openTeamIdx]) {
      const anthem = teamAnthemFiles[splTeams[openTeamIdx].name];
      if (anthem && audioRef.current) {
        audioRef.current.src = `/${anthem}`;
        audioRef.current.play().catch(() => {});
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop anthem on tab close or move
    const handleVisibility = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleVisibility);
    };
    // eslint-disable-next-line
  }, [openTeamIdx]);



  return (
    <div className="latest-news">
      <div className="news-header">
        <h1>Latest News</h1>
        <Link to="/" className="btn-back">Back to Home</Link>
      </div>

      <div className="news-content">
        <div className="featured-news">
          <h2>Featured Story</h2>
          <div className="featured-card">
            <div className="featured-image">
              {featuredNews.isImage ? (
                <img src={featuredNews.image} alt="Sankalp Legends win SPL" className="featured-img" style={{ width: '100%', height: 'auto', maxHeight: 350, objectFit: 'cover', borderRadius: '12px' }} />
              ) : (
                <span className="news-icon">{featuredNews.image}</span>
              )}
            </div>
            <div className="featured-content">
              <div className="news-meta">
                <span className="category">{featuredNews.category}</span>
                <span className="date">{featuredNews.date}</span>
                <span className="read-time">{featuredNews.readTime}</span>
              </div>
              <h3>{featuredNews.title}</h3>
              {showFullArticle ? (
                <div className="full-article">
                  {featuredNews.fullArticle.split('\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              ) : (
                <>
                  <p>{featuredNews.excerpt}</p>
                  <button className="read-more-btn" onClick={() => setShowFullArticle(true)}>Read Full Article</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SPL Season 1 Teams Blog */}
        <div className="teams-blog" style={{ marginTop: 32, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
          <h2 style={{ color: '#2a5298', textAlign: 'center', marginBottom: 16 }}>SPL Season 1 Teams</h2>
          <p style={{ textAlign: 'center', marginBottom: 16 }}>There were 6 teams participating in SPL Season 1.</p>
          <div className="teams-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
            {splTeams.map((team, idx) => (
              <div key={team.name} style={{ minWidth: 220, background: '#f8f9fa', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(42,82,152,0.07)', textAlign: 'center' }}>
                {/* Show logo for Sankalp Strikers, Legends, Warriors, Valliants, Thunderbolts, or Mavericks when open */}
                {openTeamIdx === idx && team.name === 'Sankalp Strikers' && (
                  <img src="/sankalp-strikers-logo.jpg" alt="Sankalp Strikers Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px' }} />
                )}
                {openTeamIdx === idx && team.name === 'Sankalp Legends' && (
                  <img src="/sankalp-legends-logo.jpg" alt="Sankalp Legends Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px' }} />
                )}
                {openTeamIdx === idx && team.name === 'Sankalp Warriors' && (
                  <img src="/sankalp-warriors-logo.jpg" alt="Sankalp Warriors Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px' }} />
                )}
                {openTeamIdx === idx && team.name === 'Sankalp Valliants' && (
                  <img src="/sankalp-valliants-logo.jpg" alt="Sankalp Valliants Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px' }} />
                )}
                {openTeamIdx === idx && team.name === 'Sankalp Thunderbolts' && (
                  <img src="/sankalp-thunderbolts-logo.jpg" alt="Sankalp Thunderbolts Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px' }} />
                )}
                {openTeamIdx === idx && team.name === 'Sankalp Mavericks' && (
                  <img src="/sankalp-mavericks-logo.jpg" alt="Sankalp Mavericks Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px' }} />
                )}
                <h3 style={{ color: '#1e3c72', fontSize: 18, marginBottom: 8 }}>{team.name}</h3>
                <button className="read-more-btn" style={{ fontSize: 14, padding: '0.4rem 1rem', marginBottom: 8 }} onClick={() => setOpenTeamIdx(openTeamIdx === idx ? null : idx)}>
                  {openTeamIdx === idx ? 'Hide Team' : 'View Team'}
                </button>
                {openTeamIdx === idx && (
                  <>
                    <audio ref={audioRef} style={{ display: 'none' }} />
                    <ul style={{ paddingLeft: 18, margin: 0, marginTop: 8 }}>
                      {team.players.map((player, i) => {
                        // Captains by name
                        const captains = {
                          'Sankalp Mavericks': 'Nilesh Sharma',
                          'Sankalp Thunderbolts': 'Nitin Shorey',
                          'Sankalp Warriors': 'Jignesh Mehta',
                          'Sankalp Legends': 'prakash kadam',
                          'Sankalp Strikers': 'Jimmy mehta',
                          'Sankalp Valliants': 'VIVEK MEHRA',
                        };
                        const isCaptain = player === captains[team.name];
                        return (
                          <li key={i} style={{ fontWeight: isCaptain ? 700 : 400, color: isCaptain ? '#2a5298' : '#222' }}>
                            {isCaptain ? <b>{player} <span style={{fontWeight:400, color:'#0af'}}>(c)</span></b> : player}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter section remains */}
        <div className="newsletter-section">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest SPL news and updates</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="email-input"
            />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestNews; 