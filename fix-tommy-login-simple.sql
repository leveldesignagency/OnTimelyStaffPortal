-- ============================================
-- SIMPLE FIX FOR TOMMY MORGAN LOGIN
-- ============================================
-- This just confirms the email for tommymorgan1991@gmail.com
-- so they can log in to the mobile app

-- Step 1: Check current status
SELECT 
    'Current Status' as check_type,
    au.id as auth_id,
    au.email,
    au.email_confirmed_at IS NOT NULL as can_login,
    u.id as users_id,
    u.name,
    CASE 
        WHEN au.id IS NULL THEN '❌ Not in auth.users'
        WHEN au.email_confirmed_at IS NULL THEN '❌ Email not confirmed (CANNOT LOGIN)'
        ELSE '✅ Can login'
    END as status
FROM users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.email = 'tommymorgan1991@gmail.com'
   OR u.id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58';

-- Step 2: Fix the email confirmation
-- This is SAFE - it only sets email_confirmed_at if it's NULL
UPDATE auth.users
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'tommymorgan1991@gmail.com';

-- Step 3: Verify the fix
SELECT 
    'After Fix' as check_type,
    au.id as auth_id,
    au.email,
    au.email_confirmed_at IS NOT NULL as can_login,
    au.email_confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmed - CAN LOGIN NOW'
        ELSE '❌ Still cannot login'
    END as status
FROM auth.users au
WHERE au.email = 'tommymorgan1991@gmail.com';

