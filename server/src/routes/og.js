import express from 'express';
import { format as formatUrl } from 'url';

const router = express.Router();

// Detect common social crawlers
const SOCIAL_BOTS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /WhatsApp/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /TelegramBot/i,
  /Discordbot/i,
  /Slackbot-LinkExpanding/i,
  /Discordbot/i,
  /Googlebot/i,
  /bingbot/i
];

function isSocialBot(ua) {
  if (!ua) return false;
  return SOCIAL_BOTS.some((r) => r.test(ua));
}

function formatPriceBRL(price) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  } catch (e) {
    return `R$ ${price}`;
  }
}

// GET /og/veiculo/:slug
router.get('/veiculo/:slug', async (req, res) => {
  try {
    const ua = req.get('User-Agent') || '';
    const { slug } = req.params;

    // If not a crawler, redirect to the SPA URL
    if (!isSocialBot(ua)) {
      return res.redirect(302, `/veiculo/${slug}`);
    }

    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).send('DB not initialized');
    }

    // Query vehicle by slug
    const vehicle = await db.get('SELECT * FROM vehicles WHERE slug = ?', [slug]);
    if (!vehicle) {
      return res.status(404).send('Vehicle not found');
    }

    const images = await db.all('SELECT image_url FROM vehicle_images WHERE vehicle_id = ? ORDER BY position', [vehicle.id]);
    const mainImage = (images && images.length > 0) ? images[0].image_url : '/logobranco.svg';

    // Make absolute URLs
    const origin = req.protocol + '://' + req.get('host');
    const absoluteImage = mainImage.startsWith('http') ? mainImage : `${origin}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
    const url = `${origin}/veiculo/${slug}`;

    const title = `${(vehicle.name || '').toString().toUpperCase()} - AUTOFLIX MULTIMARCAS`;
    const description = `${(vehicle.name || '').toString().toUpperCase()} ${vehicle.year || ''} em excelente estado. Preço: ${formatPriceBRL(vehicle.price || 0)}. Veículos seminovos com garantia em Curitiba.`;

    // Render minimal HTML with meta tags
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(absoluteImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(absoluteImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="AUTOFLIX MULTIMARCAS" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(absoluteImage)}" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  ${JSON.stringify({
      '@context':'https://schema.org',
      '@type':'Product',
      name: vehicle.name,
      description: description,
      image: absoluteImage,
      url: url,
      brand: { '@type': 'Brand', name: vehicle.brand || 'AUTOFLIX MULTIMARCAS' },
      offers: { '@type': 'Offer', price: vehicle.price || 0, priceCurrency: 'BRL', availability: 'https://schema.org/InStock', url }
    })}
  </script>

  <!-- Redirect human users to SPA -->
  <meta http-equiv="refresh" content="0; url=${escapeHtml(url)}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(absoluteImage)}" alt="${escapeHtml(title)}" />
  <p>Redirecionando...</p>
</body>
</html>`);

  } catch (error) {
    console.error('Error generating OG meta:', error);
    res.status(500).send('Internal error');
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default router;
