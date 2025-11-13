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

    // Create admin client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get file from request
    // Note: This assumes the file is sent as base64 or FormData
    // For Vercel serverless, we'll handle base64
    const { file, fileName, fileType } = req.body

    if (!file || !fileName) {
      return res.status(400).json({ error: 'Missing file or fileName' })
    }

    // Convert base64 to buffer if needed
    let fileBuffer
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Base64 data URL
      const base64Data = file.split(',')[1]
      fileBuffer = Buffer.from(base64Data, 'base64')
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file
    } else {
      return res.status(400).json({ error: 'Invalid file format' })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (fileType && !allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' })
    }

    // Validate file size (5MB max)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' })
    }

    // Create unique file path
    const fileExt = fileName.split('.').pop() || 'jpg'
    const uniqueFileName = `${fileName.replace(/\.[^/.]+$/, '')}-${Date.now()}.${fileExt}`
    const filePath = `app-images/${uniqueFileName}`

    // Upload to Supabase Storage using service role
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('app-images')
      .upload(filePath, fileBuffer, {
        contentType: fileType || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return res.status(500).json({ 
        error: 'Failed to upload image',
        details: uploadError.message 
      })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('app-images')
      .getPublicUrl(filePath)

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}

