// Test script to verify Supabase connection
// Run this with: node test-supabase.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://kyknunxxyjfpzdvamnqb.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING');

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('REPLACE_WITH')) {
  console.error('❌ Please update your .env file with the correct REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test 1: Check if table exists
    console.log('\n1. Testing table access...');
    const { data, error } = await supabase
      .from('player_registrations_supabase')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table access failed:', error.message);
      console.log('💡 Make sure you ran the SQL schema in your Supabase dashboard');
      return;
    }
    
    console.log('✅ Table access successful');
    console.log('Current records:', data?.length || 0);

    // Test 2: Test insert
    console.log('\n2. Testing insert...');
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
      return;
    }

    console.log('✅ Insert successful');
    console.log('Inserted record:', insertData[0]);

    // Clean up test record
    await supabase
      .from('player_registrations_supabase')
      .delete()
      .eq('id', insertData[0].id);

    console.log('\n🎉 All tests passed! Your Supabase connection is working correctly.');
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testConnection();