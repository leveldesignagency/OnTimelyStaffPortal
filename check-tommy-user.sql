-- ============================================
-- CHECK TOMMY MORGAN USER STATUS
-- ============================================
-- Run this FIRST to see what's wrong

-- Check 1: Does user exist in users table?
SELECT 
    'users table' as source,
    id,
    email,
    name,
    role,
    created_at
FROM users
WHERE email = 'tommymorgan1991@gmail.com';

-- Check 2: Does user exist in auth.users?
SELECT 
    'auth.users table' as source,
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ CANNOT LOGIN - Email not confirmed'
        ELSE '✅ CAN LOGIN - Email confirmed'
    END as login_status
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- Check 3: Do the IDs match?
SELECT 
    u.id as users_id,
    au.id as auth_users_id,
    u.email,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs DO NOT MATCH'
    END as id_match,
    CASE 
        WHEN au.email_confirmed_at IS NULL THEN '❌ CANNOT LOGIN'
        ELSE '✅ CAN LOGIN'
    END as can_login
FROM users u
FULL OUTER JOIN auth.users au ON u.email = au.email
WHERE u.email = 'tommymorgan1991@gmail.com' 
   OR au.email = 'tommymorgan1991@gmail.com';

