import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://kyknunxxyjfpzdvamnqb.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined' || supabaseKey === 'undefined') {
  console.error('Missing Supabase environment variables. Using fallback values.');
  console.log('URL:', supabaseUrl);
  console.log('Key present:', !!supabaseKey);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

