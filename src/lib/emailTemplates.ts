import { Resend } from 'resend';

// TODO: Get your Resend API key from:
// 1. Go to https://resend.com/api-keys
// 2. Copy your API key (starts with 're_')
// 3. Replace the placeholder below
// 4. Or add VITE_RESEND_API_KEY to your .env.local file and use: import.meta.env.VITE_RESEND_API_KEY

// Initialize Resend - Use the working API key from .env.local
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
console.log('🔍 RESEND SETUP:', {
  hasResendPackage: typeof Resend !== 'undefined',
  apiKey: resendApiKey ? `${resendApiKey.substring(0, 10)}...` : 'NOT FOUND',
  envVars: Object.keys(import.meta.env).filter(key => key.includes('RESEND')),
  fromEmail: import.meta.env.VITE_FROM_EMAIL
});

if (!resendApiKey) {
  console.error('❌ RESEND API KEY MISSING: VITE_RESEND_API_KEY not found in environment variables');
  throw new Error('Resend API key not configured. Please set VITE_RESEND_API_KEY in your .env.local file.');
}

const resend = new Resend(resendApiKey);
console.log('🔍 RESEND CLIENT CREATED:', !!resend);

// Test Resend API connectivity
console.log('🔍 TESTING RESEND API CONNECTIVITY...');
console.log('🔍 CURRENT LOCATION:', {
  hostname: window.location.hostname,
  port: window.location.port,
  protocol: window.location.protocol,
  fullUrl: window.location.href
});

// Network connectivity test function - commented out to prevent errors on page load
// const testNetworkConnectivity = async () => {
//   try {
//     console.log('🔍 TESTING GENERAL NETWORK CONNECTIVITY...');
//     
//     // Test general internet connectivity
//     const googleResponse = await fetch('https://www.google.com');
//     console.log('🔍 GOOGLE CONNECTIVITY:', {
//       status: googleResponse.status,
//       ok: googleResponse.ok
//     });
//     
//     // Test Resend API specifically
//     const testResponse = await fetch('https://api.resend.com/health');
//     console.log('🔍 RESEND API HEALTH CHECK:', {
//       status: testResponse.status,
//       ok: testResponse.ok,
//       statusText: testResponse.statusText
//     });
//   } catch (connectivityError) {
//     console.error('❌ NETWORK CONNECTIVITY FAILED:', connectivityError);
//   }
// };

// Call the function when module loads
// testNetworkConnectivity();

export interface EmailData {
  email: string;
  name: string;
  companyName?: string;
  confirmationUrl: string;
}

// Professional email template for account confirmation
export const getAccountConfirmationTemplate = (data: EmailData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your OnTimely Account</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #f8f9fa;
                color: #333;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            
            .logo {
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                font-weight: bold;
            }
            
            .brand-placeholder {
                width: 120px;
                height: 40px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.2);
                border: 2px dashed rgba(255, 255, 255, 0.4);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
                font-style: italic;
            }
            
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            
            h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 28px;
                font-weight: 600;
            }
            
            .welcome-text {
                color: #666;
                margin-bottom: 30px;
                font-size: 16px;
                line-height: 1.6;
            }
            
            .highlight-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 30px 0;
                text-align: left;
                border-radius: 0 10px 10px 0;
            }
            
            .highlight-box h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 18px;
                font-weight: 600;
            }
            
            .highlight-box p {
                color: #666;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                text-decoration: none;
                padding: 18px 36px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                margin: 30px 0;
                transition: transform 0.2s ease;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
            }
            
            .features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
                text-align: left;
            }
            
            .feature {
                display: flex;
                align-items: center;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .feature-icon {
                width: 40px;
                height: 40px;
                background: #667eea;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                margin-right: 15px;
                font-size: 18px;
            }
            
            .feature-text {
                color: #333;
                font-size: 14px;
                font-weight: 500;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            
            .security-note {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
            }
            
            .security-note h4 {
                color: #856404;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .security-note p {
                color: #856404;
                font-size: 12px;
                margin: 0;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 20px;
                    border-radius: 15px;
                }
                
                .header, .content, .footer {
                    padding: 30px 20px;
                }
                
                .features {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">OT</div>
                <div class="brand-placeholder">Your Brand Logo</div>
                <h1 style="color: white; margin-top: 20px;">Welcome to OnTimely!</h1>
            </div>
            
            <div class="content">
                <h1>Confirm Your Account</h1>
                <p class="welcome-text">
                    Hi ${data.name},<br>
                    Welcome to OnTimely! We're excited to have you on board.
                </p>
                
                <div class="highlight-box">
                    <h3>
                        <span style="color: #667eea;">✓</span> 
                        Account Created Successfully
                    </h3>
                    <p><strong>Email:</strong> ${data.email}</p>
                    ${data.companyName ? `<p><strong>Company:</strong> ${data.companyName}</p>` : ''}
                    <p><strong>Status:</strong> Pending Email Confirmation</p>
                </div>
                
                <p style="color: #666; margin: 20px 0;">
                    To complete your account setup and start using OnTimely, please confirm your email address by clicking the button below:
                </p>
                
                <a href="${data.confirmationUrl}" class="cta-button">
                    Confirm Email Address
                </a>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">
                            <span style="font-size: 16px;">🔒</span>
                        </div>
                        <div class="feature-text">Secure Account Setup</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">
                            <span style="font-size: 16px;">⚡</span>
                        </div>
                        <div class="feature-text">Quick & Easy</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">
                            <span style="font-size: 16px;">🎯</span>
                        </div>
                        <div class="feature-text">Professional Tools</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">
                            <span style="font-size: 16px;">🚀</span>
                        </div>
                        <div class="feature-text">Get Started Today</div>
                    </div>
                </div>
                
                <div class="security-note">
                    <h4>
                        <span style="color: #856404;">🔐</span> 
                        Security Notice
                    </h4>
                    <p>
                        This link will expire in 24 hours for security reasons. If you didn't request this account, please ignore this email.
                    </p>
                </div>
                
                <p style="color: #666; margin: 20px 0; font-size: 14px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${data.confirmationUrl}" style="color: #667eea; word-break: break-all;">${data.confirmationUrl}</a>
                </p>
            </div>
            
            <div class="footer">
                <p>
                    <strong>OnTimely</strong> - Professional Event Management Platform<br>
                    This email was sent to ${data.email}
                </p>
                <p style="margin-top: 15px;">
                    <a href="https://dashboard.ontimely.co.uk">Visit Dashboard</a> | 
                    <a href="https://ontimely.co.uk">Visit Website</a> | 
                    <a href="mailto:support@ontimely.co.uk">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send account confirmation email via Resend
export const sendAccountConfirmationEmail = async (data: EmailData) => {
  console.log('🔍 ATTEMPTING TO SEND RESEND EMAIL:', {
    to: data.email,
    hasResendClient: !!resend,
    apiKeyExists: !!import.meta.env.VITE_RESEND_API_KEY
  });
  
  try {
    const fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@ontimely.co.uk';
    console.log('🔍 SENDING TO RESEND:', {
      from: `OnTimely <${fromEmail}>`,
      to: [data.email],
      subject: `Confirm Your OnTimely Account - Welcome ${data.name}!`,
      hasHtml: !!getAccountConfirmationTemplate(data),
      htmlLength: getAccountConfirmationTemplate(data).length,
      resendClient: !!resend,
      apiKeyLength: resendApiKey?.length
    });
    
    console.log('🔍 ABOUT TO CALL resend.emails.send...');
    const { data: emailData, error } = await resend.emails.send({
      from: `OnTimely <${fromEmail}>`,
      to: [data.email],
      subject: `Confirm Your OnTimely Account - Welcome ${data.name}!`,
      html: getAccountConfirmationTemplate(data),
    });

    if (error) {
      console.error('❌ Resend email failed - MESSAGE:', error.message);
      console.error('❌ Resend email failed - TYPE:', typeof error);
      console.error('❌ Resend email failed - KEYS:', Object.keys(error));
      console.error('❌ Resend email failed - FULL ERROR:', error);
      console.error('❌ Resend email failed - STRINGIFIED:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Account confirmation email sent successfully via Resend:', emailData);
    return emailData;
  } catch (error) {
    console.error('❌ Error sending confirmation email via Resend:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
      errorType: typeof error,
      errorKeys: error instanceof Error ? Object.keys(error) : 'Not an Error object',
      fullError: JSON.stringify(error, null, 2),
      rawError: error
    });
    throw error;
  }
};

// Fallback email template (simpler version)
export const getSimpleConfirmationTemplate = (data: EmailData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px; }
            .content { padding: 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to OnTimely!</h1>
            </div>
            
            <div class="content">
                <h2>Hi ${data.name},</h2>
                <p>Your OnTimely account has been created successfully!</p>
                <p><strong>Email:</strong> ${data.email}</p>
                ${data.companyName ? `<p><strong>Company:</strong> ${data.companyName}</p>` : ''}
                
                <p>To complete your account setup, please confirm your email address:</p>
                
                <a href="${data.confirmationUrl}" class="button">Confirm Email Address</a>
                
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                    If the button doesn't work, copy this link: ${data.confirmationUrl}
                </p>
            </div>
            
            <div class="footer">
                <p>OnTimely - Professional Event Management Platform</p>
                <p>This link expires in 24 hours for security reasons.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send simple confirmation email (fallback)
export const sendSimpleConfirmationEmail = async (data: EmailData) => {
  try {
    const fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@ontimely.co.uk';
    const { data: emailData, error } = await resend.emails.send({
      from: `OnTimely <${fromEmail}>`,
      to: [data.email],
      subject: `Confirm Your OnTimely Account`,
      html: getSimpleConfirmationTemplate(data),
    });

    if (error) {
      console.error('❌ Simple confirmation email failed:', {
        message: error.message,
        details: error
      });
      throw error;
    }

    console.log('✅ Simple confirmation email sent successfully:', emailData);
    return emailData;
  } catch (error) {
    console.error('❌ Error sending simple confirmation email:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
      fullError: error
    });
    throw error;
  }
};
