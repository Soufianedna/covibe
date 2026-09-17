import OneSignal from '@onesignal/capacitor-plugin';
import { Capacitor } from '@capacitor/core';

export const requestPushPermission = async () => {
  if (!Capacitor.isNativePlatform()) return;
  const canRequest = await OneSignal.Notifications.canRequestPermission();
  if (!canRequest) return;
  await OneSignal.Notifications.requestPermission(false);
};
