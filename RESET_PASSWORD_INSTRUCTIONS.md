# Reset Password for tommymorgan1991@gmail.com

## Quick Fix (Recommended)

**Use the Portal's User Management:**
1. Go to https://portal.ontimely.co.uk
2. Navigate to Users page
3. Find `tommymorgan1991@gmail.com`
4. Click "Reset Password" or "Edit User"
5. Set new password to: `Octagon123`
6. Save

## Alternative: Run Script Directly

1. Get your Supabase Service Role Key:
   - Go to https://supabase.com/dashboard/project/ijsktwmevnqgzwwuggkf
   - Settings → API
   - Copy the **service_role** key (NOT the anon key)

2. Run the script:
   ```bash
   cd OnTimelyStaffPortal
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here node reset-password-direct.js
   ```

3. The script will:
   - Find the user by email
   - Reset password to: `Octagon123`
   - Confirm email address
   - User can then log in immediately

## What This Does

- Uses Supabase Admin API (the proper way)
- Sets password to: `Octagon123`
- Confirms email address (so login works)
- Works immediately - no rebuild needed

## After Reset

User can log in with:
- **Email:** tommymorgan1991@gmail.com
- **Password:** Octagon123

