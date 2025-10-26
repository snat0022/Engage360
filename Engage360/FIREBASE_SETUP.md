# Firebase Setup Instructions

To fix the Firebase authentication error, you need to set up a real Firebase project. Follow these steps:

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `engage360` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider:
   - Click on Email/Password
   - Toggle "Enable" to ON
   - Click "Save"
5. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable" to ON
   - Add your project support email
   - Click "Save"

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register your app with a nickname (e.g., "Engage360 Web")
5. Copy the Firebase configuration object

## Step 4: Configure Your App

1. Create a `.env` file in your Engage360 directory:
   ```bash
   # Copy env.example to .env
   cp env.example .env
   ```

2. Update `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Replace the placeholder values in `src/firebase/config.js` with your actual Firebase config

## Step 5: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with:
   - Email/Password authentication
   - Google OAuth (if configured)

## Step 6: Add Authorized Domains (for Google OAuth)

1. In Firebase Console, go to **Authentication** > **Settings**
2. Add your domains to **Authorized domains**:
   - `localhost` (for development)
   - Your production domain (when deployed)

## Troubleshooting

- **API Key Error**: Make sure you're using the correct API key from Firebase Console
- **Domain Not Authorized**: Add your domain to authorized domains in Firebase
- **Google OAuth Issues**: Ensure Google provider is enabled and configured properly

## Example Firebase Config

Your Firebase config should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ",
  authDomain: "engage360-12345.firebaseapp.com",
  projectId: "engage360-12345",
  storageBucket: "engage360-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
}
```

Replace the placeholder values with your actual Firebase project configuration.