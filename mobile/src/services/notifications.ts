// ============================================
// Anchor Daily - Push Notification Service
// ============================================
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification handler
// NotificationBehavior requires shouldShowBanner and shouldShowList
// in addition to the legacy shouldShowAlert field.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Request push notification permissions and register for push notifications.
 * Returns the Expo push token if successful.
 */
export async function registerForPushNotifications(
  userId?: string
): Promise<string | null> {
  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Save token to database if user is authenticated
    if (userId && token) {
      await supabase
        .from('users')
        .update({ push_token: token, push_enabled: true })
        .eq('id', userId);
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reflection', {
        name: 'Daily Reflection',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C9A8E',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Schedule a local daily reminder notification.
 * This is a fallback for when push notifications from the server are not set up.
 */
export async function scheduleDailyReminder(hour: number = 8, minute: number = 0) {
  // Cancel existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your daily moment is ready',
      body: 'Take a quiet moment to reflect and find peace in your day.',
      data: { screen: 'Today' },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
