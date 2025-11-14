import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../config/supabase';
import AdminLogin from './AdminLogin';
import './Home.css';

const LOCAL_KEY = 'splRegisteredPlayers';

const Admin = () => {
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [teams, setTeams] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [auctionTransactions, setAuctionTransactions] = useState([]);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('players'); // 'players', 'tournaments', 'schedules', 'create-tournament', 'auction', 'team-management'
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingTournament, setEditingTournament] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('splAdminLoggedIn') === 'true');

  // New Tournament Creation Form
  const [newTournament, setNewTournament] = useState({
    name: '',
    tournament_type: 'T20',
    total_teams: 4,
    max_players_per_team: 15,
    team_budget: 10000,
    status: 'upcoming'
  });

  const [teamNames, setTeamNames] = useState([]);
  const [currentTeamName, setCurrentTeamName] = useState('');

  // Auction Management
  const [newAuction, setNewAuction] = useState({
    tournament_id: '',
    auction_name: '',
    status: 'scheduled',
    team_budget: 100000 // Default ₹100,000 per team
  });

  const [auctionPlayers, setAuctionPlayers] = useState([]);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [selectedTeamForBid, setSelectedTeamForBid] = useState('');
  const [playerCategories, setPlayerCategories] = useState({}); // { playerId: 'base_price' }
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Manual Entry for Auction
  const [manualEntry, setManualEntry] = useState({
    playerId: '',
    amount: '',
    teamId: ''
  });
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Team Management
  const [selectedTournamentForTeams, setSelectedTournamentForTeams] = useState('');
  const [selectedTeamForPlayers, setSelectedTeamForPlayers] = useState('');
  const [teamSquads, setTeamSquads] = useState([]);

  // Schedule Generation
  const [scheduleGenTournament, setScheduleGenTournament] = useState('');
  const [generatedMatches, setGeneratedMatches] = useState([]);

  // Load data from Supabase
  useEffect(() => {
    if (loggedIn) {
      loadPlayersFromSupabase();
      loadTournamentsFromSupabase();
      loadSchedulesFromSupabase();
      loadTeamsFromSupabase();
      loadAuctionsFromSupabase();
      loadRegisteredPlayersFromSupabase();
      
      // Also load from localStorage as fallback
      const data = localStorage.getItem(LOCAL_KEY);
      if (data) {
        const localPlayers = JSON.parse(data);
        setPlayers(prev => {
          const supabasePlayerNames = prev.map(p => p.name);
          const uniqueLocalPlayers = localPlayers.filter(lp => !supabasePlayerNames.includes(lp.name));
          return [...prev, ...uniqueLocalPlayers];
        });
      }
    }
  }, [loggedIn]);

  // Load Players from Supabase
  const loadPlayersFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_registrations_supabase')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
      alert('Error loading players from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Tournaments from Supabase
  const loadTournamentsFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      alert('Error loading tournaments from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Schedules from Supabase
  const loadSchedulesFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('match_schedule')
        .select('*')
        .order('match_date', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      alert('Error loading schedules from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Teams from Supabase
  const loadTeamsFromSupabase = async () => {
    if (!currentAuction) return;
    
    setLoading(true);
    try {
      // Load teams from SIMPLE_TEAMS table for current auction
      const { data, error } = await supabase
        .from('simple_teams')
        .select('*')
        .eq('auction_id', currentAuction.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      alert('Error loading teams from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Auctions from Supabase
  const loadAuctionsFromSupabase = async () => {
    setLoading(true);
    try {
      // Load from SIMPLE_AUCTIONS table
      const { data, error } = await supabase
        .from('simple_auctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error('Error loading auctions:', error);
      alert('Error loading auctions from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Registered Players (from player_registrations table)
  const loadRegisteredPlayersFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_registrations_supabase')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegisteredPlayers(data || []);
    } catch (error) {
      console.error('Error loading registered players:', error);
      alert('Error loading registered players from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Player CRUD Operations
  const handlePlayerEdit = (idx) => {
    setEditIndex(idx);
    setEditForm(players[idx]);
  };

  const handlePlayerEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePlayerEditSave = async () => {
    setLoading(true);
    try {
      const player = editForm;
      
      if (player.id) {
        // Update existing player in Supabase
        const { error } = await supabase
          .from('player_registrations_supabase')
          .update({
            name: player.name,
            age: parseInt(player.age),
            phone: player.phone,
            building: player.building,
            wing: player.wing,
            flat: player.flat
          })
          .eq('id', player.id);

        if (error) throw error;
        
        alert('Player updated successfully!');
      }

      // Update local state
      const updated = [...players];
      updated[editIndex] = editForm;
      setPlayers(updated);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      setEditIndex(null);
      
      // Reload from Supabase
      await loadPlayersFromSupabase();
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerDelete = async (idx) => {
    if (!window.confirm('Delete this player? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const player = players[idx];
      
      if (player.id) {
        // Delete from Supabase
        const { error } = await supabase
          .from('player_registrations_supabase')
          .delete()
          .eq('id', player.id);

        if (error) throw error;
        
        alert('Player deleted successfully!');
      }

      // Update local state
      const updated = players.filter((_, i) => i !== idx);
      setPlayers(updated);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      
      // Reload from Supabase
      await loadPlayersFromSupabase();
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error deleting player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPlayersExcel = () => {
    const ws = XLSX.utils.json_to_sheet(players.map(p => ({
      Name: p.name,
      Age: p.age,
      Phone: p.phone,
      Building: p.building,
      Wing: p.wing,
      Flat: p.flat
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');
    XLSX.writeFile(wb, `SPL_Registered_Players_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Tournament CRUD Operations
  const handleTournamentEdit = (tournament) => {
    setEditingTournament(tournament);
  };

  const handleTournamentEditChange = (e) => {
    setEditingTournament({ ...editingTournament, [e.target.name]: e.target.value });
  };

  const handleTournamentEditSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({
          name: editingTournament.name,
          start_date: editingTournament.start_date,
          end_date: editingTournament.end_date,
          venue: editingTournament.venue,
          status: editingTournament.status
        })
        .eq('id', editingTournament.id);

      if (error) throw error;
      
      alert('Tournament updated successfully!');
      setEditingTournament(null);
      await loadTournamentsFromSupabase();
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Error updating tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentDelete = async (tournamentId) => {
    if (!window.confirm('Delete this tournament and all its schedules? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      // First delete all schedules for this tournament
      const { error: scheduleError } = await supabase
        .from('tournament_schedule')
        .delete()
        .eq('tournament_id', tournamentId);

      if (scheduleError) throw scheduleError;

      // Then delete the tournament
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;
      
      alert('Tournament and its schedules deleted successfully!');
      await loadTournamentsFromSupabase();
      await loadSchedulesFromSupabase();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Error deleting tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTournamentsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tournaments.map(t => ({
      'Tournament Name': t.name,
      'Start Date': t.start_date,
      'End Date': t.end_date,
      'Venue': t.venue,
      'Status': t.status,
      'Created At': new Date(t.created_at).toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tournaments');
    XLSX.writeFile(wb, `SPL_Tournaments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Schedule CRUD Operations
  const handleScheduleEdit = (schedule) => {
    setEditingSchedule(schedule);
  };

  const handleScheduleEditChange = (e) => {
    setEditingSchedule({ ...editingSchedule, [e.target.name]: e.target.value });
  };

  const handleScheduleEditSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_schedule')
        .update({
          team1_id: editingSchedule.team1_id,
          team2_id: editingSchedule.team2_id,
          match_date: editingSchedule.match_date,
          match_time: editingSchedule.match_time,
          venue: editingSchedule.venue,
          match_type: editingSchedule.match_type
        })
        .eq('id', editingSchedule.id);

      if (error) throw error;
      
      alert('Schedule updated successfully!');
      setEditingSchedule(null);
      await loadSchedulesFromSupabase();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Error updating schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDelete = async (scheduleId) => {
    if (!window.confirm('Delete this match from schedule? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_schedule')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      
      alert('Match deleted successfully!');
      await loadSchedulesFromSupabase();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSchedulesExcel = () => {
    const ws = XLSX.utils.json_to_sheet(schedules.map(s => ({
      'Match Number': s.match_number,
      'Tournament ID': s.tournament_id,
      'Team 1 ID': s.team1_id,
      'Team 2 ID': s.team2_id,
      'Match Date': s.match_date,
      'Match Time': s.match_time,
      'Venue': s.venue,
      'Match Type': s.match_type,
      'Status': s.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedules');
    XLSX.writeFile(wb, `SPL_Schedules_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ========================================
  // SCHEDULE GENERATION FUNCTIONS
  // ========================================

  const handleGenerateSchedule = async () => {
    if (!scheduleGenTournament) {
      alert('Please select a tournament');
      return;
    }

    setLoading(true);
    try {
      // Get selected tournament details
      const tournament = tournaments.find(t => t.id === parseInt(scheduleGenTournament));
      if (!tournament) {
        alert('Tournament not found');
        return;
      }

      // Get teams for this tournament
      const { data: tournamentTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournament.id)
        .order('name');

      if (teamsError) throw teamsError;

      if (!tournamentTeams || tournamentTeams.length < 2) {
        alert('Need at least 2 teams to generate schedule');
        return;
      }

      const numTeams = tournamentTeams.length;
      
      // Generate round-robin schedule
      const matches = [];
      let matchNumber = 1;
      
      // Round-robin algorithm
      for (let i = 0; i < numTeams; i++) {
        for (let j = i + 1; j < numTeams; j++) {
          matches.push({
            match_number: matchNumber++,
            tournament_id: tournament.id,
            team1_id: tournamentTeams[i].id,
            team1_name: tournamentTeams[i].name,
            team2_id: tournamentTeams[j].id,
            team2_name: tournamentTeams[j].name,
            match_date: null,
            match_time: null,
            venue: 'TBD',
            match_type: 'league',
            status: 'scheduled'
          });
        }
      }

      setGeneratedMatches(matches);
      alert(`✅ Generated ${matches.length} matches for ${tournament.name}`);
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Error generating schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneratedSchedule = async () => {
    if (generatedMatches.length === 0) {
      alert('No matches to save. Please generate schedule first.');
      return;
    }

    setLoading(true);
    try {
      // Prepare matches for insertion
      const matchesToInsert = generatedMatches.map(match => ({
        match_number: match.match_number,
        tournament_id: match.tournament_id,
        team1_id: match.team1_id,
        team2_id: match.team2_id,
        match_date: match.match_date,
        match_time: match.match_time,
        venue: match.venue || 'TBD',
        match_type: match.match_type,
        status: match.status
      }));

      const { error } = await supabase
        .from('match_schedule')
        .insert(matchesToInsert);

      if (error) throw error;

      alert(`✅ Successfully saved ${matchesToInsert.length} matches to database!`);
      
      // Reset and reload
      setGeneratedMatches([]);
      setScheduleGenTournament('');
      await loadSchedulesFromSupabase();
      setActiveTab('schedules');
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // TOURNAMENT CREATION FUNCTIONS
  // ========================================

  const handleAddTeamName = () => {
    if (currentTeamName.trim() && teamNames.length < newTournament.total_teams) {
      setTeamNames([...teamNames, currentTeamName.trim()]);
      setCurrentTeamName('');
    }
  };

  const handleRemoveTeamName = (index) => {
    setTeamNames(teamNames.filter((_, i) => i !== index));
  };

  const handleCreateTournament = async () => {
    if (!newTournament.name) {
      alert('Please enter tournament name');
      return;
    }

    if (teamNames.length !== newTournament.total_teams) {
      alert(`Please add exactly ${newTournament.total_teams} team names`);
      return;
    }

    setLoading(true);
    try {
      // Create tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .insert([{
          name: newTournament.name,
          tournament_type: newTournament.tournament_type,
          total_teams: newTournament.total_teams,
          max_players_per_team: newTournament.max_players_per_team,
          team_budget: 100000, // Fixed team budget at 100000
          status: newTournament.status
        }])
        .select();

      if (tournamentError) throw tournamentError;

      const createdTournament = tournamentData[0];

      // Create teams for this tournament with 100000 budget
      const teamsToInsert = teamNames.map(teamName => ({
        tournament_id: createdTournament.id,
        name: teamName,
        current_budget: 100000,
        remaining_budget: 100000,
        players_count: 0
      }));

      const { error: teamsError } = await supabase
        .from('teams')
        .insert(teamsToInsert);

      if (teamsError) throw teamsError;

      alert('Tournament created successfully with all teams! Each team has ₹100,000 budget.');
      
      // Reset form
      setNewTournament({
        name: '',
        tournament_type: 'T20',
        total_teams: 4,
        max_players_per_team: 15,
        team_budget: 10000,
        status: 'upcoming'
      });
      setTeamNames([]);

      // Reload data
      await loadTournamentsFromSupabase();
      await loadTeamsFromSupabase();
      
      // Switch to tournaments tab
      setActiveTab('tournaments');
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // AUCTION MANAGEMENT FUNCTIONS
  // ========================================

  const handleUploadAuctionCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setAuctionPlayers(jsonData);
      alert(`${jsonData.length} players loaded from CSV`);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadPlayersFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_registrations_supabase')
        .select('*');

      if (error) throw error;

      const formattedPlayers = data.map(p => ({
        id: p.id,
        name: p.name,
        phone_number: p.phone || p.phone_number,
        cricket_role: 'Player', // Default role since this table doesn't have cricket_role
        base_price: 100,
        age: p.age,
        building: p.building,
        wing: p.wing,
        flat: p.flat
      }));

      setAuctionPlayers(formattedPlayers);
      setShowCategoryModal(true); // Show category selection modal
      alert(`${formattedPlayers.length} players loaded from database. Please assign categories.`);
    } catch (error) {
      console.error('Error loading players:', error);
      alert('Error loading players: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Set player category
  const handleSetPlayerCategory = (playerId, category) => {
    setPlayerCategories(prev => ({
      ...prev,
      [playerId]: parseInt(category)
    }));
  };

  // Save player categories
  const handleSaveCategories = () => {
    const updatedPlayers = auctionPlayers.map(p => ({
      ...p,
      base_price: playerCategories[p.id] || 3000
    }));
    setAuctionPlayers(updatedPlayers);
    setShowCategoryModal(false);
    alert('Player categories saved!');
  };

  // Calculate bid increment
  const getBidIncrement = (currentBid) => {
    if (currentBid < 10000) return 500;
    if (currentBid < 25000) return 1000;
    return 2500;
  };

  // Increment bid
  const handleIncrementBid = () => {
    const increment = getBidIncrement(currentBid);
    setCurrentBid(currentBid + increment);
  };

  // Decrement bid
  const handleDecrementBid = () => {
    const player = auctionPlayers[currentPlayerIndex];
    if (!player) return;
    
    const increment = getBidIncrement(currentBid - 1);
    const newBid = currentBid - increment;
    if (newBid >= player.base_price) {
      setCurrentBid(newBid);
    }
  };

  const handleCreateAuction = async () => {
    if (!newAuction.auction_name) {
      alert('Please enter tournament/auction name');
      return;
    }

    if (!newAuction.team_budget || newAuction.team_budget <= 0) {
      alert('Please enter a valid budget per team');
      return;
    }

    setLoading(true);
    try {
      // Create auction in SIMPLE_AUCTIONS table
      const { data: auctionData, error: auctionError } = await supabase
        .from('simple_auctions')
        .insert([{
          tournament_name: newAuction.auction_name,
          status: 'active'
        }])
        .select();

      if (auctionError) throw auctionError;
      
      const newAuctionRecord = auctionData[0];

      // Use the budget entered by admin - same for all teams
      const budgetPerTeam = parseInt(newAuction.team_budget);

      // Create 4 default teams with the specified budget in SIMPLE_TEAMS table
      const defaultTeams = [
        { auction_id: newAuctionRecord.id, team_name: 'Team A', total_budget: budgetPerTeam, remaining_budget: budgetPerTeam },
        { auction_id: newAuctionRecord.id, team_name: 'Team B', total_budget: budgetPerTeam, remaining_budget: budgetPerTeam },
        { auction_id: newAuctionRecord.id, team_name: 'Team C', total_budget: budgetPerTeam, remaining_budget: budgetPerTeam },
        { auction_id: newAuctionRecord.id, team_name: 'Team D', total_budget: budgetPerTeam, remaining_budget: budgetPerTeam }
      ];

      const { error: teamsError } = await supabase
        .from('simple_teams')
        .insert(defaultTeams);

      if (teamsError) throw teamsError;

      alert(`✅ Auction created with 4 teams (₹${budgetPerTeam.toLocaleString()} each)!`);
      setCurrentAuction(newAuctionRecord);
      setNewAuction({ tournament_id: '', auction_name: '', status: 'scheduled', team_budget: 100000 });
      await loadAuctionsFromSupabase();
      await loadTeamsFromSupabase();
    } catch (error) {
      console.error('Error creating auction:', error);
      alert('Error creating auction: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (playerId, teamId, bidAmount) => {
    if (!currentAuction) {
      alert('Please select an active auction');
      return;
    }

    setLoading(true);
    try {
      // Record bid in bid_history
      const { error: bidError } = await supabase
        .from('bid_history')
        .insert([{
          auction_id: currentAuction.id,
          player_id: playerId,
          team_id: teamId,
          bid_amount: bidAmount
        }]);

      if (bidError) throw bidError;

      setCurrentBid(bidAmount);
      alert(`Bid placed: ₹${bidAmount}`);
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Error placing bid: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSoldPlayer = async () => {
    if (!currentAuction || !auctionPlayers[currentPlayerIndex]) {
      alert('No active auction or player');
      return;
    }

    if (!selectedTeamForBid || currentBid === 0) {
      alert('Please select a team and place a bid');
      return;
    }

    setLoading(true);
    try {
      const player = auctionPlayers[currentPlayerIndex];

      // Create auction transaction
      const { error: transactionError } = await supabase
        .from('auction_transactions')
        .insert([{
          auction_id: currentAuction.id,
          player_id: player.id,
          team_id: selectedTeamForBid,
          final_price: currentBid,
          base_price: player.base_price,
          transaction_type: 'sold',
          auction_order: currentPlayerIndex + 1
        }]);

      if (transactionError) throw transactionError;

      // Add player to team squad
      const { error: squadError } = await supabase
        .from('team_squads')
        .insert([{
          tournament_id: currentAuction.tournament_id,
          team_id: selectedTeamForBid,
          player_id: player.id,
          purchase_price: currentBid
        }]);

      if (squadError) throw squadError;

      // Update team budget
      const team = teams.find(t => t.id === selectedTeamForBid);
      if (team) {
        const { error: budgetError } = await supabase
          .from('teams')
          .update({ 
            remaining_budget: team.remaining_budget - currentBid,
            players_count: team.players_count + 1
          })
          .eq('id', selectedTeamForBid);

        if (budgetError) throw budgetError;
      }

      // Update player status
      const { error: playerError } = await supabase
        .from('player_registrations')
        .update({ status: 'sold' })
        .eq('id', player.id);

      if (playerError) throw playerError;

      alert(`Player ${player.name} sold to team for ₹${currentBid}!`);
      
      // Move to next player and set base price as current bid
      const nextIndex = currentPlayerIndex + 1;
      setCurrentPlayerIndex(nextIndex);
      
      if (nextIndex < auctionPlayers.length) {
        setCurrentBid(auctionPlayers[nextIndex].base_price);
      } else {
        setCurrentBid(0);
      }
      
      setSelectedTeamForBid('');
      
      await loadTeamsFromSupabase();
    } catch (error) {
      console.error('Error selling player:', error);
      alert('Error selling player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsoldPlayer = async () => {
    if (!currentAuction || !auctionPlayers[currentPlayerIndex]) {
      alert('No active auction or player');
      return;
    }

    setLoading(true);
    try {
      const player = auctionPlayers[currentPlayerIndex];

      // Create auction transaction
      const { error } = await supabase
        .from('auction_transactions')
        .insert([{
          auction_id: currentAuction.id,
          player_id: player.id,
          base_price: player.base_price,
          transaction_type: 'unsold',
          auction_order: currentPlayerIndex + 1
        }]);

      if (error) throw error;

      alert(`Player ${player.name} marked as unsold`);
      
      // Move to next player and set base price as current bid
      const nextIndex = currentPlayerIndex + 1;
      setCurrentPlayerIndex(nextIndex);
      
      if (nextIndex < auctionPlayers.length) {
        setCurrentBid(auctionPlayers[nextIndex].base_price);
      } else {
        setCurrentBid(0);
      }
      
      setSelectedTeamForBid('');
    } catch (error) {
      console.error('Error marking player unsold:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // MANUAL AUCTION ENTRY FUNCTIONS
  // ========================================

  const handleManualSoldEntry = async () => {
    if (!currentAuction) {
      alert('Please select or create an auction first');
      return;
    }

    if (!manualEntry.playerId || !manualEntry.amount || !manualEntry.teamId) {
      alert('Please fill all fields: Player, Amount, and Team');
      return;
    }

    setLoading(true);
    try {
      const amount = parseInt(manualEntry.amount);
      const playerId = manualEntry.playerId;
      
      // Get player details for display
      const { data: playerData, error: playerError } = await supabase
        .from('player_registrations_supabase')
        .select('name, phone')
        .eq('id', playerId)
        .limit(1);

      if (playerError) throw playerError;
      if (!playerData || playerData.length === 0) {
        throw new Error('Player not found');
      }

      const player = playerData[0];
      const team = teams.find(t => t.id === parseInt(manualEntry.teamId));

      if (!team) {
        throw new Error('Team not found. Please refresh and try again.');
      }

      // Check if team has enough budget
      if (team.remaining_budget < amount) {
        throw new Error(`Insufficient budget! Team has only ₹${team.remaining_budget.toLocaleString()} remaining.`);
      }

      // Insert into SIMPLE_PLAYER_SALES table (NEW - no foreign key errors!)
      const { data: saleData, error: saleError } = await supabase
        .from('simple_player_sales')
        .insert([{
          auction_id: currentAuction.id,
          player_name: player.name,
          player_phone: player.phone || '',
          team_name: team.team_name,
          team_id: manualEntry.teamId,
          sale_price: amount,
          transaction_type: 'sold',
          sale_order: soldPlayers.length + 1
        }])
        .select();

      if (saleError) throw saleError;
      
      const sale = saleData && saleData.length > 0 ? saleData[0] : null;

      // Update team budget in SIMPLE_TEAMS table
      const { error: budgetError } = await supabase
        .from('simple_teams')
        .update({ 
          remaining_budget: team.remaining_budget - amount,
          players_count: (team.players_count || 0) + 1
        })
        .eq('id', manualEntry.teamId)
        .eq('auction_id', currentAuction.id);

      if (budgetError) throw budgetError;

      // Store last transaction for undo
      if (sale) {
        setLastTransaction({
          saleId: sale.id,
          playerId: playerId,
          teamId: manualEntry.teamId,
          amount: amount,
          playerName: player.name
        });
        setSoldPlayers(prev => [...prev, sale]);
      }

      alert(`✅ Player "${player.name}" sold to ${team.team_name} for ₹${amount.toLocaleString()}`);
      
      // Reset form
      setManualEntry({ playerId: '', amount: '', teamId: '' });
      
      // Reload data
      await loadTeamsFromSupabase();
      await loadSoldPlayers();
    } catch (error) {
      console.error('Error adding manual entry:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoLastEntry = async () => {
    if (!lastTransaction) {
      alert('No transaction to undo');
      return;
    }

    if (!window.confirm(`Undo sale of "${lastTransaction.playerName}" for ₹${lastTransaction.amount.toLocaleString()}?`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete from SIMPLE_PLAYER_SALES (NEW!)
      const { error: saleError } = await supabase
        .from('simple_player_sales')
        .delete()
        .eq('id', lastTransaction.saleId);

      if (saleError) throw saleError;

      // Restore team budget in SIMPLE_TEAMS
      const team = teams.find(t => t.id === parseInt(lastTransaction.teamId));
      if (team) {
        const { error: budgetError } = await supabase
          .from('simple_teams')
          .update({ 
            remaining_budget: team.remaining_budget + lastTransaction.amount,
            players_count: Math.max(0, (team.players_count || 0) - 1)
          })
          .eq('id', lastTransaction.teamId)
          .eq('auction_id', currentAuction.id);

        if (budgetError) throw budgetError;
      } else {
        console.warn('Team not found for undo, budget not restored');
      }

      alert('✅ Transaction undone successfully');
      setLastTransaction(null);
      
      // Reload data
      await loadTeamsFromSupabase();
      await loadSoldPlayers();
    } catch (error) {
      console.error('Error undoing transaction:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSoldPlayer = async (soldPlayer) => {
    if (!window.confirm(`Delete "${soldPlayer.player_name}" from ${soldPlayer.team_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete from SIMPLE_PLAYER_SALES (NEW!)
      const { error: saleError } = await supabase
        .from('simple_player_sales')
        .delete()
        .eq('id', soldPlayer.id);

      if (saleError) throw saleError;

      // Restore team budget in SIMPLE_TEAMS
      const team = teams.find(t => t.id === parseInt(soldPlayer.team_id));
      if (team && soldPlayer.sale_price) {
        const { error: budgetError } = await supabase
          .from('simple_teams')
          .update({ 
            remaining_budget: team.remaining_budget + soldPlayer.sale_price,
            players_count: Math.max(0, (team.players_count || 0) - 1)
          })
          .eq('id', soldPlayer.team_id)
          .eq('auction_id', currentAuction.id);

        if (budgetError) throw budgetError;
      }

      alert('✅ Player deleted successfully');
      
      // Reload data
      await loadTeamsFromSupabase();
      await loadSoldPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSoldPlayers = async () => {
    if (!currentAuction) return;

    try {
      // Load from SIMPLE_PLAYER_SALES table (NEW!)
      const { data, error } = await supabase
        .from('simple_player_sales')
        .select('*')
        .eq('auction_id', currentAuction.id)
        .order('sale_time', { ascending: false });

      if (error) throw error;
      setSoldPlayers(data || []);
    } catch (error) {
      console.error('Error loading sold players:', error);
    }
  };

  const handleRefreshAuctionData = async () => {
    setLoading(true);
    try {
      await loadTeamsFromSupabase();
      await loadSoldPlayers();
      alert('✅ Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Error refreshing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this auction? This will also delete all associated transactions.')) {
      return;
    }

    setLoading(true);
    try {
      // Delete auction transactions first
      const { error: transError } = await supabase
        .from('auction_transactions')
        .delete()
        .eq('auction_id', auctionId);

      if (transError) throw transError;

      // Delete the auction
      const { error: auctionError } = await supabase
        .from('live_auctions')
        .delete()
        .eq('id', auctionId);

      if (auctionError) throw auctionError;

      alert('✅ Auction deleted successfully');
      await loadAuctionsFromSupabase();
      
      // Clear current auction if it was deleted
      if (currentAuction?.id === auctionId) {
        setCurrentAuction(null);
      }
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPlayerUnsold = async (soldPlayer) => {
    if (!window.confirm(`Mark "${soldPlayer.player_name}" as UNSOLD and restore team budget?`)) {
      return;
    }

    setLoading(true);
    try {
      // Update record in SIMPLE_PLAYER_SALES to mark as unsold (NEW!)
      const { error: updateError } = await supabase
        .from('simple_player_sales')
        .update({
          team_name: null,
          team_id: null,
          sale_price: null,
          transaction_type: 'unsold'
        })
        .eq('id', soldPlayer.id);

      if (updateError) throw updateError;

      // Restore team budget in SIMPLE_TEAMS
      const team = teams.find(t => t.id === parseInt(soldPlayer.team_id));
      if (team && soldPlayer.sale_price) {
        const { error: budgetError } = await supabase
          .from('simple_teams')
          .update({ 
            remaining_budget: team.remaining_budget + soldPlayer.sale_price,
            players_count: Math.max(0, (team.players_count || 0) - 1)
          })
          .eq('id', soldPlayer.team_id)
          .eq('auction_id', currentAuction.id);

        if (budgetError) throw budgetError;
      } else if (!team) {
        console.warn('Team not found, budget not restored');
      }

      alert('✅ Player marked as UNSOLD successfully');
      
      // Reload data
      await loadTeamsFromSupabase();
      await loadSoldPlayers();
    } catch (error) {
      console.error('Error marking player unsold:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUnsoldEntry = async (playerId, playerName) => {
    if (!currentAuction) {
      alert('Please select or create an auction first');
      return;
    }

    if (!window.confirm(`Mark "${playerName}" as UNSOLD?`)) {
      return;
    }

    setLoading(true);
    try {
      // Get player details
      const { data: playerData, error: playerError } = await supabase
        .from('player_registrations_supabase')
        .select('name, phone')
        .eq('id', playerId)
        .limit(1);

      if (playerError) throw playerError;
      const player = playerData && playerData.length > 0 ? playerData[0] : { name: playerName, phone: '' };

      // Insert into SIMPLE_PLAYER_SALES as unsold (NEW - no foreign key errors!)
      const { error: saleError } = await supabase
        .from('simple_player_sales')
        .insert([{
          auction_id: currentAuction.id,
          player_name: player.name,
          player_phone: player.phone || '',
          team_name: null,
          team_id: null,
          sale_price: null,
          transaction_type: 'unsold'
        }]);

      if (saleError) throw saleError;

      alert(`✅ Player "${playerName}" marked as UNSOLD`);
      
      // Reload data
      await loadSoldPlayers();
    } catch (error) {
      console.error('Error marking player unsold:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load sold players and teams when auction changes
  useEffect(() => {
    if (currentAuction) {
      loadSoldPlayers();
      loadTeamsFromSupabase();
    }
  }, [currentAuction]);

  // ========================================
  // TEAM MANAGEMENT FUNCTIONS
  // ========================================

  const loadTeamSquads = async (tournamentId, teamId) => {
    setLoading(true);
    try {
      // For old team_squads table (keeping for backward compatibility)
      const { data, error } = await supabase
        .from('team_squads')
        .select(`
          *,
          player_registrations (name, phone_number, cricket_role)
        `)
        .eq('tournament_id', tournamentId)
        .eq('team_id', teamId)
        .eq('is_active', true);

      if (error) throw error;
      setTeamSquads(data || []);
    } catch (error) {
      console.error('Error loading team squads:', error);
      alert('Error loading team squads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load team details with players from simple tables
  const loadTeamDetailsFromAuction = async (teamId) => {
    if (!currentAuction) {
      alert('Please select an auction first');
      return;
    }

    setLoading(true);
    try {
      // Load team info
      const { data: teamData, error: teamError } = await supabase
        .from('simple_teams')
        .select('*')
        .eq('id', teamId)
        .eq('auction_id', currentAuction.id)
        .single();

      if (teamError) throw teamError;

      // Load all players for this team
      const { data: playersData, error: playersError } = await supabase
        .from('simple_player_sales')
        .select('*')
        .eq('team_id', teamId)
        .eq('auction_id', currentAuction.id)
        .eq('transaction_type', 'sold')
        .order('sale_time', { ascending: false });

      if (playersError) throw playersError;

      // Calculate total cost
      const totalCost = playersData.reduce((sum, player) => sum + (player.sale_price || 0), 0);

      // Set team squads with player details
      const formattedSquad = playersData.map(player => ({
        id: player.id,
        player_name: player.player_name,
        player_phone: player.player_phone,
        sale_price: player.sale_price,
        sale_time: player.sale_time,
        team_name: teamData.team_name,
        total_budget: teamData.total_budget,
        remaining_budget: teamData.remaining_budget
      }));

      setTeamSquads(formattedSquad);
      
      return {
        team: teamData,
        players: playersData,
        totalCost,
        playerCount: playersData.length
      };
    } catch (error) {
      console.error('Error loading team details:', error);
      alert('Error loading team details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayerToTeam = async (playerId) => {
    if (!selectedTournamentForTeams || !selectedTeamForPlayers) {
      alert('Please select tournament and team');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_squads')
        .insert([{
          tournament_id: selectedTournamentForTeams,
          team_id: selectedTeamForPlayers,
          player_id: playerId,
          purchase_price: 0
        }]);

      if (error) throw error;

      alert('Player added to team successfully!');
      await loadTeamSquads(selectedTournamentForTeams, selectedTeamForPlayers);
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTeamCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!selectedTournamentForTeams || !selectedTeamForPlayers) {
          alert('Please select tournament and team first');
          return;
        }

        setLoading(true);

        // Assuming CSV has columns: player_name, jersey_number, player_role
        for (const row of jsonData) {
          // Find player by name
          const { data: playerData, error: playerError } = await supabase
            .from('player_registrations')
            .select('id')
            .eq('name', row.player_name)
            .single();

          if (playerError || !playerData) {
            console.warn(`Player ${row.player_name} not found`);
            continue;
          }

          // Add to team squad
          const { error: squadError } = await supabase
            .from('team_squads')
            .insert([{
              tournament_id: selectedTournamentForTeams,
              team_id: selectedTeamForPlayers,
              player_id: playerData.id,
              jersey_number: row.jersey_number || null,
              player_role: row.player_role || 'Player'
            }]);

          if (squadError) {
            console.error(`Error adding ${row.player_name}:`, squadError);
          }
        }

        alert('Players uploaded successfully!');
        await loadTeamSquads(selectedTournamentForTeams, selectedTeamForPlayers);
      } catch (error) {
        console.error('Error uploading CSV:', error);
        alert('Error uploading CSV: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemovePlayerFromTeam = async (squadId) => {
    if (!window.confirm('Remove this player from team?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_squads')
        .update({ is_active: false })
        .eq('id', squadId);

      if (error) throw error;

      alert('Player removed from team!');
      await loadTeamSquads(selectedTournamentForTeams, selectedTeamForPlayers);
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    sessionStorage.setItem('splAdminLoggedIn', 'true');
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-section">
      <h2>Admin Panel</h2>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: 20, borderBottom: '2px solid #333' }}>
        <button 
          className={activeTab === 'players' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('players')}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Players ({players.length})
        </button>
        <button 
          className={activeTab === 'tournaments' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('tournaments')}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Tournaments ({tournaments.length})
        </button>
        <button 
          className={activeTab === 'schedules' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('schedules')}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Schedules ({schedules.length})
        </button>
        <button 
          className={activeTab === 'generate-schedule' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('generate-schedule')}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Generate Schedule
        </button>
        <button 
          className={activeTab === 'create-tournament' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('create-tournament')}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Create Tournament
        </button>
        <button 
          className={activeTab === 'auction' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('auction')}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Auction ({auctions.length})
        </button>
        <button 
          className={activeTab === 'team-management' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('team-management')}
          style={{ marginBottom: 10 }}
        >
          Team Management
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#00ff00', marginBottom: 10 }}>Loading...</div>}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div>
          <h3>Registered Players</h3>
          <button className="btn-primary" onClick={downloadPlayersExcel} style={{marginBottom:16, marginRight: 10}}>
            Download Excel
          </button>
          <button className="btn-secondary" onClick={loadPlayersFromSupabase} style={{marginBottom:16}}>
            Refresh from Database
          </button>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Building</th>
                  <th>Wing</th>
                  <th>Flat</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr><td colSpan="7" style={{textAlign:'center'}}>No registrations yet.</td></tr>
                )}
                {players.map((p, idx) => (
                  <tr key={p.id || idx}>
                    {editIndex === idx ? (
                      <>
                        <td><input name="name" value={editForm.name} onChange={handlePlayerEditChange} /></td>
                        <td><input name="age" type="number" value={editForm.age} onChange={handlePlayerEditChange} /></td>
                        <td><input name="phone" value={editForm.phone} onChange={handlePlayerEditChange} /></td>
                        <td><input name="building" value={editForm.building} onChange={handlePlayerEditChange} /></td>
                        <td><input name="wing" value={editForm.wing} onChange={handlePlayerEditChange} /></td>
                        <td><input name="flat" value={editForm.flat} onChange={handlePlayerEditChange} /></td>
                        <td>
                          <button className="btn-primary" onClick={handlePlayerEditSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button className="btn-secondary" onClick={()=>setEditIndex(null)} disabled={loading}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{p.name}</td>
                        <td>{p.age}</td>
                        <td>{p.phone}</td>
                        <td>{p.building}</td>
                        <td>{p.wing}</td>
                        <td>{p.flat}</td>
                        <td>
                          <button className="btn-secondary" onClick={()=>handlePlayerEdit(idx)} disabled={loading}>
                            Edit
                          </button>
                          <button className="btn-danger" onClick={()=>handlePlayerDelete(idx)} disabled={loading}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && (
        <div>
          <h3>Tournaments</h3>
          <button className="btn-primary" onClick={downloadTournamentsExcel} style={{marginBottom:16, marginRight: 10}}>
            Download Excel
          </button>
          <button className="btn-secondary" onClick={loadTournamentsFromSupabase} style={{marginBottom:16}}>
            Refresh from Database
          </button>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tournament Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign:'center'}}>No tournaments yet.</td></tr>
                )}
                {tournaments.map((t) => (
                  <tr key={t.id}>
                    {editingTournament?.id === t.id ? (
                      <>
                        <td><input name="name" value={editingTournament.name} onChange={handleTournamentEditChange} /></td>
                        <td><input name="start_date" type="date" value={editingTournament.start_date} onChange={handleTournamentEditChange} /></td>
                        <td><input name="end_date" type="date" value={editingTournament.end_date} onChange={handleTournamentEditChange} /></td>
                        <td><input name="venue" value={editingTournament.venue} onChange={handleTournamentEditChange} /></td>
                        <td>
                          <select name="status" value={editingTournament.status} onChange={handleTournamentEditChange}>
                            <option value="upcoming">Upcoming</option>
                            <option value="registration_open">Registration Open</option>
                            <option value="auction_scheduled">Auction Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-primary" onClick={handleTournamentEditSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button className="btn-secondary" onClick={()=>setEditingTournament(null)} disabled={loading}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{t.name}</td>
                        <td>{t.start_date}</td>
                        <td>{t.end_date}</td>
                        <td>{t.venue}</td>
                        <td>{t.status}</td>
                        <td>
                          <button className="btn-secondary" onClick={()=>handleTournamentEdit(t)} disabled={loading}>
                            Edit
                          </button>
                          <button className="btn-danger" onClick={()=>handleTournamentDelete(t.id)} disabled={loading}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div>
          <h3>Match Schedules</h3>
          <button className="btn-primary" onClick={downloadSchedulesExcel} style={{marginBottom:16, marginRight: 10}}>
            Download Excel
          </button>
          <button className="btn-secondary" onClick={loadSchedulesFromSupabase} style={{marginBottom:16}}>
            Refresh from Database
          </button>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Match #</th>
                  <th>Team 1 ID</th>
                  <th>Team 2 ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 && (
                  <tr><td colSpan="9" style={{textAlign:'center'}}>No schedules yet.</td></tr>
                )}
                {schedules.map((s) => (
                  <tr key={s.id}>
                    {editingSchedule?.id === s.id ? (
                      <>
                        <td>{s.match_number}</td>
                        <td><input name="team1_id" value={editingSchedule.team1_id} onChange={handleScheduleEditChange} /></td>
                        <td><input name="team2_id" value={editingSchedule.team2_id} onChange={handleScheduleEditChange} /></td>
                        <td><input name="match_date" type="date" value={editingSchedule.match_date} onChange={handleScheduleEditChange} /></td>
                        <td><input name="match_time" type="time" value={editingSchedule.match_time} onChange={handleScheduleEditChange} /></td>
                        <td><input name="venue" value={editingSchedule.venue} onChange={handleScheduleEditChange} /></td>
                        <td>
                          <select name="match_type" value={editingSchedule.match_type} onChange={handleScheduleEditChange}>
                            <option value="league">League</option>
                            <option value="semi-final">Semi-Final</option>
                            <option value="final">Final</option>
                            <option value="qualifier">Qualifier</option>
                          </select>
                        </td>
                        <td>
                          <select name="status" value={editingSchedule.status} onChange={handleScheduleEditChange}>
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="postponed">Postponed</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-primary" onClick={handleScheduleEditSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button className="btn-secondary" onClick={()=>setEditingSchedule(null)} disabled={loading}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{s.match_number}</td>
                        <td>{s.team1_id}</td>
                        <td>{s.team2_id}</td>
                        <td>{s.match_date}</td>
                        <td>{s.match_time}</td>
                        <td>{s.venue}</td>
                        <td>{s.match_type}</td>
                        <td>{s.status}</td>
                        <td>
                          <button className="btn-secondary" onClick={()=>handleScheduleEdit(s)} disabled={loading}>
                            Edit
                          </button>
                          <button className="btn-danger" onClick={()=>handleScheduleDelete(s.id)} disabled={loading}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Schedule Tab */}
      {activeTab === 'generate-schedule' && (
        <div>
          <h3>Generate Tournament Schedule</h3>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 30 }}>
              <label style={{ display: 'block', marginBottom: 10, fontSize: 16 }}>
                Select Tournament *
              </label>
              <select
                value={scheduleGenTournament}
                onChange={(e) => setScheduleGenTournament(e.target.value)}
                style={{ width: '100%', padding: 12, fontSize: 16 }}
              >
                <option value="">-- Select Tournament --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.total_teams} teams)
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn-primary"
              onClick={handleGenerateSchedule}
              disabled={loading || !scheduleGenTournament}
              style={{ width: '100%', padding: 15, fontSize: 16, marginBottom: 20 }}
            >
              {loading ? 'Generating...' : 'Generate Round-Robin Schedule'}
            </button>

            {generatedMatches.length > 0 && (
              <div style={{ marginTop: 30 }}>
                <h4 style={{ marginBottom: 15 }}>
                  Generated Matches ({generatedMatches.length})
                </h4>
                
                <div style={{ 
                  maxHeight: 400, 
                  overflowY: 'auto', 
                  border: '1px solid #333',
                  borderRadius: 8,
                  marginBottom: 20 
                }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Match #</th>
                        <th>Team 1</th>
                        <th>vs</th>
                        <th>Team 2</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedMatches.map((match, idx) => (
                        <tr key={idx}>
                          <td>{match.match_number}</td>
                          <td>{match.team1_name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>vs</td>
                          <td>{match.team2_name}</td>
                          <td>{match.match_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleSaveGeneratedSchedule}
                  disabled={loading}
                  style={{ width: '100%', padding: 15, fontSize: 16 }}
                >
                  {loading ? 'Saving...' : `Save ${generatedMatches.length} Matches to Database`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Tournament Tab */}
      {activeTab === 'create-tournament' && (
        <div>
          <h3>Create New Tournament</h3>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Tournament Name *</label>
              <input 
                type="text"
                value={newTournament.name}
                onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                style={{ width: '100%', padding: 8 }}
                placeholder="e.g., SPL 2025"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Tournament Type</label>
                <select 
                  value={newTournament.tournament_type}
                  onChange={(e) => setNewTournament({...newTournament, tournament_type: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Number of Teams *</label>
                <input 
                  type="number"
                  value={newTournament.total_teams}
                  onChange={(e) => setNewTournament({...newTournament, total_teams: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: 8 }}
                  min="2"
                  max="16"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Max Players Per Team</label>
                <input 
                  type="number"
                  value={newTournament.max_players_per_team}
                  onChange={(e) => setNewTournament({...newTournament, max_players_per_team: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: 8 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Team Budget (₹)</label>
                <input 
                  type="number"
                  value={100000}
                  disabled
                  style={{ width: '100%', padding: 8, background: '#333', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#888' }}>Fixed at ₹1,00,000 per team</small>
              </div>
            </div>

            <div style={{ marginBottom: 30 }}>
              <h4>Team Names ({teamNames.length}/{newTournament.total_teams})</h4>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <input 
                  type="text"
                  value={currentTeamName}
                  onChange={(e) => setCurrentTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeamName()}
                  style={{ flex: 1, padding: 8 }}
                  placeholder="Enter team name"
                />
                <button className="btn-primary" onClick={handleAddTeamName} disabled={teamNames.length >= newTournament.total_teams}>
                  Add Team
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {teamNames.map((name, idx) => (
                  <div key={idx} style={{ 
                    padding: 10, 
                    background: '#1a1a1a', 
                    borderRadius: 5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{name}</span>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleRemoveTeamName(idx)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleCreateTournament} 
              disabled={loading || teamNames.length !== newTournament.total_teams}
              style={{ width: '100%', padding: 15, fontSize: 16 }}
            >
              {loading ? 'Creating...' : 'Create Tournament'}
            </button>
          </div>
        </div>
      )}

      {/* Auction Tab */}
      {activeTab === 'auction' && (
        <div>
          <h3>Auction Management</h3>
          
          {/* Create New Auction */}
          <div style={{ marginBottom: 30, padding: 20, background: '#1a1a1a', borderRadius: 10 }}>
            <h4>Create New Auction</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Select Tournament</label>
                <select 
                  value={newAuction.tournament_id}
                  onChange={(e) => setNewAuction({...newAuction, tournament_id: e.target.value})}
                  style={{ width: '100%', padding: 8, color: '#000', background: '#fff' }}
                >
                  <option value="">-- Select Tournament --</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Auction Name</label>
                <input 
                  type="text"
                  value={newAuction.auction_name}
                  onChange={(e) => setNewAuction({...newAuction, auction_name: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                  placeholder="e.g., SPL 2025 Auction"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Budget Per Team (₹)</label>
                <input 
                  type="number"
                  value={newAuction.team_budget}
                  onChange={(e) => setNewAuction({...newAuction, team_budget: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                  placeholder="e.g., 100000"
                  min="1000"
                />
              </div>
            </div>
            <div style={{ marginBottom: 10, padding: 10, background: '#2a2a2a', borderRadius: 5, fontSize: '0.9em' }}>
              💡 <strong>Note:</strong> All 4 teams (Team A, B, C, D) will get ₹{parseInt(newAuction.team_budget || 0).toLocaleString()} each
            </div>
            <button className="btn-primary" onClick={handleCreateAuction} disabled={loading}>
              Start Auction
            </button>
          </div>

          {/* Load Players */}
          <div style={{ marginBottom: 30, padding: 20, background: '#1a1a1a', borderRadius: 10 }}>
            <h4>Load Players for Auction</h4>
            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
              <button className="btn-primary" onClick={handleLoadPlayersFromSupabase} disabled={loading}>
                Load from Database
              </button>
              <span>OR</span>
              <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                Upload CSV
                <input 
                  type="file" 
                  accept=".csv,.xlsx,.xls"
                  onChange={handleUploadAuctionCSV}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ color: '#888' }}>
                {auctionPlayers.length} players loaded
              </span>
            </div>
          </div>

          {/* Manual Player Entry */}
          {currentAuction && (
            <div style={{ marginBottom: 30, padding: 20, background: '#1a1a1a', borderRadius: 10, border: '2px solid #a855f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h4 style={{ color: '#00f2fe', margin: 0 }}>Manual Player Entry</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    className="btn-secondary" 
                    onClick={handleRefreshAuctionData}
                    disabled={loading}
                    style={{ padding: '8px 16px', fontSize: 14 }}
                  >
                    🔄 Refresh
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={handleUndoLastEntry}
                    disabled={!lastTransaction || loading}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: 14,
                      background: lastTransaction ? '#fbbf24' : '#333',
                      cursor: lastTransaction ? 'pointer' : 'not-allowed'
                    }}
                  >
                    ↶ Undo Last
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 1fr', gap: 15, marginBottom: 15 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 5, color: '#e9f6ff' }}>
                    Player Name
                  </label>
                  <select 
                    value={manualEntry.playerId}
                    onChange={(e) => setManualEntry({...manualEntry, playerId: e.target.value})}
                    style={{ width: '100%', padding: 10, fontSize: 16, color: '#000', background: '#fff' }}
                  >
                    <option value="">-- Select Player --</option>
                    {registeredPlayers
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} {player.phone_number ? `(${player.phone_number})` : ''}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 5, color: '#e9f6ff' }}>
                    Amount (₹)
                  </label>
                  <input 
                    type="number"
                    value={manualEntry.amount}
                    onChange={(e) => setManualEntry({...manualEntry, amount: e.target.value})}
                    style={{ width: '100%', padding: 10, fontSize: 16 }}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 5, color: '#e9f6ff' }}>
                    Team
                  </label>
                  <select 
                    value={manualEntry.teamId}
                    onChange={(e) => setManualEntry({...manualEntry, teamId: e.target.value})}
                    style={{ width: '100%', padding: 10, fontSize: 16, color: '#000', background: '#fff' }}
                  >
                    <option value="">-- Select Team --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.team_name} (₹{t.remaining_budget?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleManualSoldEntry}
                    disabled={loading || !manualEntry.playerId || !manualEntry.amount || !manualEntry.teamId}
                    style={{ 
                      flex: 1,
                      padding: 10,
                      fontSize: 16,
                      background: 'linear-gradient(135deg, #10b981 0%, #00f2fe 100%)',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓ SOLD
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      if (!manualEntry.playerId) {
                        alert('Please select a player');
                        return;
                      }
                      const selectedPlayer = registeredPlayers.find(p => p.id === manualEntry.playerId);
                      handleManualUnsoldEntry(manualEntry.playerId, selectedPlayer?.name || 'Player');
                    }}
                    disabled={loading || !manualEntry.playerId}
                    style={{ 
                      flex: 1,
                      padding: 10,
                      fontSize: 16,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      fontWeight: 'bold',
                      cursor: !manualEntry.playerId ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ✗ UNSOLD
                  </button>
                </div>
              </div>

              {lastTransaction && (
                <div style={{ 
                  padding: 12, 
                  background: 'rgba(251, 191, 36, 0.1)', 
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#fbbf24'
                }}>
                  <strong>Last Entry:</strong> {lastTransaction.playerName} - ₹{lastTransaction.amount.toLocaleString()} (Click "Undo Last" to reverse)
                </div>
              )}

              {/* Sold Players List */}
              {soldPlayers.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h5 style={{ color: '#00f2fe', marginBottom: 15 }}>
                    Sold Players ({soldPlayers.length})
                  </h5>
                  <div style={{ 
                    maxHeight: 400, 
                    overflow: 'auto',
                    background: '#0a0a1f',
                    borderRadius: 8,
                    padding: 10
                  }}>
                    <table className="admin-table" style={{ fontSize: 14 }}>
                      <thead>
                        <tr>
                          <th>Player Name</th>
                          <th>Team</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldPlayers.map((sp, index) => (
                          <tr key={sp.id || index}>
                            <td>{sp.player_name || 'Unknown'}</td>
                            <td>{sp.team_name || 'Unknown Team'}</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>
                              ₹{sp.sale_price?.toLocaleString()}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  className="btn-secondary" 
                                  onClick={() => handleMarkPlayerUnsold(sp)}
                                  disabled={loading}
                                  style={{ padding: '5px 12px', fontSize: 13, background: '#fbbf24' }}
                                >
                                  ↶ Unsold
                                </button>
                                <button 
                                  className="btn-danger" 
                                  onClick={() => handleDeleteSoldPlayer(sp)}
                                  disabled={loading}
                                  style={{ padding: '5px 12px', fontSize: 13 }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category Selection Modal */}
          {showCategoryModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              overflow: 'auto',
              padding: 20
            }}>
              <div style={{
                background: '#1a1a1a',
                padding: 30,
                borderRadius: 10,
                maxWidth: 1000,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <h3>Assign Player Categories</h3>
                <p style={{ color: '#888', marginBottom: 20 }}>
                  Select base price category for each player (₹3,000 / ₹5,000 / ₹10,000)
                </p>
                
                <div style={{ marginBottom: 20 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Player Name</th>
                        <th>Phone</th>
                        <th>Age</th>
                        <th>Base Price Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auctionPlayers.map(player => (
                        <tr key={player.id}>
                          <td>{player.name}</td>
                          <td>{player.phone_number}</td>
                          <td>{player.age}</td>
                          <td>
                            <select
                              value={playerCategories[player.id] || 3000}
                              onChange={(e) => handleSetPlayerCategory(player.id, e.target.value)}
                              style={{ padding: 8, width: '100%' }}
                            >
                              <option value="3000">₹3,000</option>
                              <option value="5000">₹5,000</option>
                              <option value="10000">₹10,000</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" onClick={handleSaveCategories}>
                    Save Categories
                  </button>
                  <button className="btn-secondary" onClick={() => setShowCategoryModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Conduct Auction */}
          {currentAuction && auctionPlayers.length > 0 && !showCategoryModal && (
            <div style={{ marginBottom: 30, padding: 20, background: '#1a1a1a', borderRadius: 10 }}>
              <h4>Live Auction: {currentAuction.tournament_name}</h4>
              
              {/* Team Purses Display */}
              <div style={{ marginBottom: 20, padding: 15, background: '#2a2a2a', borderRadius: 10 }}>
                <h5>Team Purses</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {teams.map(t => (
                    <div key={t.id} style={{ padding: 10, background: '#1a1a1a', borderRadius: 5 }}>
                      <div style={{ fontWeight: 'bold' }}>{t.team_name}</div>
                      <div style={{ color: '#00ff00', fontSize: 18 }}>
                        ₹{t.remaining_budget?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        Players: {t.players_count || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {currentPlayerIndex < auctionPlayers.length ? (
                <div>
                  <div style={{ marginBottom: 20, padding: 20, background: '#2a2a2a', borderRadius: 10 }}>
                    <h3 style={{ color: '#00ff00', marginBottom: 10 }}>
                      Current Player: {auctionPlayers[currentPlayerIndex].name}
                    </h3>
                    <p>Age: {auctionPlayers[currentPlayerIndex].age}</p>
                    <p>Base Price: ₹{auctionPlayers[currentPlayerIndex].base_price?.toLocaleString()}</p>
                    <p>Phone: {auctionPlayers[currentPlayerIndex].phone_number}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Select Team</label>
                      <select 
                        value={selectedTeamForBid}
                        onChange={(e) => setSelectedTeamForBid(e.target.value)}
                        style={{ width: '100%', padding: 10 }}
                      >
                        <option value="">-- Select Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.team_name} (Budget: ₹{t.remaining_budget?.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Current Bid (₹)</label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button 
                          className="btn-secondary" 
                          onClick={handleDecrementBid}
                          style={{ padding: '10px 20px', fontSize: 18 }}
                        >
                          -
                        </button>
                        <input 
                          type="number"
                          value={currentBid}
                          onChange={(e) => setCurrentBid(parseInt(e.target.value) || 0)}
                          style={{ flex: 1, padding: 10, textAlign: 'center', fontSize: 18 }}
                          min={auctionPlayers[currentPlayerIndex].base_price}
                        />
                        <button 
                          className="btn-secondary" 
                          onClick={handleIncrementBid}
                          style={{ padding: '10px 20px', fontSize: 18 }}
                        >
                          +
                        </button>
                      </div>
                      <small style={{ color: '#888', display: 'block', marginTop: 5 }}>
                        Increment: ₹{getBidIncrement(currentBid).toLocaleString()} 
                        {currentBid < 10000 && ' (up to ₹10k)'}
                        {currentBid >= 10000 && currentBid < 25000 && ' (₹10k-₹25k)'}
                        {currentBid >= 25000 && ' (above ₹25k)'}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 15 }}>
                    <button 
                      className="btn-primary" 
                      onClick={handleSoldPlayer}
                      disabled={!selectedTeamForBid || currentBid === 0}
                      style={{ background: '#00aa00', flex: 1, padding: 15, fontSize: 18 }}
                    >
                      SOLD for ₹{currentBid.toLocaleString()}
                    </button>
                    <button 
                      className="btn-danger" 
                      onClick={handleUnsoldPlayer}
                      style={{ flex: 1, padding: 15, fontSize: 18 }}
                    >
                      UNSOLD
                    </button>
                  </div>

                  <div style={{ marginTop: 20, color: '#888', textAlign: 'center' }}>
                    Player {currentPlayerIndex + 1} of {auctionPlayers.length}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <h3 style={{ color: '#00ff00' }}>Auction Completed!</h3>
                  <p>All {auctionPlayers.length} players have been auctioned</p>
                </div>
              )}
            </div>
          )}

          {/* Auction History */}
          <div>
            <h4>Previous Auctions</h4>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Auction Name</th>
                    <th>Tournament</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign:'center'}}>No auctions yet.</td></tr>
                  )}
                  {auctions.map(a => (
                    <tr key={a.id}>
                      <td>{a.auction_name}</td>
                      <td>{tournaments.find(t => t.id === a.tournament_id)?.name}</td>
                      <td>{new Date(a.auction_date).toLocaleString()}</td>
                      <td>{a.status}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn-secondary" 
                            onClick={() => setCurrentAuction(a)}
                            style={{ padding: '5px 12px' }}
                          >
                            Select
                          </button>
                          <button 
                            className="btn-danger" 
                            onClick={() => handleDeleteAuction(a.id)}
                            disabled={loading}
                            style={{ padding: '5px 12px' }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Tab */}
      {activeTab === 'team-management' && (
        <div>
          <h3>Team Management</h3>
          
          {/* Auction Selection */}
          <div style={{ marginBottom: 30, padding: 20, background: '#1a1a1a', borderRadius: 10 }}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: '#00f2fe' }}>
                Select Active Auction
              </label>
              <select 
                value={currentAuction?.id || ''}
                onChange={(e) => {
                  const selected = auctions.find(a => a.id === parseInt(e.target.value));
                  setCurrentAuction(selected);
                  setTeamSquads([]);
                  if (selected) {
                    loadTeamsFromSupabase();
                  }
                }}
                style={{ width: '100%', padding: 10, fontSize: '1rem' }}
              >
                <option value="">-- Select Auction --</option>
                {auctions.map(a => (
                  <option key={a.id} value={a.id}>{a.tournament_name}</option>
                ))}
              </select>
            </div>

            {currentAuction && (
              <div style={{ padding: 15, background: '#2a2a2a', borderRadius: 5, marginTop: 15 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#00f2fe' }}>
                  📋 {currentAuction.tournament_name}
                </h4>
                <p style={{ margin: 0, color: '#888' }}>
                  Total Teams: {teams.length} | Status: {currentAuction.status}
                </p>
              </div>
            )}
          </div>

          {/* Teams Display */}
          {currentAuction && teams.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h4 style={{ marginBottom: 20 }}>Teams in {currentAuction.tournament_name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {teams.map(team => {
                  const teamSoldPlayers = soldPlayers.filter(p => p.team_id === team.id);
                  const totalSpent = teamSoldPlayers.reduce((sum, p) => sum + (p.sale_price || 0), 0);
                  
                  return (
                    <div 
                      key={team.id}
                      style={{
                        padding: 20,
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
                        borderRadius: 15,
                        border: '2px solid rgba(168, 85, 247, 0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => loadTeamDetailsFromAuction(team.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.borderColor = '#00f2fe';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                      }}
                    >
                      <h3 style={{ 
                        margin: '0 0 15px 0', 
                        color: '#00f2fe',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        {team.team_name}
                      </h3>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 10,
                        marginBottom: 15,
                        padding: 15,
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 8
                      }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#a8b3cf', marginBottom: 5 }}>
                            Total Budget
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                            ₹{team.total_budget?.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#a8b3cf', marginBottom: 5 }}>
                            Remaining
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00ff00' }}>
                            ₹{team.remaining_budget?.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#a8b3cf', marginBottom: 5 }}>
                            Spent
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                            ₹{totalSpent.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#a8b3cf', marginBottom: 5 }}>
                            Players
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffd700' }}>
                            {teamSoldPlayers.length}
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        textAlign: 'center', 
                        fontSize: '0.9rem', 
                        color: '#00f2fe',
                        padding: '8px',
                        background: 'rgba(0, 242, 254, 0.1)',
                        borderRadius: 5
                      }}>
                        Click to view squad details
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Squad Details */}
          {teamSquads.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20,
                padding: 20,
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
                borderRadius: 10
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#00f2fe' }}>
                    {teamSquads[0]?.team_name} - Squad Details
                  </h4>
                  <p style={{ margin: 0, color: '#a8b3cf' }}>
                    Total Players: {teamSquads.length} | 
                    Total Cost: ₹{teamSquads.reduce((sum, p) => sum + (p.sale_price || 0), 0).toLocaleString()} | 
                    Remaining Budget: ₹{teamSquads[0]?.remaining_budget?.toLocaleString()}
                  </p>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => setTeamSquads([])}
                  style={{ padding: '10px 20px' }}
                >
                  Close
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player Name</th>
                      <th>Phone</th>
                      <th>Purchase Price</th>
                      <th>Purchased At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamSquads.map((player, index) => (
                      <tr key={player.id}>
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: 'bold', color: '#00f2fe' }}>
                          {player.player_name}
                        </td>
                        <td>{player.player_phone || '-'}</td>
                        <td style={{ fontWeight: 'bold', color: '#00ff00' }}>
                          ₹{player.sale_price?.toLocaleString()}
                        </td>
                        <td>{new Date(player.sale_time).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(168, 85, 247, 0.2)', fontWeight: 'bold' }}>
                      <td colSpan="3" style={{ textAlign: 'right', paddingRight: 20 }}>
                        TOTAL:
                      </td>
                      <td style={{ color: '#00ff00', fontSize: '1.1rem' }}>
                        ₹{teamSquads.reduce((sum, p) => sum + (p.sale_price || 0), 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {!currentAuction && (
            <div style={{ 
              textAlign: 'center', 
              padding: 60, 
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: 15,
              border: '2px dashed rgba(168, 85, 247, 0.3)'
            }}>
              <h4 style={{ color: '#a8b3cf' }}>
                Please select an auction to view teams
              </h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
