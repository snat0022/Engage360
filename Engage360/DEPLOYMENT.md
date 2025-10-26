# Engage360 Deployment Guide

## Cloudflare Pages Deployment

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
