-- Disable Row Level Security (RLS) on all tables
-- This allows all operations without authentication
-- ⚠️ WARNING: Only use this for development/testing. Re-enable RLS for production!

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on matches table  
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bets table
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- Disable RLS on tournaments table
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on match_moves table
ALTER TABLE match_moves DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (cleanup)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Bets are viewable by owner" ON bets;
DROP POLICY IF EXISTS "Tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Match moves are viewable by everyone" ON match_moves;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename IN ('profiles', 'matches', 'bets', 'tournaments', 'match_moves')
ORDER BY 
    tablename;