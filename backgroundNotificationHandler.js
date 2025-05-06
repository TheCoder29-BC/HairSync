// backgroundNotificationHandler.js
import * as TaskManager   from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

// 1) Exportiere den Task-Namen
export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// 2) Definiere nur den Task
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    if (error) {
      console.error('↪️ Background task error:', error);
      return;
    }
    console.log('↪️ Background notification received:', data);
    // Optional: lokal eine Notification auslösen
    Notifications.presentNotificationAsync({
      title: data.notification?.title,
      body:  data.notification?.body,
    });
  }
);
