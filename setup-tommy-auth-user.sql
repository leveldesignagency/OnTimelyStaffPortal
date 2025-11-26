-- ============================================
-- SETUP TOMMY MORGAN IN SUPABASE AUTH
-- ============================================
-- This script creates/updates tommymorgan1991@gmail.com in Supabase Auth
-- and ensures they're properly linked to the users table
-- Replace 'YourNewPassword123!' with your desired password

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 1: Check current status
-- ============================================
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    encrypted_password IS NOT NULL as has_password,
    created_at
FROM auth.users 
WHERE email = 'tommymorgan1991@gmail.com';

SELECT 
    'users' as table_name,
    id,
    email,
    name,
    role,
    company_id,
    created_at
FROM users 
WHERE email = 'tommymorgan1991@gmail.com'
   OR id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58';

-- ============================================
-- STEP 2: Get or create the user ID
-- ============================================
DO $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_instance_id UUID;
BEGIN
    -- Get the user's company_id from users table
    SELECT company_id INTO v_company_id
    FROM users
    WHERE email = 'tommymorgan1991@gmail.com'
       OR id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58'
    LIMIT 1;
    
    -- Get instance_id (usually all zeros for Supabase)
    SELECT COALESCE(
        (SELECT instance_id FROM auth.users LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::UUID
    ) INTO v_instance_id;
    
    -- Check if user exists in auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'tommymorgan1991@gmail.com';
    
    -- If user doesn't exist in auth.users, use the ID from users table
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id
        FROM users
        WHERE email = 'tommymorgan1991@gmail.com'
           OR id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58'
        LIMIT 1;
        
        -- If still no ID, generate a new one
        IF v_user_id IS NULL THEN
            v_user_id := 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58'::UUID;
        END IF;
    END IF;
    
    -- ============================================
    -- STEP 3: Create or update user in auth.users
    -- ============================================
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,  -- THIS IS CRITICAL - must be set for login to work
        created_at,
        updated_at,
        aud,
        role,
        confirmation_token,
        email_change_token_new,
        recovery_token
    ) VALUES (
        v_user_id,
        v_instance_id,
        'tommymorgan1991@gmail.com',
        crypt('YourNewPassword123!', gen_salt('bf', 10)),
        NOW(),  -- Email confirmed = user can log in
        COALESCE((SELECT created_at FROM auth.users WHERE id = v_user_id), NOW()),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        ''
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        encrypted_password = crypt('YourNewPassword123!', gen_salt('bf', 10)),
        email_confirmed_at = NOW(),  -- Ensure email is confirmed
        updated_at = NOW();
    
    -- ============================================
    -- STEP 4: Ensure user exists in users table with matching ID
    -- ============================================
    INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        COALESCE(v_company_id, '13c9a1ff-1410-425e-b985-6cd5157d5ee4'::UUID),
        'tommymorgan1991@gmail.com',
        'Tommy Morgan',
        'user',
        'online',
        COALESCE((SELECT created_at FROM users WHERE id = v_user_id), NOW()),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        company_id = COALESCE(EXCLUDED.company_id, users.company_id),
        updated_at = NOW();
    
    RAISE NOTICE '✅ User setup complete! ID: %, Email: %', v_user_id, 'tommymorgan1991@gmail.com';
END $$;

-- ============================================
-- STEP 5: Verify the setup
-- ============================================
SELECT 
    '✅ AUTH.USERS' as status,
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    au.encrypted_password IS NOT NULL as has_password,
    au.created_at
FROM auth.users au
WHERE au.email = 'tommymorgan1991@gmail.com';

SELECT 
    '✅ USERS TABLE' as status,
    u.id,
    u.email,
    u.name,
    u.role,
    u.company_id,
    u.created_at
FROM users u
WHERE u.email = 'tommymorgan1991@gmail.com'
   OR u.id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58';

-- ============================================
-- STEP 6: Verify IDs match
-- ============================================
SELECT 
    CASE 
        WHEN au.id = u.id THEN '✅ IDs MATCH - User is properly linked'
        ELSE '❌ IDs DO NOT MATCH - User may have issues'
    END as link_status,
    au.id as auth_id,
    u.id as users_id,
    au.email as auth_email,
    u.email as users_email
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
WHERE au.email = 'tommymorgan1991@gmail.com'
   OR u.email = 'tommymorgan1991@gmail.com';

