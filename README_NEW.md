# Todo App - Cross-Platform Task Management

A production-ready React Native task management application with offline support, Firebase authentication, push notifications, and modern architecture.

## Features

- ✅ **Authentication** - Firebase email/password authentication with session persistence
- 📝 **Task Management** - Create, edit, delete, and mark tasks as complete
- 🔄 **Offline Support** - Realm local database with automatic sync to Firestore
- 🔔 **Push Notifications** - Local reminders and FCM server push notifications
- 🌓 **Dark/Light Mode** - System-based and manual theme switching
- 🏗️ **Modular Architecture** - Atomic design pattern with scalable folder structure
- ⚡ **Performance Optimized** - FlatList optimizations and lazy loading
- 🌍 **Multi-Environment** - Support for dev, staging, and production

## Tech Stack

- **React Native 0.82**
- **TypeScript**
- **Redux Toolkit** - State management
- **React Navigation** - Navigation with Auth & App stacks
- **Firebase** - Authentication, Firestore, Cloud Messaging
- **Realm** - Local database for offline support
- **Notifee** - Local push notifications
- **React Native Config** - Environment configuration

## Project Structure

```
src/
├── components/          # Atomic design components
│   ├── atoms/          # Basic building blocks (Button, Input, Checkbox)
│   ├── molecules/      # Combinations of atoms (TaskItem)
│   └── organisms/      # Complex components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication screens
│   └── tasks/         # Task management screens
├── navigation/         # Navigation structure
│   ├── AuthNavigator.tsx
│   ├── AppNavigator.tsx
│   └── RootNavigator.tsx
├── services/          # Business logic & external services
│   ├── firebase/     # Firebase services
│   ├── database/     # Realm database
│   ├── notifications/ # Notification services
│   └── sync/         # Offline sync logic
├── store/            # Redux store
│   ├── slices/      # Redux slices (auth, tasks, theme)
│   └── hooks.ts     # Typed Redux hooks
├── theme/           # Theme configuration
├── config/          # App configuration
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Prerequisites

- Node.js >= 20
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- Firebase project setup

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Firebase Cloud Messaging

#### For Android:

1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/google-services.json`

#### For iOS:

1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to the iOS project in Xcode

### 3. Environment Configuration

Update the environment files with your Firebase credentials:

- `.env.development`
- `.env.staging`
- `.env.production`

Example:

```env
ENV=development
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 4. Android Setup

```bash
# Install pods for iOS linking
cd android
./gradlew clean
cd ..

# Run on Android
npm run android
```

### 5. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..

# Run on iOS
npm run ios
```

## Running the App

### Development Environment

```bash
# Android
npm run android:dev

# iOS
npm run ios:dev

# Metro bundler
npm run start:dev
```

### Staging Environment

```bash
npm run android:staging
npm run ios:staging
npm run start:staging
```

### Production Environment

```bash
npm run android:prod
npm run ios:prod
npm run start:prod
```

## Available Scripts

- `npm run android` - Run Android app (default environment)
- `npm run ios` - Run iOS app (default environment)
- `npm run start` - Start Metro bundler
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Key Features Implementation

### Authentication

- Firebase email/password authentication
- Session persistence using Redux
- Protected routes using navigation state

### Task Management

- CRUD operations for tasks
- Mark tasks as complete/incomplete
- Task filtering (all, active, completed)
- Optimized FlatList rendering

### Offline Support

- Realm database for local storage
- Automatic sync when online
- Conflict resolution with timestamp-based merge
- Sync indicator on tasks

### Push Notifications

- Local notifications for task reminders
- Firebase Cloud Messaging for server push
- Scheduled notifications using Notifee
- Android notification channels

### Theme System

- Light and dark mode support
- System-based theme detection
- Manual theme toggle
- Consistent theming across all screens

## Performance Optimizations

- **FlatList Optimizations**

  - `maxToRenderPerBatch={10}`
  - `windowSize={10}`
  - `removeClippedSubviews={true}`
  - `initialNumToRender={10}`

- **Lazy Loading**

  - React Navigation screen lazy loading
  - Code splitting where applicable

- **State Management**
  - Redux Toolkit for efficient state updates
  - Memoized selectors
  - Normalized state structure

## Troubleshooting

### Metro Bundler Issues

```bash
npm start -- --reset-cache
```

### Android Build Issues

```bash
cd android && ./gradlew clean && cd ..
```

### iOS Build Issues

```bash
cd ios && pod install && cd ..
```

### Firebase Connection Issues

- Verify `google-services.json` is in the correct location
- Check Firebase project configuration
- Ensure all required Firebase services are enabled

## Security Notes

⚠️ **Important**: The current `google-services.json` is a placeholder. Replace it with your actual Firebase configuration file before building for production.

## Next Steps

1. Replace placeholder Firebase credentials
2. Set up proper keystore for Android release builds
3. Configure iOS signing certificates
4. Set up CI/CD pipeline
5. Add analytics (Firebase Analytics)
6. Add crash reporting (Firebase Crashlytics)
7. Implement proper error boundaries
8. Add unit and integration tests

## License

Private - All rights reserved

## Contributing

This is a personal project. For any questions or suggestions, please contact the project owner.
