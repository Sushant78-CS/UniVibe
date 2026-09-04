import {
  getMessaging,
  isSupported,
  onMessage,
  onRegistered,
  register,
} from "firebase/messaging";

import api from "../api/axios";
import { app } from "./config";
import { getToken } from "@clerk/react";

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

let fcmInitializationPromise: Promise<boolean | null> | null = null;

async function getFcmMessaging() {
  const supported = await isSupported();

  if (!supported) {
    console.warn("Firebase Cloud Messaging is not supported in this browser.");
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }

  return messagingInstance;
}

export function initializeFcm() {
  if (!fcmInitializationPromise) {
    fcmInitializationPromise = initializeFcmInternal();
  }

  return fcmInitializationPromise;
}

async function initializeFcmInternal() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  if (!("Notification" in window)) {
    console.warn("Browser notifications are not supported.");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported.");
    return null;
  }

  const messaging = await getFcmMessaging();

  if (!messaging) {
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.warn("Notification permission was not granted.");
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  onRegistered(messaging, async (fid) => {
    console.log("UniVibe Firebase Installation ID:", fid);

    try {
      const token = await getToken();

      if (!token) {
        console.warn("No authentication token available for FCM registration.");
        return;
      }

      await api.post(
        "/fcm/register",
        {
          fid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("FCM installation registered with UniVibe backend.");
    } catch (error) {
      console.error("Failed to register FCM with server:", error);
    }
  });

  await register(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  console.log("FCM registration completed.");

  return true;
}

export async function initializeForegroundMessages() {
  const messaging = await getFcmMessaging();

  if (!messaging) {
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("UniVibe foreground FCM message:", payload);

    const title =
      payload.data?.title || payload.notification?.title || "UniVibe";

    const body = payload.data?.body || payload.notification?.body || "";

    const url = payload.data?.url || "/home";

    if (Notification.permission !== "granted") {
      console.warn("Browser notification permission is not granted.");
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: "/favicon.svg",
    });

    notification.onclick = () => {
      notification.close();
      window.focus();
      window.location.href = url;
    };
  });
}

export async function enablePushNotifications(
  getToken: () => Promise<string | null>,
) {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("Browser environment is required.");
  }

  const messaging = await getFcmMessaging();

  if (!messaging) {
    throw new Error(
      "Firebase Cloud Messaging is not supported in this browser.",
    );
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  onRegistered(messaging, async (fid) => {
    console.log("UniVibe Firebase Installation ID:", fid);

    const token = await getToken();

    if (!token) {
      throw new Error("Clerk authentication token is unavailable.");
    }

    const response = await fetch("http://localhost:8080/fcm/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fid,
      }),
    });

    if (!response.ok) {
      throw new Error(`FCM registration failed: ${response.status}`);
    }

    console.log("FCM installation registered with UniVibe backend.");
  });

  await register(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return true;
}

export async function disablePushNotifications() {
  const registration = await navigator.serviceWorker.getRegistration("/");

  if (registration) {
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }
  }

  console.log("Push notifications disabled for this browser.");
}
