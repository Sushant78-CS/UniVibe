importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyA811Nkn85SCucEVZt8U8nhscVOCFohqOw",
  authDomain: "univibe-b70bc.firebaseapp.com",
  projectId: "univibe-b70bc",
  storageBucket: "univibe-b70bc.firebasestorage.app",
  messagingSenderId: "703826479766",
  appId: "1:703826479766:web:1234567890abcdef",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const title = payload.notification?.title || payload.data?.title || "UniVibe";

  const body = payload.notification?.body || payload.data?.body || "";

  const url = payload.data?.url || "/home";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: {
      url,
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/home";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }

        return undefined;
      }),
  );
});
