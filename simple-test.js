// Simple Supabase test
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kyknunxxyjfpzdvamnqb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a251bnh4eWpmcHpkdmFtbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODM1NjAsImV4cCI6MjA3Nzg1OTU2MH0.g6lZCihDwXEVoz9HYqU223Izf5Uldlh4phYj8XZWePM';

console.log('Testing Supabase connection...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test connection by trying to select from the table
    const { data, error } = await supabase
      .from('player_registrations_supabase')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('💡 You may need to run the SQL schema first');
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('Current records in table:', data?.length || 0);
    
    // Test insert
    const testRecord = {
      name: 'Test Player',
      age: 25,
      phone: '9999999999',
      building: 'Test Building',
      wing: 'A',
      flat: '101'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('player_registrations_supabase')
      .insert([testRecord])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return false;
    }

    console.log('✅ Insert test successful!');
    
    // Clean up
    await supabase
      .from('player_registrations_supabase')
      .delete()
      .eq('id', insertData[0].id);
    
    console.log('🎉 All tests passed! Supabase is ready.');
    return true;
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    return false;
  }
}

testConnection();