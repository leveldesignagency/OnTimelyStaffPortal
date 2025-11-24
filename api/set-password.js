const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email, password, token } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      })
    }

    // Get user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !users) {
      console.error('User lookup error:', userError)
      return res.status(404).json({ error: 'User not found' })
    }

    // First, confirm the email address
    const { error: confirmError } = await supabase.auth.admin.updateUserById(users.id, {
      email_confirm: true
    })

    if (confirmError) {
      console.error('Email confirmation error:', confirmError)
      return res.status(500).json({ error: 'Failed to confirm email' })
    }

    // Then update the password
    const { data, error } = await supabase.auth.admin.updateUserById(users.id, {
      password: password
    })

    if (error) {
      console.error('Password update error:', error)
      return res.status(500).json({ error: 'Failed to update password' })
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email confirmed and password updated successfully' 
    })

  } catch (error) {
    console.error('Set password error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

