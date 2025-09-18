# Firebase Setup Guide

This guide will help you set up Firebase for the Basketball Tournament App.

## Prerequisites

1. A Google account
2. Firebase project (free tier is sufficient for development)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "basketball-tournament")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. **Note**: This app uses custom authentication (username/password), not Firebase Auth directly

## Step 3: Set up Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon in top left)
2. In the "General" tab, scroll down to "Your apps"
3. Click the web icon (</>) to add a web app
4. Enter app nickname (e.g., "Basketball Tournament Web")
5. Click "Register app"
6. Copy the Firebase configuration object

## Step 5: Update Configuration in Code

1. Open `src/firebase/config.ts`
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 6: Set up Firestore Security Rules (Optional)

For development, you can use basic rules. In production, implement proper security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    // WARNING: This is for development only
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Step 7: Create Initial Admin User

Since the app doesn't allow self-registration, you'll need to create the first admin user manually:

1. Use Firebase Console to add a document to the `users` collection
2. Use the following structure:

```json
{
  "username": "admin",
  "passwordHash": "$2a$12$hash-generated-by-bcrypt",
  "role": "admin"
}
```

**To generate password hash:**
1. Use an online bcrypt generator or Node.js script
2. Hash your desired password with salt rounds = 12
3. Use the generated hash as the `passwordHash` value

Alternatively, you can temporarily modify the code to create the first user programmatically.

## Database Collections Structure

The app uses the following Firestore collections:

### `users`
```javascript
{
  username: string,
  passwordHash: string,
  role: "admin" | "comando"
}
```

### `teams`
```javascript
{
  name: string,
  city: string,
  players: [
    {
      id: string,
      name: string,
      number: number,
      position?: string
    }
  ],
  createdAt: timestamp,
  createdBy: string
}
```

### `games`
```javascript
{
  teamA: string, // team ID
  teamB: string, // team ID
  scoreA: number,
  scoreB: number,
  date: timestamp,
  status: "scheduled" | "live" | "completed" | "cancelled",
  venue?: string,
  createdAt: timestamp,
  createdBy: string,
  updatedAt?: timestamp,
  updatedBy?: string
}
```

### `tournaments`
```javascript
{
  name: string,
  location: string,
  startDate: timestamp,
  endDate: timestamp,
  teams: [string], // array of team IDs
  status: "upcoming" | "active" | "completed",
  description?: string,
  createdAt: timestamp,
  createdBy: string
}
```

## Environment Variables (Recommended)

For security, store Firebase config in environment variables:

1. Create `.env` file in project root
2. Add Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

3. Update `src/firebase/config.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Troubleshooting

### Common Issues:

1. **"Firebase app not initialized"**
   - Make sure Firebase config is correctly set in `src/firebase/config.ts`
   
2. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure you're using test mode for development
   
3. **"User not found" on login**
   - Make sure you've created at least one user in the `users` collection
   - Verify the username and password hash are correct

### Development Tips:

1. Use Firebase Console to view and edit data during development
2. Check browser console for detailed error messages
3. Enable Firebase debug logging if needed

## Next Steps

Once Firebase is set up:
1. Create your first admin user
2. Start the development server: `npm start`
3. Login with your admin credentials
4. Begin creating teams, games, and tournaments!
