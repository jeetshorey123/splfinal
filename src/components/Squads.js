

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import './Squads.css';


const Squads = () => {
  const [teams, setTeams] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

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
    
    // Create a consolidated sheet with all teams
    const allPlayersData = [];
    teams.forEach(team => {
      if (team.players && team.players.length > 0) {
        team.players.forEach(player => {
          allPlayersData.push([
            player.name || '',
            player.soldPrice || player.basePrice || 0,
            team.name || '',
            player.role || '',
            player.auctionName || '',
            `₹${team.budget?.toLocaleString() || 0} left`
          ]);
        });
      }
    });
    
    const consolidatedWs = XLSX.utils.aoa_to_sheet([
      ['Player Name', 'Sold Amount', 'Team', 'Role', 'Auction Name', 'Team Budget Remaining'],
      ...allPlayersData
    ]);
    XLSX.utils.book_append_sheet(wb, consolidatedWs, 'All Teams');
    
    // Create individual sheets for each team
    teams.forEach(team => {
      if (team.players && team.players.length > 0) {
        const data = team.players.map(player => [
          player.name || '',
          player.soldPrice || player.basePrice || 0,
          team.name || '',
          player.role || '',
          player.auctionName || ''
        ]);
        const ws = XLSX.utils.aoa_to_sheet([
          ['Player Name', 'Sold Amount', 'Team', 'Role', 'Auction Name'],
          ...data
        ]);
        XLSX.utils.book_append_sheet(wb, ws, team.name.substring(0, 31));
      }
    });
    
    const fileName = `Squads_${selectedTournament?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Tournament'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
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

  // Save edited data to Supabase
  const handleSaveEdits = async () => {
    if (!selectedTournament) return;
    
    setLoading(true);
    try {
      // Update each team's budget
      for (const team of teams) {
        await supabase
          .from('teams')
          .update({ remaining_budget: team.budget })
          .eq('id', team.id);
      }
      
      setEditMode(false);
      alert('Squad data updated!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch tournaments from Supabase
  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAvailableTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  // Fetch squad data for selected tournament
  const fetchSquadData = async (tournamentId) => {
    setLoading(true);
    try {
      // Fetch teams for the tournament
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');
      
      if (teamsError) throw teamsError;

      // Fetch auction data (sold players) from auctions table
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          *,
          player_registrations (
            id,
            name,
            cricket_role,
            base_price
          ),
          teams (
            id,
            name
          )
        `)
        .eq('status', 'sold')
        .in('team_id', teamsData.map(t => t.id));
      
      if (auctionError) throw auctionError;

      // Group players by team and auction name
      const teamsWithPlayers = teamsData.map(team => {
        const teamPlayers = auctionData
          .filter(auction => auction.team_id === team.id)
          .map(auction => ({
            name: auction.player_registrations?.name || auction.player_name,
            role: auction.player_registrations?.cricket_role || auction.player_role,
            basePrice: auction.base_price || auction.player_registrations?.base_price,
            soldPrice: auction.sold_price || auction.final_bid,
            playerId: auction.player_id,
            auctionName: auction.auction_name
          }));

        return {
          id: team.id,
          name: team.name,
          budget: team.remaining_budget || team.current_budget,
          totalBudget: team.current_budget,
          players: teamPlayers,
          owner: team.owner_name,
          color: team.team_color
        };
      });

      setTeams(teamsWithPlayers);
    } catch (error) {
      console.error('Error fetching squad data:', error);
      alert('Error loading squad data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch tournaments from Supabase
    fetchTournaments();
  }, []);

  const handleViewSquad = async (tournament) => {
    setSelectedTournament(tournament);
    await fetchSquadData(tournament.id);
  };

  const handleDeleteTournament = async (tournament) => {
    if (window.confirm(`Delete tournament "${tournament.name}"? This will also delete all associated teams and data.`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('tournaments')
          .delete()
          .eq('id', tournament.id);
        
        if (error) throw error;
        
        // Refresh tournaments list
        await fetchTournaments();
        
        if (selectedTournament && selectedTournament.id === tournament.id) {
          setSelectedTournament(null);
          setTeams([]);
        }
        
        alert('Tournament deleted successfully!');
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert('Error deleting tournament: ' + error.message);
      } finally {
        setLoading(false);
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
          <h3>Available Tournaments</h3>
          {loading ? (
            <p>Loading tournaments...</p>
          ) : availableTournaments.length === 0 ? (
            <p>No tournaments found. Create a tournament first.</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1em' }}>
              {availableTournaments.map(tournament => (
                <div key={tournament.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, border: '1px solid #eee', borderRadius: 6, padding: 10 }}>
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    {tournament.name} 
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      {tournament.description} | Status: {tournament.status}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>
                      Created: {new Date(tournament.created_at).toLocaleDateString()}
                    </div>
                  </span>
                  <button
                    className="btn-primary"
                    style={{ marginRight: 8 }}
                    onClick={() => handleViewSquad(tournament)}
                    disabled={loading}
                  >
                    View Squad
                  </button>
                  <button
                    className="btn-danger"
                    style={{ fontSize: '0.9em', padding: '2px 8px' }}
                    onClick={() => handleDeleteTournament(tournament)}
                    disabled={loading}
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
        <div className="squads-content" style={{ maxWidth: 1200, margin: '2em auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ flex: 1 }}>Squads for: {selectedTournament.name}</h2>
            <button className="btn-secondary" onClick={() => { setSelectedTournament(null); setTeams([]); setSelectedTeam(''); }}>
              Back to Tournaments
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2em' }}>
              <p>Loading squad data...</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button className="btn-primary" onClick={handleDownloadExcel} disabled={!teams.length}>
                  Download Excel
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (!editMode) setAdminPrompt(true);
                    else setEditMode(false);
                  }}
                  disabled={!teams.length}
                >
                  {editMode ? 'Cancel Edit' : 'Edit Data'}
                </button>
                {editMode && (
                  <button className="btn-success" onClick={handleSaveEdits} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
              
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
              
              {/* Team selection dropdown */}
              {teams.length > 0 && (
                <>
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
                        <option key={team.id || idx} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                    {selectedTeam && (
                      <button className="btn-secondary" style={{ padding: '2px 10px', fontSize: '0.95em' }} onClick={() => setSelectedTeam('')}>
                        Clear
                      </button>
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
                                key={team.id || idx}
                                style={{
                                  borderRight: idx !== arr.length - 1 ? '3px solid #333' : undefined,
                                  borderLeft: idx === 0 ? '3px solid #333' : undefined,
                                  textAlign: 'center',
                                }}
                              >
                                {team.name}
                                <div style={{fontWeight:400, fontSize:'0.95em'}}>
                                  ₹{team.budget?.toLocaleString() || 0} left
                                </div>
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
                                  <td key={team.id || idx} style={{color:'#888', textAlign:'center'}}>No players sold</td>
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
                                if (!player) return <td key={team.id + '_' + rowIdx} style={borderStyle}></td>;
                                return (
                                  <td key={team.id + '_' + rowIdx} style={borderStyle}>
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
                                        <div style={{color:'#444', fontSize:'0.9em'}}>
                                          {player.role && <span style={{color:'#666'}}>({player.role})</span>}
                                        </div>
                                        <div style={{color:'#444'}}>
                                          ₹{player.soldPrice?.toLocaleString?.() || player.basePrice?.toLocaleString?.() || ''}
                                        </div>
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
                </>
              )}
              
              {teams.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '2em', color: '#666' }}>
                  <p>No teams found for this tournament.</p>
                  <p>Make sure you have created teams and conducted an auction for this tournament.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Squads; 