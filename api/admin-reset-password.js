const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Get user by email from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      console.error('User lookup error:', userError)
      return res.status(404).json({ error: 'User not found' })
    }

    // Use Admin API to update password - this is the PROPER way
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: password,
      email_confirm: true // Ensure email is confirmed
    })

    if (error) {
      console.error('Password update error:', error)
      return res.status(500).json({ error: 'Failed to update password: ' + error.message })
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully',
      user_id: user.id
    })

  } catch (error) {
    console.error('Admin reset password error:', error)
    return res.status(500).json({ error: 'Internal server error: ' + error.message })
  }
}

