# SendGrid Setup - Quick Start Guide

## Your Application is LIVE! ðŸŽ‰
**URL**: https://week7-shreyas.web.app

## Configure SendGrid Email Service (5 Minutes)

### Step 1: Create SendGrid Account
1. Go to https://app.sendgrid.com/
2. Sign up for a **free account** (100 emails/day)
3. Verify your email address

### Step 2: Get Your API Key
1. In SendGrid dashboard, click **Settings** â†’ **API Keys**
2. Click **"Create API Key"**
3. Name it: Engage360-Production
4. Choose **"Restricted Access"**
5. Check the **"Mail Send"** permission
6. Click **"Create & View"**
7. **Copy the API key** (it starts with SG.)

### Step 3: Verify Sender Email
1. In SendGrid, go to **Settings** â†’ **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Enter email: 
oreply@engage360.com
4. Fill in the form:
   - Name: Engage360
   - Organization: Engage360
   - Address: Your address
   - City: Your city
   - State: Your state
   - Zip: Your zip
   - Country: Your country
5. Check your email and click the verification link

### Step 4: Add API Key to Your Project

**Windows PowerShell:**
```powershell
cd "c:\Users\shrey\Engage360\Engage360"
notepad .env
```

**Add this line (replace with your actual API key):**
`
VITE_SENDGRID_API_KEY=SG.your_actual_api_key_here
`

**Save the file** (Ctrl+S) and close Notepad.

### Step 5: Rebuild and Redeploy

```powershell
# Build with the new API key
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Step 6: Test Email Functionality
1. Go to https://week7-shreyas.web.app
2. Log in as admin
3. Book an appointment
4. As admin, confirm the appointment
5. Check if email is sent (check your email inbox)

## âœ… Done!
Your application now has fully functional email notifications!

## Need Help?

### Email Not Working?
- Check browser console for error messages
- Verify API key is correct in .env file
- Check SendGrid dashboard for email activity
- Verify sender email is verified in SendGrid

### Security Notes
- âš ï¸ **Never commit** .env file to Git (already added to .gitignore)
- âœ… API key is embedded at build time (not exposed in source code)
- âœ… Restricted API key permissions reduce security risk

## What Emails Are Sent?

1. **Appointment Confirmation**: When admin confirms a booking
2. **Appointment Rejection**: When admin rejects a booking
3. **Booking Submission**: When user creates a new booking
4. **Bulk Notifications**: When admin sends bulk emails

## Current Status
- âœ… Application deployed: https://week7-shreyas.web.app
- âœ… Firestore rules deployed
- âœ… All features working
- âš ï¸ SendGrid: Demo mode (configure above to enable)
