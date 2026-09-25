/**
 * Serviço para sanitizar e processar URLs de imagens
 * Remove placeholders e substitui por fallback apropriado
 */

const PLACEHOLDER_URLS = [
  'https://via.placeholder.com/400x300?text=No+Image',
  'https://via.placeholder.com/',
  '/placeholder-car.svg'
];

const FALLBACK_IMAGE = '/empreparacao.png';

/**
 * Verifica se uma URL é um placeholder
 */
export function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  
  const urlString = url.toString().trim();
  
  // Lista específica de placeholders conhecidos
  const knownPlaceholders = [
    'via.placeholder.com',
    '/placeholder-car.svg',
    '/placeholder.svg',
    'No+Image'
  ];
  
  // Verifica apenas placeholders conhecidos (não genérico)
  for (const placeholder of knownPlaceholders) {
    if (urlString.includes(placeholder)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sanitiza URL de imagem removendo placeholders
 * Retorna a URL limpa ou o fallback se for placeholder
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return FALLBACK_IMAGE;
  }
  
  const urlString = url.toString().trim();
  
  // Se for placeholder, retorna fallback
  if (isPlaceholderImage(urlString)) {
    return FALLBACK_IMAGE;
  }
  
  // Se a URL está vazia ou é muito curta, retorna fallback
  if (urlString.length < 10) {
    return FALLBACK_IMAGE;
  }
  
  // Retorna URL limpa
  return urlString;
}

/**
 * Processa array de URLs de imagens
 * Remove placeholders e duplicatas
 */
export function sanitizeImageUrls(urls: (string | null | undefined)[]): string[] {
  if (!Array.isArray(urls)) {
    return [FALLBACK_IMAGE];
  }
  
  const sanitized: string[] = [];
  const seen = new Set<string>();
  
  for (const url of urls) {
    if (!url) continue;
    
    // Se for placeholder, pula (não adiciona)
    if (isPlaceholderImage(url)) {
      continue;
    }
    
    const cleaned = sanitizeImageUrl(url);
    
    // Evita duplicatas
    if (!seen.has(cleaned)) {
      sanitized.push(cleaned);
      seen.add(cleaned);
    }
  }
  
  // Se nenhuma URL válida foi encontrada, retorna fallback
  if (sanitized.length === 0) {
    sanitized.push(FALLBACK_IMAGE);
  }
  
  return sanitized;
}

/**
 * Retorna a imagem de fallback padrão
 */
export function getFallbackImage(): string {
  return FALLBACK_IMAGE;
}
