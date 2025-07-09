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