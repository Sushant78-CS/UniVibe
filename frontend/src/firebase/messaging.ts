import {
  getMessaging,
  isSupported,
  onMessage,
  onRegistered,
  register,
} from "firebase/messaging";

import api from "../api/axios";
import { app } from "./config";

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

let fcmInitializationPromise: Promise<boolean | null> | null = null;

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

  // Do not automatically ask for permission here.
  // Permission should be requested from Settings / prompt.

  if (Notification.permission !== "granted") {
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  onRegistered(messaging, async (fid) => {
    console.log("UniVibe Firebase Installation ID:", fid);

    try {
      console.log("Registering FCM installation with backend...");

      const token = await getClerkTokenSafely();

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

  // ----------------------------------------
  // FCM REGISTRATION
  // ----------------------------------------

  onRegistered(messaging, async (fid) => {
    console.log("UniVibe Firebase Installation ID:", fid);

    try {
      // Use the Clerk token passed by SettingsPage
      const token = await getToken();

      if (!token) {
        throw new Error("Clerk authentication token is unavailable.");
      }

      console.log("Sending FCM installation to UniVibe backend...");

      // IMPORTANT:
      // Do NOT use localhost here.
      // Axios already points to your configured
      // Render backend in production.
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

      throw error;
    }
  });

  await register(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,

    serviceWorkerRegistration: registration,
  });

  console.log("FCM push notifications enabled.");

  return true;
}

// ==========================================
// DISABLE PUSH NOTIFICATIONS
// ==========================================

export async function disablePushNotifications() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration("/");

  if (registration) {
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }
  }

  console.log("Push notifications disabled for this browser.");
}

// ==========================================
// SAFE CLERK TOKEN
// ==========================================
//
// Used only by initializeFcm().
// enablePushNotifications() receives getToken
// directly from the React component.
//
// ==========================================

async function getClerkTokenSafely(): Promise<string | null> {
  return null;
}
