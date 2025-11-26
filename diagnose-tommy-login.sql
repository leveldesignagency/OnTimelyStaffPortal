-- ============================================
-- COMPLETE DIAGNOSTIC FOR TOMMY MORGAN LOGIN
-- ============================================
-- This checks EVERYTHING that could prevent login

-- 1. Check if user exists in users table
SELECT 
    '1. USERS TABLE CHECK' as check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ User exists in users table'
        ELSE '❌ User NOT in users table - THIS WILL CAUSE LOGIN FAILURE'
    END as result,
    COUNT(*) as count
FROM users
WHERE email = 'tommymorgan1991@gmail.com';

-- 2. Check if user exists in auth.users
SELECT 
    '2. AUTH.USERS TABLE CHECK' as check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ User exists in auth.users'
        ELSE '❌ User NOT in auth.users - THIS WILL CAUSE LOGIN FAILURE'
    END as result,
    COUNT(*) as count
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- 3. Check email_confirmed_at status
SELECT 
    '3. EMAIL CONFIRMATION CHECK' as check_name,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed - CAN LOGIN'
        ELSE '❌ Email NOT confirmed - CANNOT LOGIN'
    END as result
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- 4. Check if IDs match between users and auth.users
SELECT 
    '4. ID MATCH CHECK' as check_name,
    u.id as users_id,
    au.id as auth_users_id,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        WHEN u.id IS NULL THEN '❌ User not in users table'
        WHEN au.id IS NULL THEN '❌ User not in auth.users table'
        ELSE '❌ IDs DO NOT MATCH - THIS WILL CAUSE LOGIN FAILURE'
    END as result
FROM users u
FULL OUTER JOIN auth.users au ON u.email = au.email
WHERE u.email = 'tommymorgan1991@gmail.com' 
   OR au.email = 'tommymorgan1991@gmail.com';

-- 5. Get full details for debugging
SELECT 
    '5. FULL DETAILS' as check_name,
    'users table' as source,
    id,
    email,
    name,
    role,
    created_at
FROM users
WHERE email = 'tommymorgan1991@gmail.com'

UNION ALL

SELECT 
    '5. FULL DETAILS' as check_name,
    'auth.users table' as source,
    id::text,
    email,
    COALESCE(raw_user_meta_data->>'name', 'N/A') as name,
    role::text,
    created_at::text
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- 6. Check password hash exists (can't see actual password, but can verify hash exists)
SELECT 
    '6. PASSWORD CHECK' as check_name,
    email,
    CASE 
        WHEN encrypted_password IS NOT NULL AND encrypted_password != '' THEN '✅ Password hash exists'
        ELSE '❌ No password hash - USER CANNOT LOGIN'
    END as result,
    LENGTH(encrypted_password) as password_hash_length
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

