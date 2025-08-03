import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnwabwghxbjtmdbujxjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2Fid2doeGJqdG1kYnVqeGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzcwNzQsImV4cCI6MjA2OTQ1MzA3NH0.jf6ADsIRXJYuw_8KLfyHgoj8vRDjfndlpVH68VPFF-c'; // Use env variables in production
export const supabase = createClient(supabaseUrl, supabaseKey);
