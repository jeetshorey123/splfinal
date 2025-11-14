import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './LiveAuction.css';

const LiveAuctionPublic = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [teams, setTeams] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);

  useEffect(() => {
    loadAuctions();
  }, []);

  useEffect(() => {
    if (!selectedAuction) return;

    loadTeams(selectedAuction.id);
    loadSoldPlayers(selectedAuction.id);

    const teamsChannel = supabase
      .channel('simple_teams_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'simple_teams', filter: `auction_id=eq.${selectedAuction.id}` }, 
        () => {
          loadTeams(selectedAuction.id);
        }
      )
      .subscribe();

    const salesChannel = supabase
      .channel('simple_sales_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'simple_player_sales', filter: `auction_id=eq.${selectedAuction.id}` },
        () => {
          loadSoldPlayers(selectedAuction.id);
        }
      )
      .subscribe();

    return () => {
      teamsChannel.unsubscribe();
      salesChannel.unsubscribe();
    };
  }, [selectedAuction]);

  const loadAuctions = async () => {
    try {
      const { data, error } = await supabase
        .from('simple_auctions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const activeAuctions = data || [];
      setAuctions(activeAuctions);
      
      // Don't auto-select, let user choose from dropdown
    } catch (error) {
      console.error('Error loading auctions:', error);
    }
  };

  const handleAuctionSelect = (e) => {
    const auctionId = parseInt(e.target.value);
    const auction = auctions.find(a => a.id === auctionId);
    setSelectedAuction(auction);
  };

  const loadTeams = async (auctionId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('simple_teams')
        .select('*')
        .eq('auction_id', auctionId)
        .order('team_name', { ascending: true });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSoldPlayers = async (auctionId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('simple_player_sales')
        .select('*')
        .eq('auction_id', auctionId)
        .order('sale_time', { ascending: false });

      if (error) throw error;
      
      const allPlayers = data || [];
      setSoldPlayers(allPlayers.filter(p => p.transaction_type === 'sold'));
      setUnsoldPlayers(allPlayers.filter(p => p.transaction_type === 'unsold'));
    } catch (error) {
      console.error('Error loading sold players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = async (team) => {
    setSelectedTeam(team);
    
    // Load all players for this team
    try {
      const { data, error } = await supabase
        .from('simple_player_sales')
        .select('*')
        .eq('auction_id', selectedAuction.id)
        .eq('team_id', team.id)
        .eq('transaction_type', 'sold')
        .order('sale_time', { ascending: false });

      if (error) throw error;
      setTeamPlayers(data || []);
    } catch (error) {
      console.error('Error loading team players:', error);
      setTeamPlayers([]);
    }
  };

  const closeTeamModal = () => {
    setSelectedTeam(null);
    setTeamPlayers([]);
  };

  // Calculate team statistics
  const getTeamStats = (team) => {
    const teamSoldPlayers = soldPlayers.filter(p => p.team_id === team.id);
    const totalSpent = teamSoldPlayers.reduce((sum, player) => sum + (player.sale_price || 0), 0);
    const playerCount = teamSoldPlayers.length;
    
    return {
      totalSpent,
      playerCount,
      remainingBudget: team.remaining_budget || 0,
      totalBudget: team.total_budget || 0
    };
  };

  return (
    <div className="live-auction-container">
      <div className="live-auction-header">
        <h1>🔴 LIVE AUCTION</h1>
      </div>

      {/* Auction Selector */}
      <div className="auction-selector-container">
        <label htmlFor="auction-select">Select Tournament</label>
        <select 
          id="auction-select"
          value={selectedAuction?.id || ''}
          onChange={handleAuctionSelect}
          className="auction-select"
        >
          <option value="">-- Select an Auction --</option>
          {auctions.map(auction => (
            <option key={auction.id} value={auction.id}>
              {auction.tournament_name}
            </option>
          ))}
        </select>
      </div>

      {!selectedAuction && auctions.length > 0 && (
        <div className="no-auction-message">
          <h3>Please select an auction above to view live updates</h3>
        </div>
      )}

      {auctions.length === 0 && (
        <div className="no-auction-message">
          <h3>No active auctions at the moment</h3>
          <p>Check back later!</p>
        </div>
      )}

      {selectedAuction && (
        <>
          <div className="team-purses-section">
            <h3>💰 Team Purses</h3>
            <div className="team-purses-grid">
              {teams.map(team => {
                const stats = getTeamStats(team);
                return (
                  <div 
                    key={team.id} 
                    className="team-purse-card"
                    onClick={() => handleTeamClick(team)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="team-name">{team.team_name}</div>
                    <div className="budget-display">
                      <div className="remaining-budget">
                        ₹{stats.remainingBudget.toLocaleString()}
                      </div>
                      <div className="budget-label">Remaining</div>
                    </div>
                    <div className="team-stats">
                      <div className="stat">
                        <span className="stat-label">Players:</span>
                        <span className="stat-value">{stats.playerCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Spent:</span>
                        <span className="stat-value">₹{stats.totalSpent.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="click-hint">Click to view team</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sold-players-section">
            <h3>🎯 Players Sold ({soldPlayers.length})</h3>
            {soldPlayers.length === 0 ? (
              <div className="empty-message">
                <p>No players sold yet. Auction starting soon...</p>
              </div>
            ) : (
              <div className="players-table-container">
                <table className="players-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player Name</th>
                      <th>Team</th>
                      <th>Price</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldPlayers.map((player, index) => (
                      <tr key={player.id} className={index < 3 ? 'recent-sale' : ''}>
                        <td>{index + 1}</td>
                        <td className="player-name">
                          {player.player_name}
                          {player.player_phone && (
                            <span className="player-phone"> ({player.player_phone})</span>
                          )}
                        </td>
                        <td className="team-name">{player.team_name}</td>
                        <td className="price">₹{player.sale_price?.toLocaleString()}</td>
                        <td className="time">
                          {new Date(player.sale_time).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {unsoldPlayers.length > 0 && (
            <div className="unsold-players-section">
              <h3>❌ Unsold Players ({unsoldPlayers.length})</h3>
              <div className="unsold-players-list">
                {unsoldPlayers.map((player, index) => (
                  <div key={player.id} className="unsold-player-card">
                    <span className="player-number">{index + 1}.</span>
                    <span className="player-name">{player.player_name}</span>
                    {player.player_phone && (
                      <span className="player-phone">({player.player_phone})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="team-modal-overlay" onClick={closeTeamModal}>
          <div className="team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2>{selectedTeam.team_name} - Complete Squad</h2>
              <button className="close-modal-btn" onClick={closeTeamModal}>✕</button>
            </div>
            
            <div className="team-modal-stats">
              <div className="modal-stat-card">
                <div className="modal-stat-label">Total Budget</div>
                <div className="modal-stat-value">₹{selectedTeam.total_budget?.toLocaleString()}</div>
              </div>
              <div className="modal-stat-card">
                <div className="modal-stat-label">Spent</div>
                <div className="modal-stat-value spent">₹{getTeamStats(selectedTeam).totalSpent.toLocaleString()}</div>
              </div>
              <div className="modal-stat-card">
                <div className="modal-stat-label">Remaining</div>
                <div className="modal-stat-value remaining">₹{getTeamStats(selectedTeam).remainingBudget.toLocaleString()}</div>
              </div>
              <div className="modal-stat-card">
                <div className="modal-stat-label">Players</div>
                <div className="modal-stat-value">{teamPlayers.length}</div>
              </div>
            </div>

            <div className="team-modal-body">
              {teamPlayers.length === 0 ? (
                <div className="no-players-message">
                  <p>No players bought yet</p>
                </div>
              ) : (
                <table className="team-players-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player Name</th>
                      <th>Phone</th>
                      <th>Price</th>
                      <th>Purchased At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPlayers.map((player, index) => (
                      <tr key={player.id}>
                        <td>{index + 1}</td>
                        <td className="player-name-col">{player.player_name}</td>
                        <td>{player.player_phone || '-'}</td>
                        <td className="price-col">₹{player.sale_price?.toLocaleString()}</td>
                        <td>{new Date(player.sale_time).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="3"><strong>Total</strong></td>
                      <td className="price-col">
                        <strong>₹{teamPlayers.reduce((sum, p) => sum + (p.sale_price || 0), 0).toLocaleString()}</strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">⚡ Updating...</div>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionPublic;
