# Task Reminder Notifications Feature

## Overview

Implemented a task reminder notification system that works even when the app is closed or killed, similar to an alarm app.

## Features Implemented

### 1. **Date-Time Picker Component**

- Created `DateTimePicker.tsx` component for selecting reminder times
- Supports both iOS and Android native pickers
- Allows clearing/removing reminder
- Shows formatted date and time
- Minimum date set to current date (prevents past dates)

### 2. **Notification Scheduling**

- Integrated with `@notifee/react-native` for local notifications
- Notifications are scheduled using exact alarms (`allowWhileIdle: true`)
- Works even when app is closed/killed
- Includes sound, vibration, and timestamp

### 3. **Database Schema**

- Task schema already includes `reminderTime` field (timestamp in milliseconds)
- Stores scheduled notification time for each task

### 4. **User Interface Updates**

#### Add Task Screen

- Added "Reminder Time (Optional)" picker
- Schedules notification when task is created with a reminder time

#### Edit Task Screen

- Shows existing reminder time if set
- Allows editing reminder time
- Cancels old notification and schedules new one when updated

#### Task Detail Screen

- Displays reminder time in a formatted way
- Shows "Not set" if no reminder
- Cancels notification when task is deleted

### 5. **Notification Persistence**

- Notifications are rescheduled on app startup
- Handles device reboot (requires `RECEIVE_BOOT_COMPLETED` permission)
- Only reschedules notifications with future times

### 6. **Android Permissions**

The following permissions were added to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## How It Works

### Creating a Task with Reminder

1. User creates a new task
2. Optionally selects a reminder date/time using the DateTimePicker
3. When saved, the app:
   - Stores the task with `reminderTime` in Realm database
   - Schedules a local notification using Notifee
   - Syncs to Firebase

### Notification Delivery

1. At the scheduled time, Android's AlarmManager triggers the notification
2. The notification appears with:
   - Title: "⏰ Task Reminder"
   - Body: Task title
   - Sound, vibration, and visual alerts
3. Works even if:
   - App is closed
   - App is killed/force stopped
   - Device was rebooted (notifications are rescheduled on boot)

### Editing/Deleting Tasks

- **Edit**: Cancels old notification, schedules new one if reminder time is set
- **Delete**: Cancels the notification to prevent orphaned reminders

### App Restart Handling

On app startup, the app:

1. Fetches all tasks from local database
2. Filters tasks with future reminder times
3. Reschedules notifications for those tasks
4. This ensures notifications persist after app updates or device reboots

## Dependencies Added

- `@react-native-community/datetimepicker` - Native date/time picker component

## Technical Details

### Notification Channel

- **ID**: `task-reminders`
- **Name**: Task Reminders
- **Importance**: HIGH
- **Features**: Sound, vibration, timestamp

### iOS Critical Notifications

- Configured for critical alerts (requires user permission)
- Critical volume set to maximum
- Bypasses Do Not Disturb mode

### Android Exact Alarms

- Uses `allowWhileIdle` flag to ensure delivery
- Requires exact alarm permission (granted on Android 12+)
- Survives device sleep and doze mode

## Testing

### Test Scenarios

1. **Basic Notification**: Set reminder 1-2 minutes in future, close app, wait for notification
2. **App Killed**: Force stop app, notification should still appear at scheduled time
3. **Edit Reminder**: Change reminder time, verify old notification is cancelled
4. **Delete Task**: Delete task with reminder, verify notification doesn't appear
5. **App Restart**: Restart app, verify future notifications are rescheduled
6. **Past Date**: Verify cannot select past dates in picker

### For iOS

Run: `cd ios && pod install` to install native dependencies

### For Android

The app should work without additional setup. Test exact alarm permissions on Android 13+.

## Notes

- Notifications use local storage (Realm) as source of truth
- Each notification ID is prefixed with `task-` followed by task ID
- Future enhancement: Add recurring reminders
- Future enhancement: Snooze functionality
