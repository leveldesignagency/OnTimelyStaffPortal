const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      app_version,
      platform,
      device_model,
      os_version,
      error_type,
      error_message,
      stack_trace,
      user_id,
      user_email,
      screen_name,
      action_taken,
      severity = 'medium',
    } = req.body;

    // Validate required fields
    if (!app_version || !platform || !error_type || !error_message) {
      return res.status(400).json({ 
        error: 'Missing required fields: app_version, platform, error_type, error_message' 
      });
    }

    // Insert crash report
    const { data, error } = await supabase
      .from('crash_reports')
      .insert({
        app_version,
        platform,
        device_model: device_model || null,
        os_version: os_version || null,
        error_type,
        error_message,
        stack_trace: stack_trace || null,
        user_id: user_id || null,
        user_email: user_email || null,
        screen_name: screen_name || null,
        action_taken: action_taken || null,
        severity: severity || 'medium',
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting crash report:', error);
      return res.status(500).json({ error: 'Failed to save crash report: ' + error.message });
    }

    return res.status(200).json({ 
      success: true, 
      id: data.id,
      message: 'Crash report saved successfully' 
    });

  } catch (error) {
    console.error('Crash report API error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

