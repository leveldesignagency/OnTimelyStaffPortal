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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background: #f8fafc;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #0ab27c 0%, #16a34a 100%); 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
              border-radius: 12px 12px 0 0; 
              margin: -20px -20px 0 -20px;
            }
            .logo {
              width: 200px;
              height: auto;
              margin-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content { 
              padding: 30px 20px; 
              background: #fff; 
              border-radius: 0 0 12px 12px; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #0ab27c 0%, #16a34a 100%); 
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0; 
              font-weight: 600;
              transition: transform 0.2s ease;
              box-shadow: 0 4px 12px rgba(10, 178, 124, 0.3);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(10, 178, 124, 0.4);
            }
            .info-box {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              margin-top: 30px; 
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-logo {
              width: 120px;
              height: auto;
              margin-bottom: 10px;
              opacity: 0.7;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 1695.17 474.35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <style>
                    .cls-1 { fill: #fff; }
                    .cls-2 { fill: #fff; }
                  </style>
                </defs>
                <g>
                  <rect class="cls-2" x="157.17" y="197.18" width="23.87" height="37.04"/>
                  <path class="cls-2" d="M259.12,113.91v120.3h-52.87v-43.2c0-4.8-1.85-8.9-5.56-12.31-3.65-3.35-8-5.03-13.06-5.03h-37.07c-5.05,0-9.4,1.68-13.06,5.03-3.7,3.41-5.55,7.51-5.55,12.31v43.2h-52.88v-120.3c0-10.31,8.36-18.68,18.69-18.68h142.69c10.32,0,18.68,8.36,18.68,18.68Z"/>
                  <rect class="cls-2" x="157.17" y="240.14" width="23.87" height="37.04"/>
                  <path class="cls-2" d="M259.12,240.14v120.3c0,10.32-8.35,18.69-18.68,18.69H97.76c-10.32,0-18.69-8.36-18.69-18.69v-120.3h52.88v43.19c0,4.81,1.85,8.91,5.55,12.31,3.65,3.35,8.01,5.03,13.06,5.03h37.07c5.06,0,9.4-1.68,13.06-5.03,3.71-3.4,5.56-7.5,5.56-12.31v-43.19h52.87Z"/>
                  <polygon class="cls-2" points="348.02 218.86 351.9 234.22 348.02 234.22 348.02 218.86"/>
                  <path class="cls-2" d="M453.24,113.91v120.3h-49.61v-60.53h-25.22v60.53h-5.43l-15.2-60.53h-34.97v60.53h-49.62v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.32,0,18.68,8.36,18.68,18.68Z"/>
                  <polygon class="cls-2" points="378.41 255.86 374.46 240.14 378.41 240.14 378.41 255.86"/>
                  <path class="cls-2" d="M453.24,240.14v120.3c0,10.32-8.35,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h49.62v60.52h25.22v-60.52h5.38l15.32,60.52h34.9v-60.52h49.61Z"/>
                </g>
                <g>
                  <path class="cls-1" d="M645.54,113.91v120.3h-77.43v-37.04h24.54v-23.49h-74.29v23.49h24.62v37.04h-77.5v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.69,8.36,18.69,18.68Z"/>
                  <path class="cls-1" d="M645.54,240.14v120.3c0,10.32-8.37,18.69-18.69,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h77.5v60.52h25.14v-60.52h77.43Z"/>
                  <path class="cls-1" d="M839.64,113.91v120.3h-77.42v-60.53h-25.21v60.53h-77.42v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M839.64,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h77.42v60.52h25.21v-60.52h77.42Z"/>
                  <polygon class="cls-1" points="973.06 234.22 976.67 216.99 976.67 234.22 973.06 234.22"/>
                  <polygon class="cls-1" points="910.79 216.99 914.43 234.22 910.79 234.22 910.79 216.99"/>
                  <path class="cls-1" d="M1033.75,113.91v120.3h-31.87v-60.53h-34.97l-13.55,60.53h-19.17l-13.65-60.53h-34.97v60.53h-31.87v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <polygon class="cls-1" points="943.81 276.87 935.52 240.14 952.03 240.14 943.81 276.87"/>
                  <path class="cls-1" d="M1033.75,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h31.87v60.52h25.22v-60.52h4.9l12.81,60.52h30.62l12.7-60.52h4.86v60.52h25.22v-60.52h31.87Z"/>
                  <path class="cls-1" d="M1227.87,113.91v120.3h-63.46v-8.82h-34.97v-28.21h42.03v-23.49h-67.25v60.53h-56.4v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M1227.87,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h56.4v60.52h67.25v-23.49h-42.03v-28.21h34.97v-8.82h63.46Z"/>
                  <path class="cls-1" d="M1421.98,113.91v120.3h-94.9v-60.53h-25.22v60.53h-59.93v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.32,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M1421.98,240.14v120.3c0,10.32-8.35,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h59.93v60.52h60.19v-23.49h-34.97v-37.04h94.9Z"/>
                  <path class="cls-1" d="M1616.1,113.91v120.3h-70.11l19.14-60.53h-25.74c-3.64,12.33-8.08,32.5-13.31,60.53h-.09c-5.13-28.03-9.55-48.21-13.24-60.53h-25.74l19.18,60.53h-70.15v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M1616.1,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h72.02l5.43,17.15v43.37h25.22v-43.45l5.4-17.07h71.98Z"/>
                </g>
              </svg>
              <h1>Welcome to OnTimely!</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Your OnTimely account has been created successfully! 🎉</p>
              
              <div class="info-box">
                <p><strong>📧 Email:</strong> ${email}</p>
                ${companyName ? `<p><strong>🏢 Company:</strong> ${companyName}</p>` : ''}
              </div>
              
              <p>To complete your account setup and start managing events, please confirm your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
              </div>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666; padding: 16px; background: #f8fafc; border-radius: 8px;">
                <strong>Having trouble?</strong> If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #0ab27c;">${confirmationUrl}</span>
              </p>
            </div>
            
            <div class="footer">
              <svg class="footer-logo" viewBox="0 0 1695.17 474.35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <style>
                    .cls-1 { fill: #666; }
                    .cls-2 { fill: #0ab27c; }
                  </style>
                </defs>
                <g>
                  <rect class="cls-2" x="157.17" y="197.18" width="23.87" height="37.04"/>
                  <path class="cls-2" d="M259.12,113.91v120.3h-52.87v-43.2c0-4.8-1.85-8.9-5.56-12.31-3.65-3.35-8-5.03-13.06-5.03h-37.07c-5.05,0-9.4,1.68-13.06,5.03-3.7,3.41-5.55,7.51-5.55,12.31v43.2h-52.88v-120.3c0-10.31,8.36-18.68,18.69-18.68h142.69c10.32,0,18.68,8.36,18.68,18.68Z"/>
                  <rect class="cls-2" x="157.17" y="240.14" width="23.87" height="37.04"/>
                  <path class="cls-2" d="M259.12,240.14v120.3c0,10.32-8.35,18.69-18.68,18.69H97.76c-10.32,0-18.69-8.36-18.69-18.69v-120.3h52.88v43.19c0,4.81,1.85,8.91,5.55,12.31,3.65,3.35,8.01,5.03,13.06,5.03h37.07c5.06,0,9.4-1.68,13.06-5.03,3.71-3.4,5.56-7.5,5.56-12.31v-43.19h52.87Z"/>
                  <polygon class="cls-2" points="348.02 218.86 351.9 234.22 348.02 234.22 348.02 218.86"/>
                  <path class="cls-2" d="M453.24,113.91v120.3h-49.61v-60.53h-25.22v60.53h-5.43l-15.2-60.53h-34.97v60.53h-49.62v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.32,0,18.68,8.36,18.68,18.68Z"/>
                  <polygon class="cls-2" points="378.41 255.86 374.46 240.14 378.41 240.14 378.41 255.86"/>
                  <path class="cls-2" d="M453.24,240.14v120.3c0,10.32-8.35,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h49.62v60.52h25.22v-60.52h5.38l15.32,60.52h34.9v-60.52h49.61Z"/>
                </g>
                <g>
                  <path class="cls-1" d="M645.54,113.91v120.3h-77.43v-37.04h24.54v-23.49h-74.29v23.49h24.62v37.04h-77.5v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.69,8.36,18.69,18.68Z"/>
                  <path class="cls-1" d="M645.54,240.14v120.3c0,10.32-8.37,18.69-18.69,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h77.5v60.52h25.14v-60.52h77.43Z"/>
                  <path class="cls-1" d="M839.64,113.91v120.3h-77.42v-60.53h-25.21v60.53h-77.42v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M839.64,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h77.42v60.52h25.21v-60.52h77.42Z"/>
                  <polygon class="cls-1" points="973.06 234.22 976.67 216.99 976.67 234.22 973.06 234.22"/>
                  <polygon class="cls-1" points="910.79 216.99 914.43 234.22 910.79 234.22 910.79 216.99"/>
                  <path class="cls-1" d="M1033.75,113.91v120.3h-31.87v-60.53h-34.97l-13.55,60.53h-19.17l-13.65-60.53h-34.97v60.53h-31.87v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <polygon class="cls-1" points="943.81 276.87 935.52 240.14 952.03 240.14 943.81 276.87"/>
                  <path class="cls-1" d="M1033.75,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h31.87v60.52h25.22v-60.52h4.9l12.81,60.52h30.62l12.7-60.52h4.86v60.52h25.22v-60.52h31.87Z"/>
                  <path class="cls-1" d="M1227.87,113.91v120.3h-63.46v-8.82h-34.97v-28.21h42.03v-23.49h-67.25v60.53h-56.4v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M1227.87,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h56.4v60.52h67.25v-23.49h-42.03v-28.21h34.97v-8.82h63.46Z"/>
                  <path class="cls-1" d="M1421.98,113.91v120.3h-94.9v-60.53h-25.22v60.53h-59.93v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.32,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M1421.98,240.14v120.3c0,10.32-8.35,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h59.93v60.52h60.19v-23.49h-34.97v-37.04h94.9Z"/>
                  <path class="cls-1" d="M1616.1,113.91v120.3h-70.11l19.14-60.53h-25.74c-3.64,12.33-8.08,32.5-13.31,60.53h-.09c-5.13-28.03-9.55-48.21-13.24-60.53h-25.74l19.18,60.53h-70.15v-120.3c0-10.31,8.36-18.68,18.68-18.68h142.7c10.31,0,18.68,8.36,18.68,18.68Z"/>
                  <path class="cls-1" d="M1616.1,240.14v120.3c0,10.32-8.36,18.69-18.68,18.69h-142.7c-10.31,0-18.68-8.36-18.68-18.69v-120.3h72.02l5.43,17.15v43.37h25.22v-43.45l5.4-17.07h71.98Z"/>
                </g>
              </svg>
              <p><strong>OnTimely</strong> - Professional Event Management Platform</p>
              <p>This link expires in 24 hours for security reasons.</p>
              <p style="font-size: 12px; color: #999;">
                © 2025 OnTimely. All rights reserved.<br>
                You received this email because an account was created for you.
              </p>
            </div>
          </div>
        </body>
        </html>
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
