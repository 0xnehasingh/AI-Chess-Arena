-- Combined Migration SQL for AI Chess Arena
-- Generated on: 2025-09-01T09:50:45.688Z
-- Execute this in your Supabase SQL Editor


-- ========================================
-- Migration: 001_initial_schema.sql
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    wallet_address VARCHAR(42),
    total_winnings DECIMAL(10,2) DEFAULT 0,
    total_bets INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sponsor VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
    prize_pool DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id),
    champion_white VARCHAR(20) NOT NULL CHECK (champion_white IN ('ChatGPT', 'Claude')),
    champion_black VARCHAR(20) NOT NULL CHECK (champion_black IN ('ChatGPT', 'Claude')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    winner VARCHAR(20) CHECK (winner IN ('ChatGPT', 'Claude', 'draw')),
    move_count INTEGER DEFAULT 0,
    pgn TEXT,
    betting_closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
    total_pool DECIMAL(10,2) DEFAULT 0,
    chatgpt_pool DECIMAL(10,2) DEFAULT 0,
    claude_pool DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    match_id UUID NOT NULL REFERENCES matches(id),
    champion VARCHAR(20) NOT NULL CHECK (champion IN ('ChatGPT', 'Claude')),
    amount DECIMAL(10,2) NOT NULL,
    potential_payout DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    payout_amount DECIMAL(10,2),
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_moves table
CREATE TABLE IF NOT EXISTS match_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id),
    move_number INTEGER NOT NULL,
    champion VARCHAR(20) NOT NULL CHECK (champion IN ('ChatGPT', 'Claude')),
    move VARCHAR(10) NOT NULL,
    position_after TEXT NOT NULL,
    thinking_time INTEGER,
    evaluation DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON matches(start_time);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_match_moves_match_id ON match_moves(match_id);
CREATE INDEX IF NOT EXISTS idx_match_moves_move_number ON match_moves(move_number);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON bets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile and bets
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public tables (no RLS needed for read access)
-- matches, tournaments, match_moves can be read by everyone

-- Insert sample data
INSERT INTO tournaments (name, description, sponsor, start_date, end_date, prize_pool) VALUES
('AI Chess Championship 2024', 'The ultimate battle between AI chess champions', 'DeFi Core', '2024-01-15 10:00:00+00', '2024-01-20 18:00:00+00', 10000.00),
('Moonbeam AI Tournament', 'AI chess tournament on Moonbeam network', 'Moonbeam Foundation', '2024-02-01 12:00:00+00', '2024-02-05 20:00:00+00', 15000.00),
('Metis Challenge', 'Professional AI chess challenge', 'Metis', '2024-02-15 14:00:00+00', '2024-02-18 16:00:00+00', 8000.00);

-- Insert sample matches
INSERT INTO matches (tournament_id, champion_white, champion_black, start_time, betting_closes_at) VALUES
((SELECT id FROM tournaments WHERE name = 'AI Chess Championship 2024'), 'ChatGPT', 'Claude', '2024-01-15 15:00:00+00', '2024-01-15 14:55:00+00'),
((SELECT id FROM tournaments WHERE name = 'Moonbeam AI Tournament'), 'Claude', 'ChatGPT', '2024-02-01 16:00:00+00', '2024-02-01 15:55:00+00'),
((SELECT id FROM tournaments WHERE name = 'Metis Challenge'), 'ChatGPT', 'Claude', '2024-02-15 18:00:00+00', '2024-02-15 17:55:00+00'); 


-- ========================================
-- Migration: 002_fix_profile_rls.sql
-- ========================================

-- Fix Row Level Security policies for profiles table
-- Add missing INSERT policy so users can create their own profiles

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own profile" ON profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Add missing INSERT policy - this was causing the RLS violation
CREATE POLICY "Users can insert own profile" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Also add a policy for service role to manage profiles if needed
CREATE POLICY "Service role can manage profiles" ON profiles 
    FOR ALL USING (auth.role() = 'service_role'); 


-- ========================================
-- Migration: 003_add_partner_fields.sql
-- ========================================

-- Add partner-specific fields to profiles table (safely, only if they don't exist)

-- Add user_role column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_role') THEN
        ALTER TABLE profiles ADD COLUMN user_role VARCHAR(20) DEFAULT 'player' CHECK (user_role IN ('player', 'partner'));
    END IF;
END $$;

-- Add website column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='website') THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
    END IF;
END $$;

-- Add telegram_discord column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='telegram_discord') THEN
        ALTER TABLE profiles ADD COLUMN telegram_discord TEXT;
    END IF;
END $$;

-- Add logo_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='logo_url') THEN
        ALTER TABLE profiles ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Add banner_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='banner_url') THEN
        ALTER TABLE profiles ADD COLUMN banner_url TEXT;
    END IF;
END $$;

-- Add short_bio column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='short_bio') THEN
        ALTER TABLE profiles ADD COLUMN short_bio TEXT;
    END IF;
END $$;

-- Add ticket_name column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ticket_name') THEN
        ALTER TABLE profiles ADD COLUMN ticket_name VARCHAR(100);
    END IF;
END $$;

-- Add project_name column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='project_name') THEN
        ALTER TABLE profiles ADD COLUMN project_name VARCHAR(100);
    END IF;
END $$;

-- Create index for user role for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

-- Update RLS policies to allow partners to be publicly viewable for certain fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view partner profiles') THEN
        EXECUTE 'CREATE POLICY "Public can view partner profiles" ON profiles FOR SELECT USING (user_role = ''partner'')';
    END IF;
END $$;

-- Allow users to update their own partner-specific fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own partner fields') THEN
        EXECUTE 'CREATE POLICY "Users can update own partner fields" ON profiles FOR UPDATE USING (auth.uid() = id)';
    END IF;
END $$; 


-- ========================================
-- Migration: 004_add_ticket_balance.sql
-- ========================================

-- Add ticket balance management to profiles table

-- Add ticket balance fields if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='tickets_balance') THEN
        ALTER TABLE profiles ADD COLUMN tickets_balance INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add vouchers balance field if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='vouchers_balance') THEN
        ALTER TABLE profiles ADD COLUMN vouchers_balance INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add total tickets earned field if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_tickets_earned') THEN
        ALTER TABLE profiles ADD COLUMN total_tickets_earned INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add total tickets spent field if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_tickets_spent') THEN
        ALTER TABLE profiles ADD COLUMN total_tickets_spent INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create index for ticket balance for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_tickets_balance ON profiles(tickets_balance);

-- Create index for vouchers balance for better performance  
CREATE INDEX IF NOT EXISTS idx_profiles_vouchers_balance ON profiles(vouchers_balance);

-- Update existing users to have 100 welcome tickets (if they have 0)
UPDATE profiles 
SET 
    tickets_balance = 100,
    total_tickets_earned = 100
WHERE 
    tickets_balance = 0 
    AND vouchers_balance = 0 
    AND total_tickets_earned = 0; 

