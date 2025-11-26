-- ============================================
-- SAFELY ADD RLS POLICY FOR MOBILE APP
-- ============================================
-- This ONLY adds a policy if one doesn't exist
-- It does NOT drop any existing policies

-- Step 1: Check if policy already exists
DO $$
BEGIN
    -- Check if we already have a policy that allows users to read their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Authenticated users can read own profile'
    ) THEN
        -- Only create if it doesn't exist
        CREATE POLICY "Authenticated users can read own profile" ON users
            FOR SELECT
            USING (
                auth.uid() IS NOT NULL AND 
                id = auth.uid()
            );
        
        RAISE NOTICE '✅ Created policy: Authenticated users can read own profile';
    ELSE
        RAISE NOTICE 'ℹ️ Policy already exists: Authenticated users can read own profile';
    END IF;
END $$;

-- Step 2: Verify the policy was created
SELECT 
    'Verification' as check_type,
    policyname,
    cmd as command,
    qual as policy_expression
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'Authenticated users can read own profile';

