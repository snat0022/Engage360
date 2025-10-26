# Email Service Setup Guide

## Overview
The Engage360 application uses SendGrid for email notifications. Currently, the email service is in demo mode and doesn't send real emails. This guide will help you configure SendGrid to enable real email sending.

## Current Status
- ✅ Email service implemented with SendGrid integration
- ✅ Email validation added
- ✅ Error handling and fallback to demo mode
- ❌ SendGrid API key not configured (demo mode active)

## Setup Instructions

### Step 1: Create SendGrid Account
1. Go to [SendGrid Console](https://app.sendgrid.com/)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### Step 2: Get API Key
1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access** and give it **Mail Send** permissions
4. Copy the generated API key (starts with `SG.`)

### Step 3: Verify Sender Email
1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Add `noreply@engage360.com` as the sender email
4. Verify the email address through the confirmation email

### Step 4: Configure Environment Variables
1. Create a `.env` file in the project root directory
2. Add the following content:

```env
# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.your_actual_api_key_here

# Other existing environment variables...
VITE_FIREBASE_API_KEY=AIzaSyBzK8Q9X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L
VITE_FIREBASE_AUTH_DOMAIN=week7-shreyas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=week7-shreyas
VITE_FIREBASE_STORAGE_BUCKET=week7-shreyas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

### Step 5: Restart Development Server
1. Stop the current development server (Ctrl+C)
2. Restart with: `npm run dev`
3. The application will now use SendGrid for email sending

## Email Features

### What Emails Are Sent
1. **Appointment Confirmation**: When admin confirms a pending appointment
2. **Appointment Rejection**: When admin rejects a pending appointment
3. **Booking Submission**: When user submits a new appointment (pending status)
4. **Bulk Confirmations**: When admin confirms multiple pending appointments

### Email Validation
- All email addresses are validated before sending
- Invalid email addresses will show error messages
- Email service gracefully handles SendGrid API errors

### Error Handling
- **401 Error**: Invalid API key
- **403 Error**: Sender email not verified
- **400 Error**: Invalid email format or request
- **Network Errors**: Connection issues with SendGrid

## Testing Email Functionality

### Test Individual Confirmation
1. Book an appointment as a user
2. As admin, confirm the appointment
3. Check user's email for confirmation message

### Test Bulk Confirmation
1. Book multiple appointments as different users
2. As admin, click "Confirm All Pending"
3. All users should receive confirmation emails

### Test Email Validation
1. Try to confirm appointment with invalid email
2. System should show error message
3. Check console for detailed error information

## Troubleshooting

### Common Issues

**"SendGrid API key is invalid"**
- Check that the API key is correct
- Ensure the API key has Mail Send permissions
- Verify the API key is properly set in `.env` file

**"SendGrid sender email not verified"**
- Verify `noreply@engage360.com` in SendGrid dashboard
- Check spam folder for verification email
- Re-verify if needed

**"Email would be sent (SendGrid not configured)"**
- Check that `.env` file exists and has correct API key
- Restart development server after adding API key
- Verify environment variable name is correct

**Emails going to spam**
- SendGrid free tier emails may go to spam initially
- Consider upgrading to paid plan for better deliverability
- Add SPF/DKIM records for your domain (advanced)

### Debug Mode
- Check browser console for email service logs
- Look for "Email would be sent" messages in demo mode
- Check "Email sent successfully via SendGrid" for real sending

## Security Notes

### API Key Security
- Never commit `.env` file to version control
- Use environment variables in production
- Rotate API keys regularly
- Use restricted API keys with minimal permissions

### Email Content
- All email content is HTML formatted
- Includes appointment details and branding
- Professional templates with Engage360 styling

## Production Deployment

### Environment Variables
Set the following environment variables in your production environment:
```
VITE_SENDGRID_API_KEY=your_production_api_key
```

### Domain Verification
For production, consider:
1. Setting up domain authentication in SendGrid
2. Adding SPF/DKIM records
3. Using a custom domain for sender email
4. Monitoring email delivery rates

## Support

### SendGrid Resources
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [API Reference](https://docs.sendgrid.com/api-reference/)
- [Best Practices](https://docs.sendgrid.com/for-developers/sending-email/best-practices)

### Application Support
- Check browser console for error messages
- Verify SendGrid dashboard for delivery status
- Test with different email addresses
- Check spam folders for delivered emails

---

**Note**: The email service will automatically fall back to demo mode if SendGrid is not properly configured, ensuring the application continues to function while providing clear feedback about the email service status.
