// Plugin Vite para salvar dados dos veículos localmente
import fs from 'fs';
import path from 'path';

export function saveVehiclesPlugin() {
  return {
    name: 'save-vehicles',
    configureServer(server) {
      server.middlewares.use('/api/save-vehicles', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const publicPath = path.resolve(process.cwd(), 'public', 'vehicles-data.json');
              fs.writeFileSync(publicPath, JSON.stringify(data, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
              console.log('💾 Dados dos veículos salvos em:', publicPath);
            } catch (error) {
              console.error('❌ Erro ao salvar dados:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save data' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}