

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import './Squads.css';


const Squads = () => {
  const [teams, setTeams] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  // Handle editing player name
  const handlePlayerNameChange = (teamIdx, playerIdx, value) => {
    setTeams(prevTeams => {
      const newTeams = JSON.parse(JSON.stringify(prevTeams));
      newTeams[teamIdx].players[playerIdx].name = value;
      return newTeams;
    });
  };
  // Admin credentials (hardcoded for now)
  const ADMIN_ID = 'admin';
  const ADMIN_PASS = 'spl2025';

  // Download squad data as Excel
  const handleDownloadExcel = () => {
    if (!teams.length) return;
    const wb = XLSX.utils.book_new();
    teams.forEach(team => {
      const data = team.players.map(player => [player.name, player.soldPrice || player.basePrice || '', team.name]);
      const ws = XLSX.utils.aoa_to_sheet([
        ['Player Name', 'Sold Amount', 'Team'],
        ...data
      ]);
      XLSX.utils.book_append_sheet(wb, ws, team.name.substring(0, 31));
    });
    XLSX.writeFile(wb, `Squads_${selectedTournament?.name || 'Tournament'}.xlsx`);
  };

  // Handle editing player price
  const handlePlayerPriceChange = (teamIdx, playerIdx, value) => {
    setTeams(prevTeams => {
      const newTeams = JSON.parse(JSON.stringify(prevTeams));
      const price = parseInt(value) || 0;
      newTeams[teamIdx].players[playerIdx].soldPrice = price;
      return newTeams;
    });
  };

  // Save edited data to localStorage
  const handleSaveEdits = () => {
    if (!selectedTournament) return;
    const savedData = localStorage.getItem(selectedTournament.key);
    if (savedData) {
      const data = JSON.parse(savedData);
      data.teams = JSON.parse(JSON.stringify(teams));
      localStorage.setItem(selectedTournament.key, JSON.stringify(data));
      setEditMode(false);
      alert('Squad data updated!');
    }
  };
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [availableTournaments, setAvailableTournaments] = useState([]);

  useEffect(() => {
    // Find all saved tournaments
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('splAuctionData_'));
    const tournaments = allKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        key,
        name: data.auctionName || data.timestamp || key,
        timestamp: data.timestamp || '',
      };
    });
    setAvailableTournaments(tournaments);
  }, []);

  const handleViewSquad = (key) => {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      // Always use the teams as saved in the tournament snapshot
      const data = JSON.parse(savedData);
      // Deep clone to avoid accidental mutation
      const teamsSnapshot = data.teams ? JSON.parse(JSON.stringify(data.teams)) : [];
      setTeams(teamsSnapshot);
      setSelectedTournament({
        key,
        name: data.auctionName || data.timestamp || key,
        timestamp: data.timestamp || '',
      });
    }
  };

  const handleDeleteTournament = (key) => {
    if (window.confirm('Delete this tournament?')) {
      localStorage.removeItem(key);
      setAvailableTournaments(prev => prev.filter(x => x.key !== key));
      if (selectedTournament && selectedTournament.key === key) {
        setSelectedTournament(null);
        setTeams([]);
      }
    }
  };



  return (
    <div className="squads">
      <div className="squads-header">
        <h1>Team Squads</h1>
        <Link to="/" className="btn-back">Back to Home</Link>
      </div>

      {/* Tournament List */}
      {!selectedTournament && (
        <div className="tournament-list" style={{ maxWidth: 600, margin: '2em auto' }}>
          <h3>Saved Tournaments</h3>
          {availableTournaments.length === 0 ? (
            <p>No tournaments saved.</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1em' }}>
              {availableTournaments.map(a => (
                <div key={a.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, border: '1px solid #eee', borderRadius: 6, padding: 10 }}>
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    {a.name} ({a.timestamp && new Date(a.timestamp).toLocaleString()})
                  </span>
                  <button
                    className="btn-primary"
                    style={{ marginRight: 8 }}
                    onClick={() => handleViewSquad(a.key)}
                  >
                    View Squad
                  </button>
                  <button
                    className="btn-danger"
                    style={{ fontSize: '0.9em', padding: '2px 8px' }}
                    onClick={() => handleDeleteTournament(a.key)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Squad View */}
      {selectedTournament && (
        <div className="squads-content" style={{ maxWidth: 900, margin: '2em auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ flex: 1 }}>Squads for: {selectedTournament.name}</h2>
            <button className="btn-secondary" onClick={() => { setSelectedTournament(null); setTeams([]); setSelectedTeam(''); }}>Back to Tournaments</button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button className="btn-primary" onClick={handleDownloadExcel}>Download Excel</button>
            <button
              className="btn-secondary"
              onClick={() => {
                if (!editMode) setAdminPrompt(true);
                else setEditMode(false);
              }}
            >
              {editMode ? 'Cancel Edit' : 'Edit Data'}
            </button>
            {editMode && (
              <button className="btn-success" onClick={handleSaveEdits}>Save Changes</button>
            )}
          {/* Admin login modal */}
          {adminPrompt && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
                <h3 style={{marginBottom:16}}>Admin Login Required</h3>
                <div style={{marginBottom:12}}>
                  <label style={{fontWeight:500}}>Admin ID:</label><br/>
                  <input type="text" value={adminId} onChange={e => setAdminId(e.target.value)} style={{width:'100%',padding:6,marginTop:2}} autoFocus />
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{fontWeight:500}}>Password:</label><br/>
                  <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{width:'100%',padding:6,marginTop:2}} />
                </div>
                {adminError && <div style={{color:'red',marginBottom:10}}>{adminError}</div>}
                <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                  <button className="btn-secondary" onClick={() => { setAdminPrompt(false); setAdminId(''); setAdminPass(''); setAdminError(''); }}>Cancel</button>
                  <button className="btn-primary" onClick={() => {
                    if (adminId === ADMIN_ID && adminPass === ADMIN_PASS) {
                      setEditMode(true);
                      setAdminPrompt(false);
                      setAdminId('');
                      setAdminPass('');
                      setAdminError('');
                    } else {
                      setAdminError('Invalid admin ID or password');
                    }
                  }}>Login</button>
                </div>
              </div>
            </div>
          )}
          </div>
          {/* Team selection dropdown */}
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="teamSelect" style={{ marginRight: 8, fontWeight: 500 }}>Choose Team:</label>
            <select
              id="teamSelect"
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              style={{ minWidth: 180, marginRight: 10 }}
            >
              <option value="">-- All Teams --</option>
              {teams.map((team, idx) => (
                <option key={team.name + idx} value={team.name}>{team.name}</option>
              ))}
            </select>
            {selectedTeam && (
              <button className="btn-secondary" style={{ padding: '2px 10px', fontSize: '0.95em' }} onClick={() => setSelectedTeam('')}>Clear</button>
            )}
          </div>
          <div className="teams-table-container">
            <table className="table table-bordered table-hover table-striped bg-white">
              <thead className="table-dark">
                <tr>
                  {teams
                    .filter(team => !selectedTeam || team.name === selectedTeam)
                    .map((team, idx, arr) => (
                      <th
                        key={team.name + idx}
                        style={{
                          borderRight: idx !== arr.length - 1 ? '3px solid #333' : undefined,
                          borderLeft: idx === 0 ? '3px solid #333' : undefined,
                          textAlign: 'center',
                        }}
                      >
                        {team.name}
                        <div style={{fontWeight:400, fontSize:'0.95em'}}>₹{team.budget.toLocaleString()} left</div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Get filtered teams
                  const filteredTeams = teams.filter(team => !selectedTeam || team.name === selectedTeam);
                  if (filteredTeams.length === 0) {
                    return (
                      <tr><td colSpan={1} style={{textAlign:'center', color:'#888'}}>No teams</td></tr>
                    );
                  }
                  // Find max players in any team
                  const maxPlayers = Math.max(...filteredTeams.map(t => (t.players ? t.players.length : 0)), 0);
                  if (maxPlayers === 0) {
                    return (
                      <tr>
                        {filteredTeams.map((team, idx) => (
                          <td key={team.name + idx} style={{color:'#888'}}>No players</td>
                        ))}
                      </tr>
                    );
                  }
                  // Render rows for each player index
                  return Array.from({ length: maxPlayers }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {filteredTeams.map((team, teamIdx, arr) => {
                        const player = team.players && team.players[rowIdx];
                        const borderStyle = {
                          borderRight: teamIdx !== arr.length - 1 ? '3px solid #333' : undefined,
                          borderLeft: teamIdx === 0 ? '3px solid #333' : undefined,
                          textAlign: 'center',
                        };
                        if (!player) return <td key={team.name + teamIdx} style={borderStyle}></td>;
                        return (
                          <td key={team.name + teamIdx} style={borderStyle}>
                            {editMode ? (
                              <>
                                <input
                                  type="text"
                                  value={player.name}
                                  onChange={e => handlePlayerNameChange(teams.indexOf(team), rowIdx, e.target.value)}
                                  style={{ width: 120, padding: '2px 4px', marginBottom: 4 }}
                                /><br/>
                                <input
                                  type="number"
                                  min="0"
                                  value={player.soldPrice ?? player.basePrice ?? ''}
                                  onChange={e => handlePlayerPriceChange(teams.indexOf(team), rowIdx, e.target.value)}
                                  style={{ width: 90, padding: '2px 4px' }}
                                />
                              </>
                            ) : (
                              <>
                                <div style={{fontWeight:500}}>{player.name}</div>
                                <div style={{color:'#444'}}>₹{player.soldPrice?.toLocaleString?.() || player.basePrice?.toLocaleString?.() || ''}</div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default Squads; 