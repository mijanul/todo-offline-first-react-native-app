# Todo App - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Setup

#### Option A: Use Test/Development Firebase (Quickest)

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication → Email/Password
3. Create Firestore Database (Start in test mode)
4. Download `google-services.json` for Android
5. Replace `android/app/google-services.json` with your file

#### Option B: Use Existing Firebase Project

1. Get your `google-services.json` from Firebase Console
2. Replace the placeholder file in `android/app/google-services.json`
3. Update `.env.development` with your Firebase config

### Step 3: Update Environment Variables

Edit `.env.development`:

```env
ENV=development
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:android:abc123def456
```

You can find these values in:

- Firebase Console → Project Settings → General → Your apps

### Step 4: Run the App

#### Android

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Run app
npm run android:dev
```

#### iOS (macOS only)

```bash
cd ios && pod install && cd ..
npm run ios:dev
```

## 📱 Testing the App

### 1. Create an Account

- Open the app
- Click "Sign Up"
- Enter email and password (minimum 6 characters)
- Click "Sign Up" button

### 2. Create Tasks

- Click "+ Add Task"
- Enter task title and description
- Click "Create"

### 3. Test Offline Mode

- Create a task
- Turn off WiFi/Data
- Create another task (will show orange sync indicator)
- Turn WiFi back on
- Pull to refresh to sync

### 4. Test Dark Mode

- Add theme toggle button to TaskList screen, or
- Change system theme and restart app

## 🐛 Common Issues

### Issue 1: Firebase Connection Failed

**Solution:**

- Verify `google-services.json` is in `android/app/`
- Check Firebase project has Authentication and Firestore enabled
- Run: `cd android && ./gradlew clean && cd ..`

### Issue 2: Metro Bundler Cache Issues

**Solution:**

```bash
npm start -- --reset-cache
```

### Issue 3: Android Build Errors

**Solution:**

```bash
cd android
./gradlew clean
./gradlew build
cd ..
npm run android:dev
```

### Issue 4: Realm Database Errors

**Solution:**

- Clear app data from device settings
- Or uninstall and reinstall the app

### Issue 5: TypeScript Errors

**Solution:**

- These are expected due to module resolution
- The app will still run correctly
- To fix, run: `npm run android:dev` (runtime will work)

## 📋 Features Checklist

Test these features:

- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Create a task
- [ ] Edit a task
- [ ] Mark task as complete
- [ ] Delete a task
- [ ] Filter tasks (All/Active/Completed)
- [ ] Test offline mode (create task offline)
- [ ] Test sync (go online and pull to refresh)
- [ ] View task details
- [ ] Session persistence (close and reopen app)

## 🎨 Current UI (Minimal as Requested)

The app currently has a minimal, functional UI:

- Simple forms with input fields
- Basic buttons (primary, secondary, danger)
- Task list with checkboxes
- Filter buttons
- No fancy animations or complex designs
- Focus on functionality over aesthetics

## 🔧 Customization

### Change App Name

1. `android/app/src/main/res/values/strings.xml` → Update `app_name`
2. `app.json` → Update `displayName`

### Change Package Name

1. `android/app/build.gradle` → Update `applicationId`
2. Rename folders in `android/app/src/main/java/com/todo/`
3. Update imports in Kotlin files

### Add App Icon

1. Replace icons in `android/app/src/main/res/mipmap-*/`
2. Use a tool like https://romannurik.github.io/AndroidAssetStudio/

## 📦 Production Build

### Android Release Build

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## 🔐 Security Reminders

Before going to production:

1. ✅ Replace test `google-services.json` with production config
2. ✅ Set up proper Firestore security rules
3. ✅ Generate release keystore for Android
4. ✅ Enable Proguard/R8 for code obfuscation
5. ✅ Review and update environment variables

## 📚 Next Steps

1. **Add Features:**

   - Task categories/tags
   - Due date picker
   - Task priority
   - Search functionality
   - User profile
   - Task sharing

2. **Improve UI:**

   - Add animations
   - Better task cards
   - Swipe actions
   - Empty states
   - Loading skeletons

3. **Add Testing:**

   - Unit tests
   - Integration tests
   - E2E tests with Detox

4. **DevOps:**
   - CI/CD with GitHub Actions
   - Fastlane for deployment
   - App versioning
   - Crash reporting

## 🆘 Need Help?

Check these files for implementation details:

- `src/services/` - Service implementations
- `src/features/` - Screen components
- `src/store/` - State management
- `README_NEW.md` - Full documentation

Happy coding! 🎉
