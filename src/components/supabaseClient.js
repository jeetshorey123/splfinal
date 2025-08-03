import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://boapmwiltbbohjswyiub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYXBtd2lsdGJib2hqc3d5aXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDA5OTEsImV4cCI6MjA2OTgxNjk5MX0.AZJAvDXac2kJlKrLNc-SZSd4howPHcJgtKeXhAIVfNA'; // Use env variables in production
export const supabase = createClient(supabaseUrl, supabaseKey);

