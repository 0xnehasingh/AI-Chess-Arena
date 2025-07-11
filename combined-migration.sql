-- =============================================
-- COMBINED MIGRATION FOR AI CHESS ARENA
-- Apply this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== INITIAL SCHEMA (001) =====

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'admin', 'partner')),
    bio TEXT,
    location VARCHAR(100),
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
    prize_pool DECIMAL(12,2) DEFAULT 0,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    chatgpt_id VARCHAR(100),
    claude_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'finished')),
    winner VARCHAR(10) CHECK (winner IN ('chatgpt', 'claude', 'draw')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    current_turn VARCHAR(10) DEFAULT 'chatgpt' CHECK (current_turn IN ('chatgpt', 'claude')),
    board_state JSONB DEFAULT '{"board": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", "turn": "w", "castling": "KQkq", "enPassant": "-", "halfmove": 0, "fullmove": 1}',
    move_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    champion VARCHAR(10) NOT NULL CHECK (champion IN ('chatgpt', 'claude')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    odds DECIMAL(5,2) DEFAULT 2.0,
    potential_payout DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'refunded')),
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_moves table
CREATE TABLE IF NOT EXISTS match_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player VARCHAR(10) NOT NULL CHECK (player IN ('chatgpt', 'claude')),
    move_number INTEGER NOT NULL,
    move_notation VARCHAR(20) NOT NULL,
    move_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    thinking_time_seconds INTEGER DEFAULT 0,
    board_state_after JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON bets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile and bets
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public tables (no RLS needed for read access)
-- tournaments, matches, match_moves are public for viewing

-- Insert sample tournaments
INSERT INTO tournaments (name, description, sponsor, start_date, end_date, status, prize_pool) VALUES
('MoonBeam Championship', 'Premier AI chess tournament on MoonBeam network', 'MoonBeam Foundation', '2024-07-15 10:00:00+00', '2024-07-25 18:00:00+00', 'upcoming', 10000.00),
('NodeOps Grand Prix', 'Elite competition for NodeOps validators', 'NodeOps Protocol', '2024-08-01 12:00:00+00', '2024-08-10 20:00:00+00', 'upcoming', 15000.00),
('DeFiCore Masters', 'Ultimate DeFi chess challenge', 'DeFiCore DAO', '2024-08-15 14:00:00+00', '2024-08-25 22:00:00+00', 'upcoming', 20000.00)
ON CONFLICT DO NOTHING;

-- Insert sample matches
INSERT INTO matches (tournament_id, chatgpt_id, claude_id, status) 
SELECT t.id, 'gpt-4', 'claude-3', 'pending' 
FROM tournaments t 
WHERE NOT EXISTS (SELECT 1 FROM matches m WHERE m.tournament_id = t.id)
LIMIT 3;

-- ===== PROFILE RLS FIX (002) =====

-- Fix Row Level Security policies for profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Add missing INSERT policy - this was causing signup issues
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also add a policy for service role to manage profiles
CREATE POLICY "Service role can manage all profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ===== PARTNER FIELDS (003) =====

-- Add partner-specific fields to profiles table (check if exists first)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='website') THEN
        ALTER TABLE profiles ADD COLUMN website VARCHAR(255);
    END IF;
END $$;

-- Add website column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='telegram_discord') THEN
        ALTER TABLE profiles ADD COLUMN telegram_discord VARCHAR(255);
    END IF;
END $$;

-- Add telegram_discord column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='logo_url') THEN
        ALTER TABLE profiles ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Add logo_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='banner_url') THEN
        ALTER TABLE profiles ADD COLUMN banner_url TEXT;
    END IF;
END $$;

-- Add banner_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='short_bio') THEN
        ALTER TABLE profiles ADD COLUMN short_bio TEXT;
    END IF;
END $$;

-- Add short_bio column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ticket_name') THEN
        ALTER TABLE profiles ADD COLUMN ticket_name VARCHAR(100);
    END IF;
END $$;

-- Add ticket_name column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='project_name') THEN
        ALTER TABLE profiles ADD COLUMN project_name VARCHAR(100);
    END IF;
END $$;

-- Add project_name column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create index for user role for better performance
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Partners can be viewed by anyone') THEN
        CREATE POLICY "Partners can be viewed by anyone" ON profiles FOR SELECT USING (role = 'partner');
    END IF;
END $$;

-- Update RLS policies to allow partners to be publicly viewable
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update partner fields') THEN
        CREATE POLICY "Users can update partner fields" ON profiles FOR UPDATE USING (auth.uid() = user_id AND role = 'partner');
    END IF;
END $$;

-- ===== VOUCHER BETTING SYSTEM (004) =====

-- ===== TOURNAMENT REGISTRATIONS =====
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voucher_balance DECIMAL(10,2) DEFAULT 0,
    total_vouchers_earned DECIMAL(10,2) DEFAULT 0,
    total_vouchers_spent DECIMAL(10,2) DEFAULT 0,
    registration_status VARCHAR(20) DEFAULT 'active' CHECK (registration_status IN ('active', 'withdrawn', 'banned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one registration per user per tournament
    UNIQUE(user_id, tournament_id)
);

-- ===== TOURNAMENT VOUCHER TYPES =====
CREATE TABLE IF NOT EXISTS tournament_voucher_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    voucher_name VARCHAR(100) NOT NULL,
    voucher_symbol VARCHAR(10) NOT NULL,
    voucher_description TEXT,
    
    -- Voucher mechanics
    initial_allocation DECIMAL(10,2) DEFAULT 20,
    max_voucher_balance DECIMAL(10,2) DEFAULT 1000,
    min_bet_amount DECIMAL(10,2) DEFAULT 1,
    max_bet_amount DECIMAL(10,2) DEFAULT 20,
    
    -- Earning rules
    earn_on_registration DECIMAL(10,2) DEFAULT 20,
    earn_on_referral DECIMAL(10,2) DEFAULT 50,
    earn_on_daily_login DECIMAL(10,2) DEFAULT 10,
    earn_on_match_participation DECIMAL(10,2) DEFAULT 5,
    
    -- Expiry and rules
    vouchers_expire BOOLEAN DEFAULT false,
    expiry_duration_days INTEGER DEFAULT NULL,
    transferable BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one voucher type per tournament
    UNIQUE(tournament_id)
);

-- ===== USER VOUCHER TRANSACTIONS =====
CREATE TABLE IF NOT EXISTS voucher_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
    
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired', 'refunded')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    
    -- Transaction context
    source VARCHAR(50) NOT NULL,
    reference_id UUID,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== MODIFY BETS TABLE FOR VOUCHER SYSTEM =====
DO $$ 
BEGIN 
    -- Add voucher_bet flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bets' AND column_name='is_voucher_bet') THEN
        ALTER TABLE bets ADD COLUMN is_voucher_bet BOOLEAN DEFAULT false;
    END IF;
    
    -- Add tournament registration reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bets' AND column_name='registration_id') THEN
        ALTER TABLE bets ADD COLUMN registration_id UUID REFERENCES tournament_registrations(id);
    END IF;
    
    -- Add voucher amount (for voucher bets)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bets' AND column_name='voucher_amount') THEN
        ALTER TABLE bets ADD COLUMN voucher_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add voucher payout (for voucher wins)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bets' AND column_name='voucher_payout') THEN
        ALTER TABLE bets ADD COLUMN voucher_payout DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- ===== INDEXES FOR PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_user_id ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(registration_status);

CREATE INDEX IF NOT EXISTS idx_voucher_transactions_user_id ON voucher_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_transactions_tournament_id ON voucher_transactions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_voucher_transactions_type ON voucher_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_voucher_transactions_created_at ON voucher_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_bets_registration_id ON bets(registration_id);
CREATE INDEX IF NOT EXISTS idx_bets_voucher_bet ON bets(is_voucher_bet);

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tournament registrations" ON tournament_registrations 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tournament registrations" ON tournament_registrations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tournament registrations" ON tournament_registrations 
    FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE voucher_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own voucher transactions" ON voucher_transactions 
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE tournament_voucher_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tournament voucher types" ON tournament_voucher_types 
    FOR SELECT USING (true);

-- ===== UTILITY FUNCTIONS =====

-- Function to get user's voucher balance for a tournament
CREATE OR REPLACE FUNCTION get_user_voucher_balance(p_user_id UUID, p_tournament_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    balance DECIMAL(10,2);
BEGIN
    SELECT voucher_balance INTO balance
    FROM tournament_registrations
    WHERE user_id = p_user_id AND tournament_id = p_tournament_id AND registration_status = 'active';
    
    RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process voucher transaction
CREATE OR REPLACE FUNCTION process_voucher_transaction(
    p_user_id UUID,
    p_tournament_id UUID,
    p_transaction_type VARCHAR(20),
    p_amount DECIMAL(10,2),
    p_source VARCHAR(50),
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_registration_id UUID;
    v_balance_before DECIMAL(10,2);
    v_balance_after DECIMAL(10,2);
    v_max_balance DECIMAL(10,2);
BEGIN
    -- Get registration and current balance
    SELECT id, voucher_balance INTO v_registration_id, v_balance_before
    FROM tournament_registrations
    WHERE user_id = p_user_id AND tournament_id = p_tournament_id AND registration_status = 'active';
    
    IF v_registration_id IS NULL THEN
        RAISE EXCEPTION 'User not registered for this tournament';
    END IF;
    
    -- Get max balance limit
    SELECT max_voucher_balance INTO v_max_balance
    FROM tournament_voucher_types
    WHERE tournament_id = p_tournament_id;
    
    -- Calculate new balance based on transaction type
    IF p_transaction_type IN ('earned', 'refunded') THEN
        v_balance_after := v_balance_before + p_amount;
        -- Check max balance limit
        IF v_balance_after > v_max_balance THEN
            v_balance_after := v_max_balance;
            p_amount := v_max_balance - v_balance_before;
        END IF;
    ELSIF p_transaction_type IN ('spent', 'expired') THEN
        v_balance_after := v_balance_before - p_amount;
        -- Check minimum balance
        IF v_balance_after < 0 THEN
            RAISE EXCEPTION 'Insufficient voucher balance';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type';
    END IF;
    
    -- Update registration balance
    UPDATE tournament_registrations
    SET voucher_balance = v_balance_after,
        total_vouchers_earned = CASE WHEN p_transaction_type IN ('earned', 'refunded') 
                                    THEN total_vouchers_earned + p_amount 
                                    ELSE total_vouchers_earned END,
        total_vouchers_spent = CASE WHEN p_transaction_type IN ('spent', 'expired') 
                                   THEN total_vouchers_spent + p_amount 
                                   ELSE total_vouchers_spent END,
        updated_at = NOW()
    WHERE id = v_registration_id;
    
    -- Insert transaction record
    INSERT INTO voucher_transactions (
        user_id, tournament_id, registration_id, transaction_type, amount,
        balance_before, balance_after, source, reference_id, description
    ) VALUES (
        p_user_id, p_tournament_id, v_registration_id, p_transaction_type, p_amount,
        v_balance_before, v_balance_after, p_source, p_reference_id, p_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== UPDATE TRIGGERS =====
CREATE TRIGGER update_tournament_registrations_updated_at 
    BEFORE UPDATE ON tournament_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_voucher_types_updated_at 
    BEFORE UPDATE ON tournament_voucher_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== SAMPLE DATA =====
-- Insert voucher types for existing tournaments
INSERT INTO tournament_voucher_types (tournament_id, voucher_name, voucher_symbol, voucher_description, initial_allocation)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%Moonbeam%' THEN 'MoonBeam Betting Credits'
        WHEN name LIKE '%NodeOps%' THEN 'NodeOps Tournament Tokens'
        WHEN name LIKE '%DeFi%' THEN 'DeFiCore Chess Coins'
        ELSE name || ' Vouchers'
    END as voucher_name,
    CASE 
        WHEN name LIKE '%Moonbeam%' THEN 'MBC'
        WHEN name LIKE '%NodeOps%' THEN 'NTT'
        WHEN name LIKE '%DeFi%' THEN 'DCC'
        ELSE LEFT(REPLACE(UPPER(name), ' ', ''), 3)
    END as voucher_symbol,
    'Tournament-specific betting vouchers that can only be used within this tournament',
    20 as initial_allocation
FROM tournaments
WHERE NOT EXISTS (
    SELECT 1 FROM tournament_voucher_types tvt WHERE tvt.tournament_id = tournaments.id
);

-- =============================================
-- END OF COMBINED MIGRATION
-- ============================================= 