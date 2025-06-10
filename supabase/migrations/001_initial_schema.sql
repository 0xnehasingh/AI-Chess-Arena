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
('NodeOps Challenge', 'Professional AI chess challenge', 'NodeOps', '2024-02-15 14:00:00+00', '2024-02-18 16:00:00+00', 8000.00);

-- Insert sample matches
INSERT INTO matches (tournament_id, champion_white, champion_black, start_time, betting_closes_at) VALUES
((SELECT id FROM tournaments WHERE name = 'AI Chess Championship 2024'), 'ChatGPT', 'Claude', '2024-01-15 15:00:00+00', '2024-01-15 14:55:00+00'),
((SELECT id FROM tournaments WHERE name = 'Moonbeam AI Tournament'), 'Claude', 'ChatGPT', '2024-02-01 16:00:00+00', '2024-02-01 15:55:00+00'),
((SELECT id FROM tournaments WHERE name = 'NodeOps Challenge'), 'ChatGPT', 'Claude', '2024-02-15 18:00:00+00', '2024-02-15 17:55:00+00'); 