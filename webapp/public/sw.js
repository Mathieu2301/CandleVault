importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');

self.addEventListener('fetch', (e) => {
  e.respondWith(async function() {
    const normalizedUrl = new URL(e.request.url);
    normalizedUrl.search = '';

    if (
      (
        !normalizedUrl.hostname.includes('candlevault')
        && !normalizedUrl.hostname.includes('fonts')
      )
      || normalizedUrl.protocol === 'chrome-extension:'
    ) {
      // console.log('FETCHING', e.request);
      return fetch(e.request);
    }
    // } else console.log('CACHING', e.request);

    const fetchResponseP = fetch(e.request);
    const fetchResponseCloneP = fetchResponseP.then(r => r.clone());

    e.waitUntil((async () => {
      const cache = await caches.open('app');
      await cache.put(e.request, await fetchResponseCloneP);
    })());

    return (await caches.match(e.request)) || fetchResponseP;
  }());
});

self.addEventListener('message', async (e) => {
  if (!e.data || !e.data.type) return;
  if (e.data.type === 'update') {
    await caches.delete('app');
    return self.skipWaiting();
  }
});

firebase.initializeApp({
  apiKey: 'AIzaSyBR7DCsR_W3C3OHY8QRpTkQXk8Pcd7Do_E',
  authDomain: 'iridium-blast.firebaseapp.com',
  databaseURL: 'https://iridium-blast.firebaseio.com',
  projectId: 'iridium-blast',
  storageBucket: 'iridium-blast.appspot.com',
  messagingSenderId: '273479070895',
  appId: '1:273479070895:web:f6dbc723ae36d690f6d05a',
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  return self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    badge: './icons/notif.png',
    icon: './icons/256.png',
    image: payload.data.image,
    lang: payload.data.lang,
    timestamp: payload.data.timestamp,
    actions: JSON.parse(payload.data.actions ?? '[]'),
    renotify: true,
    tag: payload.data.tag,
    vibrate: [100, 50, 100],
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll().then((clientList) => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url == `./${e.notification.tag}` && 'focus' in client) return client.focus();
    }

    if (clients.openWindow) return clients.openWindow(`./${e.notification.tag}`);
  }));
});
