# Email Setup Instructions

## Gmail Configuration for tryon3643@gmail.com

To use Gmail with Nodemailer, you need to create an **App Password** instead of using your regular Gmail password.

### Steps to Create Gmail App Password:

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Scroll down to "App passwords"
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other (custom name)"
   - Enter "Business Inventory Backend"
   - Click "Generate"
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)

3. **Update .env file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=tryon3643@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   EMAIL_FROM=Business Inventory <tryon3643@gmail.com>
   ```

### Alternative SMTP Providers:

If you prefer not to use Gmail, you can use other providers:

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your_mailgun_username
EMAIL_PASSWORD=your_mailgun_password
```

### Testing Email Configuration:

1. **Development Mode**: If no email configuration is provided, the system will use Ethereal Email (fake SMTP service) for testing
2. **Preview URLs**: In development, email preview URLs will be logged to console
3. **Production**: Make sure to set `NODE_ENV=production` and configure real email service

### Environment Variables Summary:

```env
# Required for Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=tryon3643@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=Business Inventory <tryon3643@gmail.com>

# Required for Custom SMTP
SMTP_HOST=your.smtp.host
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your_username
EMAIL_PASSWORD=your_password
EMAIL_FROM=Business Inventory <your-email@domain.com>
```

### Security Notes:

- Never commit your actual email passwords to version control
- Use environment variables for all sensitive information
- For production, consider using dedicated email services like SendGrid or AWS SES
- Gmail App Passwords are more secure than regular passwords for applications
