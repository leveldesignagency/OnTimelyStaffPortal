-- ============================================
-- CHECK TOMMY IN BOTH TABLES
-- ============================================
-- This checks if the user exists in BOTH auth.users AND users table
-- Mobile app REQUIRES both to exist

-- Check auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- Check users table
SELECT 
    'users' as table_name,
    id,
    email,
    name,
    role,
    company_id,
    created_at
FROM users
WHERE email = 'tommymorgan1991@gmail.com';

-- Check if IDs match
SELECT 
    'ID MATCH CHECK' as check_type,
    au.id as auth_users_id,
    u.id as users_table_id,
    au.email,
    CASE 
        WHEN au.id = u.id THEN '✅ IDs MATCH - Mobile login should work'
        WHEN u.id IS NULL THEN '❌ User NOT in users table - Mobile login will FAIL'
        WHEN au.id IS NULL THEN '❌ User NOT in auth.users - Login will FAIL'
        ELSE '❌ IDs DO NOT MATCH - Mobile login will FAIL'
    END as status
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
WHERE au.email = 'tommymorgan1991@gmail.com' 
   OR u.email = 'tommymorgan1991@gmail.com';

