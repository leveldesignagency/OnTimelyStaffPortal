const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  // Enable CORS (needed because called from browser)
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

    const { email, isMobile } = req.body || {}
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    console.log('Password reset request for:', email)

    // Check if user exists in database and get their name
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      console.log('User not found or error:', userError)
      return res.status(200).json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      })
    }

    // Get user's name (fallback to email if no name)
    const userName = user.name || email.split('@')[0] || 'User'

    // Determine reset URL based on platform
    const resetUrl = isMobile 
      ? `https://ontimely.co.uk/set-initial-password?token=${encodeURIComponent(email)}&type=recovery&mobile=true`
      : `https://ontimely.co.uk/set-initial-password?token=${encodeURIComponent(email)}&type=recovery`

    // Call the custom password reset email API
    // Try dashboard.ontimely.co.uk first, fallback to ontimely.co.uk
    let emailApiUrl = 'https://dashboard.ontimely.co.uk/api/send-password-reset-email'
    
    console.log('📧 Calling password reset email API:', emailApiUrl)
    let emailResponse = await fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        name: userName,
        resetUrl: resetUrl
      })
    })

    // If dashboard API fails, try ontimely.co.uk
    if (!emailResponse.ok) {
      console.log('Dashboard API failed, trying ontimely.co.uk')
      emailApiUrl = 'https://ontimely.co.uk/api/send-password-reset-email'
      emailResponse = await fetch(emailApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: userName,
          resetUrl: resetUrl
        })
      })
    }

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}))
      console.error('Email API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        error: errorData
      })
      
      // Check if it's a Resend API key issue
      if (errorData.error && errorData.error.includes('RESEND_API_KEY')) {
        console.error('❌ RESEND_API_KEY issue detected:', errorData.error)
        return res.status(500).json({ 
          error: 'Email service configuration error. Please contact support.' 
        })
      }
      
      return res.status(500).json({ 
        error: 'Failed to send password reset email. Please try again later.' 
      })
    }

    console.log(`✅ Password reset email sent successfully to ${email}`)
    
    return res.status(200).json({ 
      success: true, 
      message: 'Password reset link has been sent to your email address.' 
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    return res.status(500).json({ 
      error: 'An error occurred. Please try again later.' 
    })
  }
}

