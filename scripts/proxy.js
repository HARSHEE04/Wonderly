import http from 'http';

const PORT = 9000;
const BACKEND = { host: 'localhost', port: 4000 };
const FRONTEND = { host: 'localhost', port: 8090 };

const server = http.createServer((req, res) => {
  const target = req.url.startsWith('/api') ? BACKEND : FRONTEND;
  const proxyReq = http.request(
    { ...target, method: req.method, path: req.url, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );
  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end('Bad gateway');
  });
  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`proxy listening on ${PORT}, /api -> :4000, everything else -> :8090`);
});
