// Simple local proxy for GraphQL requests
const http = require('http');
const https = require('https');
const url = require('url');
const { Buffer } = require('buffer');

const TARGET = 'https://steam.seventh.space/graphql/';
const PORT = 4000;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': 86400,
    });
    res.end();
    return;
  }

  if ((req.url === '/graphql' || req.url === '/graphql/') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      console.log(`[${new Date().toISOString()}] Proxying request to ${TARGET}`);
      const options = url.parse(TARGET);
      options.method = 'POST';
      options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      };
      const proxyReq = https.request(options, proxyRes => {
        console.log(`[${new Date().toISOString()}] Proxied response status: ${proxyRes.statusCode}`);
        res.writeHead(proxyRes.statusCode, {
          ...proxyRes.headers,
          'Access-Control-Allow-Origin': '*',
        });
        proxyRes.pipe(res, { end: true });
      });
      proxyReq.on('error', err => {
        console.error(`[${new Date().toISOString()}] Proxy error:`, err);
        res.writeHead(500);
        res.end('Proxy error: ' + err.message);
      });
      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
  console.warn(`[${new Date().toISOString()}] 404 Not found: ${req.method} ${req.url}`);
  res.writeHead(404);
  res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Local GraphQL proxy running on http://localhost:${PORT}/graphql`);
});
