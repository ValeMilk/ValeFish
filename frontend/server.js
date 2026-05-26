const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  console.log(`📍 ${req.method} ${req.url}`);

  // Servir arquivos estáticos
  let filePath = path.join(DIST_DIR, req.url);
  
  // Se é uma rota SPA, servir index.html
  if (req.url === '/' || (!path.extname(filePath) && !req.url.startsWith('.'))) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // Se arquivo não existe, servir index.html (SPA)
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        }
      });
    } else {
      const contentType = getContentType(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  return types[ext] || 'application/octet-stream';
}

server.listen(PORT, () => {
  console.log(`🚀 Frontend server rodando em http://localhost:${PORT}`);
  console.log(`📁 Servindo arquivos de: ${DIST_DIR}`);
  console.log(`📝 Nota: /api/* será roteado pelo Nginx para http://localhost:4000`);
});


