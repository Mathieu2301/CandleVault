import { register } from 'register-service-worker';
import 'firebase/messaging';

/* eslint-disable no-console */

/** @type {import('firebase').default} */
const firebase = window.firebase;

/** @type {import('firebase').default.auth.Auth} */
const auth = window.auth;

/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

/** @type {import('izitoast').default} */
const toast = window.toast;

register(`${process.env.BASE_URL}sw.js`, {
  ready() {
    console.log('App is being served from cache by a service worker.');
  },
  registered(serviceWorkerRegistration) {
    const fcm = firebase.messaging();

    auth.onAuthStateChanged((fUser) => {
      if (!fUser) return;
      fcm.getToken({ serviceWorkerRegistration }).then(async (token) => {
        const doc = db
          .collection('candlevault_users')
          .doc(fUser.uid)
          .collection('pushTokens')
          .doc(token);

        if (!(await doc.get()).exists) doc.set({ UA: navigator.userAgent });
      }).catch(() => {
        console.error('PushToken error');
        toast.warning({ title: 'Notifications disabled !' });
      });
    });
  },
  cached() {
    console.log('Content has been cached for offline use.');
  },
  updatefound() {
    console.log('New content is downloading.');
  },
  updated(rg) {
    console.log('New content is available; please refresh.');
    rg.waiting.postMessage({ type: 'update' });
  },
  offline() {
    console.log('No internet connection found. App is running in offline mode.');
  },
  error(error) {
    console.error('Error during service worker registration:', error);
  },
});
