export default function AdminForgotPasswordEmailTemplate(mailOptions: any) {
    const template = `<!DOCTYPE html>
      <html>
      <head>
          <title>Reset Your Password - OTP Verification</title>
      </head>
      <style>
        a {
          display: inline-block;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          background-color: #4CAF50;
          color: white;
          border-radius: 5px;
        }
      </style>
      <body>
          <p>Dear ${mailOptions.adminName},</p>
          <p>We received a request to reset your password for your Bible Stories admin account. To verify your identity, please use the OTP below:</p>
          <p><strong>OTP: ${mailOptions.otp}</strong></p>
          <p>Please enter this OTP within the next 10 minutes to proceed with resetting your password.</p>
          <p>If you did not request a password reset, please ignore this email. Your account remains secure.</p>
          <p>If you have any questions or concerns, feel free to reach out to our support team.</p>
          <p>Thank you for using Bible Stories!</p>
          <p>Best regards,</p>
          <p>The Bible Stories Team</p>
      </body>
      </html>`;
  
    const forgotPasswordEmailTemplate = {
      subject: 'Reset Your Password - OTP Verification',
      html: template,
    };
  
    return forgotPasswordEmailTemplate;
  }
  