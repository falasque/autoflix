// ✅ Service Worker com LIMPEZA FORÇADA de cache antigo

const CACHE_VERSION = 'v7'; // FORÇAR LIMPEZA TOTAL
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
];

// 🧩 Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => console.warn('SW: Falha ao fazer cache inicial:', err))
  );
  self.skipWaiting();
});

// 🧹 Ativação e limpeza AGRESSIVA de versões antigas
self.addEventListener('activate', (event) => {
  console.log(`🔥 [SW v${CACHE_VERSION.substring(1)}] Ativando e limpando caches antigos...`);
  
  event.waitUntil(
    caches.keys().then(keys => {
      console.log(`📦 Caches encontrados:`, keys);
      
      const cachesToDelete = keys.filter(key => 
        ![STATIC_CACHE, IMAGE_CACHE, API_CACHE].includes(key)
      );
      
      console.log(`🗑️ Deletando ${cachesToDelete.length} caches antigos:`, cachesToDelete);
      
      return Promise.all(
        cachesToDelete.map(key => {
          console.log(`   🔴 Deletando cache: ${key}`);
          return caches.delete(key);
        })
      );
    }).then(() => {
      console.log(`✅ [SW v${CACHE_VERSION.substring(1)}] Caches antigos removidos!`);
      return self.clients.claim();
    })
  );
});

// 🚀 Intercepta requisições
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // Imagens (externas ou locais)
  if (req.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    event.respondWith(cacheFirstImage(req));
    return;
  }

  // APIs e XML
  if (url.pathname.includes('xml') || url.hostname.includes('api.') || url.pathname.includes('/api/')) {
    event.respondWith(networkFirstApi(req));
    return;
  }

  // Recursos estáticos locais
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

// 🖼️ Estratégia Cache First para imagens
async function cacheFirstImage(req) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // CRÍTICO: Detectar S3 ANTES de verificar cache
  const url = new URL(req.url);
  const isS3 = url.hostname.includes('s3.carro57.com.br') || 
               url.hostname.includes('carro57') ||
               url.pathname.includes('/FC/11466/');
  
  console.log(`🖼️ [SW] cacheFirstImage:`, {
    url: url.href,
    isS3,
    hostname: url.hostname,
    pathname: url.pathname
  });
  
  // Se é imagem S3, SEMPRE buscar da rede (network-first)
  if (isS3) {
    console.log(`🌐 [SW] É S3! Network-first...`);
    try {
      const res = await fetch(req, { 
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache' // Força buscar imagem fresca
      });
      
      if (res && res.ok) {
        console.log(`✅ [SW] S3 carregada com sucesso!`);
        cache.put(req, res.clone()).catch(() => {});
        return res;
      }
      throw new Error('S3 response inválida');
    } catch (err) {
      console.error(`❌ [SW] Erro ao carregar S3:`, err);
      // Se é S3 e falhou, tentar cache como fallback
      const cached = await cache.match(req);
      if (cached) {
        console.log(`💾 [SW] Retornando S3 do cache (fallback)`);
        return cached;
      }
      // Se não tem cache, deixa falhar (não usar empreparacao.png)
      throw err;
    }
  }
  
  // Para imagens locais, cache-first normal
  console.log(`💾 [SW] NÃO É S3. Cache-first...`);
  const cached = await cache.match(req);
  if (cached) {
    console.log(`✅ [SW] Retornando do cache`);
    return cached;
  }

  try {
    console.log(`🌐 [SW] Cache miss, buscando da rede...`);
    const res = await fetch(req, { 
      mode: 'no-cors',
      credentials: 'omit'
    });
    
    if (!res || !res.ok) throw new Error('Response inválida');
    cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch (err) {
    console.warn(`⚠️ [SW] Erro ao carregar imagem local, usando fallback`);
    // Fallback apenas para imagens locais
    try {
      const fallback = await fetch('/empreparacao.png');
      return fallback;
    } catch {
      // SVG fallback final
      return new Response(
        `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
  }
}

// 🌐 Network First para APIs/XML
async function networkFirstApi(req) {
  const cache = await caches.open(API_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) {
      cache.put(req, fresh.clone()).catch(() => {});
      return fresh;
    }
    throw new Error('Response não ok');
  } catch {
    const cached = await cache.match(req);
    return cached || new Response('Offline', { status: 503 });
  }
}

// ⚡ Stale-While-Revalidate para estáticos locais
async function staleWhileRevalidate(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || networkPromise;
}
