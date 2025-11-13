// Quick script to reset password to "admin123"
// Run this with: node reset-password-script.js your-email@example.com

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node reset-password-script.js your-email@example.com');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  try {
    console.log(`🔐 Resetting password for: ${email}`);
    
    // Generate bcrypt hash for "admin123"
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);
    
    console.log('✅ Generated bcrypt hash');
    
    // Update password in database
    const { data, error } = await supabase
      .from('ontimely_staff')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();
    
    if (error) {
      console.error('❌ Error updating password:', error);
      process.exit(1);
    }
    
    if (!data || data.length === 0) {
      console.error(`❌ No staff member found with email: ${email}`);
      process.exit(1);
    }
    
    console.log('✅ Password reset successfully!');
    console.log('📧 Email:', data[0].email);
    console.log('👤 Name:', data[0].name);
    console.log('🔑 New password: admin123');
    console.log('\n⚠️  Please change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

