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
               <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: radial-gradient(1200px 800px at 20% -10%, rgba(34,197,94,0.12), transparent 40%), radial-gradient(1000px 700px at 120% 10%, rgba(34,197,94,0.08), transparent 45%), #0f1115; min-height: 100vh; margin: 0; padding: 0;">
                 
                 <!-- Desktop Layout -->
                 <div style="display: block; max-width: none; margin: 0; padding: 0;">
                   <div style="background: rgba(17, 24, 39, 0.55); border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45); backdrop-filter: blur(8px); overflow: hidden; margin: 24px; min-height: calc(100vh - 48px);">
                     
                     <!-- Hero Header -->
                     <div style="background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,163,74,0.1)); padding: 60px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden;">
                       <!-- Background Pattern -->
                       <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 20% 20%, rgba(34,197,94,0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,163,74,0.08), transparent 50%);"></div>
                       
                       <!-- Logo -->
                       <div style="position: relative; z-index: 2; margin-bottom: 30px;">
                         <div style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px 30px; border-radius: 15px; box-shadow: 0 8px 32px rgba(34,197,94,0.3);">
                           <h1 style="color: #0b1411; margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em;">ONTIMELY</h1>
                           <p style="color: #0b1411; margin: 5px 0 0; font-size: 0.9rem; font-weight: 600; opacity: 0.8;">EVENT MANAGEMENT SOFTWARE</p>
                         </div>
                       </div>
                       
                       <!-- Main Heading -->
                       <div style="position: relative; z-index: 2;">
                         <h2 style="color: #e5e7eb; margin: 0 0 15px; font-size: 3rem; font-weight: 700; line-height: 1.1;">Welcome to OnTimely!</h2>
                         <p style="color: #cbd5e1; margin: 0; font-size: 1.2rem; font-weight: 400; opacity: 0.9;">Professional Event Management Platform</p>
                       </div>
                     </div>
                     
                     <!-- Content -->
                     <div style="padding: 50px 40px; display: flex; gap: 40px; align-items: flex-start;">
                       
                       <!-- Left Column - Main Content -->
                       <div style="flex: 1; min-width: 0;">
                         <!-- Greeting -->
                         <p style="color: #e5e7eb; font-size: 18px; line-height: 1.6; margin: 0 0 30px; font-weight: 500;">
                           Hi ${name},
                         </p>
                         
                         <p style="color: #e5e7eb; font-size: 18px; line-height: 1.6; margin: 0 0 40px;">
                           Your OnTimely account has been created successfully! 🎉
                         </p>
                         
                         <!-- Account Details -->
                         <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 15px; margin: 30px 0;">
                           <h3 style="color: #22c55e; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                             <span style="margin-right: 10px; font-size: 18px;">👤</span>
                             Account Details
                           </h3>
                           <div style="margin-bottom: 20px;">
                             <strong style="color: #cbd5e1; display: block; margin-bottom: 8px; font-size: 16px;">Email:</strong> 
                             <span style="color: #e5e7eb; font-family: monospace; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; display: inline-block; font-size: 16px; border: 1px solid rgba(255,255,255,0.1);">${email}</span>
                           </div>
                           ${companyName ? `
                           <div style="margin-bottom: 20px;">
                             <strong style="color: #cbd5e1; display: block; margin-bottom: 8px; font-size: 16px;">Company:</strong> 
                             <span style="color: #e5e7eb; font-family: monospace; background: rgba(34,197,94,0.2); padding: 12px 16px; border-radius: 8px; display: inline-block; font-size: 16px; border: 1px solid rgba(34,197,94,0.3);">${companyName}</span>
                           </div>
                           ` : ''}
                         </div>
                         
                         <p style="color: #e5e7eb; font-size: 18px; line-height: 1.6; margin: 0 0 40px;">
                           To complete your account setup and start managing events, please confirm your email address:
                         </p>
                         
                         <!-- Confirmation Button -->
                         <div style="margin: 40px 0;">
                           <a href="${confirmationUrl}" 
                              style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #0b1411; 
                                     padding: 20px 40px; text-decoration: none; border-radius: 12px; 
                                     font-weight: 700; font-size: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 12px 32px rgba(34,197,94,0.3);
                                     transition: all 0.2s ease; border: 2px solid transparent;">
                             <span style="margin-right: 10px;">✅</span>
                             Confirm Email Address
                           </a>
                         </div>
                         
                         <!-- Next Steps -->
                         <div style="background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); padding: 25px; border-radius: 12px; margin: 30px 0;">
                           <h4 style="color: #22c55e; margin: 0 0 20px; font-size: 18px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center;">
                             <span style="margin-right: 10px; font-size: 16px;">🚀</span>
                             Next Steps
                           </h4>
                           <ol style="color: #e5e7eb; margin: 0; padding-left: 25px; line-height: 1.8; font-size: 16px;">
                             <li style="margin-bottom: 10px;">Click "Confirm Email Address" above</li>
                             <li style="margin-bottom: 10px;">Set your secure password</li>
                             <li style="margin-bottom: 10px;">Log into your OnTimely dashboard</li>
                             <li style="margin-bottom: 0;">Start managing your events!</li>
                           </ol>
                         </div>
                       </div>
                       
                       <!-- Right Column - Visual Element -->
                       <div style="flex: 0 0 300px; display: flex; align-items: center; justify-content: center; padding-left: 20px;">
                         <div style="background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,163,74,0.05)); border: 2px solid rgba(34,197,94,0.2); border-radius: 20px; padding: 40px; text-align: center; width: 100%;">
                           <div style="font-size: 4rem; margin-bottom: 20px;">🎯</div>
                           <h3 style="color: #e5e7eb; margin: 0 0 15px; font-size: 1.5rem; font-weight: 600;">Ready to Launch?</h3>
                           <p style="color: #cbd5e1; margin: 0; font-size: 1rem; line-height: 1.5; opacity: 0.9;">
                             Your event management journey starts with a simple email confirmation.
                           </p>
                         </div>
                       </div>
                       
                     </div>
                     
                     <!-- Footer -->
                     <div style="background: rgba(0,0,0,0.2); padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                       <p style="color: #9ca3af; font-size: 16px; margin: 0 0 10px; line-height: 1.5;">
                         This link expires in 24 hours for security reasons.
                       </p>
                       <p style="color: #6b7280; font-size: 14px; margin: 0;">
                         This email was sent by OnTimely Event Management Systems
                       </p>
                     </div>
                     
                   </div>
                 </div>
                 
                 <!-- Mobile Layout -->
                 <div style="display: none; max-width: 400px; margin: 0 auto; padding: 20px;">
                   <div style="background: rgba(17, 24, 39, 0.55); border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45); backdrop-filter: blur(8px); overflow: hidden;">
                     
                     <!-- Mobile Header -->
                     <div style="background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,163,74,0.1)); padding: 30px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
                       <!-- Logo -->
                       <div style="margin-bottom: 20px;">
                         <div style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 15px 25px; border-radius: 12px; box-shadow: 0 6px 24px rgba(34,197,94,0.3);">
                           <h1 style="color: #0b1411; margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">ONTIMELY</h1>
                           <p style="color: #0b1411; margin: 3px 0 0; font-size: 0.7rem; font-weight: 600; opacity: 0.8;">EVENT MANAGEMENT SOFTWARE</p>
                         </div>
                       </div>
                       
                       <h2 style="color: #e5e7eb; margin: 0 0 10px; font-size: 2rem; font-weight: 700; line-height: 1.1;">Welcome to OnTimely!</h2>
                       <p style="color: #cbd5e1; margin: 0; font-size: 1rem; font-weight: 400; opacity: 0.9;">Professional Event Management Platform</p>
                     </div>
                     
                     <!-- Mobile Content -->
                     <div style="padding: 30px 20px;">
                       <!-- Greeting -->
                       <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 20px; font-weight: 500; text-align: center;">
                         Hi ${name},
                       </p>
                       
                       <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                         Your OnTimely account has been created successfully! 🎉
                       </p>
                       
                       <!-- Account Details -->
                       <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; margin: 20px 0;">
                         <h3 style="color: #22c55e; margin: 0 0 15px; font-size: 16px; font-weight: 600; text-align: center;">Account Details</h3>
                         <div style="margin-bottom: 15px;">
                           <strong style="color: #cbd5e1; display: block; margin-bottom: 5px; font-size: 14px; text-align: center;">Email:</strong> 
                           <span style="color: #e5e7eb; font-family: monospace; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; display: block; font-size: 14px; text-align: center; border: 1px solid rgba(255,255,255,0.1); word-break: break-all;">${email}</span>
                         </div>
                         ${companyName ? `
                         <div style="margin-bottom: 15px;">
                           <strong style="color: #cbd5e1; display: block; margin-bottom: 5px; font-size: 14px; text-align: center;">Company:</strong> 
                           <span style="color: #e5e7eb; font-family: monospace; background: rgba(34,197,94,0.2); padding: 8px 12px; border-radius: 6px; display: block; font-size: 14px; text-align: center; border: 1px solid rgba(34,197,94,0.3);">${companyName}</span>
                         </div>
                         ` : ''}
                       </div>
                       
                       <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                         To complete your account setup and start managing events, please confirm your email address:
                       </p>
                       
                       <!-- Confirmation Button -->
                       <div style="text-align: center; margin: 30px 0;">
                         <a href="${confirmationUrl}" 
                            style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #0b1411; 
                                   padding: 16px 32px; text-decoration: none; border-radius: 10px; 
                                   font-weight: 700; font-size: 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 24px rgba(34,197,94,0.25);
                                   white-space: nowrap;">
                           <span style="margin-right: 8px;">✅</span>
                           Confirm Email Address
                         </a>
                       </div>
                       
                       <!-- Next Steps -->
                       <div style="background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); padding: 20px; border-radius: 10px; margin: 20px 0;">
                         <h4 style="color: #22c55e; margin: 0 0 15px; font-size: 16px; font-weight: 600; text-align: center;">Next Steps:</h4>
                         <ol style="color: #e5e7eb; margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px;">
                           <li style="margin-bottom: 8px;">Click "Confirm Email Address" above</li>
                           <li style="margin-bottom: 8px;">Set your secure password</li>
                           <li style="margin-bottom: 8px;">Log into your OnTimely dashboard</li>
                           <li style="margin-bottom: 0;">Start managing your events!</li>
                         </ol>
                       </div>
                       
                       <!-- Fallback Link -->
                       <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 15px; border-radius: 8px; margin: 20px 0;">
                         <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px; line-height: 1.4; text-align: center;">
                           <strong>Having trouble?</strong> If the button doesn't work, copy and paste this link:
                         </p>
                         <p style="color: #22c55e; font-size: 10px; margin: 0; word-break: break-all; font-family: monospace; background: rgba(34,197,94,0.1); padding: 6px 8px; border-radius: 4px; text-align: center;">
                           ${confirmationUrl}
                         </p>
                       </div>
                       
                     </div>
                     
                     <!-- Mobile Footer -->
                     <div style="background: rgba(0,0,0,0.2); padding: 20px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                       <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px; line-height: 1.4;">
                         This link expires in 24 hours for security reasons.
                       </p>
                       <p style="color: #6b7280; font-size: 10px; margin: 0;">
                         This email was sent by OnTimely Event Management Systems
                       </p>
                     </div>
                     
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