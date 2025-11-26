-- ============================================
-- FIX TOMMY MORGAN USER LOGIN
-- ============================================
-- Run this AFTER checking the status above
-- This will ONLY fix the email_confirmed_at issue

-- Step 1: Confirm the email in auth.users
-- This is SAFE - it only sets email_confirmed_at if it's NULL
UPDATE auth.users
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'tommymorgan1991@gmail.com';

-- Step 2: Verify the fix
SELECT 
    'After Fix' as status,
    id,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed - CAN LOGIN NOW'
        ELSE '❌ Still cannot login - may need to create auth.users record'
    END as result
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

