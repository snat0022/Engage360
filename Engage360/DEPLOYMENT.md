# Engage360 Deployment Guide

## Firebase Hosting Deployment (Current Method)

### ✅ Successfully Deployed
- **Live URL**: https://week7-shreyas.web.app
- **Project**: week7-shreyas
- **Status**: ✅ Live and Operational

### Important Note About Environment Variables in Firebase Hosting

**Firebase Hosting does NOT support environment variables for client-side applications.** All environment variables must be set at **build time** using a `.env` file.

### Configure SendGrid Email Service

**Option 1: Build-time Configuration (Recommended for Firebase Hosting)**

1. Create a `.env` file in the project root:
   ```bash
   # In the Engage360 directory
   cd c:\Users\shrey\Engage360\Engage360
   ```

2. Create `.env` file with your SendGrid API key:
   ```env
   VITE_SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
   ```

3. Get your SendGrid API key:
   - Go to https://app.sendgrid.com/
   - Log in to your SendGrid account
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Choose "Restricted Access" and give it "Mail Send" permissions
   - Copy the API key (it starts with `SG.`)

4. Verify sender email in SendGrid:
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Add `noreply@engage360.com` as the sender email
   - Verify the email address through the confirmation email

5. Build and deploy:
   ```bash
   # Build with the new API key
   npm run build
   
   # Deploy to Firebase
   firebase deploy --only hosting
   ```

**Option 2: Cloud Functions (Alternative Approach)**

If you need runtime environment variables, use Firebase Cloud Functions:

1. Set environment variables in Functions:
   ```bash
   firebase functions:config:set sendgrid.api_key="YOUR_API_KEY"
   ```

2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

3. Call the function from your client app instead of direct SendGrid calls.

### Security Best Practices

⚠️ **IMPORTANT**: Never commit `.env` files to Git!

1. Ensure `.env` is in `.gitignore`
2. Add `.env` to `.gitignore` if not already present
3. Never share your API keys publicly
4. Use restricted API keys with minimal permissions
5. Rotate API keys regularly

### Current Deployment Status

- ✅ Frontend hosted on Firebase Hosting
- ✅ Firestore rules deployed
- ✅ Database configured
- ⚠️ SendGrid email service in demo mode (needs configuration)
- ⚠️ Environment variables need to be configured for production

### Deploy with SendGrid Configuration

1. **Add SendGrid API key to `.env` file**
2. **Build the application**: `npm run build`
3. **Deploy to Firebase**: `firebase deploy --only hosting`
4. **Test email functionality** on the live site

## Cloudflare Pages Deployment (Alternative Option)

### Prerequisites
1. Cloudflare account
2. GitHub repository with your code
3. Firebase project setup
4. SendGrid account

### Step 1: Prepare Your Repository

1. Ensure all files are committed to your GitHub repository
2. Make sure the `dist` folder is in `.gitignore` (it will be generated during build)

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the Firebase configuration object

### Step 3: SendGrid Setup

1. Go to [SendGrid Console](https://app.sendgrid.com/)
2. Create an API key:
   - Go to Settings > API Keys
   - Create API Key with "Full Access" permissions
   - Copy the API key

### Step 4: Cloudflare Pages Deployment

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: Vue
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `Engage360` (if your project is in a subfolder)

### Step 5: Environment Variables

In Cloudflare Pages dashboard, go to Settings > Environment variables and add:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
```

### Step 6: Deploy

1. Click "Save and Deploy"
2. Wait for the build to complete
3. Your application will be available at `https://your-project-name.pages.dev`

### Step 7: Custom Domain (Optional)

1. In Cloudflare Pages, go to Custom domains
2. Add your custom domain
3. Update DNS records as instructed

## Local Development

### Prerequisites
- Node.js 20.19.0 or higher
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the Engage360 directory:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your actual API keys

5. Start development server:
   ```bash
   npm run dev
   ```

## Features Implemented

### ✅ BR (D.1): External Authentication
- Firebase Authentication with Google OAuth
- Email/Password authentication
- Role-based access control
- Secure session management

### ✅ BR (D.2): Email Functionality
- SendGrid integration
- Email composition with attachments
- File upload validation
- Email templates

### ✅ BR (D.3): Interactive Table Data
- Advanced table component with sorting, searching, pagination
- Two interactive tables implemented:
  - Admin Dashboard (User Management)
  - Program Ratings (Ratings Management)
- 10 rows per page default with customizable options

### ✅ BR (D.4): Cloud Deployment
- Cloudflare Pages deployment ready
- Production build configuration
- Environment variable management
- Responsive design

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check that all environment variables are set
- Verify Firebase configuration is correct

### Authentication Issues
- Check Firebase project settings
- Verify Google OAuth is enabled
- Ensure domain is authorized in Firebase

### Email Issues
- Verify SendGrid API key is correct
- Check sender email is verified in SendGrid
- Ensure file attachments are within size limits

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all services (Firebase, SendGrid) are properly configured
