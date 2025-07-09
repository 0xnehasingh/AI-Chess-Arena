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