-- ============================================
-- COMPLETE VERIFICATION FOR TOMMY
-- ============================================
-- Check everything that could prevent mobile login

-- 1. Email confirmation status
SELECT 
    'Email Confirmation' as check_type,
    email,
    email_confirmed_at IS NOT NULL as is_confirmed,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
        ELSE '❌ Email NOT confirmed - MOBILE LOGIN WILL FAIL'
    END as status
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- 2. Password hash exists
SELECT 
    'Password Status' as check_type,
    email,
    CASE 
        WHEN encrypted_password IS NOT NULL AND encrypted_password != '' THEN '✅ Password hash exists'
        ELSE '❌ No password hash - LOGIN WILL FAIL'
    END as password_status,
    LENGTH(encrypted_password) as hash_length
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- 3. Users table record completeness
SELECT 
    'Users Table Record' as check_type,
    id,
    email,
    name,
    role,
    company_id,
    status,
    CASE 
        WHEN id IS NOT NULL AND email IS NOT NULL AND role IS NOT NULL THEN '✅ Complete record'
        ELSE '❌ Missing required fields'
    END as record_status
FROM users
WHERE email = 'tommymorgan1991@gmail.com';

-- 4. Final verification - everything needed for mobile login
SELECT 
    'FINAL CHECK' as check_type,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    au.encrypted_password IS NOT NULL as has_password,
    u.id IS NOT NULL as has_users_record,
    au.id = u.id as ids_match,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL 
         AND au.encrypted_password IS NOT NULL 
         AND u.id IS NOT NULL 
         AND au.id = u.id 
        THEN '✅ MOBILE LOGIN SHOULD WORK'
        ELSE '❌ MOBILE LOGIN WILL FAIL - See issues above'
    END as mobile_login_status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'tommymorgan1991@gmail.com';

