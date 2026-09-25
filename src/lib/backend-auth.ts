// Serviço de autenticação via API backend
const API_URL = import.meta.env.VITE_API_URL || 'https://api.autoflix.com.br';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  expiresIn?: number;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

export const backendAuth = {
  /**
   * Faz login via API do backend
   */
  login: async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token) {
        // Salva o token no localStorage
        localStorage.setItem('admin-token', data.token);
        console.log('✅ Login realizado com sucesso via backend!');
        return true;
      }

      console.log('❌ Login falhou:', data.message);
      return false;
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      return false;
    }
  },

  /**
   * Verifica se está autenticado
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data: VerifyResponse = await response.json();

      if (!data.success) {
        // Token inválido ou expirado, remove do localStorage
        localStorage.removeItem('admin-token');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      // Em caso de erro de rede, assume que está autenticado se tem token
      return true;
    }
  },

  /**
   * Verifica se está autenticado (versão síncrona que só checa localStorage)
   */
  isAuthenticatedSync: (): boolean => {
    const token = localStorage.getItem('admin-token');
    return !!token;
  },

  /**
   * Faz logout
   */
  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    } finally {
      // Remove o token do localStorage
      localStorage.removeItem('admin-token');
      console.log('✅ Logout realizado');
    }
  },

  /**
   * Limpa dados de autenticação
   */
  clearAuthData: (): void => {
    localStorage.removeItem('admin-token');
    console.log('Dados de autenticação limpos');
  },
};
