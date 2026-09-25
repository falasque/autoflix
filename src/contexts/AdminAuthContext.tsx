import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAuth } from '@/lib/auth';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se já está autenticado ao carregar
    const checkAuth = () => {
      const authenticated = adminAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (password: string): boolean => {
    const success = adminAuth.login(password);
    if (success) {
      setIsAuthenticated(true);
    }
    return success;
  };

  const logout = (): void => {
    adminAuth.logout();
    setIsAuthenticated(false);
  };

  const value: AdminAuthContextType = {
    isAuthenticated,
    login,
    logout,
    isLoading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};