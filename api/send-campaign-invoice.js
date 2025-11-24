const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { campaign_id, email, amount, company_name, campaign_title, invoice_ref } = req.body;

    if (!campaign_id || !email || !amount) {
      return res.status(400).json({ error: 'Missing required fields: campaign_id, email, amount' });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        status: 'sent',
        recipient_name: company_name,
        recipient_email: email,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        currency: 'USD',
        line_items: [
          {
            description: `Smart Advertising Campaign: ${campaign_title}`,
            quantity: 1,
            unit_price: amount,
            total: amount
          }
        ],
        subtotal: amount,
        tax_amount: 0,
        total_amount: amount,
        notes: `Campaign Reference: ${invoice_ref || 'N/A'}\nCampaign ID: ${campaign_id}`
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return res.status(500).json({ error: 'Failed to create invoice', details: invoiceError.message });
    }

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.FROM_EMAIL || 'noreply@ontimely.co.uk';

    // Generate payment URL (this would typically be a Stripe payment link or similar)
    const paymentUrl = `https://portal.ontimely.co.uk/pay-invoice/${invoice.id}`;

    // Create invoice email HTML
    const invoiceEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #10b981; padding-bottom: 20px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">OnTimely Advertising</h1>
            <p style="color: #6b7280; margin: 8px 0 0; font-size: 14px;">Smart Location-Based Advertising Platform</p>
          </div>

          <!-- Invoice Details -->
          <div style="margin-bottom: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">Invoice for Advertising Campaign</h2>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Invoice Number:</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #1f2937;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Campaign:</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #1f2937;">${campaign_title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Company:</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #1f2937;">${company_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Invoice Date:</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #1f2937;">${new Date(invoice.invoice_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Due Date:</strong></td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #1f2937;">${new Date(invoice.due_date).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <!-- Line Items -->
            <div style="margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-size: 14px; color: #374151; font-weight: 600;">Description</th>
                    <th style="padding: 12px; text-align: right; font-size: 14px; color: #374151; font-weight: 600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
                      Smart Advertising Campaign: ${campaign_title}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; color: #1f2937;">
                      $${parseFloat(amount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 12px; text-align: right; font-size: 16px; font-weight: 600; color: #1f2937;" colspan="2">
                      Total: $${parseFloat(amount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Payment Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${paymentUrl}" 
                 style="display: inline-block; background-color: #10b981; color: #ffffff; 
                        padding: 14px 32px; text-decoration: none; border-radius: 6px; 
                        font-weight: 600; font-size: 16px;">
                Pay Invoice
              </a>
            </div>

            <!-- Payment Instructions -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Payment Instructions:</strong><br>
                Click the "Pay Invoice" button above to complete your payment. Once payment is confirmed, your advertising campaign will automatically go live.
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                If you have any questions about this invoice, please contact us at support@ontimely.co.uk
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">
                This is an automated invoice from OnTimely Advertising Platform
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `OnTimely Advertising <${fromEmail}>`,
      to: [email],
      subject: `Invoice ${invoiceNumber} - Advertising Campaign Payment`,
      html: invoiceEmailHtml,
    });

    if (emailError) {
      console.error('Error sending invoice email:', emailError);
      return res.status(500).json({ error: 'Failed to send invoice email', details: emailError.message });
    }

    return res.status(200).json({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      payment_url: paymentUrl,
      email_sent: true
    });

  } catch (error) {
    console.error('Error in send-campaign-invoice:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

