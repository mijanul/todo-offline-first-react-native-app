# 🚀 Getting Started Checklist

Use this checklist to get your Todo App up and running!

## ☑️ Pre-Flight Checklist

### 1. Firebase Setup

- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Enable Authentication → Email/Password method
- [ ] Create Firestore Database (Start in test mode)
- [ ] Enable Firebase Cloud Messaging
- [ ] Download `google-services.json` for Android
- [ ] Copy `google-services.json` to `android/app/`

### 2. Environment Configuration

- [ ] Open `.env.development`
- [ ] Replace placeholder values with your Firebase config:
  - [ ] FIREBASE_API_KEY
  - [ ] FIREBASE_AUTH_DOMAIN
  - [ ] FIREBASE_PROJECT_ID
  - [ ] FIREBASE_STORAGE_BUCKET
  - [ ] FIREBASE_MESSAGING_SENDER_ID
  - [ ] FIREBASE_APP_ID

### 3. Dependencies

- [ ] Run `npm install` (already done if you followed setup)
- [ ] Verify all packages installed successfully
- [ ] Check for any peer dependency warnings

### 4. Android Setup

- [ ] Ensure Android Studio is installed
- [ ] Ensure Android SDK is set up
- [ ] Ensure at least one emulator is created OR physical device connected
- [ ] Run `cd android && ./gradlew clean && cd ..`

### 5. Build & Run

- [ ] Open a terminal in project root
- [ ] Run `npm run android:dev`
- [ ] Wait for Metro bundler to start
- [ ] Wait for app to install on device/emulator
- [ ] App should launch automatically

## ☑️ First-Time Testing

### Test Authentication

- [ ] App opens to Login screen
- [ ] Click "Sign Up"
- [ ] Enter test email (e.g., test@example.com)
- [ ] Enter password (min 6 characters)
- [ ] Click "Sign Up" button
- [ ] Should see Task List screen (empty)

### Test Task Creation

- [ ] Click "+ Add Task" button
- [ ] Enter task title
- [ ] Enter task description
- [ ] Click "Create" button
- [ ] Task appears in list

### Test Task Operations

- [ ] Click on a task to view details
- [ ] Click "Edit" to modify task
- [ ] Update title or description
- [ ] Click "Update"
- [ ] Click checkbox to mark complete
- [ ] Click task again → Click "Delete"
- [ ] Confirm deletion

### Test Filtering

- [ ] Create multiple tasks
- [ ] Mark some as complete
- [ ] Click "Active" filter - see only incomplete
- [ ] Click "Completed" filter - see only complete
- [ ] Click "All" filter - see everything

### Test Offline Mode

- [ ] Create a task
- [ ] Turn off WiFi/Mobile data
- [ ] Create another task (should work)
- [ ] Notice orange sync indicator on new task
- [ ] Turn WiFi back on
- [ ] Pull down to refresh
- [ ] Sync indicator should disappear

### Test Session Persistence

- [ ] Close the app completely
- [ ] Reopen the app
- [ ] Should automatically log in
- [ ] All tasks should be visible

## ☑️ Optional Enhancements

### Add Theme Toggle

You can add this to TaskListScreen header:

```tsx
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

// In TaskListScreen component:
const { toggleTheme, isDark } = useTheme();

// Add to header:
<TouchableOpacity onPress={toggleTheme}>
  <Text>{isDark ? '☀️' : '🌙'}</Text>
</TouchableOpacity>;
```

### Add Logout Button

Add to TaskListScreen:

```tsx
import { firebaseService } from '../../../services/firebase/firebaseService';
import { useAppDispatch } from '../../../store/hooks';
import { clearAuth } from '../../../store/slices/authSlice';

const handleLogout = async () => {
  await firebaseService.signOut();
  dispatch(clearAuth());
};

<Button title="Logout" onPress={handleLogout} variant="secondary" />;
```

## ☑️ Troubleshooting

If something doesn't work, check these:

### App Won't Build

- [ ] Run `cd android && ./gradlew clean && cd ..`
- [ ] Delete `node_modules` and run `npm install`
- [ ] Check `google-services.json` is in correct location
- [ ] Verify Android SDK is properly installed

### Firebase Errors

- [ ] Verify Firebase project has Auth and Firestore enabled
- [ ] Check `google-services.json` matches your Firebase project
- [ ] Verify `.env.development` has correct values
- [ ] Check internet connection

### Metro Bundler Issues

- [ ] Run `npm start -- --reset-cache`
- [ ] Close all Metro windows and restart
- [ ] Check port 8081 is not in use

### App Crashes

- [ ] Check Android Studio Logcat for errors
- [ ] Run `adb logcat | grep ReactNative`
- [ ] Uninstall app and reinstall
- [ ] Clear app data from device settings

## ☑️ Production Checklist

Before deploying to users:

### Security

- [ ] Replace development Firebase with production
- [ ] Set up Firestore security rules
- [ ] Generate release keystore for Android
- [ ] Update `android/app/build.gradle` with release signing config
- [ ] Enable ProGuard/R8 for code obfuscation
- [ ] Remove console.log statements

### Testing

- [ ] Test on multiple Android devices
- [ ] Test different Android versions
- [ ] Test with slow/no internet
- [ ] Test with airplane mode
- [ ] Full QA testing

### App Store

- [ ] Update app version in `android/app/build.gradle`
- [ ] Update version in `package.json`
- [ ] Generate release build: `cd android && ./gradlew assembleRelease`
- [ ] Test release APK thoroughly
- [ ] Prepare store listing (screenshots, description)
- [ ] Submit to Google Play Store

## ☑️ Documentation

- [ ] Read `IMPLEMENTATION_SUMMARY.md` for full overview
- [ ] Read `README_NEW.md` for detailed documentation
- [ ] Read `SETUP_GUIDE.md` for quick setup
- [ ] Review code comments in `src/` directory

## 🎉 You're Ready!

Once all checkboxes are checked, you have a fully functional, production-ready task management app!

---

**Questions or Issues?**

- Check the documentation files
- Review implementation in `src/` directory
- Firebase Console: https://console.firebase.google.com/
- React Native Docs: https://reactnative.dev/

**Happy Building! 🚀**
