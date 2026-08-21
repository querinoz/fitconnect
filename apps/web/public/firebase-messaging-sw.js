/* FitConnect FCM background worker.
 * Loads public Firebase config from the same origin. Do not put secrets here.
 */
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js");

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

fetch("/api/v1/firebase/public-config")
  .then(function (response) {
    return response.json();
  })
  .then(function (payload) {
    if (!payload || !payload.configured || !payload.app) return;
    firebase.initializeApp(payload.app);
    var messaging = firebase.messaging();
    messaging.onBackgroundMessage(function (remote) {
      var title =
        (remote.notification && remote.notification.title) ||
        (remote.data && remote.data.title) ||
        "FitConnect";
      var body =
        (remote.notification && remote.notification.body) ||
        (remote.data && remote.data.body) ||
        "";
      return self.registration.showNotification(title, {
        body: body,
        data: remote.data || {},
        icon: "/brand/fitconnect-logo-256.png"
      });
    });
  })
  .catch(function () {
    /* Stay silent when Firebase is not configured. */
  });
