import {
  deleteToken as deleteFcmToken,
  getMessaging,
  getToken as getFcmToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

import api from "../api/axios";
import { app } from "./config";

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

// ==========================================
// GET FIREBASE MESSAGING INSTANCE
// ==========================================

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

// ==========================================
// INITIALIZE FCM
// ==========================================

export async function initializeFcm() {
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

  if (Notification.permission !== "granted") {
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  console.log("Firebase messaging service worker registered.", registration);

  return true;
}

// ==========================================
// FOREGROUND MESSAGES
// ==========================================

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

// ==========================================
// ENABLE PUSH NOTIFICATIONS
// ==========================================

export async function enablePushNotifications(
  getClerkToken: () => Promise<string | null>,
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

  // ----------------------------------------
  // PERMISSION
  // ----------------------------------------

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  // ----------------------------------------
  // SERVICE WORKER
  // ----------------------------------------

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  console.log("Firebase messaging service worker registered.", registration);

  // ----------------------------------------
  // GET ACTUAL FCM TOKEN
  // ----------------------------------------

  const fcmToken = await getFcmToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,

    serviceWorkerRegistration: registration,
  });

  if (!fcmToken) {
    throw new Error("Firebase did not return an FCM registration token.");
  }

  console.log("UniVibe FCM registration token obtained.");

  // ----------------------------------------
  // GET CLERK AUTH TOKEN
  // ----------------------------------------

  const clerkToken = await getClerkToken();

  if (!clerkToken) {
    throw new Error("Clerk authentication token is unavailable.");
  }

  // ----------------------------------------
  // REGISTER FCM TOKEN WITH BACKEND
  // ----------------------------------------

  console.log("Registering FCM token with UniVibe backend...");

  await api.post(
    "/fcm/register",
    {
      token: fcmToken,
    },
    {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  );

  console.log("FCM token registered with UniVibe backend.");

  return true;
}

// ==========================================
// DISABLE PUSH NOTIFICATIONS
// ==========================================

export async function disablePushNotifications(
  getClerkToken: () => Promise<string | null>,
) {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return;
  }

  const messaging = await getFcmMessaging();

  if (!messaging) {
    return;
  }

  // ----------------------------------------
  // GET CURRENT FCM TOKEN
  // ----------------------------------------

  let fcmToken: string | null = null;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");

    if (registration) {
      fcmToken = await getFcmToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,

        serviceWorkerRegistration: registration,
      });
    }
  } catch (error) {
    console.warn("Could not get current FCM token:", error);
  }

  // ----------------------------------------
  // REMOVE TOKEN FROM BACKEND
  // ----------------------------------------

  if (fcmToken) {
    try {
      const clerkToken = await getClerkToken();

      if (clerkToken) {
        await api.delete("/fcm/unregister", {
          data: {
            token: fcmToken,
          },

          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        });

        console.log("FCM token removed from UniVibe backend.");
      }
    } catch (error) {
      console.error("Failed to remove FCM token from backend:", error);
    }
  }

  // ----------------------------------------
  // DELETE FCM TOKEN FROM FIREBASE
  // ----------------------------------------

  try {
    await deleteFcmToken(messaging);

    console.log("FCM token deleted from Firebase.");
  } catch (error) {
    console.error("Failed to delete FCM token:", error);
  }

  console.log("Push notifications disabled.");
}
