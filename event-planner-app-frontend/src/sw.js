import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title || "TripTrack", {
        body: data.message || "You have a new update.",
        icon: new URL("/android-chrome-192x192.png", self.location.origin).href,
        badge: new URL("/favicon-32x32.png", self.location.origin).href,
        vibrate: [100, 50, 100],

        data: {
          url: data.url || "/",
        },
      }),
    );
  } catch (error) {
    console.error("Error parsing push notification data:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const origin = self.location.origin;

        for (const client of clientList) {
          if (new URL(client.url).origin === origin && "focus" in client) {
            if ("navigate" in client && typeof client.navigate === "function") {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
