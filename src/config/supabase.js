import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://kyknunxxyjfpzdvamnqb.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a251bnh4eWpmcHpkdmFtbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODM1NjAsImV4cCI6MjA3Nzg1OTU2MH0.g6lZCihDwXEVoz9HYqU223Izf5Uldlh4phYj8XZWePM'

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
  console.error('Missing Supabase environment variables. Using fallback values.')
  console.log('URL:', supabaseUrl)
  console.log('Key present:', !!supabaseAnonKey)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  TEAMS: 'teams',
  PLAYERS: 'players',
  PLAYER_REGISTRATIONS: 'player_registrations_supabase', // New table for registration form
  TOURNAMENTS: 'tournaments',
  MATCHES: 'matches',
  AUCTIONS: 'auctions',
  AUCTION_HISTORY: 'auction_history'
}

// Helper functions for database operations
export const dbHelpers = {
  // Teams operations
  async getTeams() {
    const { data, error } = await supabase
      .from(TABLES.TEAMS)
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async createTeam(team) {
    const { data, error } = await supabase
      .from(TABLES.TEAMS)
      .insert([team])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateTeam(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.TEAMS)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Players operations
  async getPlayers() {
    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async createPlayer(player) {
    const { data, error } = await supabase
      .from(TABLES.PLAYER_REGISTRATIONS)
      .insert([player])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Tournaments operations
  async getTournaments() {
    const { data, error } = await supabase
      .from(TABLES.TOURNAMENTS)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createTournament(tournament) {
    const { data, error } = await supabase
      .from(TABLES.TOURNAMENTS)
      .insert([tournament])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateTournament(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.TOURNAMENTS)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Matches operations
  async getMatches(tournamentId = null) {
    let query = supabase
      .from(TABLES.MATCHES)
      .select('*')
      .order('date', { ascending: false })
    
    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async createMatch(match) {
    const { data, error } = await supabase
      .from(TABLES.MATCHES)
      .insert([match])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateMatch(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.MATCHES)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Auction operations
  async getAuction(auctionId) {
    const { data, error } = await supabase
      .from(TABLES.AUCTIONS)
      .select('*')
      .eq('id', auctionId)
      .single()
    
    if (error) throw error
    return data
  },

  async createAuction(auction) {
    const { data, error } = await supabase
      .from(TABLES.AUCTIONS)
      .insert([auction])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateAuction(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.AUCTIONS)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Auction history operations
  async getAuctionHistory(auctionId) {
    const { data, error } = await supabase
      .from(TABLES.AUCTION_HISTORY)
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  async addAuctionHistory(history) {
    const { data, error } = await supabase
      .from(TABLES.AUCTION_HISTORY)
      .insert([history])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

export default supabase 