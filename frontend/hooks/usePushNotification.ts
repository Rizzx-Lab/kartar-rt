'use client';

import { useCallback } from 'react';
import { getPushVapidKey, subscribePush, unsubscribePush } from '@/lib/admin-api';

// Convert a base64 string to Uint8Array for the push subscription
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to web push notifications.
 * Fetches VAPID public key from backend, requests browser permission,
 * creates push subscription, and saves it to the backend.
 * Fails silently if push is not supported or permission is denied.
 */
export async function subscribe(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!('PushManager' in window)) return;

  try {
    // Check current permission
    const permission = Notification.permission;
    if (permission === 'denied') return; // Silent fail
    if (permission === 'granted') {
      // Already subscribed at browser level, just sync with backend
      await subscribeToBackend();
      return;
    }

    // Request permission
    const result = await Notification.requestPermission();
    if (result !== 'granted') return; // Silent fail

    // Permission granted, subscribe
    await subscribeToBackend();
  } catch (error) {
    // Silent fail for any unexpected errors
    console.warn('Push subscription failed silently:', error);
  }
}

async function subscribeToBackend(): Promise<void> {
  // Fetch VAPID public key from backend (never hardcoded)
  const publicKey = await getPushVapidKey();
  if (!publicKey) return; // Silent fail if key fetch fails

  const registration = await navigator.serviceWorker.ready;

  // Check if already subscribed at browser level
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    // Already subscribed, sync endpoint to backend
    const subJson = existingSubscription.toJSON();
    await subscribePush(subJson);
    return;
  }

  // Create new subscription
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Save to backend
  const subJson = subscription.toJSON();
  await subscribePush(subJson);
}

/**
 * Unsubscribe from web push notifications.
 * Calls backend DELETE endpoint and unsubscribes from browser push manager.
 * Fails silently.
 */
export async function unsubscribe(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!('PushManager' in window)) return;

  try {
    // Call backend to remove subscription
    await unsubscribePush();
  } catch (error) {
    console.warn('Push unsubscribe failed silently:', error);
  }
}

// Custom hook for convenient usage in React components
export function usePushNotification() {
  return {
    subscribe: useCallback(subscribe, []),
    unsubscribe: useCallback(unsubscribe, []),
  };
}
