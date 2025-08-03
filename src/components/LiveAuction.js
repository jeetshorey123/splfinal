import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import * as XLSX from 'xlsx';
import './LiveAuction.css';
import { supabase } from './supabaseClient';
// Save auction to Supabase
const saveAuctionToSupabase = async (auctionName, soldPlayers) => {
  try {
    // 1. Create a new auction record
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .insert([{ auction_name: auctionName }])
      .select()
      .single();

    if (auctionError) throw auctionError;

    // 2. Prepare and insert players
    const playersData = soldPlayers.map(player => ({
      auction_id: auction.id,
      player_name: player.name,
      team_name: player.soldTo,
      sold_price: player.soldPrice
    }));

    const { error: playersError } = await supabase
      .from('auctioned_players')
      .insert(playersData);

    if (playersError) throw playersError;

    alert('Auction data saved to Supabase!');
  } catch (error) {
    console.error('Error saving auction:', error.message);
    alert('Failed to save auction data to Supabase.');
  }
};

const LiveAuction = () => {
  // Admin login state
  const [adminStep, setAdminStep] = useState(0); // 0: login, 1: proceed
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const ADMIN_PASS = 'admin123'; // Change this password as needed

  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [numTeams, setNumTeams] = useState(4);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState('');
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  // Add state to track if we're in the unsold round
  const [unsoldRound, setUnsoldRound] = useState(false);
  // State for auction selection modal
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [availableAuctions, setAvailableAuctions] = useState([]);
  const [selectedAuctionKey, setSelectedAuctionKey] = useState('');

  const initialTeamBudget = 10000;

  useEffect(() => {
    // On mount, load the most recent auction if exists (for backward compatibility)
    if (adminStep !== 1) return;
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('splAuctionData_'));
    if (allKeys.length > 0) {
      // Optionally, load the most recent auction
      const latestKey = allKeys.sort().reverse()[0];
      const savedData = localStorage.getItem(latestKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        setTeams(data.teams || []);
        setSoldPlayers(data.soldPlayers || []);
        setUnsoldPlayers(data.unsoldPlayers || []);
        setAuctionHistory(data.auctionHistory || []);
      }
    }
  }, [adminStep]);
  // Admin login form
  const renderAdminLogin = () => (
    <div className="auction-step">
      <h2>Admin Login Required</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (adminPassword === ADMIN_PASS) {
            setAdminStep(1);
            setAdminError('');
          } else {
            setAdminError('Incorrect password.');
          }
        }}
      >
        <div className="form-group">
          <label>Enter Admin Password:</label>
          <input
            type="password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            placeholder="Admin Password"
            required
          />
        </div>
        {adminError && <div style={{ color: 'red', marginBottom: 8 }}>{adminError}</div>}
        <div className="button-group">
          <button type="submit" className="btn-primary">Login</button>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </form>
    </div>
  );

  const saveAuctionData = async () => {
    const timestamp = new Date().toISOString();
    const auctionName = prompt('Enter a name for this auction save (or leave blank for timestamp):', '');
    const key = `splAuctionData_${auctionName ? auctionName.replace(/\s+/g, '_') : timestamp}`;
    // If a new name is given, treat as new tournament: reset all state
    if (auctionName) {
      // Save to Supabase
      await saveAuctionToSupabase(auctionName, soldPlayers);

      const data = {
        teams: [],
        soldPlayers: [],
        unsoldPlayers: [],
        auctionHistory: [],
        userName: '',
        players: [],
        auctionStarted: false,
        currentPlayer: null,
        currentBid: 0,
        currentBidder: '',
        step: 1,
        timestamp,
        auctionName
      };
      localStorage.setItem(key, JSON.stringify(data));
      alert(`New tournament "${auctionName}" created!`);
    } else {
      // Save current auction state as before
      const data = {
        teams: [...teams],
        soldPlayers: [...soldPlayers],
        unsoldPlayers: [...unsoldPlayers],
        auctionHistory: [...auctionHistory],
        userName,
        players: [...players],
        auctionStarted,
        currentPlayer: currentPlayer ? { ...currentPlayer } : null,
        currentBid,
        currentBidder,
        step,
        timestamp,
        auctionName: auctionName || timestamp
      };
      localStorage.setItem(key, JSON.stringify(data));
      alert(`Auction saved as "${auctionName || timestamp}"!`);
    }
  };

  const downloadAuctionExcel = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Sold players sheet
    const soldData = soldPlayers.map(player => [
      player.name,
      player.basePrice,
      player.soldPrice,
      player.soldTo,
      'Sold'
    ]);
    const soldWs = XLSX.utils.aoa_to_sheet([
      ['Player Name', 'Base Price', 'Sold Price', 'Sold To', 'Status'],
      ...soldData
    ]);
    XLSX.utils.book_append_sheet(wb, soldWs, 'Sold Players');
    
    // Unsold players sheet
    const unsoldData = unsoldPlayers.map(player => [
      player.name,
      player.basePrice,
      'Unsold'
    ]);
    const unsoldWs = XLSX.utils.aoa_to_sheet([
      ['Player Name', 'Base Price', 'Status'],
      ...unsoldData
    ]);
    XLSX.utils.book_append_sheet(wb, unsoldWs, 'Unsold Players');
    
    // Teams summary sheet
    const teamsData = teams.map(team => [
      team.name,
      initialTeamBudget,
      team.budget,
      initialTeamBudget - team.budget,
      team.players.length
    ]);
    const teamsWs = XLSX.utils.aoa_to_sheet([
      ['Team Name', 'Initial Budget', 'Remaining Budget', 'Spent', 'Players Bought'],
      ...teamsData
    ]);
    XLSX.utils.book_append_sheet(wb, teamsWs, 'Teams Summary');
    
    // Auction history sheet
    const historyData = auctionHistory.map(record => [
      record.player,
      record.soldTo,
      record.price,
      record.timestamp
    ]);
    const historyWs = XLSX.utils.aoa_to_sheet([
      ['Player', 'Sold To', 'Price', 'Timestamp'],
      ...historyData
    ]);
    XLSX.utils.book_append_sheet(wb, historyWs, 'Auction History');
    
    // Download the file
    XLSX.writeFile(wb, `Sankalp_Premier_League_Auction_${new Date().toISOString().split('T')[0]}.xlsx`);
    alert('Auction data downloaded successfully!');
  };

  const undoLastSale = () => {
    if (soldPlayers.length === 0) {
      alert('No sales to undo!');
      return;
    }
    const lastSoldPlayer = soldPlayers[soldPlayers.length - 1];
    const buyerTeam = teams.find(t => t.name === lastSoldPlayer.soldTo);
    if (buyerTeam) {
      // Remove player from team and refund money
      const updatedTeams = teams.map(team => 
        team.id === buyerTeam.id 
          ? { 
              ...team, 
              budget: team.budget + lastSoldPlayer.soldPrice,
              players: team.players.filter(p => p.id !== lastSoldPlayer.id)
            }
          : team
      );
      // Remove from sold players and add back to available players
      const updatedSoldPlayers = soldPlayers.slice(0, -1);
      const updatedPlayers = players.map(p => 
        p.id === lastSoldPlayer.id 
          ? { ...p, status: 'available' }
          : p
      );
      // Remove from auction history
      const updatedHistory = auctionHistory.slice(0, -1);
      setTeams(updatedTeams);
      setSoldPlayers(updatedSoldPlayers);
      setPlayers(updatedPlayers);
      setAuctionHistory(updatedHistory);
      // Immediately resume auction for this player
      setCurrentPlayer({ ...lastSoldPlayer, status: 'available' });
      setCurrentBid(lastSoldPlayer.basePrice);
      setCurrentBidder('');
      setAuctionStarted(true);
      setStep(5);
      alert(`Undid sale of ${lastSoldPlayer.name} to ${lastSoldPlayer.soldTo}. Auction for this player resumed.`);
    }
  };

  // Show modal to select previous auction
  const loadPreviousAuction = () => {
    // Gather all auction keys
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('splAuctionData_'));
    const auctions = allKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        key,
        name: data.auctionName || data.timestamp || key,
        timestamp: data.timestamp || '',
      };
    });
    setAvailableAuctions(auctions);
    setShowAuctionModal(true);
  };

  // Actually load the selected auction
  const handleAuctionSelect = () => {
    if (!selectedAuctionKey) return;
    const savedData = localStorage.getItem(selectedAuctionKey);
    if (savedData) {
      const data = JSON.parse(savedData);
      setTeams(data.teams || []);
      setSoldPlayers(data.soldPlayers || []);
      setUnsoldPlayers(data.unsoldPlayers || []);
      setAuctionHistory(data.auctionHistory || []);
      setUserName(data.userName || '');
      if (data.players) setPlayers(data.players);
      if (typeof data.auctionStarted === 'boolean') setAuctionStarted(data.auctionStarted);
      if (data.currentPlayer) setCurrentPlayer(data.currentPlayer);
      if (typeof data.currentBid === 'number') setCurrentBid(data.currentBid);
      if (data.currentBidder) setCurrentBidder(data.currentBidder);
      if (typeof data.step === 'number') setStep(data.step);
      else setStep(4);
      setShowAuctionModal(false);
      alert(`Auction "${data.auctionName || data.timestamp || selectedAuctionKey}" loaded successfully!`);
    }
  };

  const handleUserNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setStep(2);
    }
  };

  const handleTeamSetup = (e) => {
    e.preventDefault();
    const newTeams = [];
    for (let i = 0; i < numTeams; i++) {
      const teamName = e.target[`team${i}`].value;
      if (teamName.trim()) {
        newTeams.push({
          id: i + 1,
          name: teamName,
          budget: initialTeamBudget,
          players: []
        });
      }
    }
    if (newTeams.length === numTeams) {
      setTeams(newTeams);
      setStep(3);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Stop at first empty cell in name column
        let playerList = [];
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const name = row[0];
          if (!name || name === '') {
            // Stop processing at first empty cell
            break;
          }
          if (name === 'Player Name') continue; // skip header if present
          playerList.push({
            id: i + 1,
            name,
            basePrice: parseInt(row[1]) || 100,
            status: 'available'
          });
        }
        setPlayers(playerList);
        setStep(4);
      };
      reader.readAsBinaryString(file);
    }
  };

  const startAuction = () => {
    if (players.length > 0) {
      setAuctionStarted(true);
      // If resuming, use last currentPlayer/currentBid, else start from first
      if (!currentPlayer || !players.some(p => p.id === currentPlayer.id && p.status === 'available')) {
        // Start from first available player
        const firstAvailable = players.find(p => p.status === 'available');
        setCurrentPlayer(firstAvailable);
        setCurrentBid(firstAvailable ? firstAvailable.basePrice : 0);
      }
      setStep(5);
    }
  };

  const placeBid = (teamId, bidAmount) => {
    const team = teams.find(t => t.id === teamId);
    if (team && team.budget >= bidAmount && bidAmount > currentBid) {
      setCurrentBid(bidAmount);
      setCurrentBidder(team.name);
    }
  };

  const sellPlayer = () => {
    if (currentPlayer && currentBidder) {
      const buyerTeam = teams.find(t => t.name === currentBidder);
      if (buyerTeam) {
        const updatedTeams = teams.map(team => 
          team.id === buyerTeam.id 
            ? { ...team, budget: team.budget - currentBid, players: [...team.players, currentPlayer] }
            : team
        );
        
        const soldPlayer = {
          ...currentPlayer,
          soldPrice: currentBid,
          soldTo: currentBidder,
          status: 'sold'
        };
        
        setTeams(updatedTeams);
        setSoldPlayers([...soldPlayers, soldPlayer]);
        setAuctionHistory([...auctionHistory, {
          player: currentPlayer.name,
          soldTo: currentBidder,
          price: currentBid,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        moveToNextPlayer();
      }
    }
  };

  const unsoldPlayer = () => {
    if (currentPlayer) {
      const unsoldPlayer = {
        ...currentPlayer,
        status: 'unsold'
      };
      
      setUnsoldPlayers([...unsoldPlayers, unsoldPlayer]);
      setAuctionHistory([...auctionHistory, {
        player: currentPlayer.name,
        soldTo: 'Unsold',
        price: 0,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      moveToNextPlayer();
    }
  };

  // Modified moveToNextPlayer to handle unsold round
  const moveToNextPlayer = () => {
    const availablePlayers = players.filter(p => p.status === 'available');
    const currentIndex = availablePlayers.findIndex(p => p.id === currentPlayer.id);
    if (currentIndex < availablePlayers.length - 1) {
      const nextPlayer = availablePlayers[currentIndex + 1];
      setCurrentPlayer(nextPlayer);
      setCurrentBid(nextPlayer.basePrice);
      setCurrentBidder('');
    } else {
      // Auction finished
      setAuctionStarted(false);
      setCurrentPlayer(null);
      saveAuctionData();
      setTimeout(() => {
        alert('All players sold! Opening unsold list.');
      }, 300);
    }
  };

  // New: Start auction for unsold players
  const auctionUnsoldPlayers = () => {
    if (unsoldPlayers.length > 0) {
      // Mark all unsold players as available again
      const resetUnsold = unsoldPlayers.map((p, idx) => ({
        ...p,
        status: 'available',
        id: 10000 + idx // ensure unique id for this round
      }));
      setPlayers(resetUnsold);
      setCurrentPlayer(resetUnsold[0]);
      setCurrentBid(resetUnsold[0].basePrice);
      setCurrentBidder('');
      setAuctionStarted(true);
      setUnsoldPlayers([]);
      setUnsoldRound(true);
      setStep(5);
    }
  };

  const resetAuction = () => {
    setStep(1);
    setUserName('');
    setNumTeams(4);
    setTeams([]);
    setPlayers([]);
    setCurrentPlayer(null);
    setAuctionStarted(false);
    setCurrentBid(0);
    setCurrentBidder('');
    setAuctionHistory([]);
    setSoldPlayers([]);
    setUnsoldPlayers([]);
    localStorage.removeItem('splAuctionData');
  };

  const renderStep1 = () => (
    <div className="auction-step">
      <h2>Welcome to Live Auction</h2>
      <form onSubmit={handleUserNameSubmit}>
        <div className="form-group">
          <label>Enter your name:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="btn-primary">Continue</button>
          <button 
            type="button" 
            onClick={loadPreviousAuction}
            className="btn-secondary"
          >
            Load Previous Auction
          </button>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </form>

      {/* Auction selection modal */}
      {showAuctionModal && (
        <div className="modal-overlay">
          <div className="modal auction-modal">
            <h3>Select Previous Auction</h3>
            {availableAuctions.length === 0 ? (
              <p>No previous auctions found.</p>
            ) : (
              <>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1em' }}>
                  {availableAuctions.map(a => (
                    <div key={a.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                      <input
                        type="radio"
                        name="auctionSelect"
                        value={a.key}
                        checked={selectedAuctionKey === a.key}
                        onChange={() => setSelectedAuctionKey(a.key)}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ flex: 1 }}>
                        {a.name} ({a.timestamp && new Date(a.timestamp).toLocaleString()})
                      </span>
                      <button
                        className="btn-danger"
                        style={{ marginLeft: 8, fontSize: '0.9em', padding: '2px 8px' }}
                        onClick={() => {
                          if (window.confirm(`Delete auction "${a.name}"?`)) {
                            localStorage.removeItem(a.key);
                            // Remove from list
                            setAvailableAuctions(prev => prev.filter(x => x.key !== a.key));
                            // If deleted auction was selected, clear selection
                            if (selectedAuctionKey === a.key) setSelectedAuctionKey('');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
                  <button
                    className="btn-primary"
                    disabled={!selectedAuctionKey}
                    onClick={handleAuctionSelect}
                  >
                    Load Selected Auction
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowAuctionModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="auction-step">
      <h2>Team Setup</h2>
      <form onSubmit={handleTeamSetup}>
        <div className="form-group">
          <label>Number of teams:</label>
          <input
            type="number"
            min="2"
            max="10"
            value={numTeams}
            onChange={(e) => setNumTeams(parseInt(e.target.value))}
          />
        </div>
        <div className="teams-input">
          {Array.from({ length: numTeams }, (_, i) => (
            <div key={i} className="form-group">
              <label>Team {i + 1} name:</label>
              <input
                type="text"
                name={`team${i}`}
                placeholder={`Team ${i + 1}`}
                required
              />
            </div>
          ))}
        </div>
        <div className="button-group">
          <button type="submit" className="btn-primary">Continue</button>
          <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="auction-step">
      <h2>Upload Player List</h2>
      <p>Please upload an Excel file with the following format:</p>
      <ul>
        <li>Column 1: Player Name</li>
        <li>Column 2: Base Price</li>
      </ul>
      <div className="form-group">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          required
        />
      </div>
      <div className="button-group">
        <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="auction-step">
      <h2>Ready to Start Auction</h2>
      <div className="auction-summary">
        <h3>Summary</h3>
        <p>Teams: {teams.length}</p>
        <p>Players: {players.length}</p>
        <p>Budget per team: ₹{initialTeamBudget.toLocaleString()}</p>
      </div>
      <div className="teams-list">
        <h3>Teams</h3>
        {teams.map(team => (
          <div key={team.id} className="team-item">
            <span>{team.name}</span>
            <span>₹{team.budget.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="button-group">
        <button onClick={startAuction} className="btn-primary">Start Auction</button>
        <button onClick={() => setStep(3)} className="btn-secondary">Back</button>
      </div>
    </div>
  );

  const renderAuction = () => (
    <div className="auction-container">
      <div className="auction-header">
        <h2>Live Auction in Progress</h2>
        <div className="auction-controls">
          <button onClick={() => setShowSaveOptions(!showSaveOptions)} className="btn-secondary">
            {showSaveOptions ? 'Hide Options' : 'Show Options'}
          </button>
          <button onClick={resetAuction} className="btn-danger">Reset Auction</button>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>

      {showSaveOptions && (
        <div className="save-options">
          <h3>Auction Options</h3>
          <div className="options-grid">
            <button onClick={saveAuctionData} className="btn-primary">
              Save Auction
            </button>
            <button onClick={downloadAuctionExcel} className="btn-secondary">
              Download Auction Excel
            </button>
            <button onClick={undoLastSale} className="btn-warning">
              Undo Last Sale
            </button>
          </div>
        </div>
      )}

      <div className="teams-purse">
        <h3>Remaining Purse of Each Team</h3>
        <div className="purse-grid">
          {teams.map(team => (
            <div key={team.id} className="purse-card">
              <h4>{team.name}</h4>
              <div className="purse-details">
                <p>Initial: ₹{initialTeamBudget.toLocaleString()}</p>
                <p>Remaining: ₹{team.budget.toLocaleString()}</p>
                <p>Spent: ₹{(initialTeamBudget - team.budget).toLocaleString()}</p>
                <p>Players: {team.players.length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentPlayer && (
        <div className="current-player">
          <h3>Current Player</h3>
          <div className="player-card">
            <h4>{currentPlayer.name}</h4>
            <p>Base Price: ₹{currentPlayer.basePrice.toLocaleString()}</p>
            <p>Current Bid: ₹{currentBid.toLocaleString()}</p>
            {currentBidder && <p>Highest Bidder: {currentBidder}</p>}
          </div>
        </div>
      )}

      <div className="bidding-section">
        <h3>Place Bids</h3>
        <div className="teams-bidding">
          {teams.map(team => (
            <div key={team.id} className="team-bid-card">
              <h4>{team.name}</h4>
              <p>Budget: ₹{team.budget.toLocaleString()}</p>
              <p>Players: {team.players.length}</p>
              <div className="bid-buttons">
                <button
                  onClick={() => placeBid(team.id, currentBid + 100)}
                  disabled={team.budget < currentBid + 100}
                  className="btn-bid"
                >
                  +₹100
                </button>
                <button
                  onClick={() => placeBid(team.id, currentBid + 500)}
                  disabled={team.budget < currentBid + 500}
                  className="btn-bid"
                >
                  +₹500
                </button>
                <button
                  onClick={() => placeBid(team.id, currentBid + 1000)}
                  disabled={team.budget < currentBid + 1000}
                  className="btn-bid"
                >
                  +₹1000
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auction-actions">
        <button onClick={sellPlayer} disabled={!currentBidder} className="btn-success">
          Sold to {currentBidder || 'No Bidder'}
        </button>
        <button onClick={unsoldPlayer} className="btn-warning">
          Unsold
        </button>
      </div>

      <div className="auction-status">
        <div className="status-section">
          <h3>Sold Players ({soldPlayers.length})</h3>
          <div className="players-list">
            {soldPlayers.map(player => (
              <div key={player.id} className="player-item sold">
                <span>{player.name}</span>
                <span>₹{player.soldPrice.toLocaleString()}</span>
                <span>{player.soldTo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="status-section">
          <h3>Unsold Players ({unsoldPlayers.length})</h3>
          <div className="players-list">
            {unsoldPlayers.map(player => (
              <div key={player.id} className="player-item unsold">
                <span>{player.name}</span>
                <span>Base: ₹{player.basePrice.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Show Auction Unsold Players button if auction is finished and there are unsold players */}
      {!auctionStarted && !currentPlayer && unsoldPlayers.length > 0 && !unsoldRound && (
        <div className="unsold-auction-btn-section">
          <button onClick={auctionUnsoldPlayers} className="btn-primary">
            Auction Unsold Players
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="live-auction">
      {adminStep !== 1 ? (
        renderAdminLogin()
      ) : (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderAuction()}
        </>
      )}
    </div>
  );
};

export default LiveAuction; 