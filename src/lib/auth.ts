import CryptoJS from 'crypto-js';

// Configuração local do login legado (valores incluídos no bundle do navegador).
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || "";

// Chave secreta para localStorage (use uma chave mais complexa em produção)
const SECRET_KEY = import.meta.env.VITE_ADMIN_STORAGE_KEY || "";

// Flag de debug (desativado em produção)
const DEBUG = false;

if (DEBUG) {
  console.log('Hash SHA1 de "admin123":', CryptoJS.SHA1('admin123').toString());
  console.log('Hash esperado:', ADMIN_PASSWORD_HASH);
  console.log('Hashes coincidem:', CryptoJS.SHA1('admin123').toString() === ADMIN_PASSWORD_HASH);
}

export const adminAuth = {
  // Verifica se está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('admin-token');
    if (!token) return false;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(token, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const data = JSON.parse(decrypted);
      
      // Verifica se o token não expirou (válido por 24 horas)
      const now = new Date().getTime();
      const isValid = data.expires > now;
      
      // Se o token expirou, remove do localStorage
      if (!isValid) {
        localStorage.removeItem('admin-token');
      }
      
      return isValid;
    } catch (error) {
      // Se houve erro ao descriptografar, remove o token corrompido
      if (DEBUG) console.warn('Token corrompido removido:', error);
      localStorage.removeItem('admin-token');
      return false;
    }
  },

  // Faz login com senha
  login: (password: string): boolean => {
    const hashedPassword = CryptoJS.SHA1(password).toString();
    
    if (DEBUG) {
      console.log('Tentativa de login:');
      console.log('Senha digitada:', password);
      console.log('Hash gerado:', hashedPassword);
      console.log('Hash esperado:', ADMIN_PASSWORD_HASH);
      console.log('Hashes coincidem:', hashedPassword === ADMIN_PASSWORD_HASH);
    }
    
    if (hashedPassword === ADMIN_PASSWORD_HASH) {
      const token = {
        authenticated: true,
        expires: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 horas
        timestamp: new Date().getTime()
      };
      
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(token), SECRET_KEY).toString();
      localStorage.setItem('admin-token', encrypted);
      if (DEBUG) console.log('Login realizado com sucesso!');
      return true;
    }
    
    if (DEBUG) console.log('Login falhou - hashes não coincidem');
    return false;
  },

  // Faz logout
  logout: (): void => {
    localStorage.removeItem('admin-token');
  },

  // Gera um novo hash de senha (utilitário para desenvolvimento)
  generatePasswordHash: (password: string): string => {
    return CryptoJS.SHA1(password).toString();
  },

  // Limpa dados corrompidos (utilitário para debug)
  clearAuthData: (): void => {
    localStorage.removeItem('admin-token');
    console.log('Dados de autenticação limpos');
  },

  // Debug: mostra informações do token atual
  debugToken: (): void => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      console.log('Nenhum token encontrado');
      return;
    }
    
    try {
      const decrypted = CryptoJS.AES.decrypt(token, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const data = JSON.parse(decrypted);
      const now = new Date().getTime();
      
      console.log('Token info:', {
        authenticated: data.authenticated,
        expires: new Date(data.expires).toLocaleString(),
        timestamp: new Date(data.timestamp).toLocaleString(),
        isExpired: data.expires <= now,
        timeRemaining: Math.max(0, data.expires - now) + 'ms'
      });
    } catch (error) {
      console.log('Erro ao ler token:', error);
    }
  }
};

// Expor funções de debug globalmente (apenas em desenvolvimento)
if (typeof window !== 'undefined') {
  (window as any).adminAuthDebug = {
    clearAuthData: adminAuth.clearAuthData,
    debugToken: adminAuth.debugToken,
    generateHash: adminAuth.generatePasswordHash,
    testLogin: (password: string) => {
      console.log('Testando login com senha:', password);
      return adminAuth.login(password);
    }
  };
}