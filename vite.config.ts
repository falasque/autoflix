import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { saveVehiclesPlugin } from "./src/lib/vite-save-plugin";
import fs from "fs";

// Plugin para copiar arquivos estáticos críticos
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const filesToCopy = [
        { src: 'public/force-update.html', dest: 'dist/force-update.html' },
      ];

      filesToCopy.forEach(({ src, dest }) => {
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`✅ Copiado: ${src} → ${dest}`);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy para resolver CORS com o XML
      '/api/xml': {
        target: 'https://app.revendamais.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xml/, '/application/index.php/apiGeneratorXml/generator/sitedaloja'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },

    }
  },
  plugins: [react(), saveVehiclesPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // CORREÇÃO: Não limpar pasta dist automaticamente (evita conflito com arquivos do servidor)
    emptyOutDir: false,
    // Otimizações de build
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar'],
          'query': ['@tanstack/react-query'],
          'icons': ['lucide-react', 'react-icons'],
          'utils': ['clsx', 'class-variance-authority', 'tailwind-merge'],
        },
        // Otimizar nomes de arquivos
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Aumentar limite de chunks
    chunkSizeWarningLimit: 1000,
    // Sourcemaps só em dev
    sourcemap: mode === 'development',
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
    ],
  },
  // Cache de dependências
  cacheDir: '.vite',
}));
