# Offline Detection - Quick Reference

## 🔌 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                         APP STARTUP                          │
├─────────────────────────────────────────────────────────────┤
│  1. Redux Store initialized with networkSlice               │
│  2. NetworkProvider wraps app and starts monitoring         │
│  3. NetInfo listens for connectivity changes                │
│  4. OfflineBanner renders but hidden initially              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK CHANGE DETECTED                   │
├─────────────────────────────────────────────────────────────┤
│  NetInfo detects connection change                          │
│           │                                                  │
│           ▼                                                  │
│  NetworkProvider dispatches setNetworkState()               │
│           │                                                  │
│           ▼                                                  │
│  Redux store updated with new network state                 │
│           │                                                  │
│           ▼                                                  │
│  Components using useAppSelector re-render                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌──────────────┐           ┌──────────────┐
        │   OFFLINE    │           │    ONLINE    │
        └──────────────┘           └──────────────┘
                │                           │
                ▼                           ▼
   ┌──────────────────────┐    ┌──────────────────────┐
   │ Banner slides DOWN   │    │ Banner slides UP     │
   │ Login: DISABLED      │    │ Login: ENABLED       │
   │ SignUp: DISABLED     │    │ SignUp: ENABLED      │
   │ Logout: DISABLED     │    │ Logout: ENABLED      │
   │ + Warning message    │    │ No warnings          │
   └──────────────────────┘    └──────────────────────┘
```

## 📱 User Experience Flow

### Scenario 1: User Goes Offline While on Login Screen

```
1. User on Login screen with WiFi ON
   └─> Login button: ENABLED ✅

2. User turns WiFi OFF
   └─> NetInfo detects change → Redux updated
       └─> OfflineBanner appears (animated) 🔴
       └─> Login button: DISABLED ⛔

3. User tries to click Login
   └─> Alert shows: "No Internet Connection" 🚫

4. User turns WiFi ON
   └─> NetInfo detects change → Redux updated
       └─> OfflineBanner disappears (animated) ✅
       └─> Login button: ENABLED ✅
```

### Scenario 2: User Goes Offline While Logged In

```
1. User viewing tasks with WiFi ON
   └─> Everything works normally ✅

2. User turns WiFi OFF
   └─> NetInfo detects change → Redux updated
       └─> OfflineBanner appears 🔴
       └─> Tasks still visible and editable ✅
       └─> New tasks saved locally 💾

3. User goes to Settings
   └─> Logout button: DISABLED ⛔
   └─> Warning: "Logout requires internet connection" ⚠️

4. User creates/edits tasks
   └─> Changes saved to Realm database ✅
   └─> Sync indicator shows pending sync 🔄

5. User turns WiFi ON
   └─> NetInfo detects change → Redux updated
       └─> OfflineBanner disappears ✅
       └─> Auto-sync starts 🔄
       └─> Tasks synced to Firebase ☁️
```

## 🎨 Visual Components

### Offline Banner

```
┌─────────────────────────────────────────────────┐
│ 📡  No Internet Connection                      │
│     Some features may be unavailable            │
└─────────────────────────────────────────────────┘
```

- **Background**: Red (#FF3B30)
- **Position**: Sticky top
- **Animation**: Spring (smooth physics-based)

### Login Screen (Offline)

```
┌─────────────────────────────────────────────────┐
│               Welcome Back                       │
│   Sign in to continue managing your tasks       │
├─────────────────────────────────────────────────┤
│  Email: [____________________________]          │
│  Password: [____________________________]       │
│                                                  │
│  ┌──────────────────────────────────────┐      │
│  │     Sign In (DISABLED - GRAYED)      │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

### Settings Screen (Offline)

```
┌─────────────────────────────────────────────────┐
│                  ACCOUNT                         │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐      │
│  │     Logout (DISABLED - GRAYED)       │      │
│  └──────────────────────────────────────┘      │
│  Logout requires internet connection ⚠️        │
└─────────────────────────────────────────────────┘
```

## 🔐 Protected Operations

| Operation        | Online     | Offline    | Reason                      |
| ---------------- | ---------- | ---------- | --------------------------- |
| **Login**        | ✅ Allowed | ⛔ Blocked | Requires Firebase Auth      |
| **SignUp**       | ✅ Allowed | ⛔ Blocked | Requires Firebase Auth      |
| **Logout**       | ✅ Allowed | ⛔ Blocked | Requires Firebase Auth      |
| **View Tasks**   | ✅ Works   | ✅ Works   | Uses local Realm DB         |
| **Create Task**  | ✅ Works   | ✅ Works   | Saved to Realm, syncs later |
| **Edit Task**    | ✅ Works   | ✅ Works   | Saved to Realm, syncs later |
| **Delete Task**  | ✅ Works   | ✅ Works   | Saved to Realm, syncs later |
| **Theme Toggle** | ✅ Works   | ✅ Works   | Local state only            |

## 📊 Redux State Shape

```typescript
// Global Redux State
{
  auth: { ... },
  tasks: { ... },
  theme: { ... },
  sync: { ... },
  network: {                    // ← NEW!
    isConnected: boolean,       // Main flag to check
    type: string | null,        // 'wifi', 'cellular', etc.
    isInternetReachable: boolean | null
  }
}
```

## 🎯 Key Implementation Points

### 1. Checking Network Status in Components

```tsx
import { useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';

const isConnected = useAppSelector(
  (state: RootState) => state.network.isConnected,
);
```

### 2. Disabling Buttons

```tsx
<Button
  title="Login"
  disabled={!isConnected} // Disabled when offline
  onPress={handleLogin}
/>
```

### 3. Showing Alerts

```tsx
if (!isConnected) {
  Alert.alert(
    'No Internet Connection',
    'Please check your internet connection and try again.',
  );
  return;
}
```

## 🧪 Testing Checklist

- [ ] Banner appears when WiFi is turned off
- [ ] Banner disappears when WiFi is turned on
- [ ] Login button disabled when offline
- [ ] SignUp button disabled when offline
- [ ] Logout button disabled when offline
- [ ] Alert shows when trying to login offline
- [ ] Alert shows when trying to signup offline
- [ ] Alert shows when trying to logout offline
- [ ] Tasks can still be created offline
- [ ] Tasks sync when connection is restored
- [ ] Banner animates smoothly
- [ ] Works on both iOS and Android

## 📦 Package Dependencies

```json
{
  "@react-native-community/netinfo": "^11.4.1" // Already installed ✅
}
```

## 🔗 File Structure

```
src/
├── components/
│   ├── NetworkProvider.tsx          ← NEW: Monitors network
│   └── OfflineBanner.tsx            ← NEW: Shows banner
├── hooks/
│   └── useNetworkStatus.ts          ← NEW: Hook to access network state
├── store/
│   ├── slices/
│   │   └── networkSlice.ts          ← NEW: Redux slice for network
│   └── index.ts                     ← UPDATED: Added network reducer
├── features/
│   ├── auth/
│   │   ├── LoginScreen.tsx          ← UPDATED: Offline check
│   │   └── SignUpScreen.tsx         ← UPDATED: Offline check
│   └── settings/
│       └── SettingsScreen.tsx       ← UPDATED: Offline check
└── App.tsx                          ← UPDATED: Added providers
```

---

**💡 Pro Tip**: The implementation is designed to be non-intrusive. Users can continue using most features offline, and the app will sync automatically when connection is restored.
