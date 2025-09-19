const { Resend } = require('resend');

// Use your verified domain now that DNS is configured
const FROM_EMAIL = 'noreply@ontimely.co.uk';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }
  
  const resend = new Resend(apiKey);

  try {
    const { email, name, companyName, confirmationUrl } = req.body || {};
    console.log('Received request:', { email, name, companyName, confirmationUrl });
    
    if (!email || !name || !confirmationUrl) {
      return res.status(400).json({ error: 'Missing required fields: email, name, confirmationUrl' });
    }

    const emailPayload = {
      from: `OnTimely <${FROM_EMAIL}>`,
      to: [email],
      subject: `Confirm Your OnTimely Account - Welcome ${name}!`,
             html: `
               <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #000000; color: #ffffff; margin: 0; padding: 0; width: 100%;">
                 
                 <!-- Desktop Layout -->
                 <div style="width: 100%; background: #000000; padding: 40px;">
                   
                   <!-- Header -->
                   <div style="margin-bottom: 30px;">
                     <p style="color: #cccccc; font-size: 16px; margin: 0 0 10px;">You have been invited to create an account for:</p>
                     <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 10px;">OnTimely Account</h1>
                     <p style="color: #cccccc; font-size: 14px; margin: 0;">Powered by OnTimely</p>
                   </div>
                   
                   <!-- Content -->
                   <div style="margin-bottom: 30px;">
                     <p style="color: #cccccc; font-size: 16px; margin: 0 0 20px;">Please complete your account setup using the link below:</p>
                     
                     <!-- Button -->
                     <div style="margin: 20px 0;">
                       <a href="${confirmationUrl}" 
                          style="display: inline-block; background: #22c55e; color: #ffffff; 
                                 padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                                 font-weight: bold; font-size: 16px;">
                         Confirm Email Address
                       </a>
                     </div>
                     
                     <!-- Alternative Link -->
                     <p style="color: #cccccc; font-size: 14px; margin: 20px 0 0;">
                       If the button does not work, <a href="${confirmationUrl}" style="color: #22c55e; text-decoration: underline;">click here</a> to access the confirmation page.
                     </p>
                   </div>
                   
                   <!-- Footer -->
                   <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333333;">
                     <p style="color: #cccccc; font-size: 14px; margin: 0 0 10px;">If you have any questions, please contact your account administrator.</p>
                     <p style="color: #999999; font-size: 12px; margin: 0;">This email was sent by OnTimely Event Management Systems</p>
                   </div>
                   
                 </div>
                 
                 <!-- Mobile Layout -->
                 <div style="display: none; width: 100%; background: #000000; padding: 20px;">
                   
                   <!-- Mobile Header -->
                   <div style="text-align: center; margin-bottom: 30px;">
                     <p style="color: #cccccc; font-size: 14px; margin: 0 0 8px;">You have been invited to create an account for:</p>
                     <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 8px;">OnTimely Account</h1>
                     <p style="color: #cccccc; font-size: 12px; margin: 0;">Powered by OnTimely</p>
                   </div>
                   
                   <!-- Mobile Content -->
                   <div style="margin-bottom: 30px;">
                     <p style="color: #cccccc; font-size: 14px; margin: 0 0 20px; text-align: center;">Please complete your account setup using the link below:</p>
                     
                     <!-- Mobile Button -->
                     <div style="text-align: center; margin: 20px 0;">
                       <a href="${confirmationUrl}" 
                          style="display: inline-block; background: #22c55e; color: #ffffff; 
                                 padding: 14px 28px; text-decoration: none; border-radius: 6px; 
                                 font-weight: bold; font-size: 16px; width: 100%; max-width: 280px; text-align: center;">
                         Confirm Email Address
                       </a>
                     </div>
                     
                     <!-- Mobile Alternative Link -->
                     <p style="color: #cccccc; font-size: 12px; margin: 20px 0 0; text-align: center;">
                       If the button does not work, <a href="${confirmationUrl}" style="color: #22c55e; text-decoration: underline;">click here</a> to access the confirmation page.
                     </p>
                   </div>
                   
                   <!-- Mobile Footer -->
                   <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333333;">
                     <p style="color: #cccccc; font-size: 12px; margin: 0 0 8px; text-align: center;">If you have any questions, please contact your account administrator.</p>
                     <p style="color: #999999; font-size: 10px; margin: 0; text-align: center;">This email was sent by OnTimely Event Management Systems</p>
                   </div>
                   
                 </div>
                 
                 <!-- Media Query for Mobile -->
                 <style>
                   @media only screen and (max-width: 600px) {
                     .desktop-layout { display: none !important; }
                     .mobile-layout { display: block !important; }
                   }
                   @media only screen and (min-width: 601px) {
                     .desktop-layout { display: block !important; }
                     .mobile-layout { display: none !important; }
                   }
                 </style>
                 
               </div>
             `,
    };

    console.log('Sending email with payload:', emailPayload);

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json(error);
    }

    console.log('Resend success:', data);
    return res.status(200).json(data);
  } catch (e) {
    console.error('Edge Function error:', e);
    return res.status(500).json({ error: 'Failed to send email', details: e.message });
  }
};