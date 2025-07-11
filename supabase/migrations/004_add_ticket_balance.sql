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