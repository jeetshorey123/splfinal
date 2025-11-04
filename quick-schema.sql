-- Minimal schema for player registration testing
-- Copy and paste this into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the player registration table
CREATE TABLE IF NOT EXISTS public.player_registrations_supabase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INTEGER CHECK (age >= 5 AND age <= 100),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
    building TEXT,
    wing TEXT,
    flat TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.player_registrations_supabase ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_anonymous_insert_player_registrations" ON public.player_registrations_supabase;
DROP POLICY IF EXISTS "allow_read_player_registrations" ON public.player_registrations_supabase;

-- Create policy to allow anonymous inserts
CREATE POLICY "allow_anonymous_insert_player_registrations" ON public.player_registrations_supabase
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow reading registrations
CREATE POLICY "allow_read_player_registrations" ON public.player_registrations_supabase
    FOR SELECT
    USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pr_supabase_phone ON public.player_registrations_supabase(phone);

-- Insert sample data for testing
INSERT INTO public.player_registrations_supabase (name, age, phone, building, wing, flat) VALUES
('Amit Sharma', 28, '9876543210', 'Sankalp 1', 'A', '101'),
('Ravi Verma', 22, '9876543211', 'Sankalp 2', 'B', '202')
ON CONFLICT DO NOTHING;