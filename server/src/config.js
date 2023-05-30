const envGet = require('./env');

module.exports = {
  FIREBASE_CREDENTIALS: JSON.parse(envGet('FIREBASE_CREDENTIALS')),
  FIREBASE_DB: envGet('FIREBASE_DB'),
  CORR: envGet('CORR', 0),
  PORT: envGet('PORT', 4000),
};
