# 📱 Todo App - Interview Questions

> **130 Project-Specific Questions** | React Native • Firebase • Offline-First  
> Complete answers with code examples and explanations

---


---

## 🏗️ Architecture & Folder Structure

<a name="q1"></a>
### Q1. Why use both Redux and Realm in this project?

**💡 Answer:**  
Redux manages UI state and app-wide state (auth, theme, network), while Realm provides offline-first local persistence. This separation ensures data survives app restarts and works offline.

<a name="q2"></a>
### Q2. Explain the service layer architecture pattern used.

**💡 Answer:**  
Services are singleton classes exported as instances (`realmService`, `firebaseService`, `syncService`, `notificationService`). They encapsulate business logic separately from UI components.

<a name="q3"></a>
### Q3. Why separate navigation into RootNavigator, AppNavigator, AuthNavigator, and TabNavigator?

**💡 Answer:**  
Each handles different navigation contexts: Root (auth check), Auth (login/signup), App (authenticated screens), Tab (bottom tabs). This creates clear boundaries and conditional rendering.

<a name="q4"></a>
### Q4. What's the purpose of the atoms/molecules component structure?

**💡 Answer:**  
Atomic design pattern: atoms are basic building blocks (Button, Input), molecules are combinations (TaskItem). Promotes reusability and consistency.

<a name="q5"></a>
### Q5. Why use environment-specific .env files?

**💡 Answer:**  
Supports multiple deployment environments (dev, staging, prod) with different Firebase configs and API URLs without code changes.

<a name="q6"></a>
### Q6. Explain the schema migration strategy in Realm.

**💡 Answer:**  
Uses `schemaVersion` and `onMigration` callback to handle database schema changes without data loss.

<a name="q7"></a>
### Q7. Why use Context API for theme instead of Redux?

**💡 Answer:**  
Theme needs deep component tree access without prop drilling. Context API is lighter for this specific use case, though Redux stores theme mode for persistence.

<a name="q8"></a>
### Q8. What's the role of the types/index.ts file?

**💡 Answer:**  
Central type definitions for Task, User, navigation params, and state shapes. Ensures type safety across the app.

<a name="q9"></a>
### Q9. Why separate services into database/, firebase/, sync/, and notifications/?

**💡 Answer:**  
Each service has distinct responsibility: database (local storage), firebase (remote), sync (coordination), notifications (push). Follows single responsibility principle.

<a name="q10"></a>
### Q10. Explain the custom hooks pattern (useSyncStatus, useNetworkStatus).

**💡 Answer:**  
Encapsulates Redux selectors and derived state logic. Components get clean API without knowing Redux internals.


---

## 🔄 Data Flow & State Management

<a name="q11"></a>
### Q11. How does the offline-first architecture work?

**💡 Answer:**  
All CRUD operations write to Realm first (local), then sync to Firestore when online. App always reads from Realm.

<a name="q12"></a>
### Q12. Explain the bidirectional sync strategy.

**💡 Answer:**  
Local-to-remote syncs unsynced tasks to Firestore. Remote-to-local listens to Firestore changes and updates Realm.

<a name="q13"></a>
### Q13. How are sync conflicts handled?

**💡 Answer:**  
Last-write-wins based on `updatedAt` timestamp. Remote changes always overwrite local if remote is newer.

<a name="q14"></a>
### Q14. Why mark tasks as `synced: false` on local changes?

**💡 Answer:**  
Tracks which tasks need uploading to Firestore. Sync service queries unsynced tasks to upload.

<a name="q15"></a>
### Q15. Explain soft delete vs hard delete implementation.

**💡 Answer:**  
Soft delete marks `isDeleted: true`, hard delete removes from database. Soft delete allows sync of deletions.

<a name="q16"></a>
### Q16. How does the filter state work in TaskListScreen?

**💡 Answer:**  
Redux stores filter ('all'|'active'|'completed'), useMemo filters tasks client-side for performance.

<a name="q17"></a>
### Q17. Why use Redux Toolkit instead of plain Redux?

**💡 Answer:**  
RTK provides `createSlice` (reduces boilerplate), Immer (immutable updates), and configured store with DevTools.

<a name="q18"></a>
### Q18. Explain the serializableCheck middleware configuration.

**💡 Answer:**  
Redux requires serializable state, but Firebase User objects aren't serializable. Config ignores specific paths.

<a name="q19"></a>
### Q19. How does Realm change listener trigger UI updates?

**💡 Answer:**  
Realm listener calls callback on data changes, which loads tasks from Realm and dispatches to Redux, triggering re-render.

<a name="q20"></a>
### Q20. Why separate network state into its own Redux slice?

**💡 Answer:**  
Network status affects multiple features (sync, offline banner). Centralized state prevents duplicate listeners.


---

## 🔌 API Layer & Backend Integrations

<a name="q21"></a>
### Q21. How does Firebase Authentication integrate with the app?

**💡 Answer:**  
`firebaseService.onAuthStateChanged` listener updates Redux auth state, triggering navigation between Auth and App stacks.

<a name="q22"></a>
### Q22. Explain Firestore data structure for tasks.

**💡 Answer:**  
Collection path: `users/{userId}/tasks/{taskId}`. Each user's tasks are isolated in their subcollection.

<a name="q23"></a>
### Q23. Why filter `isDeleted == false` in Firestore queries?

**💡 Answer:**  
Prevents showing deleted tasks. Soft-deleted tasks remain in Firestore briefly for sync, then get hard-deleted.

<a name="q24"></a>
### Q24. How does FCM (Firebase Cloud Messaging) work in this app?

**💡 Answer:**  
FCM provides push notification capability. App gets token, sends to backend (future), receives remote messages.

<a name="q25"></a>
### Q25. Explain the Notifee vs Firebase Messaging split.

**💡 Answer:**  
Notifee handles local notifications (scheduled reminders), Firebase Messaging handles remote push notifications.

<a name="q26"></a>
### Q26. How are task reminders scheduled?

**💡 Answer:**  
When task with `reminderTime` is created, Notifee schedules trigger notification at that timestamp.

<a name="q27"></a>
### Q27. Why reschedule notifications on app initialization?

**💡 Answer:**  
Notifications are lost on app reinstall or data clear. Rescheduling ensures reminders persist.

<a name="q28"></a>
### Q28. How does the app handle background message delivery?

**💡 Answer:**  
`setBackgroundMessageHandler` processes messages when app is in background/quit state.

<a name="q29"></a>
### Q29. Explain the permission request strategy for notifications.

**💡 Answer:**  
Platform-specific: Android uses Notifee for system permissions, iOS uses Firebase Messaging. Both checked on initialization.

<a name="q30"></a>
### Q30. Why use `listenToTasks` instead of polling?

**💡 Answer:**  
Firestore real-time listener (`onSnapshot`) pushes changes instantly. More efficient than polling, lower latency.


---

## ⚡ Async Logic & Side Effects

<a name="q31"></a>
### Q31. How does the app prevent concurrent sync operations?

**💡 Answer:**  
`isSyncing` flag prevents multiple simultaneous syncs. Returns early if already syncing.

<a name="q32"></a>
### Q32. Explain the sync status state machine.

**💡 Answer:**  
States: idle → syncing → succeeded/failed → idle. UI shows different indicators per state.

<a name="q33"></a>
### Q33. Why use `useCallback` for event handlers in TaskListScreen?

**💡 Answer:**  
Prevents recreating functions on every render, which would break memoization and cause unnecessary re-renders.

<a name="q34"></a>
### Q34. How does the app handle async initialization errors?

**💡 Answer:**  
Try-catch blocks log errors but don't crash app. Services initialize independently.

<a name="q35"></a>
### Q35. Explain the cleanup pattern in useEffect hooks.

**💡 Answer:**  
Return cleanup function to unsubscribe listeners, preventing memory leaks.

<a name="q36"></a>
### Q36. Why dispatch Redux actions after Realm writes?

**💡 Answer:**  
Realm is source of truth, Redux is UI cache. Update Realm first, then sync Redux for UI reactivity.

<a name="q37"></a>
### Q37. How does the app handle network state changes during sync?

**💡 Answer:**  
NetInfo listener triggers sync when connection restored. Sync checks `isConnected` before proceeding.

<a name="q38"></a>
### Q38. Explain the pull-to-refresh implementation.

**💡 Answer:**  
`RefreshControl` component triggers manual sync and task reload. Shows loading spinner during operation.

<a name="q39"></a>
### Q39. Why use `useMemo` for filtered tasks?

**💡 Answer:**  
Filtering large arrays is expensive. Memoization caches result until dependencies change.

<a name="q40"></a>
### Q40. How does the app sequence initialization steps?

**💡 Answer:**  
Async/await chain ensures proper order: Realm → Notifications → Sync → Reschedule reminders.


---

## 🔐 Authentication & Authorization

<a name="q41"></a>
### Q41. How does the app prevent unauthorized access to tasks?

**💡 Answer:**  
Navigation conditionally renders Auth or App stack based on `isAuthenticated`. Firestore rules enforce server-side.

<a name="q42"></a>
### Q42. Explain the auth state persistence mechanism.

**💡 Answer:**  
Firebase Auth persists session automatically. On app restart, `onAuthStateChanged` fires with existing user.

<a name="q43"></a>
### Q43. Why store user in both Redux and Firebase?

**💡 Answer:**  
Firebase Auth holds credentials, Redux holds UI state. Redux enables quick access without async calls.

<a name="q44"></a>
### Q44. How does logout clear local data?

**💡 Answer:**  
Logout signs out Firebase, clears Redux auth state, but preserves Realm data for next login.

<a name="q45"></a>
### Q45. Explain the loading state during auth check.

**💡 Answer:**  
Shows spinner while `onAuthStateChanged` determines auth status. Prevents flash of wrong screen.

<a name="q46"></a>
### Q46. Why use email/password auth instead of OAuth?

**💡 Answer:**  
Simplicity for MVP. Email/password requires no external provider setup. Can add OAuth later.

<a name="q47"></a>
### Q47. How would you add multi-factor authentication?

**💡 Answer:**  
Firebase supports MFA. Enable in console, use `multiFactor` API to enroll and verify.

<a name="q48"></a>
### Q48. Explain potential security issues with current auth implementation.

**💡 Answer:**  
No email verification, weak password requirements, user object in Redux (non-serializable), no rate limiting.

<a name="q49"></a>
### Q49. How does Firebase Auth token refresh work?

**💡 Answer:**  
Firebase SDK automatically refreshes tokens before expiration. `onAuthStateChanged` fires on refresh.

<a name="q50"></a>
### Q50. Why not store password in Redux or Realm?

**💡 Answer:**  
Security risk. Firebase Auth handles credentials securely. Never store passwords client-side.


---

## 💼 Business Rules & Domain Logic

<a name="q51"></a>
### Q51. Why use timestamps instead of Date objects?

**💡 Answer:**  
Timestamps (numbers) are serializable, cross-platform consistent, and easier to compare.

<a name="q52"></a>
### Q52. Explain the task completion toggle logic.

**💡 Answer:**  
Finds task by ID, toggles `completed` boolean, updates Realm, dispatches Redux action, triggers sync.

<a name="q53"></a>
### Q53. Why generate task IDs client-side with BSON.ObjectId?

**💡 Answer:**  
Enables offline task creation without server round-trip. ObjectId is globally unique.

<a name="q54"></a>
### Q54. How does the app handle due dates and reminders?

**💡 Answer:**  
Optional `dueDate` and `reminderTime` timestamps. Reminder schedules notification, due date is display-only.

<a name="q55"></a>
### Q55. Explain the filter counts calculation.

**💡 Answer:**  
Memoized calculation counts active/completed/all tasks for filter pill badges.

<a name="q56"></a>
### Q56. Why separate `synced` and `isDeleted` flags?

**💡 Answer:**  
`synced` tracks upload status, `isDeleted` tracks deletion state. Both needed for proper sync.

<a name="q57"></a>
### Q57. How would you implement task priority levels?

**💡 Answer:**  
Add `priority` field to schema, filter/sort by priority, add UI picker.

<a name="q58"></a>
### Q58. Explain the task ownership model.

**💡 Answer:**  
Each task has `userId` field. Queries filter by current user's ID. Firestore rules enforce ownership.

<a name="q59"></a>
### Q59. Why use optional description field?

**💡 Answer:**  
Not all tasks need descriptions. Optional field reduces data size and simplifies UI.

<a name="q60"></a>
### Q60. How does the app handle task search/filtering?

**💡 Answer:**  
Currently only status filtering (all/active/completed). Search would require text filtering on title/description.


---

## ⚡ Performance & Optimization

<a name="q61"></a>
### Q61. Explain FlatList optimization props used.

**💡 Answer:**  
`getItemLayout` enables instant scrolling, `removeClippedSubviews` reduces memory, `windowSize` controls render buffer.

<a name="q62"></a>
### Q62. Why use React.memo for FilterPill component?

**💡 Answer:**  
Prevents re-rendering pills when unrelated state changes (e.g., task toggle). Only re-renders when props change.

<a name="q63"></a>
### Q63. How does the app minimize Realm queries?

**💡 Answer:**  
Loads tasks once on mount, uses Redux for UI updates, only re-queries on refresh or auth change.

<a name="q64"></a>
### Q64. Explain the gradient rendering optimization.

**💡 Answer:**  
LinearGradient is expensive. Used sparingly (header, buttons, FAB) and memoized where possible.

<a name="q65"></a>
### Q65. Why use Animated.Value instead of state for animations?

**💡 Answer:**  
Animated API runs on native thread, avoiding JS bridge overhead. Smoother 60fps animations.

<a name="q66"></a>
### Q66. How does the app handle large task lists?

**💡 Answer:**  
FlatList virtualization renders only visible items. Optimized with `getItemLayout` and `windowSize`.

<a name="q67"></a>
### Q67. Explain the sync debouncing strategy.

**💡 Answer:**  
`isSyncing` flag prevents concurrent syncs. Realm listener triggers sync, but flag ensures one at a time.

<a name="q68"></a>
### Q68. Why use `useNativeDriver` for animations?

**💡 Answer:**  
Offloads animation to native thread. JS thread can be busy without affecting animation smoothness.

<a name="q69"></a>
### Q69. How does the app minimize re-renders?

**💡 Answer:**  
useCallback, useMemo, React.memo, and Redux selectors prevent unnecessary re-renders.

<a name="q70"></a>
### Q70. Explain the theme toggle performance.

**💡 Answer:**  
Context API updates only components using `useTheme`. Redux stores mode for persistence.


---

## 🐛 Error Handling & Edge Cases

<a name="q71"></a>
### Q71. How does the app handle network errors during sync?

**💡 Answer:**  
Try-catch blocks catch errors, dispatch `setSyncStatus('failed')`, log error, show UI indicator.

<a name="q72"></a>
### Q72. What happens if Realm initialization fails?

**💡 Answer:**  
Error logged, app continues but features degraded. Tasks won't persist.

<a name="q73"></a>
### Q73. How does the app handle permission denial for notifications?

**💡 Answer:**  
Checks permission status, shows UI message if denied, allows manual retry.

<a name="q74"></a>
### Q74. Explain the null safety pattern for user object.

**💡 Answer:**  
Optional chaining and null checks prevent crashes when user is null.

<a name="q75"></a>
### Q75. How does the app handle Firestore quota limits?

**💡 Answer:**  
Currently no handling. Production needs rate limiting, error handling, and user feedback.

<a name="q76"></a>
### Q76. What happens if task ID collision occurs?

**💡 Answer:**  
BSON.ObjectId is globally unique (timestamp + random). Collision probability is astronomically low.

<a name="q77"></a>
### Q77. How does the app handle timezone differences?

**💡 Answer:**  
Uses UTC timestamps (Date.now()). Display formatting would need timezone conversion.

<a name="q78"></a>
### Q78. Explain error handling in async initialization.

**💡 Answer:**  
Each service has try-catch, errors logged but don't stop other services.

<a name="q79"></a>
### Q79. How does the app handle stale data after long offline period?

**💡 Answer:**  
On reconnect, sync pulls latest from Firestore, overwrites local with remote changes.

<a name="q80"></a>
### Q80. What happens if user deletes app and reinstalls?

**💡 Answer:**  
Realm data lost, Firebase Auth persists (if not logged out). User logs in, syncs tasks from Firestore.


---

## �� Security & Deployment

<a name="q81"></a>
### Q81. How would you secure Firestore rules for this app?

**💡 Answer:**  
Restrict read/write to authenticated users, enforce userId matching.

<a name="q82"></a>
### Q82. Explain the environment configuration strategy.

**💡 Answer:**  
Three .env files (dev, staging, prod) with different Firebase projects. Scripts select via ENVFILE variable.

<a name="q83"></a>
### Q83. Why not commit .env files to git?

**💡 Answer:**  
Contains sensitive API keys. .gitignore excludes them. Use .env.example for structure.

<a name="q84"></a>
### Q84. How would you implement API key rotation?

**💡 Answer:**  
Update Firebase project keys, update .env files, redeploy app. Old keys remain valid during transition.

<a name="q85"></a>
### Q85. Explain the Android notification channel importance.

**💡 Answer:**  
HIGH importance shows heads-up notifications, makes sound. Required for task reminders.

<a name="q86"></a>
### Q86. How would you implement code obfuscation?

**💡 Answer:**  
Enable ProGuard for Android, configure React Native obfuscation, use Hermes bytecode.

<a name="q87"></a>
### Q87. Explain the security implications of storing FCM token.

**💡 Answer:**  
Token enables sending notifications to device. Should be stored server-side, associated with user.

<a name="q88"></a>
### Q88. How would you implement certificate pinning?

**💡 Answer:**  
Use react-native-ssl-pinning to pin Firebase certificates. Prevents MITM attacks.

<a name="q89"></a>
### Q89. Why use HTTPS for API_URL?

**💡 Answer:**  
Encrypts data in transit. Prevents eavesdropping and tampering.

<a name="q90"></a>
### Q90. How would you handle sensitive data in Realm?

**💡 Answer:**  
Use Realm encryption with user-specific key. Encrypts database file.


---

## 🚀 Advanced Topics

<a name="q91"></a>
### Q91. How would you implement offline image attachments?

**💡 Answer:**  
Store images in device filesystem, save path in Realm, upload to Firebase Storage on sync.

<a name="q92"></a>
### Q92. Explain how you'd implement collaborative tasks.

**💡 Answer:**  
Add `sharedWith` array to task, update Firestore rules, listen to shared tasks.

<a name="q93"></a>
### Q93. How would you implement task categories/tags?

**💡 Answer:**  
Add `tags` array to schema, create tag filter UI, index for efficient queries.

<a name="q94"></a>
### Q94. Explain implementing recurring tasks.

**💡 Answer:**  
Add `recurrence` field (daily/weekly/monthly), create next instance on completion.

<a name="q95"></a>
### Q95. How would you implement task history/audit log?

**💡 Answer:**  
Create TaskHistory schema, log changes on update, display timeline.

<a name="q96"></a>
### Q96. Explain implementing push notification analytics.

**💡 Answer:**  
Track notification delivery, opens, and dismissals. Send events to analytics service.

<a name="q97"></a>
### Q97. How would you implement dark mode scheduling?

**💡 Answer:**  
Add time-based theme switching, use device schedule, or custom times.

<a name="q98"></a>
### Q98. Explain implementing task attachments with Realm.

**💡 Answer:**  
Store file metadata in Realm, actual files in filesystem, sync to cloud storage.

<a name="q99"></a>
### Q99. How would you implement task templates?

**💡 Answer:**  
Create Template schema, allow users to save tasks as templates, instantiate from template.

<a name="q100"></a>
### Q100. Explain implementing cross-device sync conflict resolution.

**💡 Answer:**  
Use vector clocks or CRDTs for true conflict resolution, or operational transforms.


---

## 🎨 Component & UI Patterns Additional Component & UI Questions

<a name="q101"></a>
### Q101. Explain the form validation strategy in LoginScreen.

**💡 Answer:**  
Client-side validation checks email format and password length before API call. Errors displayed per-field and globally.

<a name="q102"></a>
### Q102. How does the app map Firebase error codes to user-friendly messages?

**💡 Answer:**  
`getFriendlyError` function maps Firebase error codes to readable messages for better UX.

<a name="q103"></a>
### Q103. Why check network status before login attempt?

**💡 Answer:**  
Prevents failed API calls and provides immediate feedback when offline. Shows alert instead of waiting for timeout.

<a name="q104"></a>
### Q104. Explain the TaskItem animation pattern.

**💡 Answer:**  
Uses `Animated.Value` for scale and opacity. Fade-in on mount, scale on press for tactile feedback.

<a name="q105"></a>
### Q105. How does TaskItem determine accent color?

**💡 Answer:**  
Color based on task state: red for overdue, yellow for due today, blue for normal, green for completed.

<a name="q106"></a>
### Q106. Explain the gradient usage pattern in TaskItem.

**💡 Answer:**  
Different gradients for completed vs active tasks. Adapts to light/dark theme.

<a name="q107"></a>
### Q107. Why use React.memo for TaskItem?

**💡 Answer:**  
TaskItem renders in FlatList with potentially hundreds of items. Memo prevents re-renders when props unchanged.

<a name="q108"></a>
### Q108. How does the sync indicator work in TaskItem?

**💡 Answer:**  
Shows small dot when `task.synced === false`. Visual feedback for pending uploads.

<a name="q109"></a>
### Q109. Explain the date formatting logic in TaskItem.

**💡 Answer:**  
Converts timestamps to relative dates (Today/Tomorrow) or formatted dates for better readability.

<a name="q110"></a>
### Q110. How does OfflineBanner animation work?

**💡 Answer:**  
Slides down from top when offline, slides up when online. Uses spring animation for natural motion.

<a name="q111"></a>
### Q111. Why use `pointerEvents="none"` on OfflineBanner?

**💡 Answer:**  
Banner is informational only, shouldn't block touches to underlying UI.

<a name="q112"></a>
### Q112. Explain the KeyboardAvoidingView usage in LoginScreen.

**💡 Answer:**  
Adjusts layout when keyboard appears, preventing input fields from being hidden.

<a name="q113"></a>
### Q113. How does the Button component handle disabled state with gradients?

**💡 Answer:**  
Switches gradient to grayscale when disabled, maintains visual consistency.

<a name="q114"></a>
### Q114. Why separate loading state in LoginScreen (local + Redux)?

**💡 Answer:**  
Local state controls button spinner, Redux state for global loading indicator. Different scopes.

<a name="q115"></a>
### Q115. Explain the error clearing pattern in LoginScreen.

**💡 Answer:**  
Clears auth error when user types, providing clean slate for new attempt.

<a name="q116"></a>
### Q116. How does the app handle platform-specific styling?

**💡 Answer:**  
Uses `Platform.select` for iOS/Android differences in shadows, elevation, behavior.

<a name="q117"></a>
### Q117. Why use LinearGradient for auth screens background?

**💡 Answer:**  
Creates visually appealing, modern UI. Gradients adapt to theme (light/dark).

<a name="q118"></a>
### Q118. Explain the icon usage pattern in Input components.

**💡 Answer:**  
Emoji icons provide visual context without icon library dependency. Lightweight and universal.

<a name="q119"></a>
### Q119. How does the app handle text truncation in TaskItem?

**💡 Answer:**  
Uses `numberOfLines` prop to prevent overflow, maintains consistent item height.

<a name="q120"></a>
### Q120. Explain the accent border pattern in TaskItem.

**💡 Answer:**  
Colored left border provides visual priority indicator without overwhelming the design.


---

## 📊 Additional State Management Additional State Management Questions

<a name="q121"></a>
### Q121. Why use separate error states for email and password?

**💡 Answer:**  
Enables field-specific error messages, better UX than single form error.

<a name="q122"></a>
### Q122. How does the sync status auto-reset work?

**💡 Answer:**  
After successful sync, status resets to idle after 3 seconds using setTimeout.

<a name="q123"></a>
### Q123. Explain the network state structure in Redux.

**💡 Answer:**  
Stores connection status, type (wifi/cellular), and internet reachability separately.

<a name="q124"></a>
### Q124. Why use `??` (nullish coalescing) for network state?

**💡 Answer:**  
NetInfo can return null/undefined. Nullish coalescing provides safe defaults.

<a name="q125"></a>
### Q125. How does the app handle rapid filter changes?

**💡 Answer:**  
useMemo prevents re-filtering until dependencies change. Filter state updates immediately.


---

## ⚡ Additional Performance Additional Performance Questions

<a name="q126"></a>
### Q126. Explain the FlatList `windowSize` optimization.

**💡 Answer:**  
Controls how many screens of content to render. Default 21 means 10 above, 10 below, 1 visible.

<a name="q127"></a>
### Q127. Why use `removeClippedSubviews` only on Android?

**💡 Answer:**  
iOS has different rendering optimization. Android benefits from clipping off-screen views.

<a name="q128"></a>
### Q128. How does `getItemLayout` improve FlatList performance?

**💡 Answer:**  
Tells FlatList exact item dimensions, enabling instant scroll-to-position without measuring.

<a name="q129"></a>
### Q129. Explain the gradient rendering trade-off.

**💡 Answer:**  
Gradients are expensive to render. Used strategically for visual impact vs performance.

<a name="q130"></a>
### Q130. How does the app optimize theme changes?

**💡 Answer:**  
Context API updates only components using `useTheme`. Redux stores mode for persistence.


## 📚 Quick Reference

### Key Technologies
- **Frontend**: React Native 0.82, TypeScript
- **State**: Redux Toolkit, Context API
- **Database**: Realm (offline-first)
- **Backend**: Firebase Auth, Firestore
- **Notifications**: Notifee, FCM
- **UI**: LinearGradient, Animations

### Architecture Patterns
- ✅ Offline-first with Realm
- ✅ Bidirectional sync
- ✅ Service layer pattern
- ✅ Atomic design components
- ✅ Custom hooks for logic reuse

### Performance Optimizations
- ✅ FlatList virtualization
- ✅ React.memo for components
- ✅ useMemo/useCallback hooks
- ✅ Native animations
- ✅ Strategic gradient usage

---

**📱 Mobile-Optimized Format** | **130 Questions** | **Complete Answers**
