# Todo App

An offline-first React Native todo application with Firebase backend integration, supporting both iOS and Android platforms.

## 📥 Download

**[Download Latest Release APK](https://drive.google.com/file/d/1jQbIAFiH-UFifS_B9ZWETs0YcWz8XFFS/view?usp=sharing)** - Install directly on your Android device

## Features

- ✅ **Offline-First Architecture**: Works seamlessly without internet connection using Realm database
- 🔄 **Automatic Sync**: Background synchronization with Firebase Firestore when online
- 🔐 **Firebase Authentication**: Secure user authentication
- 📱 **Push Notifications**: Firebase Cloud Messaging integration with Notifee
- 🎨 **Theme Support**: Light and dark mode with custom theming
- 📊 **Redux State Management**: Centralized state management with Redux Toolkit
- 🔔 **Network Status Indicator**: Real-time network connectivity monitoring

## Tech Stack

- **Framework**: React Native 0.82.1
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 7.x
- **Local Database**: Realm
- **Backend**: Firebase (Auth, Firestore, Messaging)
- **Notifications**: Notifee + Firebase Cloud Messaging
- **UI Components**: Custom themed components with Linear Gradient support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd todo
```

2. Install dependencies:

```bash
npm install
```

3. Install iOS pods:

```bash
cd ios
pod install
cd ..
```

4. **Android Configuration:**

   **Configure Android SDK Path:**

   The `android/local.properties` file contains the path to your Android SDK. You have two options:

   - **Option 1 (Recommended)**: If you have Android SDK configured globally, delete the `local.properties` file:

     ```bash
     rm android/local.properties
     ```

   - **Option 2**: Update the SDK path in `android/local.properties` to match your local setup:
     ```properties
     sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
     ```

   **Install NDK (Side by Side):**

   React Native requires NDK for native code compilation. Install it via Android Studio:

   1. Open Android Studio
   2. Go to **Settings/Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
   3. Click on the **SDK Tools** tab
   4. Check **NDK (Side by side)**
   5. Click **Apply** to install

   **Recommended Android Build Versions:**

   This project uses the following Android SDK versions (configured in `android/build.gradle`):

   ```gradle
   buildToolsVersion = "36.0.0"
   minSdkVersion = 24
   compileSdkVersion = 36
   targetSdkVersion = 36
   ndkVersion = "27.1.12297006"
   ```

5. Set up environment files:
   Create the following files in the root directory:

- `.env.development`
- `.env.staging`
- `.env.production`

## Running the App

### Development

**Android:**

```bash
npm run android:dev
```

**iOS:**

```bash
npm run ios:dev
```

### Staging

**Android:**

```bash
npm run android:staging
```

**iOS:**

```bash
npm run ios:staging
```

### Production

**Android:**

```bash
npm run android:prod
```

**iOS:**

```bash
npm run ios:prod
```

### Metro Bundler

Start the Metro bundler separately:

```bash
npm start
# or for specific environment
npm run start:dev
npm run start:staging
npm run start:prod
```

## Building Release APK

To build a release APK for Android:

```bash
cd android
./gradlew assembleRelease
cd ..
```

The generated APK will be available at:
`android/app/build/outputs/apk/release/app-release.apk`

You can install it directly on your Android device or distribute it for testing.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── atoms/       # Basic building blocks
│   ├── molecules/   # Composite components
│   └── organisms/   # Complex components
├── features/        # Feature-based modules
│   ├── auth/        # Authentication
│   ├── notifications/ # Push notifications
│   ├── settings/    # App settings
│   └── tasks/       # Task management
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── services/        # External services
│   ├── database/    # Realm database
│   ├── firebase/    # Firebase integration
│   ├── notifications/ # Notification handling
│   └── sync/        # Sync logic
├── store/           # Redux store
│   └── slices/      # Redux slices
├── theme/           # Theme configuration
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add iOS and Android apps to your Firebase project
3. Download configuration files:
   - `google-services.json` for Android → Place in `android/app/`
   - `GoogleService-Info.plist` for iOS → Place in `ios/todo/`
4. Enable Authentication and Firestore in Firebase Console
5. Set up Firebase Cloud Messaging for push notifications

## Environment Variables

Configure the following variables in your `.env` files:

```
# Add your environment-specific variables here
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
# ... other Firebase config
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.

## Support

For issues and questions, please create an issue in the repository.
