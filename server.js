const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const root = path.resolve(__dirname);
const dataFile = path.join(root, 'server-data.json');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    const initialData = {
      portfolioGames: [],
      editedDefaultGames: {},
      deletedDefaultGames: [],
      contentBackup: {}
    };
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (err) {
    console.error('Error reading data file:', err);
    return { portfolioGames: [], editedDefaultGames: {}, deletedDefaultGames: [], contentBackup: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function applySavedChanges(htmlContent) {
  try {
    const data = readData();
    let modifiedHtml = htmlContent;

    // Aplicar cambios de contenido editado
    if (data.contentBackup) {
      Object.entries(data.contentBackup).forEach(([elementId, content]) => {
        // Crear un patrón para encontrar el elemento por ID y reemplazar su contenido
        const pattern = new RegExp(`(<[^>]*id="${elementId}"[^>]*>)(.*?)(</[^>]*>)`, 's');
        modifiedHtml = modifiedHtml.replace(pattern, `$1${content}$3`);
      });
    }

    // Inyectar datos del portfolio si estamos en la página de portfolio
    if (htmlContent.includes('portfolio.html') || htmlContent.includes('portfolio-grid-modern')) {
      modifiedHtml = injectPortfolioData(modifiedHtml, data);
    }

    return modifiedHtml;
  } catch (error) {
    console.error('Error applying saved changes:', error);
    return htmlContent; // Devolver HTML original si hay error
  }
}

function injectPortfolioData(htmlContent, data) {
  // Crear un script que sobrescriba los datos del portfolio
  const portfolioScript = `
    <script>
      // Datos del portfolio inyectados por el servidor
      window.serverPortfolioData = ${JSON.stringify({
        portfolioGames: data.portfolioGames || [],
        editedDefaultGames: data.editedDefaultGames || {},
        deletedDefaultGames: data.deletedDefaultGames || []
      })};
    </script>
  `;

  // Inyectar el script antes del cierre del body
  return htmlContent.replace('</body>', portfolioScript + '</body>');
}

function applyPortfolioChanges(htmlContent, data) {
  // Esta función ya no es necesaria, los cambios se aplican vía JavaScript
  return htmlContent;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    let content = data;

    // Si es un archivo HTML, aplicar cambios guardados
    if (ext === '.html') {
      content = applySavedChanges(data.toString());
    }

    // Headers para evitar cache durante desarrollo
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    res.writeHead(200, headers);
    res.end(content);
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Strip /app prefix for frontend routes
  if (pathname.startsWith('/app')) {
    pathname = pathname.slice(4); // Remove '/app' prefix
    if (pathname === '') pathname = '/'; // If just /app, serve index.html
  }

  if (pathname === '/api/portfolio' && req.method === 'GET') {
    const data = readData();
    sendJson(res, 200, data);
    return;
  }

  // Endpoint para verificar estado del servidor (útil para desarrollo)
  if (pathname === '/api/status' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    return;
  }

  if (pathname === '/api/content' && req.method === 'GET') {
    const data = readData();
    sendJson(res, 200, { contentBackup: data.contentBackup || {} });
    return;
  }

  if (pathname === '/api/content' && req.method === 'PUT') {
    try {
      const payload = await parseRequestBody(req);
      const data = readData();
      const { id, content } = payload;

      if (!id || typeof content !== 'string') {
        sendJson(res, 400, { error: 'Faltan datos: id o content' });
        return;
      }

      data.contentBackup = data.contentBackup || {};
      data.contentBackup[id] = content;
      writeData(data);
      sendJson(res, 200, { message: 'Contenido guardado' });
    } catch (err) {
      sendJson(res, 400, { error: 'JSON inválido' });
    }
    return;
  }

  if (pathname === '/api/portfolio/custom' && req.method === 'POST') {
    try {
      const gameData = await parseRequestBody(req);
      const data = readData();
      data.portfolioGames.push(gameData);
      writeData(data);
      sendJson(res, 201, { message: 'Juego creado', index: data.portfolioGames.length - 1 });
    } catch (err) {
      sendJson(res, 400, { error: 'JSON inválido' });
    }
    return;
  }

  const customMatch = pathname.match(/^\/api\/portfolio\/custom\/(\d+)$/);
  if (customMatch) {
    const index = parseInt(customMatch[1], 10);
    const data = readData();

    if (req.method === 'PUT') {
      try {
        const gameData = await parseRequestBody(req);
        if (!data.portfolioGames[index]) {
          sendJson(res, 404, { error: 'Juego no encontrado' });
          return;
        }
        data.portfolioGames[index] = gameData;
        writeData(data);
        sendJson(res, 200, { message: 'Juego actualizado' });
      } catch (err) {
        sendJson(res, 400, { error: 'JSON inválido' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      if (!data.portfolioGames[index]) {
        sendJson(res, 404, { error: 'Juego no encontrado' });
        return;
      }
      data.portfolioGames.splice(index, 1);
      writeData(data);
      sendJson(res, 200, { message: 'Juego eliminado' });
      return;
    }
  }

  const defaultMatch = pathname.match(/^\/api\/portfolio\/default\/(\d+)$/);
  if (defaultMatch) {
    const index = parseInt(defaultMatch[1], 10);
    const data = readData();

    if (req.method === 'PUT') {
      try {
        const gameData = await parseRequestBody(req);
        data.editedDefaultGames[index] = gameData;
        writeData(data);
        sendJson(res, 200, { message: 'Juego por defecto actualizado' });
      } catch (err) {
        sendJson(res, 400, { error: 'JSON inválido' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      if (!data.deletedDefaultGames.includes(index)) {
        data.deletedDefaultGames.push(index);
        writeData(data);
      }
      sendJson(res, 200, { message: 'Juego por defecto eliminado' });
      return;
    }
  }

  // Serve static assets with clean URLs
  let filePath;
  
  if (pathname === '/' || pathname === '') {
    filePath = path.join(root, 'index.html');
  } else if (pathname.endsWith('/')) {
    filePath = path.join(root, pathname, 'index.html');
  } else {
    // Try the exact file first
    filePath = path.join(root, pathname);
    
    // If file doesn't exist and doesn't have an extension, try adding .html
    if (!fs.existsSync(filePath) && !path.extname(pathname)) {
      const htmlFilePath = path.join(root, pathname + '.html');
      if (fs.existsSync(htmlFilePath)) {
        filePath = htmlFilePath;
      }
    }
  }

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    sendFile(res, filePath);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
