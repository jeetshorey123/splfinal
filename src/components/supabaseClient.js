import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://kyknunxxyjfpzdvamnqb.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a251bnh4eWpmcHpkdmFtbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODM1NjAsImV4cCI6MjA3Nzg1OTU2MH0.g6lZCihDwXEVoz9HYqU223Izf5Uldlh4phYj8XZWePM';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined' || supabaseKey === 'undefined') {
  console.error('Missing Supabase environment variables. Using fallback values.');
  console.log('URL:', supabaseUrl);
  console.log('Key present:', !!supabaseKey);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

