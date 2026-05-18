// ============================================================
// AROGYA-SWARM HMS — Authentication Context
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, LoginPayload, RegisterPayload } from '../types';
import { authAPI } from '../api/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const savedToken = localStorage.getItem('hms_token');
    const savedName = localStorage.getItem('hms_name');
    const savedRole = localStorage.getItem('hms_role');
    if (savedToken && savedName && savedRole) {
      setToken(savedToken);
      setUser({ id: 0, name: savedName, email: '', role: savedRole as User['role'] });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    const res = await authAPI.login(data);
    localStorage.setItem('hms_token', res.token);
    localStorage.setItem('hms_name', res.user.name);
    localStorage.setItem('hms_role', res.user.role);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    await authAPI.register(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_name');
    localStorage.removeItem('hms_role');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!token,
      isLoading,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ── Protected Route Component ──
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    if (!isLoading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-light)' }}></i>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
};
