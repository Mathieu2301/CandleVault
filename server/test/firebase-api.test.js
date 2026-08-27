const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');

const admin = require('firebase-admin');

// Pins the exact firebase-admin surface main.js and backgroundHelper.js rely on,
// so a major-version bump of the SDK is verified rather than assumed. Purely
// offline: building clients makes no network calls.
function fakeServiceAccount() {
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  return {
    project_id: 'candlevault-test',
    client_email: 'test@candlevault-test.iam.gserviceaccount.com',
    private_key: privateKey,
  };
}

const app = admin.initializeApp({
  credential: admin.credential.cert(fakeServiceAccount()),
  databaseURL: 'https://candlevault-test.firebaseio.com',
}, 'api-surface-check');

test('credential.cert + initializeApp accept a service account', () => {
  assert.ok(app, 'app should be created');
});

test('auth().verifyIdToken exists', () => {
  assert.strictEqual(typeof admin.auth(app).verifyIdToken, 'function');
});

test('messaging().send exists', () => {
  assert.strictEqual(typeof admin.messaging(app).send, 'function');
});

test('firestore query surface used by the agent exists', () => {
  const db = admin.firestore(app);
  const coll = db.collection('candlevault_users');

  assert.strictEqual(typeof coll.doc, 'function');
  assert.strictEqual(typeof coll.where, 'function');
  assert.strictEqual(typeof coll.get, 'function');
  assert.strictEqual(typeof coll.onSnapshot, 'function');
  assert.strictEqual(typeof coll.orderBy, 'function');
  assert.strictEqual(typeof coll.limit, 'function');

  // Nested subcollection: db.collection(x).doc(y).collection('pushTokens')
  assert.strictEqual(typeof coll.doc('u').collection('pushTokens').get, 'function');

  // The chained filter used for the transaction listener.
  assert.strictEqual(typeof coll.where('state', '==', 'WAITING').onSnapshot, 'function');

  // array-contains-any, used by scanCryptos.
  assert.strictEqual(typeof coll.where('markets', 'array-contains-any', ['BTCEUR']).get, 'function');

  // The '!=' operator used in the websocket auth path.
  assert.strictEqual(typeof coll.where('state', '!=', 'CLOSED').get, 'function');
});

test('FieldValue.increment exists on the namespaced export', () => {
  assert.strictEqual(typeof admin.firestore.FieldValue.increment, 'function');
  assert.ok(admin.firestore.FieldValue.increment(5));
});
