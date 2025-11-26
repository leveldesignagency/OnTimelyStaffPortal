-- ============================================
-- FIX TOMMY MOBILE LOGIN
-- ============================================
-- Mobile app REQUIRES user to exist in BOTH auth.users AND users table
-- This script ensures the user exists in both with matching IDs

-- Step 1: Check current status
SELECT 
    'BEFORE FIX' as status,
    au.id as auth_id,
    au.email as auth_email,
    u.id as users_id,
    u.email as users_email,
    CASE 
        WHEN au.id IS NULL THEN '❌ Missing from auth.users'
        WHEN u.id IS NULL THEN '❌ Missing from users table (MOBILE WILL FAIL)'
        WHEN au.id = u.id THEN '✅ IDs match'
        ELSE '❌ IDs do not match'
    END as issue
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
WHERE au.email = 'tommymorgan1991@gmail.com' 
   OR u.email = 'tommymorgan1991@gmail.com';

-- Step 2: Get user info from auth.users
DO $$
DECLARE
    v_auth_id UUID;
    v_auth_email TEXT;
    v_auth_name TEXT;
    v_auth_company_id UUID;
    v_auth_role TEXT;
    v_users_id UUID;
BEGIN
    -- Get user from auth.users
    SELECT 
        id,
        email,
        COALESCE(raw_user_meta_data->>'name', 'User'),
        (raw_user_meta_data->>'company_id')::UUID,
        COALESCE(raw_user_meta_data->>'role', 'user')
    INTO v_auth_id, v_auth_email, v_auth_name, v_auth_company_id, v_auth_role
    FROM auth.users
    WHERE email = 'tommymorgan1991@gmail.com';

    IF v_auth_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;

    -- Check if user exists in users table
    SELECT id INTO v_users_id
    FROM users
    WHERE email = 'tommymorgan1991@gmail.com';

    IF v_users_id IS NULL THEN
        -- User doesn't exist in users table - CREATE IT with matching ID
        RAISE NOTICE 'Creating user in users table with ID: %', v_auth_id;
        
        INSERT INTO users (
            id,
            email,
            name,
            company_id,
            role,
            status,
            avatar,
            avatar_url,
            description,
            company_role,
            created_at,
            updated_at
        ) VALUES (
            v_auth_id, -- Use the SAME ID as auth.users
            v_auth_email,
            v_auth_name,
            v_auth_company_id,
            v_auth_role,
            'offline',
            '',
            NULL,
            NULL,
            NULL,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ User created in users table';
    ELSIF v_users_id != v_auth_id THEN
        -- IDs don't match - this is a problem
        RAISE NOTICE '⚠️ IDs do not match. Auth ID: %, Users ID: %', v_auth_id, v_users_id;
        RAISE NOTICE '⚠️ This requires manual intervention to fix foreign key constraints';
    ELSE
        -- User exists and IDs match - just ensure email is confirmed
        RAISE NOTICE '✅ User exists in both tables with matching IDs';
    END IF;

    -- Ensure email is confirmed in auth.users
    UPDATE auth.users
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = v_auth_id;

    RAISE NOTICE '✅ Email confirmed in auth.users';
END $$;

-- Step 3: Verify the fix
SELECT 
    'AFTER FIX' as status,
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    u.id as users_id,
    u.email as users_email,
    u.name,
    u.role,
    CASE 
        WHEN au.id IS NOT NULL AND u.id IS NOT NULL AND au.id = u.id AND au.email_confirmed_at IS NOT NULL 
        THEN '✅ MOBILE LOGIN WILL WORK'
        ELSE '❌ STILL HAS ISSUES'
    END as result
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'tommymorgan1991@gmail.com';

