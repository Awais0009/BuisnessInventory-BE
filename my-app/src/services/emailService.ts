// Email service for sending confirmation and reset emails
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export class EmailService {
  private readonly fromEmail: string;
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'Business Inventory <noreply@businessinventory.com>';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configure transporter based on environment variables
    if (process.env.EMAIL_SERVICE === 'gmail') {
      // Gmail configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
        }
      });
    } else if (process.env.SMTP_HOST) {
      // Custom SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Fallback to ethereal email for testing
      console.warn('⚠️  No email configuration found, using test account');
      this.createTestAccount();
    }
  }

  private async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Test email account created:');
      console.log(`User: ${testAccount.user}`);
      console.log(`Pass: ${testAccount.pass}`);
    } catch (error) {
      console.error('Failed to create test account:', error);
    }
  }

  // Send email confirmation
  async sendConfirmationEmail(email: string, token: string): Promise<boolean> {
    const confirmationUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&type=email_confirmation`;
    
    const emailOptions: EmailOptions = {
      to: email,
      subject: 'Confirm Your Email - Business Inventory',
      html: this.getConfirmationEmailTemplate(confirmationUrl),
      text: `Please confirm your email by clicking this link: ${confirmationUrl}`
    };

    return this.sendEmail(emailOptions);
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&type=password_reset`;
    
    const emailOptions: EmailOptions = {
      to: email,
      subject: 'Reset Your Password - Business Inventory',
      html: this.getPasswordResetEmailTemplate(resetUrl),
      text: `Reset your password by clicking this link: ${resetUrl}`
    };

    return this.sendEmail(emailOptions);
  }

  // Generic send email method
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // If transporter is not initialized (async test account creation), wait a bit
      if (!this.transporter) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const mailOptions = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully!');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message ID: ${info.messageId}`);
      
      // For test accounts, log the preview URL
      if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_SERVICE && !process.env.SMTP_HOST) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`📧 Preview URL: ${previewUrl}`);
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Email sending error:', error);
      
      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      return false;
    }
  }

  // Email templates
  private getConfirmationEmailTemplate(confirmationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h1 style="color: #2c3e50; text-align: center;">Welcome to Business Inventory!</h1>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Thank you for creating an account with Business Inventory. To complete your registration, 
            please confirm your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #3498db; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                      display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
            <br>
            <a href="${confirmationUrl}" style="color: #3498db;">${confirmationUrl}</a>
          </p>
          
          <p style="color: #7f8c8d; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create this account, 
            you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h1 style="color: #2c3e50; text-align: center;">Reset Your Password</h1>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            You recently requested to reset your password for your Business Inventory account. 
            Click the button below to reset it:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #e74c3c; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
            <br>
            <a href="${resetUrl}" style="color: #e74c3c;">${resetUrl}</a>
          </p>
          
          <p style="color: #7f8c8d; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, 
            you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
