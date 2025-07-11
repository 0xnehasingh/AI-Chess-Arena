-- ====================================================================
-- VOUCHER-BASED BETTING SYSTEM FOR TOURNAMENTS
-- ====================================================================

-- ===== TOURNAMENT REGISTRATIONS =====
-- Track which users are registered for which tournaments
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
-- Define voucher types and rules for each tournament
CREATE TABLE IF NOT EXISTS tournament_voucher_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    voucher_name VARCHAR(100) NOT NULL, -- e.g., "MoonBeam Betting Credits", "NodeOps Tournament Tokens"
    voucher_symbol VARCHAR(10) NOT NULL, -- e.g., "MBC", "NTT"
    voucher_description TEXT,
    
    -- Voucher mechanics
    initial_allocation DECIMAL(10,2) DEFAULT 20, -- Initial vouchers given on registration
    max_voucher_balance DECIMAL(10,2) DEFAULT 1000, -- Maximum vouchers a user can hold
    min_bet_amount DECIMAL(10,2) DEFAULT 1, -- Minimum bet in vouchers
    max_bet_amount DECIMAL(10,2) DEFAULT 20, -- Maximum bet in vouchers (limited to free voucher amount)
    
    -- Earning rules
    earn_on_registration DECIMAL(10,2) DEFAULT 20,
    earn_on_referral DECIMAL(10,2) DEFAULT 50,
    earn_on_daily_login DECIMAL(10,2) DEFAULT 10,
    earn_on_match_participation DECIMAL(10,2) DEFAULT 5,
    
    -- Expiry and rules
    vouchers_expire BOOLEAN DEFAULT false,
    expiry_duration_days INTEGER DEFAULT NULL,
    transferable BOOLEAN DEFAULT false, -- Tournament vouchers should not be transferable
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one voucher type per tournament
    UNIQUE(tournament_id)
);

-- ===== USER VOUCHER TRANSACTIONS =====
-- Track all voucher movements (earned, spent, expired)
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
    source VARCHAR(50) NOT NULL, -- 'registration', 'referral', 'daily_login', 'bet_placed', 'bet_won', 'bet_refund'
    reference_id UUID, -- Could reference a bet_id, match_id, etc.
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== MODIFY BETS TABLE FOR VOUCHER SYSTEM =====
-- Add voucher-related fields to existing bets table
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
-- Tournament registrations - users can only see their own registrations
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tournament registrations" ON tournament_registrations 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tournament registrations" ON tournament_registrations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tournament registrations" ON tournament_registrations 
    FOR UPDATE USING (auth.uid() = user_id);

-- Voucher transactions - users can only see their own transactions
ALTER TABLE voucher_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own voucher transactions" ON voucher_transactions 
    FOR SELECT USING (auth.uid() = user_id);

-- Tournament voucher types are public (read-only for users)
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