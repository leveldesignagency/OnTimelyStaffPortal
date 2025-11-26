-- ============================================
-- CHECK EXISTING RLS POLICIES ON USERS TABLE
-- ============================================
-- Run this FIRST to see what policies exist before making changes

-- 1. Check if RLS is enabled
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 2. List all existing policies
SELECT 
    'Existing Policies' as check_type,
    policyname,
    cmd as command,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- 3. Check if there's already a policy for reading own profile
SELECT 
    'Policy Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'users' 
            AND cmd = 'SELECT'
            AND (qual LIKE '%auth.uid()%' OR qual LIKE '%id = auth.uid()%')
        ) THEN '✅ Policy exists for reading own profile'
        ELSE '❌ No policy found for reading own profile - NEEDS TO BE ADDED'
    END as status;

