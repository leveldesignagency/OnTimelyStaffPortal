// Direct password reset using Supabase Admin API
// Run with: node reset-password-direct.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ijsktwmevnqgzwwuggkf.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase SERVICE_ROLE_KEY!');
  console.error('\nTo get your service role key:');
  console.error('1. Go to https://supabase.com/dashboard/project/ijsktwmevnqgzwwuggkf');
  console.error('2. Settings → API');
  console.error('3. Copy the "service_role" key (NOT the anon key)');
  console.error('\nThen run:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_key_here node reset-password-direct.js');
  console.error('\nOr create a .env file with:');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
  const email = 'tommymorgan1991@gmail.com';
  const newPassword = 'Octagon123';

  try {
    console.log(`🔐 Resetting password for: ${email}`);
    
    // Get user by email from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', userError);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.id}`);

    // Use Admin API to update password - THIS IS THE PROPER WAY
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true // Ensure email is confirmed
    });

    if (error) {
      console.error('❌ Password update failed:', error);
      process.exit(1);
    }

    console.log('✅ Password reset successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`👤 User ID: ${user.id}`);
    console.log('\n✅ User can now log in with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

