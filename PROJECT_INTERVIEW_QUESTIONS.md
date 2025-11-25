# Project Interview Preparation - Todo App

## Architecture & Folder Structure

### Q1. Why use both Redux and Realm in this project?
**Answer:** Redux manages UI state and app-wide state (auth, theme, network), while Realm provides offline-first local persistence. This separation ensures data survives app restarts and works offline.

**Example:**
```typescript
// Redux for UI state
const { filter } = useAppSelector(state => state.tasks);
// Realm for persistent data
const tasks = await realmService.getAllTasks(userId);
```

**Explanation:** Redux is ephemeral (lost on app close), Realm is persistent. Using both provides reactive UI updates and offline data persistence.

### Q2. Explain the service layer architecture pattern used.
**Answer:** Services are singleton classes exported as instances (`realmService`, `firebaseService`, `syncService`, `notificationService`). They encapsulate business logic separately from UI components.

**Example:**
```typescript
class RealmService {
  private realm: Realm | null = null;
  async init() { /* ... */ }
}
export const realmService = new RealmService();
```

**Explanation:** This pattern ensures single instances, easier testing, and separation of concerns. Services can be imported anywhere without prop drilling.

### Q3. Why separate navigation into RootNavigator, AppNavigator, AuthNavigator, and TabNavigator?
**Answer:** Each handles different navigation contexts: Root (auth check), Auth (login/signup), App (authenticated screens), Tab (bottom tabs). This creates clear boundaries and conditional rendering.

**Example:**
```typescript
{isAuthenticated ? (
  <Stack.Screen name="App" component={AppNavigator} />
) : (
  <Stack.Screen name="Auth" component={AuthNavigator} />
)}
```

**Explanation:** Prevents unauthorized access, improves code organization, and enables different navigation patterns per context.

### Q4. What's the purpose of the atoms/molecules component structure?
**Answer:** Atomic design pattern: atoms are basic building blocks (Button, Input), molecules are combinations (TaskItem). Promotes reusability and consistency.

**Example:**
```typescript
// Atom
<Button title="Save" variant="primary" />
// Molecule using atoms
<TaskItem task={task} onToggleComplete={handler} />
```

**Explanation:** Smaller components are easier to test, maintain, and reuse across screens.

### Q5. Why use environment-specific .env files?
**Answer:** Supports multiple deployment environments (dev, staging, prod) with different Firebase configs and API URLs without code changes.

**Example:**
```bash
# .env.development
ENV=development
FIREBASE_PROJECT_ID=todo-test-e08af
# .env.production
ENV=production
FIREBASE_PROJECT_ID=todo-prod-xyz
```

**Explanation:** Enables safe testing in dev, staging validation, and production deployment with proper configs.

### Q6. Explain the schema migration strategy in Realm.
**Answer:** Uses `schemaVersion` and `onMigration` callback to handle database schema changes without data loss.

**Example:**
```typescript
schemaVersion: 2,
onMigration: (oldRealm, newRealm) => {
  if (oldRealm.schemaVersion < 2) {
    const newObjects = newRealm.objects('Task');
    for (let i = 0; i < newObjects.length; i++) {
      newObjects[i].isDeleted = false;
    }
  }
}
```

**Explanation:** When adding `isDeleted` field, existing tasks get default value. Prevents crashes on app updates.

### Q7. Why use Context API for theme instead of Redux?
**Answer:** Theme needs deep component tree access without prop drilling. Context API is lighter for this specific use case, though Redux stores theme mode for persistence.

**Example:**
```typescript
const { theme, isDark, toggleTheme } = useTheme();
// vs Redux
const themeMode = useAppSelector(state => state.theme.mode);
```

**Explanation:** Context provides theme object and utilities, Redux persists user preference. Best of both worlds.

### Q8. What's the role of the types/index.ts file?
**Answer:** Central type definitions for Task, User, navigation params, and state shapes. Ensures type safety across the app.

**Example:**
```typescript
export interface Task {
  id: string;
  userId: string;
  synced: boolean;
  isDeleted: boolean;
}
```

**Explanation:** TypeScript catches errors at compile time, provides autocomplete, and serves as documentation.

### Q9. Why separate services into database/, firebase/, sync/, and notifications/?
**Answer:** Each service has distinct responsibility: database (local storage), firebase (remote), sync (coordination), notifications (push). Follows single responsibility principle.

**Explanation:** Makes code easier to test, debug, and modify. Changes to Firebase don't affect Realm logic.

### Q10. Explain the custom hooks pattern (useSyncStatus, useNetworkStatus).
**Answer:** Encapsulates Redux selectors and derived state logic. Components get clean API without knowing Redux internals.

**Example:**
```typescript
export const useSyncStatus = () => {
  const { status, lastSyncedAt } = useSelector(state => state.sync);
  return {
    isSyncing: status === 'syncing',
    isSynced: status === 'succeeded',
  };
};
```

**Explanation:** Reusable, testable, and hides complexity. Multiple components can use same logic.

## Data Flow & State Management

### Q11. How does the offline-first architecture work?
**Answer:** All CRUD operations write to Realm first (local), then sync to Firestore when online. App always reads from Realm.

**Example:**
```typescript
// Create task - writes to Realm immediately
const task = await realmService.createTask(taskData);
// Sync to Firebase when online
if (isConnected) {
  await syncService.syncLocalToRemote();
}
```

**Explanation:** Users can work offline. Changes queue locally and sync when connection returns.

### Q12. Explain the bidirectional sync strategy.
**Answer:** Local-to-remote syncs unsynced tasks to Firestore. Remote-to-local listens to Firestore changes and updates Realm.

**Example:**
```typescript
// Local to remote
const unsyncedTasks = await realmService.getUnsyncedTasks(userId);
for (const task of unsyncedTasks) {
  await firebaseService.syncTaskToFirestore(task);
}
// Remote to local
firebaseService.listenToTasks(tasks => {
  tasks.forEach(task => realmService.saveRemoteTask(task));
});
```

**Explanation:** Ensures consistency across devices. Changes from any device propagate to all others.

### Q13. How are sync conflicts handled?
**Answer:** Last-write-wins based on `updatedAt` timestamp. Remote changes always overwrite local if remote is newer.

**Example:**
```typescript
async saveRemoteTask(task: Task) {
  const existingTask = this.realm.objects('Task').filtered('id == $0', task.id)[0];
  if (existingTask) {
    // Overwrite with remote data
    existingTask.title = task.title;
    existingTask.synced = true;
  }
}
```

**Explanation:** Simple but can lose data. Trade-off for implementation simplicity. Could enhance with CRDTs.

### Q14. Why mark tasks as `synced: false` on local changes?
**Answer:** Tracks which tasks need uploading to Firestore. Sync service queries unsynced tasks to upload.

**Example:**
```typescript
async updateTask(id, userId, updates) {
  this.realm.write(() => {
    Object.assign(task, {
      ...updates,
      synced: false, // Mark for sync
    });
  });
}
```

**Explanation:** Efficient sync - only uploads changed tasks, not entire database.

### Q15. Explain soft delete vs hard delete implementation.
**Answer:** Soft delete marks `isDeleted: true`, hard delete removes from database. Soft delete allows sync of deletions.

**Example:**
```typescript
// Soft delete - syncs to Firebase
async deleteTask(id, userId) {
  task.isDeleted = true;
  task.synced = false;
}
// Hard delete - after sync completes
async permanentlyDeleteTask(id, userId) {
  this.realm.delete(task);
}
```

**Explanation:** Soft delete ensures deletions sync to Firestore before permanent removal.

### Q16. How does the filter state work in TaskListScreen?
**Answer:** Redux stores filter ('all'|'active'|'completed'), useMemo filters tasks client-side for performance.

**Example:**
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
}, [tasks, filter]);
```

**Explanation:** Memoization prevents re-filtering on every render. Only recalculates when tasks or filter change.

### Q17. Why use Redux Toolkit instead of plain Redux?
**Answer:** RTK provides `createSlice` (reduces boilerplate), Immer (immutable updates), and configured store with DevTools.

**Example:**
```typescript
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload; // Immer makes this safe
    }
  }
});
```

**Explanation:** Less code, fewer bugs, better DX. Immer handles immutability automatically.

### Q18. Explain the serializableCheck middleware configuration.
**Answer:** Redux requires serializable state, but Firebase User objects aren't serializable. Config ignores specific paths.

**Example:**
```typescript
middleware: getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredPaths: ['auth.user'],
      ignoredActions: ['auth/setUser'],
    },
  }),
```

**Explanation:** Prevents console warnings while storing Firebase User. Trade-off: can't time-travel debug user object.

### Q19. How does Realm change listener trigger UI updates?
**Answer:** Realm listener calls callback on data changes, which loads tasks from Realm and dispatches to Redux, triggering re-render.

**Example:**
```typescript
this.unsubscribeRealm = await realmService.addChangeListener(() => {
  if (this.isConnected) {
    this.syncLocalToRemote();
  }
});
```

**Explanation:** Reactive data flow: Realm change → sync → Redux update → UI re-render.

### Q20. Why separate network state into its own Redux slice?
**Answer:** Network status affects multiple features (sync, offline banner). Centralized state prevents duplicate listeners.

**Example:**
```typescript
const networkState = useAppSelector(state => state.network);
if (!networkState.isConnected) {
  return <OfflineBanner />;
}
```

**Explanation:** Single source of truth. Components react to network changes without managing listeners.

## API Layer & Backend Integrations

### Q21. How does Firebase Authentication integrate with the app?
**Answer:** `firebaseService.onAuthStateChanged` listener updates Redux auth state, triggering navigation between Auth and App stacks.

**Example:**
```typescript
useEffect(() => {
  const unsubscribe = firebaseService.onAuthStateChanged(user => {
    if (user) {
      dispatch(setUser({ uid: user.uid, email: user.email }));
    } else {
      dispatch(clearAuth());
    }
  });
  return () => unsubscribe();
}, []);
```

**Explanation:** Real-time auth state sync. Handles token refresh, logout, and multi-tab scenarios.

### Q22. Explain Firestore data structure for tasks.
**Answer:** Collection path: `users/{userId}/tasks/{taskId}`. Each user's tasks are isolated in their subcollection.

**Example:**
```typescript
firestore()
  .collection('users')
  .doc(userId)
  .collection('tasks')
  .doc(taskId)
  .set(taskData);
```

**Explanation:** Security rules can easily restrict access per user. Scalable structure for multi-user app.

### Q23. Why filter `isDeleted == false` in Firestore queries?
**Answer:** Prevents showing deleted tasks. Soft-deleted tasks remain in Firestore briefly for sync, then get hard-deleted.

**Example:**
```typescript
.collection('tasks')
.where('isDeleted', '==', false)
.get();
```

**Explanation:** Ensures UI only shows active tasks while allowing deletion sync across devices.

### Q24. How does FCM (Firebase Cloud Messaging) work in this app?
**Answer:** FCM provides push notification capability. App gets token, sends to backend (future), receives remote messages.

**Example:**
```typescript
const token = await messaging().getToken();
messaging().onMessage(async remoteMessage => {
  await notificationService.displayNotification(
    remoteMessage.notification?.title,
    remoteMessage.notification?.body
  );
});
```

**Explanation:** Enables server-triggered notifications. Currently displays, could integrate with task reminders.

### Q25. Explain the Notifee vs Firebase Messaging split.
**Answer:** Notifee handles local notifications (scheduled reminders), Firebase Messaging handles remote push notifications.

**Example:**
```typescript
// Local scheduled notification (Notifee)
await notifee.createTriggerNotification({...}, trigger);
// Remote notification (Firebase)
messaging().onMessage(async remoteMessage => {...});
```

**Explanation:** Notifee provides better local notification control. Firebase handles server-to-device messaging.

### Q26. How are task reminders scheduled?
**Answer:** When task with `reminderTime` is created, Notifee schedules trigger notification at that timestamp.

**Example:**
```typescript
async scheduleTaskReminder(taskId, title, timestamp) {
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    alarmManager: { allowWhileIdle: true }
  };
  await notifee.createTriggerNotification({
    id: `task-${taskId}`,
    title: '⏰ Task Reminder',
    body: title
  }, trigger);
}
```

**Explanation:** Persists across app restarts. `allowWhileIdle` ensures delivery even in doze mode.

### Q27. Why reschedule notifications on app initialization?
**Answer:** Notifications are lost on app reinstall or data clear. Rescheduling ensures reminders persist.

**Example:**
```typescript
const tasksWithReminders = allTasks.filter(
  task => task.reminderTime && task.reminderTime > Date.now()
);
await notificationService.rescheduleNotifications(tasksWithReminders);
```

**Explanation:** Defensive programming. Handles edge cases like OS clearing notification queue.

### Q28. How does the app handle background message delivery?
**Answer:** `setBackgroundMessageHandler` processes messages when app is in background/quit state.

**Example:**
```typescript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await notificationService.displayNotification(
    remoteMessage.notification?.title,
    remoteMessage.notification?.body
  );
});
```

**Explanation:** Ensures notifications appear even when app isn't running. Required for reliable push.

### Q29. Explain the permission request strategy for notifications.
**Answer:** Platform-specific: Android uses Notifee for system permissions, iOS uses Firebase Messaging. Both checked on initialization.

**Example:**
```typescript
if (Platform.OS === 'android') {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
} else {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
}
```

**Explanation:** Different permission APIs per platform. Abstracts complexity in service layer.

### Q30. Why use `listenToTasks` instead of polling?
**Answer:** Firestore real-time listener (`onSnapshot`) pushes changes instantly. More efficient than polling, lower latency.

**Example:**
```typescript
firestore()
  .collection('users').doc(userId).collection('tasks')
  .onSnapshot(snapshot => {
    const tasks = snapshot.docs.map(doc => ({...doc.data()}));
    callback(tasks);
  });
```

**Explanation:** Real-time sync across devices. Changes appear instantly without manual refresh.

## Async Logic & Side Effects

### Q31. How does the app prevent concurrent sync operations?
**Answer:** `isSyncing` flag prevents multiple simultaneous syncs. Returns early if already syncing.

**Example:**
```typescript
async syncLocalToRemote() {
  if (!this.isConnected || this.isSyncing) return;
  try {
    this.isSyncing = true;
    // ... sync logic
  } finally {
    this.isSyncing = false;
  }
}
```

**Explanation:** Prevents race conditions, duplicate uploads, and Firestore quota waste.

### Q32. Explain the sync status state machine.
**Answer:** States: idle → syncing → succeeded/failed → idle. UI shows different indicators per state.

**Example:**
```typescript
store.dispatch(setSyncStatus('syncing'));
// ... perform sync
store.dispatch(setSyncStatus('succeeded'));
setTimeout(() => store.dispatch(setSyncStatus('idle')), 3000);
```

**Explanation:** Clear state transitions. Auto-reset to idle prevents stale "Synced" badges.

### Q33. Why use `useCallback` for event handlers in TaskListScreen?
**Answer:** Prevents recreating functions on every render, which would break memoization and cause unnecessary re-renders.

**Example:**
```typescript
const handleToggleComplete = useCallback(async (taskId) => {
  await realmService.updateTask(taskId, user.uid, {...});
}, [tasks, user, dispatch]);
```

**Explanation:** Dependencies array ensures function updates when needed. Optimizes performance in large lists.

### Q34. How does the app handle async initialization errors?
**Answer:** Try-catch blocks log errors but don't crash app. Services initialize independently.

**Example:**
```typescript
try {
  await realmService.init();
  await notificationService.initialize();
} catch (error) {
  console.error('Failed to initialize:', error);
  // App continues, features may be degraded
}
```

**Explanation:** Graceful degradation. Network errors shouldn't prevent offline usage.

### Q35. Explain the cleanup pattern in useEffect hooks.
**Answer:** Return cleanup function to unsubscribe listeners, preventing memory leaks.

**Example:**
```typescript
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {...});
  return () => unsubscribe();
}, []);
```

**Explanation:** Critical for listeners. Without cleanup, listeners accumulate on re-renders.

### Q36. Why dispatch Redux actions after Realm writes?
**Answer:** Realm is source of truth, Redux is UI cache. Update Realm first, then sync Redux for UI reactivity.

**Example:**
```typescript
await realmService.updateTask(taskId, userId, updates);
dispatch(toggleTaskComplete(taskId));
```

**Explanation:** If Redux updated first and Realm failed, UI would show incorrect state.

### Q37. How does the app handle network state changes during sync?
**Answer:** NetInfo listener triggers sync when connection restored. Sync checks `isConnected` before proceeding.

**Example:**
```typescript
NetInfo.addEventListener(state => {
  this.isConnected = state.isConnected ?? false;
  if (this.isConnected) {
    this.syncLocalToRemote();
  }
});
```

**Explanation:** Automatic sync on reconnection. Users don't need manual refresh.

### Q38. Explain the pull-to-refresh implementation.
**Answer:** `RefreshControl` component triggers manual sync and task reload. Shows loading spinner during operation.

**Example:**
```typescript
const onRefresh = async () => {
  setRefreshing(true);
  await syncService.syncLocalToRemote();
  await loadTasks();
  setRefreshing(false);
};
```

**Explanation:** Gives users control over sync timing. Useful when auto-sync fails.

### Q39. Why use `useMemo` for filtered tasks?
**Answer:** Filtering large arrays is expensive. Memoization caches result until dependencies change.

**Example:**
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    return true;
  });
}, [tasks, filter]);
```

**Explanation:** Performance optimization. Prevents filtering on every render (e.g., theme toggle).

### Q40. How does the app sequence initialization steps?
**Answer:** Async/await chain ensures proper order: Realm → Notifications → Sync → Reschedule reminders.

**Example:**
```typescript
await realmService.init();
await notificationService.initialize();
syncService.initialize();
const tasks = await realmService.getAllTasks('');
await notificationService.rescheduleNotifications(tasks);
```

**Explanation:** Dependencies must initialize first. Sync needs Realm, reminders need tasks.

## Authentication & Authorization

### Q41. How does the app prevent unauthorized access to tasks?
**Answer:** Navigation conditionally renders Auth or App stack based on `isAuthenticated`. Firestore rules enforce server-side.

**Example:**
```typescript
{isAuthenticated ? (
  <Stack.Screen name="App" component={AppNavigator} />
) : (
  <Stack.Screen name="Auth" component={AuthNavigator} />
)}
```

**Explanation:** Client-side prevents UI access, server-side prevents API access. Defense in depth.

### Q42. Explain the auth state persistence mechanism.
**Answer:** Firebase Auth persists session automatically. On app restart, `onAuthStateChanged` fires with existing user.

**Example:**
```typescript
// No manual token storage needed
useEffect(() => {
  const unsubscribe = firebaseService.onAuthStateChanged(user => {
    if (user) {
      dispatch(setUser({...}));
    }
  });
}, []);
```

**Explanation:** Firebase handles token refresh, storage, and expiration. Simplifies auth logic.

### Q43. Why store user in both Redux and Firebase?
**Answer:** Firebase Auth holds credentials, Redux holds UI state. Redux enables quick access without async calls.

**Example:**
```typescript
// Quick synchronous access
const { user } = useAppSelector(state => state.auth);
// vs async Firebase call
const user = firebaseService.getCurrentUser();
```

**Explanation:** Redux optimizes performance. Firebase is source of truth for auth status.

### Q44. How does logout clear local data?
**Answer:** Logout signs out Firebase, clears Redux auth state, but preserves Realm data for next login.

**Example:**
```typescript
await firebaseService.signOut();
dispatch(clearAuth());
// Realm data persists - filtered by userId on next login
```

**Explanation:** Allows offline access to last user's data. Could add option to clear Realm on logout.

### Q45. Explain the loading state during auth check.
**Answer:** Shows spinner while `onAuthStateChanged` determines auth status. Prevents flash of wrong screen.

**Example:**
```typescript
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  const unsubscribe = firebaseService.onAuthStateChanged(user => {
    // ... update state
    setIsLoading(false);
  });
}, []);
if (isLoading) return <ActivityIndicator />;
```

**Explanation:** Better UX. Waits for definitive auth state before showing login or app.

### Q46. Why use email/password auth instead of OAuth?
**Answer:** Simplicity for MVP. Email/password requires no external provider setup. Can add OAuth later.

**Explanation:** Faster development, fewer dependencies. Trade-off: less convenient for users.

### Q47. How would you add multi-factor authentication?
**Answer:** Firebase supports MFA. Enable in console, use `multiFactor` API to enroll and verify.

**Example:**
```typescript
const session = await user.multiFactor.getSession();
const phoneVerifier = new firebase.auth.PhoneAuthProvider();
const verificationId = await phoneVerifier.verifyPhoneNumber(phoneNumber, session);
```

**Explanation:** Enhances security. Requires phone number collection and SMS verification flow.

### Q48. Explain potential security issues with current auth implementation.
**Answer:** No email verification, weak password requirements, user object in Redux (non-serializable), no rate limiting.

**Explanation:** Production app needs: email verification, password strength rules, account lockout, and secure token storage.

### Q49. How does Firebase Auth token refresh work?
**Answer:** Firebase SDK automatically refreshes tokens before expiration. `onAuthStateChanged` fires on refresh.

**Explanation:** Transparent to app. User stays logged in without manual intervention.

### Q50. Why not store password in Redux or Realm?
**Answer:** Security risk. Firebase Auth handles credentials securely. Never store passwords client-side.

**Explanation:** Firebase uses secure token storage. Storing passwords enables theft if device compromised.

## Business Rules & Domain Logic

### Q51. Why use timestamps instead of Date objects?
**Answer:** Timestamps (numbers) are serializable, cross-platform consistent, and easier to compare.

**Example:**
```typescript
createdAt: Date.now(), // 1234567890
updatedAt: Date.now(),
// vs
createdAt: new Date(), // Not serializable in Redux
```

**Explanation:** Avoids timezone issues, serialization problems, and simplifies sorting.

### Q52. Explain the task completion toggle logic.
**Answer:** Finds task by ID, toggles `completed` boolean, updates Realm, dispatches Redux action, triggers sync.

**Example:**
```typescript
const handleToggleComplete = async (taskId) => {
  const task = tasks.find(t => t.id === taskId);
  await realmService.updateTask(taskId, user.uid, {
    completed: !task.completed
  });
  dispatch(toggleTaskComplete(taskId));
  syncService.syncLocalToRemote();
};
```

**Explanation:** Optimistic UI update. User sees instant feedback while sync happens in background.

### Q53. Why generate task IDs client-side with BSON.ObjectId?
**Answer:** Enables offline task creation without server round-trip. ObjectId is globally unique.

**Example:**
```typescript
const id = new BSON.ObjectId().toString();
this.realm.create('Task', {
  _id: new BSON.ObjectId(),
  id, // String version for Firestore
  ...task
});
```

**Explanation:** Offline-first requirement. Server-generated IDs would require connectivity.

### Q54. How does the app handle due dates and reminders?
**Answer:** Optional `dueDate` and `reminderTime` timestamps. Reminder schedules notification, due date is display-only.

**Example:**
```typescript
if (task.reminderTime && task.reminderTime > Date.now()) {
  await notificationService.scheduleTaskReminder(
    task.id,
    task.title,
    task.reminderTime
  );
}
```

**Explanation:** Separation of concerns. Reminders are proactive, due dates are informational.

### Q55. Explain the filter counts calculation.
**Answer:** Memoized calculation counts active/completed/all tasks for filter pill badges.

**Example:**
```typescript
const getFilterCounts = useMemo(() => ({
  active: tasks.filter(t => !t.completed).length,
  completed: tasks.filter(t => t.completed).length,
  all: tasks.length
}), [tasks]);
```

**Explanation:** Shows task distribution at a glance. Memoization prevents recalculation on every render.

### Q56. Why separate `synced` and `isDeleted` flags?
**Answer:** `synced` tracks upload status, `isDeleted` tracks deletion state. Both needed for proper sync.

**Example:**
```typescript
// Deleted but not synced
{ isDeleted: true, synced: false } // Needs upload to Firestore
// Deleted and synced
{ isDeleted: true, synced: true } // Can be hard-deleted
```

**Explanation:** Ensures deletions propagate to server before permanent removal.

### Q57. How would you implement task priority levels?
**Answer:** Add `priority` field to schema, filter/sort by priority, add UI picker.

**Example:**
```typescript
// Schema
priority: { type: 'string', default: 'medium' }, // low/medium/high
// Sorting
tasks.sort((a, b) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
});
```

**Explanation:** Common feature. Requires schema migration and UI updates.

### Q58. Explain the task ownership model.
**Answer:** Each task has `userId` field. Queries filter by current user's ID. Firestore rules enforce ownership.

**Example:**
```typescript
const tasks = this.realm.objects('Task').filtered(
  'userId == $0 AND isDeleted == false',
  userId
);
```

**Explanation:** Multi-user support. Users only see their own tasks.

### Q59. Why use optional description field?
**Answer:** Not all tasks need descriptions. Optional field reduces data size and simplifies UI.

**Example:**
```typescript
description?: string; // TypeScript optional
description: 'string?', // Realm optional
```

**Explanation:** Flexibility. Users can add details when needed without forcing it.

### Q60. How does the app handle task search/filtering?
**Answer:** Currently only status filtering (all/active/completed). Search would require text filtering on title/description.

**Example:**
```typescript
// Future implementation
const searchResults = tasks.filter(task =>
  task.title.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Explanation:** Not implemented yet. Would need search input and debounced filtering.

## Performance & Optimization

### Q61. Explain FlatList optimization props used.
**Answer:** `getItemLayout` enables instant scrolling, `removeClippedSubviews` reduces memory, `windowSize` controls render buffer.

**Example:**
```typescript
<FlatList
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  })}
  removeClippedSubviews={Platform.OS === 'android'}
  windowSize={21}
  maxToRenderPerBatch={10}
/>
```

**Explanation:** Critical for large lists. Prevents lag with hundreds of tasks.

### Q62. Why use React.memo for FilterPill component?
**Answer:** Prevents re-rendering pills when unrelated state changes (e.g., task toggle). Only re-renders when props change.

**Example:**
```typescript
const FilterPill = React.memo(({ label, count, isActive, onPress, theme }) => {
  // Component logic
});
```

**Explanation:** Performance optimization. Three pills don't need re-render when task completes.

### Q63. How does the app minimize Realm queries?
**Answer:** Loads tasks once on mount, uses Redux for UI updates, only re-queries on refresh or auth change.

**Example:**
```typescript
useEffect(() => {
  loadTasks(); // Only on mount
}, [loadTasks]);
// Updates use Redux
dispatch(toggleTaskComplete(taskId));
```

**Explanation:** Realm queries are fast but not free. Redux provides instant UI updates.

### Q64. Explain the gradient rendering optimization.
**Answer:** LinearGradient is expensive. Used sparingly (header, buttons, FAB) and memoized where possible.

**Explanation:** Trade-off between aesthetics and performance. Gradients add visual polish but cost render time.

### Q65. Why use Animated.Value instead of state for animations?
**Answer:** Animated API runs on native thread, avoiding JS bridge overhead. Smoother 60fps animations.

**Example:**
```typescript
const fabScale = useRef(new Animated.Value(1)).current;
Animated.spring(fabScale, {
  toValue: 0.9,
  useNativeDriver: true
}).start();
```

**Explanation:** `useNativeDriver: true` enables native performance. State-based animations are janky.

### Q66. How does the app handle large task lists?
**Answer:** FlatList virtualization renders only visible items. Optimized with `getItemLayout` and `windowSize`.

**Explanation:** Scales to thousands of tasks. Only ~21 items rendered at once (windowSize).

### Q67. Explain the sync debouncing strategy.
**Answer:** `isSyncing` flag prevents concurrent syncs. Realm listener triggers sync, but flag ensures one at a time.

**Example:**
```typescript
if (!this.isConnected || this.isSyncing) return;
this.isSyncing = true;
// ... sync
this.isSyncing = false;
```

**Explanation:** Prevents sync storms. Multiple rapid changes trigger one sync.

### Q68. Why use `useNativeDriver` for animations?
**Answer:** Offloads animation to native thread. JS thread can be busy without affecting animation smoothness.

**Explanation:** Critical for 60fps. Animations run even if JS thread is blocked.

### Q69. How does the app minimize re-renders?
**Answer:** useCallback, useMemo, React.memo, and Redux selectors prevent unnecessary re-renders.

**Explanation:** Performance optimization. Large component trees re-render slowly.

### Q70. Explain the theme toggle performance.
**Answer:** Context API updates only components using `useTheme`. Redux stores mode for persistence.

**Explanation:** Efficient. Only themed components re-render, not entire app.

## Error Handling & Edge Cases

### Q71. How does the app handle network errors during sync?
**Answer:** Try-catch blocks catch errors, dispatch `setSyncStatus('failed')`, log error, show UI indicator.

**Example:**
```typescript
try {
  await firebaseService.syncTaskToFirestore(task);
} catch (error) {
  console.error('Sync error:', error);
  store.dispatch(setSyncStatus('failed'));
  store.dispatch(setSyncError(error.message));
}
```

**Explanation:** Graceful degradation. User sees error, can retry manually.

### Q72. What happens if Realm initialization fails?
**Answer:** Error logged, app continues but features degraded. Tasks won't persist.

**Example:**
```typescript
try {
  await realmService.init();
} catch (error) {
  console.error('Failed to initialize Realm:', error);
  // App continues, but tasks won't save
}
```

**Explanation:** Better than crash. User can still navigate, see error message.

### Q73. How does the app handle permission denial for notifications?
**Answer:** Checks permission status, shows UI message if denied, allows manual retry.

**Example:**
```typescript
const permissionGranted = await notificationService.requestPermission();
if (!permissionGranted) {
  // Show UI: "Notifications disabled. Enable in settings."
}
```

**Explanation:** User control. App works without notifications, but reminders won't fire.

### Q74. Explain the null safety pattern for user object.
**Answer:** Optional chaining and null checks prevent crashes when user is null.

**Example:**
```typescript
const { user } = useAppSelector(state => state.auth);
if (!user) return;
const tasks = await realmService.getAllTasks(user.uid);
```

**Explanation:** TypeScript helps, but runtime checks needed. User can be null during logout.

### Q75. How does the app handle Firestore quota limits?
**Answer:** Currently no handling. Production needs rate limiting, error handling, and user feedback.

**Explanation:** Firestore has read/write limits. Excessive syncing can hit quotas.

### Q76. What happens if task ID collision occurs?
**Answer:** BSON.ObjectId is globally unique (timestamp + random). Collision probability is astronomically low.

**Explanation:** ObjectId design prevents collisions. 12-byte value with 16M+ combinations.

### Q77. How does the app handle timezone differences?
**Answer:** Uses UTC timestamps (Date.now()). Display formatting would need timezone conversion.

**Example:**
```typescript
// Storage
createdAt: Date.now(), // UTC timestamp
// Display
new Date(task.createdAt).toLocaleString(); // User's timezone
```

**Explanation:** Timestamps are timezone-agnostic. Conversion happens at display time.

### Q78. Explain error handling in async initialization.
**Answer:** Each service has try-catch, errors logged but don't stop other services.

**Example:**
```typescript
try {
  await realmService.init();
} catch (error) {
  console.error('Realm init failed:', error);
}
try {
  await notificationService.initialize();
} catch (error) {
  console.error('Notification init failed:', error);
}
```

**Explanation:** Independent failures. Notification error doesn't prevent Realm usage.

### Q79. How does the app handle stale data after long offline period?
**Answer:** On reconnect, sync pulls latest from Firestore, overwrites local with remote changes.

**Explanation:** Last-write-wins. Long offline means local data likely stale.

### Q80. What happens if user deletes app and reinstalls?
**Answer:** Realm data lost, Firebase Auth persists (if not logged out). User logs in, syncs tasks from Firestore.

**Explanation:** Cloud backup. Tasks survive reinstall if synced before deletion.

## Security & Deployment

### Q81. How would you secure Firestore rules for this app?
**Answer:** Restrict read/write to authenticated users, enforce userId matching.

**Example:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Explanation:** Prevents unauthorized access. Users can only access their own tasks.

### Q82. Explain the environment configuration strategy.
**Answer:** Three .env files (dev, staging, prod) with different Firebase projects. Scripts select via ENVFILE variable.

**Example:**
```bash
# package.json
"android:dev": "ENVFILE=.env.development react-native run-android"
"android:prod": "ENVFILE=.env.production react-native run-android"
```

**Explanation:** Safe testing in dev, production isolation. No code changes needed.

### Q83. Why not commit .env files to git?
**Answer:** Contains sensitive API keys. .gitignore excludes them. Use .env.example for structure.

**Explanation:** Security best practice. Leaked keys enable unauthorized access.

### Q84. How would you implement API key rotation?
**Answer:** Update Firebase project keys, update .env files, redeploy app. Old keys remain valid during transition.

**Explanation:** Zero-downtime rotation. Both keys work until all users update.

### Q85. Explain the Android notification channel importance.
**Answer:** HIGH importance shows heads-up notifications, makes sound. Required for task reminders.

**Example:**
```typescript
await notifee.createChannel({
  id: 'task-reminders',
  name: 'Task Reminders',
  importance: AndroidImportance.HIGH,
  vibration: true
});
```

**Explanation:** Android 8+ requires channels. Importance controls notification behavior.

### Q86. How would you implement code obfuscation?
**Answer:** Enable ProGuard for Android, configure React Native obfuscation, use Hermes bytecode.

**Explanation:** Protects intellectual property. Makes reverse engineering harder.

### Q87. Explain the security implications of storing FCM token.
**Answer:** Token enables sending notifications to device. Should be stored server-side, associated with user.

**Explanation:** Token theft allows spam notifications. Server-side storage adds security layer.

### Q88. How would you implement certificate pinning?
**Answer:** Use react-native-ssl-pinning to pin Firebase certificates. Prevents MITM attacks.

**Explanation:** Advanced security. Ensures app only trusts specific certificates.

### Q89. Why use HTTPS for API_URL?
**Answer:** Encrypts data in transit. Prevents eavesdropping and tampering.

**Explanation:** Security fundamental. HTTP exposes user data.

### Q90. How would you handle sensitive data in Realm?
**Answer:** Use Realm encryption with user-specific key. Encrypts database file.

**Example:**
```typescript
const realmConfig = {
  schema: [TaskSchema],
  encryptionKey: getEncryptionKey() // 64-byte key
};
```

**Explanation:** Protects data if device stolen. Key management is critical.

## Advanced Topics

### Q91. How would you implement offline image attachments?
**Answer:** Store images in device filesystem, save path in Realm, upload to Firebase Storage on sync.

**Example:**
```typescript
// Save locally
const localPath = await saveImageToDevice(imageUri);
task.imagePath = localPath;
// Sync to cloud
const downloadUrl = await uploadToFirebaseStorage(localPath);
await firestore().doc(taskId).update({ imageUrl: downloadUrl });
```

**Explanation:** Offline-first for images. Local path for offline, cloud URL for sync.

### Q92. Explain how you'd implement collaborative tasks.
**Answer:** Add `sharedWith` array to task, update Firestore rules, listen to shared tasks.

**Example:**
```typescript
interface Task {
  sharedWith: string[]; // Array of user IDs
}
// Firestore rule
allow read: if request.auth.uid in resource.data.sharedWith;
```

**Explanation:** Multi-user tasks. Requires invitation system and conflict resolution.

### Q93. How would you implement task categories/tags?
**Answer:** Add `tags` array to schema, create tag filter UI, index for efficient queries.

**Example:**
```typescript
tags: { type: 'list', objectType: 'string' },
// Query
tasks.filtered('ANY tags == $0', selectedTag);
```

**Explanation:** Flexible organization. Users can create custom tags.

### Q94. Explain implementing recurring tasks.
**Answer:** Add `recurrence` field (daily/weekly/monthly), create next instance on completion.

**Example:**
```typescript
if (task.recurrence && task.completed) {
  const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrence);
  await createTask({
    ...task,
    completed: false,
    dueDate: nextDueDate
  });
}
```

**Explanation:** Common feature. Requires recurrence logic and UI.

### Q95. How would you implement task history/audit log?
**Answer:** Create TaskHistory schema, log changes on update, display timeline.

**Example:**
```typescript
class TaskHistory {
  taskId: string;
  action: string; // 'created' | 'updated' | 'completed'
  timestamp: number;
  changes: string; // JSON of changed fields
}
```

**Explanation:** Accountability and debugging. Shows who changed what when.

### Q96. Explain implementing push notification analytics.
**Answer:** Track notification delivery, opens, and dismissals. Send events to analytics service.

**Example:**
```typescript
notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    analytics.logEvent('notification_opened', {
      notificationId: detail.notification.id
    });
  }
});
```

**Explanation:** Measures notification effectiveness. Informs UX improvements.

### Q97. How would you implement dark mode scheduling?
**Answer:** Add time-based theme switching, use device schedule, or custom times.

**Example:**
```typescript
const hour = new Date().getHours();
const shouldBeDark = hour < 6 || hour > 18;
if (themeMode === 'auto') {
  dispatch(setTheme(shouldBeDark ? 'dark' : 'light'));
}
```

**Explanation:** User preference. Auto-switch based on time or system.

### Q98. Explain implementing task attachments with Realm.
**Answer:** Store file metadata in Realm, actual files in filesystem, sync to cloud storage.

**Example:**
```typescript
class Attachment {
  id: string;
  taskId: string;
  fileName: string;
  localPath: string;
  cloudUrl?: string;
  synced: boolean;
}
```

**Explanation:** Hybrid storage. Metadata in DB, files in filesystem.

### Q99. How would you implement task templates?
**Answer:** Create Template schema, allow users to save tasks as templates, instantiate from template.

**Example:**
```typescript
class TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
}
// Create from template
const task = await createTask({
  ...template,
  userId: user.uid,
  createdAt: Date.now()
});
```

**Explanation:** Productivity feature. Reduces repetitive task creation.

### Q100. Explain implementing cross-device sync conflict resolution.
**Answer:** Use vector clocks or CRDTs for true conflict resolution, or operational transforms.

**Example:**
```typescript
interface Task {
  version: number;
  lastModifiedBy: string;
  conflictResolution: 'last-write-wins' | 'manual';
}
// Detect conflict
if (localTask.version !== remoteTask.version) {
  // Show conflict resolution UI or apply strategy
}
```

**Explanation:** Advanced sync. Current implementation uses last-write-wins, can lose data.

---

## Summary

This React Native todo app demonstrates:
- **Offline-first architecture** with Realm + Firebase
- **Bidirectional sync** with conflict resolution
- **Redux Toolkit** for state management
- **Firebase Auth** and Firestore integration
- **Push notifications** with Notifee + FCM
- **Multi-environment** configuration
- **Performance optimizations** (memoization, FlatList, animations)
- **TypeScript** for type safety
- **Modern UI** with gradients, animations, and theming

Key architectural decisions prioritize offline functionality, user experience, and scalability.

## Additional Component & UI Questions

### Q101. Explain the form validation strategy in LoginScreen.
**Answer:** Client-side validation checks email format and password length before API call. Errors displayed per-field and globally.

**Example:**
```typescript
const validateForm = (): boolean => {
  if (!email) {
    setEmailError('Email is required');
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    setEmailError('Email is invalid');
    isValid = false;
  }
  if (password.length < 6) {
    setPasswordError('Password must be at least 6 characters');
    isValid = false;
  }
  return isValid;
};
```

**Explanation:** Prevents unnecessary API calls, provides immediate feedback. Regex validates email format. Firebase enforces 6-char minimum.

### Q102. How does the app map Firebase error codes to user-friendly messages?
**Answer:** `getFriendlyError` function maps Firebase error codes to readable messages for better UX.

**Example:**
```typescript
const getFriendlyError = (error: any) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return error.message || 'Authentication failed.';
  }
};
```

**Explanation:** Technical error codes confuse users. Friendly messages improve UX and reduce support requests.

### Q103. Why check network status before login attempt?
**Answer:** Prevents failed API calls and provides immediate feedback when offline. Shows alert instead of waiting for timeout.

**Example:**
```typescript
const handleLogin = async () => {
  if (!isConnected) {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.'
    );
    return;
  }
  // Proceed with login
};
```

**Explanation:** Better UX than Firebase timeout error. User knows immediately why login failed.

### Q104. Explain the TaskItem animation pattern.
**Answer:** Uses `Animated.Value` for scale and opacity. Fade-in on mount, scale on press for tactile feedback.

**Example:**
```typescript
const scaleAnim = useRef(new Animated.Value(1)).current;
const opacityAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(opacityAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true
  }).start();
}, []);

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.97,
    useNativeDriver: true
  }).start();
};
```

**Explanation:** Smooth entrance animation. Spring animation provides natural press feedback. Native driver ensures 60fps.

### Q105. How does TaskItem determine accent color?
**Answer:** Color based on task state: red for overdue, yellow for due today, blue for normal, green for completed.

**Example:**
```typescript
const getAccentColor = () => {
  if (isOverdue()) return theme.colors.error;
  if (isDueToday()) return theme.colors.warning;
  return theme.colors.primary;
};

const isOverdue = () => {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date();
};
```

**Explanation:** Visual priority system. Users quickly identify urgent tasks. Completed tasks show success color.

### Q106. Explain the gradient usage pattern in TaskItem.
**Answer:** Different gradients for completed vs active tasks. Adapts to light/dark theme.

**Example:**
```typescript
const getGradientColors = () => {
  const isDark = theme.colors.background === '#000000';
  if (task.completed) {
    return isDark
      ? ['rgba(28, 28, 30, 0.95)', 'rgba(44, 44, 46, 0.95)']
      : ['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.95)'];
  }
  return isDark
    ? ['rgba(28, 28, 30, 0.98)', 'rgba(44, 44, 46, 0.98)']
    : ['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)'];
};
```

**Explanation:** Subtle gradients add depth. Completed tasks have lower opacity for visual hierarchy.

### Q107. Why use React.memo for TaskItem?
**Answer:** TaskItem renders in FlatList with potentially hundreds of items. Memo prevents re-renders when props unchanged.

**Example:**
```typescript
const TaskItemComponent: React.FC<TaskItemProps> = ({ task, onToggleComplete, onPress }) => {
  // Component logic
};

export const TaskItem = React.memo(TaskItemComponent);
```

**Explanation:** Performance critical for lists. Only re-renders when task data, callbacks change. Saves CPU on filter changes.

### Q108. How does the sync indicator work in TaskItem?
**Answer:** Shows small dot when `task.synced === false`. Visual feedback for pending uploads.

**Example:**
```typescript
{!task.synced && (
  <View style={styles.syncContainer}>
    <View
      style={[
        styles.syncIndicator,
        { backgroundColor: theme.colors.warning }
      ]}
    />
  </View>
)}
```

**Explanation:** Users see which tasks haven't synced. Useful for debugging sync issues. Warning color indicates pending state.

### Q109. Explain the date formatting logic in TaskItem.
**Answer:** Converts timestamps to relative dates (Today/Tomorrow) or formatted dates for better readability.

**Example:**
```typescript
const formatDate = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
```

**Explanation:** Relative dates are more intuitive. Users understand "Today" faster than "Nov 25". Fallback to formatted date for future dates.

### Q110. How does OfflineBanner animation work?
**Answer:** Slides down from top when offline, slides up when online. Uses spring animation for natural motion.

**Example:**
```typescript
const slideAnim = useRef(new Animated.Value(-100)).current;

useEffect(() => {
  if (!isConnected) {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  } else {
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true
    }).start();
  }
}, [isConnected]);
```

**Explanation:** Non-intrusive notification. Spring animation feels natural. Auto-hides when online. Uses safe area insets for notch support.

### Q111. Why use `pointerEvents="none"` on OfflineBanner?
**Answer:** Banner is informational only, shouldn't block touches to underlying UI.

**Example:**
```typescript
<Animated.View
  style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
  pointerEvents="none"
>
  <View style={styles.content}>
    <Text>Offline</Text>
  </View>
</Animated.View>
```

**Explanation:** Users can still interact with app while banner visible. Prevents accidental taps on banner.

### Q112. Explain the KeyboardAvoidingView usage in LoginScreen.
**Answer:** Adjusts layout when keyboard appears, preventing input fields from being hidden.

**Example:**
```typescript
<KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    <Input label="Email" />
    <Input label="Password" />
  </ScrollView>
</KeyboardAvoidingView>
```

**Explanation:** iOS uses padding, Android uses height adjustment. `keyboardShouldPersistTaps="handled"` allows tapping buttons while keyboard open.

### Q113. How does the Button component handle disabled state with gradients?
**Answer:** Switches gradient to grayscale when disabled, maintains visual consistency.

**Example:**
```typescript
<LinearGradient
  colors={disabled ? ['#9CA3AF', '#4B5563'] : gradientColors}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.gradientButton}
>
  {content}
</LinearGradient>
```

**Explanation:** Disabled state clearly visible. Grayscale indicates non-interactive. Prevents confusion when form invalid.

### Q114. Why separate loading state in LoginScreen (local + Redux)?
**Answer:** Local state controls button spinner, Redux state for global loading indicator. Different scopes.

**Example:**
```typescript
const [loading, setLoadingState] = useState(false);

const handleLogin = async () => {
  setLoadingState(true); // Button spinner
  dispatch(setLoading(true)); // Global state
  try {
    await firebaseService.signIn(email, password);
  } finally {
    setLoadingState(false);
    dispatch(setLoading(false));
  }
};
```

**Explanation:** Button needs immediate feedback. Redux state could be used by other components (e.g., global loader).

### Q115. Explain the error clearing pattern in LoginScreen.
**Answer:** Clears auth error when user types, providing clean slate for new attempt.

**Example:**
```typescript
<Input
  value={email}
  onChangeText={text => {
    setEmail(text);
    setAuthError(''); // Clear error on input
  }}
  error={emailError}
/>
```

**Explanation:** Prevents stale error messages. User sees fresh validation on next submit. Better UX than persistent errors.

### Q116. How does the app handle platform-specific styling?
**Answer:** Uses `Platform.select` for iOS/Android differences in shadows, elevation, behavior.

**Example:**
```typescript
...Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  android: {
    elevation: 4
  }
})
```

**Explanation:** iOS uses shadow properties, Android uses elevation. Platform.select keeps code clean. Ensures native look on each platform.

### Q117. Why use LinearGradient for auth screens background?
**Answer:** Creates visually appealing, modern UI. Gradients adapt to theme (light/dark).

**Example:**
```typescript
<LinearGradient
  colors={
    isDark
      ? ['#0A84FF', '#0066CC', '#1C1C1E']
      : ['#007AFF', '#5AC8FA', '#F5F5F7']
  }
  style={styles.gradient}
>
  {/* Auth form */}
</LinearGradient>
```

**Explanation:** Branded appearance. Dark mode uses darker blues, light mode uses brighter colors. Creates depth and visual interest.

### Q118. Explain the icon usage pattern in Input components.
**Answer:** Emoji icons provide visual context without icon library dependency. Lightweight and universal.

**Example:**
```typescript
<Input
  label="Email"
  leftIcon={<Text style={styles.icon}>✉️</Text>}
/>
<Input
  label="Password"
  leftIcon={<Text style={styles.icon}>🔒</Text>}
/>
```

**Explanation:** No icon library needed. Emojis work cross-platform. Adds personality and improves scannability.

### Q119. How does the app handle text truncation in TaskItem?
**Answer:** Uses `numberOfLines` prop to prevent overflow, maintains consistent item height.

**Example:**
```typescript
<Text
  style={[styles.title, { color: theme.colors.text }]}
  numberOfLines={2}
>
  {task.title}
</Text>
{task.description && (
  <Text
    style={[styles.description, { color: theme.colors.textSecondary }]}
    numberOfLines={2}
  >
    {task.description}
  </Text>
)}
```

**Explanation:** Prevents layout breaking with long text. Ellipsis indicates more content. Users tap to see full text in detail view.

### Q120. Explain the accent border pattern in TaskItem.
**Answer:** Colored left border provides visual priority indicator without overwhelming the design.

**Example:**
```typescript
<View
  style={[
    styles.accentBorder,
    {
      backgroundColor: task.completed
        ? theme.colors.success
        : getAccentColor(),
      opacity: task.completed ? 0.5 : 1
    }
  ]}
/>
```

**Explanation:** Subtle but effective. Color-coded priority (overdue=red, today=yellow, normal=blue). Completed tasks have muted accent.

## Additional State Management Questions

### Q121. Why use separate error states for email and password?
**Answer:** Enables field-specific error messages, better UX than single form error.

**Example:**
```typescript
const [emailError, setEmailError] = useState('');
const [passwordError, setPasswordError] = useState('');

if (!email) {
  setEmailError('Email is required');
} else if (!/\S+@\S+\.\S+/.test(email)) {
  setEmailError('Email is invalid');
}
```

**Explanation:** User knows exactly which field has issue. Can fix one field without re-validating entire form.

### Q122. How does the sync status auto-reset work?
**Answer:** After successful sync, status resets to idle after 3 seconds using setTimeout.

**Example:**
```typescript
store.dispatch(setSyncStatus('succeeded'));
store.dispatch(setLastSyncedAt(Date.now()));

setTimeout(() => {
  store.dispatch(setSyncStatus('idle'));
}, 3000);
```

**Explanation:** Shows "Synced" confirmation briefly, then clears. Prevents stale status badges. Users see feedback without permanent clutter.

### Q123. Explain the network state structure in Redux.
**Answer:** Stores connection status, type (wifi/cellular), and internet reachability separately.

**Example:**
```typescript
interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

dispatch(setNetworkState({
  isConnected: state.isConnected ?? false,
  type: state.type,
  isInternetReachable: state.isInternetReachable ?? null
}));
```

**Explanation:** `isConnected` means device has network, `isInternetReachable` means internet access. Can be connected to wifi without internet.

### Q124. Why use `??` (nullish coalescing) for network state?
**Answer:** NetInfo can return null/undefined. Nullish coalescing provides safe defaults.

**Example:**
```typescript
isConnected: state.isConnected ?? false,
isInternetReachable: state.isInternetReachable ?? null
```

**Explanation:** `??` only coalesces null/undefined, not false. Different from `||` which coalesces falsy values. Preserves false as valid value.

### Q125. How does the app handle rapid filter changes?
**Answer:** useMemo prevents re-filtering until dependencies change. Filter state updates immediately.

**Example:**
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
}, [tasks, filter]);
```

**Explanation:** Clicking filters updates Redux state instantly. Memoization prevents unnecessary filtering. Only recalculates when tasks or filter actually change.

## Additional Performance Questions

### Q126. Explain the FlatList `windowSize` optimization.
**Answer:** Controls how many screens of content to render. Default 21 means 10 above, 10 below, 1 visible.

**Example:**
```typescript
<FlatList
  data={filteredTasks}
  windowSize={21}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
/>
```

**Explanation:** Larger windowSize = more memory, smoother scrolling. Smaller = less memory, possible blank areas during fast scroll. 21 is good balance.

### Q127. Why use `removeClippedSubviews` only on Android?
**Answer:** iOS has different rendering optimization. Android benefits from clipping off-screen views.

**Example:**
```typescript
<FlatList
  removeClippedSubviews={Platform.OS === 'android'}
/>
```

**Explanation:** Reduces memory on Android by unmounting off-screen items. iOS handles this differently. Platform-specific optimization.

### Q128. How does `getItemLayout` improve FlatList performance?
**Answer:** Tells FlatList exact item dimensions, enabling instant scroll-to-position without measuring.

**Example:**
```typescript
const ITEM_HEIGHT = 100;

const getItemLayout = (_, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index
});
```

**Explanation:** FlatList can calculate scroll position mathematically. No need to render/measure items. Critical for smooth scrolling in large lists.

### Q129. Explain the gradient rendering trade-off.
**Answer:** Gradients are expensive to render. Used strategically for visual impact vs performance.

**Example:**
```typescript
// Used: Header, buttons, FAB, task items
<LinearGradient colors={[...]} />

// Not used: Simple backgrounds, borders, text
<View style={{ backgroundColor: theme.colors.background }} />
```

**Explanation:** Gradients add polish but cost render time. Use for key UI elements. Solid colors for less important areas.

### Q130. How does the app optimize theme changes?
**Answer:** Context API updates only components using `useTheme`. Redux stores mode for persistence.

**Example:**
```typescript
// Only components calling useTheme re-render
const { theme, isDark } = useTheme();

// Redux persists preference
const themeMode = useAppSelector(state => state.theme.mode);
```

**Explanation:** Efficient re-rendering. Components not using theme don't update. Separation of concerns: Context for reactivity, Redux for persistence.

