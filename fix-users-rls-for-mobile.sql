-- ============================================
-- FIX RLS POLICY FOR MOBILE APP LOGIN
-- ============================================
-- Mobile app needs to query users table after Supabase Auth succeeds
-- This policy allows authenticated users to read their own record

-- Check current policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Drop any existing restrictive policies that might block this
DROP POLICY IF EXISTS "Users can only see users from their company" ON users;
DROP POLICY IF EXISTS "Users can view company users" ON users;
DROP POLICY IF EXISTS "Guests cannot access users table" ON users;

-- Create policy that allows authenticated users to read their own record
-- This is needed for mobile app login flow
CREATE POLICY "Authenticated users can read own profile" ON users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        id = auth.uid()
    );

-- Also allow users to see other users in their company (for desktop app)
CREATE POLICY "Users can view company users" ON users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Can see own profile
            id = auth.uid() OR
            -- Can see users in same company
            company_id = (
                SELECT company_id 
                FROM users 
                WHERE id = auth.uid()
            )
        )
    );

-- Verify policies
SELECT 
    '✅ Policies created' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

