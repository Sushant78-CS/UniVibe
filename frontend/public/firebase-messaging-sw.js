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
    icon: "/favicon-package/icon-192.png",
    badge: "/favicon-package/favicon-96x96.png",
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
        // UniVibe is already open
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus().then(() => {
              if ("navigate" in client) {
                const targetUrl = new URL(url, self.location.origin).href;

                return client.navigate(targetUrl);
              }
            });
          }
        }

        // UniVibe is not open
        const startUrl = new URL(
          `/home?notificationUrl=${encodeURIComponent(url)}`,
          self.location.origin,
        ).href;

        return clients.openWindow(startUrl);
      }),
  );
});
