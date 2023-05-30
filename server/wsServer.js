const WebSocketServer = require('websocket').server;
const http = require('http');
const config = require('./src/config');

let incomming = {};
setInterval(() => {
  // Reset 'incomming' list every 5 minutes
  incomming = {};
}, 300000);

const httpServer = http.createServer((rq, rs) => {
  if (rq.url === '/ping') rs.end('pong');
});

httpServer.listen(config.PORT);

exports.server = new WebSocketServer({ httpServer });

exports.server.on('request', async (rq) => {
  const ip = rq.remoteAddresses.join('@');
  console.log('Connect', ip);

  if (incomming[ip] && (Date.now() - incomming[ip].last) < (5000 / incomming[ip].i)) {
    console.log('Banned IP', ip);
    rq.reject(403);
    return;
  }

  if (!incomming[ip]) incomming[ip] = { i: 0 };
  incomming[ip].l = Date.now();
  incomming[ip].l += 1;

  if (!rq.origin || !rq.origin.includes('/')) {
    console.log('Wrong request: no origin', rq.origin);
    rq.reject(400);
    return;
  }

  const originHost = rq.origin.split('/');

  if (!originHost || !originHost[2] || ![
    'dev.candlevault.com:8080',
    'candlevault.web.app',
  ].includes(originHost[2])) {
    console.log('Wrong origin', originHost);
    rq.reject(400);
    return;
  }

  rq.accept();
});
