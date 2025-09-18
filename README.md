# Moroccan Court Kings

A complete React application for managing basketball tournaments with authentication, role-based permissions, and Firebase integration.

## Features

### 🔐 Authentication & Authorization
- **Username/Password Authentication**: Secure login system
- **Role-Based Access Control**: Admin and Comando roles with different permissions
- **Admin-Only User Creation**: Only administrators can create new accounts
- **Protected Routes**: Automatic redirection based on authentication status

### 🏀 Tournament Management
- **Team Management**: Create, edit, and manage teams with player rosters
- **Game Scheduling**: Schedule games with venue, date/time, and status tracking
- **Tournament Creation**: Full tournament management with team selection (Admin only)
- **Live Score Updates**: Update game scores and status in real-time
- **User Management**: Admin interface for creating and managing user accounts

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop and mobile devices
- **Basketball Theme**: Sports-themed design with smooth animations
- **Role-Based Navigation**: Dynamic menu based on user permissions
- **Interactive Dashboards**: Personalized dashboard with quick actions
- **Modal Forms**: Elegant popup forms for data entry

## User Roles & Permissions

### 👑 Admin
- ✅ Full access to all features
- ✅ Manage teams, games, and tournaments
- ✅ Create and manage user accounts
- ✅ Delete any content
- ✅ Access to all admin-only features

### ⚡ Comando
- ✅ Create and edit teams
- ✅ Create and edit games
- ❌ Cannot delete games
- ❌ Cannot manage tournaments
- ❌ Cannot create user accounts

## Technologies Used

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Firebase Firestore** - NoSQL database for data storage
- **React Router** - Client-side routing with protected routes
- **Bcrypt.js** - Password hashing for security
- **CSS3** - Custom properties and modern styling
- **Inter Font** - Professional typography

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Firebase account (free tier sufficient)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd moroccan-court-kings
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Follow the detailed [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Update `src/firebase/config.ts` with your Firebase configuration

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app

## Firebase Setup

This app requires Firebase configuration. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions including:

- Creating a Firebase project
- Setting up Firestore database
- Configuring authentication
- Creating the first admin user
- Database schema and security rules

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header/         # Navigation with user menu
│   ├── Footer/         # App footer
│   ├── ProtectedRoute/ # Route protection wrapper
│   └── AccessDenied/   # Access denied page
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # Business logic
│   ├── authService.ts  # Authentication service
│   └── firebaseService.ts # Database operations
├── pages/              # Page components
│   ├── Login/          # Login page
│   ├── Dashboard/      # Role-based dashboard
│   ├── Teams/          # Teams CRUD
│   ├── Games/          # Games CRUD
│   ├── Tournament/     # Tournament management
│   ├── Schedule/       # Games schedule view
│   └── Users/          # User management (Admin only)
├── types/              # TypeScript definitions
├── firebase/           # Firebase configuration
├── App.tsx             # Main app with routing
└── index.tsx           # App entry point
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Database Schema

### Collections

- **users**: User accounts with roles and hashed passwords
- **teams**: Team information with player rosters
- **games**: Game schedules with scores and status
- **tournaments**: Tournament information with participating teams

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed schema documentation.

## Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **Role-Based Access**: Server-side and client-side permission checks
- **Protected Routes**: Authentication required for all admin functions
- **Input Validation**: Form validation and sanitization
- **Firestore Rules**: Database-level security (configure as needed)

## Development Workflow

1. **Authentication Flow**:
   - Users must log in with username/password
   - Role-based redirection to appropriate dashboard
   - Persistent login sessions

2. **Data Management**:
   - Real-time updates with Firestore
   - Optimistic UI updates
   - Error handling and user feedback

3. **Permission Checking**:
   - Client-side permission guards
   - Dynamic UI based on user role
   - Access denial for unauthorized actions

## Deployment

For production deployment:

1. Build the app: `npm run build`
2. Configure Firebase hosting or your preferred hosting service
3. Set up environment variables for Firebase config
4. Configure Firestore security rules for production
5. Set up proper backup and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Login Issues**: Check Firebase configuration and user creation
2. **Permission Errors**: Verify Firestore security rules
3. **Build Issues**: Ensure all dependencies are installed

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed troubleshooting.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
1. Check the troubleshooting section
2. Review Firebase setup documentation
3. Create an issue in the repository
