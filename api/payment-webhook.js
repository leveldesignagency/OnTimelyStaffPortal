const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invoice ID from webhook payload
    // This assumes the payment processor (Stripe, PayPal, etc.) sends invoice_id
    const { invoice_id, payment_status, amount, currency } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ error: 'Missing invoice_id in webhook payload' });
    }

    // Update invoice status
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        status: payment_status === 'paid' || payment_status === 'succeeded' ? 'paid' : 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice_id)
      .select()
      .single();

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      return res.status(500).json({ error: 'Failed to update invoice', details: invoiceError.message });
    }

    // If payment is successful, find and activate the associated campaign
    if (payment_status === 'paid' || payment_status === 'succeeded') {
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('invoice_id', invoice_id);

      if (campaignError) {
        console.error('Error finding campaign:', campaignError);
        return res.status(500).json({ error: 'Failed to find campaign', details: campaignError.message });
      }

      // Activate all campaigns associated with this invoice
      for (const campaign of campaigns || []) {
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            status: 'active',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign.id);

        if (updateError) {
          console.error(`Error activating campaign ${campaign.id}:`, updateError);
        } else {
          console.log(`Campaign ${campaign.id} activated successfully`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      invoice_id,
      payment_status,
      campaigns_activated: payment_status === 'paid' || payment_status === 'succeeded' ? (campaigns?.length || 0) : 0
    });

  } catch (error) {
    console.error('Error in payment-webhook:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

