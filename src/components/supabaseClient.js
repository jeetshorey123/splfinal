import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnwabwghxbjtmdbujxjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2Fid2doeGJqdG1kYnVqeGp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg3NzA3NCwiZXhwIjoyMDY5NDUzMDc0fQ.OxSwuax6oP_zc94y5kHqWiI6epeCGjUHgoMirZGCASs'; // Use env variables in production
export const supabase = createClient(supabaseUrl, supabaseKey);

