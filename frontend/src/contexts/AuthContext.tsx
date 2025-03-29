import { createContext, useState, ReactNode, useContext } from 'react';
const baseUrl = 'http://localhost:8080';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  login: (username: string, password: string) => Promise<void>;
  request: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('token')
  );

  const login = async (username: string, password: string): Promise<void> => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid username or password');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const request = async (url: string, options?: RequestInit) => {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      logout();
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        request,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
