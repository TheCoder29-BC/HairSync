import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Den Task-Namen aus deinem Hintergrund-Handler importieren
import { BACKGROUND_NOTIFICATION_TASK } from './backgroundNotificationHandler';

// ─── 1) Konfiguration für Foreground-Notifications ───────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener     = useRef();

  useEffect(() => {
    // a) Push-Token holen & Background-Task registrieren
    registerForPushNotificationsAsync();

    // b) Listener – wenn eine Notification eintrifft (App im Vordergrund)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      Alert.alert(title, body);
    });

    // c) Listener – wenn der User auf eine Notification klickt
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('✅ Notification angeklickt:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        HairSync Mobile mit Expo-Notifications läuft…
      </Text>
    </View>
  );
}

/**
 * Registriert Push-Permissions, holt den Expo-Push-Token,
 * legt den Android-Channel an und registriert den Background-Task.
 */
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('⚠️ Push-Notifications nur auf echtem Gerät möglich');
    return;
  }

  // 1) Permissions prüfen/anforderung
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('❌ Push-Permissions verweigert');
    return;
  }

  // 2) Expo-Push-Token holen
  const { data: token } = await Notifications.getExpoPushTokenAsync();
  console.log('🎟️ Expo Push Token:', token);

  // 3) Android-Channel einrichten
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:             'default',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#FF231F7C',
    });
  }

  // 4) Hintergrund-Task registrieren
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log('✅ Hintergrund-Task registriert:', BACKGROUND_NOTIFICATION_TASK);
  } catch (err) {
    console.warn('⚠️ Fehler beim Registrieren des Hintergrund-Tasks:', err);
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        16,
  },
  text: {
    fontSize:  18,
    textAlign: 'center',
  },
});
