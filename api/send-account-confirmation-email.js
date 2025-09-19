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
               <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: radial-gradient(1200px 800px at 20% -10%, rgba(34,197,94,0.12), transparent 40%), radial-gradient(1000px 700px at 120% 10%, rgba(34,197,94,0.08), transparent 45%), #0f1115;">
                 <div style="background: rgba(17, 24, 39, 0.55); border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45); backdrop-filter: blur(8px); overflow: hidden;">
                   
                   <!-- Header -->
                   <div style="background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); color: #e5e7eb; padding: 36px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
                     <h1 style="color: #e5e7eb; margin: 0 0 10px; font-size: 2.5rem; font-weight: 700;">Welcome to OnTimely!</h1>
                     <h2 style="color: #e5e7eb; margin: 0; font-size: 1.1rem; font-weight: normal; opacity: 0.9;">Professional Event Management Platform</h2>
                   </div>
                   
                   <!-- Content -->
                   <div style="padding: 40px;">
                     <!-- Greeting -->
                     <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                       Hi ${name},
                     </p>
                     
                     <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                       Your OnTimely account has been created successfully! To complete your account setup and start managing events, please confirm your email address by clicking the button below.
                     </p>
                     
                     <!-- Account Details -->
                     <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 24px; border-radius: 10px; margin: 24px 0;">
                       <h3 style="color: #22c55e; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Account Details</h3>
                       <div style="margin-bottom: 16px;">
                         <strong style="color: #cbd5e1; display: block; margin-bottom: 4px;">Email:</strong> 
                         <span style="color: #e5e7eb; font-family: monospace; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; display: inline-block;">${email}</span>
                       </div>
                       ${companyName ? `
                       <div style="margin-bottom: 16px;">
                         <strong style="color: #cbd5e1; display: block; margin-bottom: 4px;">Company:</strong> 
                         <span style="color: #e5e7eb; font-family: monospace; background: rgba(34,197,94,0.2); padding: 8px 12px; border-radius: 6px; display: inline-block; border: 1px solid rgba(34,197,94,0.3);">${companyName}</span>
                       </div>
                       ` : ''}
                     </div>
                     
                     <!-- Confirmation Button -->
                     <div style="text-align: center; margin: 32px 0;">
                       <a href="${confirmationUrl}" 
                          style="display: inline-block; background: linear-gradient(180deg, #22c55e, #16a34a); color: #0b1411; 
                                 padding: 16px 32px; text-decoration: none; border-radius: 10px; 
                                 font-weight: 700; font-size: 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 10px 24px rgba(34,197,94,0.25);">
                         Confirm Email Address
                       </a>
                     </div>
                     
                     <!-- Fallback Link -->
                     <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 10px; margin: 24px 0;">
                       <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px; line-height: 1.5;">
                         <strong>Having trouble?</strong> If the button doesn't work, copy and paste this link into your browser:
                       </p>
                       <p style="color: #22c55e; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace; background: rgba(34,197,94,0.1); padding: 8px 12px; border-radius: 6px;">
                         ${confirmationUrl}
                       </p>
                     </div>
                     
                     <!-- Next Steps -->
                     <div style="background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); padding: 20px; border-radius: 10px; margin: 24px 0;">
                       <h4 style="color: #22c55e; margin: 0 0 16px; font-size: 16px; font-weight: 600; text-align: center;">Next Steps:</h4>
                       <ol style="color: #e5e7eb; margin: 0; padding-left: 20px; line-height: 1.8;">
                         <li style="margin-bottom: 8px;">Click "Confirm Email Address" above</li>
                         <li style="margin-bottom: 8px;">Set your secure password</li>
                         <li style="margin-bottom: 8px;">Log into your OnTimely dashboard</li>
                         <li style="margin-bottom: 0;">Start managing your events!</li>
                       </ol>
                     </div>
                     
                     <!-- Footer -->
                     <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
                       <p style="color: #9ca3af; font-size: 14px; margin: 0; line-height: 1.5;">
                         This link expires in 24 hours for security reasons.
                       </p>
                       <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">
                         This email was sent by OnTimely Event Management Systems
                       </p>
                     </div>
                     
                   </div>
                 </div>
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