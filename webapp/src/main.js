import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/firestore';
import izitoast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import app from './app.vue';

window.toast = izitoast;
window.toast.settings({
  position: 'bottomRight',
});

window.toast.confirm = (message, cb, config = {}) => {
  window.toast.show({
    theme: 'dark',
    title: 'Confirm ?',
    message,
    layout: 2,
    position: 'center',
    maxWidth: '70%',
    backgroundColor: '#344d61',
    progressBarColor: '#00db92',
    overlay: true,
    overlayClose: true,
    timeout: 8000,
    buttons: [
      ['<button>Confirm</button>', (inst, toast) => {
        cb();
        inst.hide({ transitionOut: 'fadeOutDown' }, toast);
      }],
      ['<button>Abort</button>', (inst, toast) => inst.hide({ transitionOut: 'fadeOutDown' }, toast)],
    ],
    ...config,
  });
};

firebase.initializeApp({
  apiKey: 'AIzaSyBR7DCsR_W3C3OHY8QRpTkQXk8Pcd7Do_E',
  authDomain: 'iridium-blast.firebaseapp.com',
  databaseURL: 'https://iridium-blast.firebaseio.com',
  projectId: 'iridium-blast',
  storageBucket: 'iridium-blast.appspot.com',
  messagingSenderId: '273479070895',
  appId: '1:273479070895:web:f6dbc723ae36d690f6d05a',
});

window.firebase = firebase;
window.auth = firebase.auth();
window.db = firebase.firestore();

window.auth.useDeviceLanguage();

// eslint-disable-next-line
if (window.location.protocol === 'https:') import('./registerServiceWorker');

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'CandleVault',
      component: () => import('./pages/main.vue'),
      children: [
        { path: ':market', component: () => import('./pages/market.vue') },
        { path: ':market/:action', component: () => import('./pages/marketAction.vue') },
      ],
    },
    {
      path: '/:path(.*)',
      redirect: '/',
    },
  ],
});

createApp(app).use(router).mount('#app');
