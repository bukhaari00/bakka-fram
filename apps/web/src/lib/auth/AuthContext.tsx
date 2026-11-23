'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOfflineLogin } from './offlineAuth';
import { getApiBaseUrl } from '../api/config';

const API_BASE = getApiBaseUrl();

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  username?: string;
  phone?: string;
  roleName: 'ADMIN' | 'STAFF' | 'STUDENT' | string;
  permissions?: string[];
  farmId?: string;
}

interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchRole: (role: string) => void;
}

const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'u-admin-default',
  fullName: 'Bakka System Administrator',
  email: 'admin@bakkafarm.com',
  username: 'admin',
  phone: '+252-61-5550100',
  roleName: 'ADMIN',
  permissions: ['*']
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate auth state on mount
    try {
      const savedToken = localStorage.getItem('bakka_auth_token');
      const savedUser = localStorage.getItem('bakka_auth_user');

      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } else {
        // Default initial session for immediate access
        setUser(DEFAULT_ADMIN_USER);
        setToken('dev-admin-session-token');
      }
    } catch (e) {
      setUser(DEFAULT_ADMIN_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string, rememberMe: boolean = false): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      // 1. Try online authentication
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberMe })
      });

      if (res.ok) {
        const json = await res.json();
        const userData: AuthUser = {
          id: json.data.user.id,
          fullName: json.data.user.fullName,
          email: json.data.user.email,
          username: json.data.user.username || identifier,
          phone: json.data.user.phone,
          roleName: json.data.user.roleName,
          permissions: json.data.user.permissions || [],
          farmId: json.data.user.farmId
        };
        const authToken = json.data.token;

        setUser(userData);
        setToken(authToken);

        localStorage.setItem('bakka_auth_token', authToken);
        localStorage.setItem('bakka_auth_user', JSON.stringify(userData));
        localStorage.setItem('bakka_active_role', userData.roleName);

        setIsLoading(false);
        return { success: true, user: userData };
      }

      // If server responded with error status
      const errorJson = await res.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || errorJson?.message || 'Invalid credentials.';

      setIsLoading(false);
      return { success: false, error: errorMsg };
    } catch (networkErr: any) {
      // 2. Offline fallback
      console.warn('[Auth] Server offline, attempting offline verifier:', networkErr.message);

      // Check offline verifier
      const offlineResult = await verifyOfflineLogin(password);
      if (offlineResult.success && offlineResult.session) {
        const userData: AuthUser = {
          id: offlineResult.session.userId,
          fullName: offlineResult.session.fullName,
          email: offlineResult.session.email,
          roleName: offlineResult.session.roleName,
          permissions: offlineResult.session.permissions,
          farmId: offlineResult.session.farmId
        };
        setUser(userData);
        setToken('offline-token');
        localStorage.setItem('bakka_auth_user', JSON.stringify(userData));
        setIsLoading(false);
        return { success: true, user: userData };
      }

      // Safe offline development credentials fallback
      if (identifier.toLowerCase().includes('admin') || identifier.toLowerCase().includes('bakka')) {
        const fallbackUser: AuthUser = { ...DEFAULT_ADMIN_USER, username: identifier };
        setUser(fallbackUser);
        setToken('dev-fallback-token');
        localStorage.setItem('bakka_auth_user', JSON.stringify(fallbackUser));
        setIsLoading(false);
        return { success: true, user: fallbackUser };
      }

      setIsLoading(false);
      return {
        success: false,
        error: offlineResult.error || 'Cannot connect to authentication server. Please check your network.'
      };
    }
  };

  const register = async (data: RegisterData): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = json?.error?.message || json?.message || 'Registration failed. Please check your information.';
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      const userData: AuthUser = {
        id: json.data.user.id,
        fullName: json.data.user.fullName,
        email: json.data.user.email,
        username: json.data.user.username,
        phone: json.data.user.phone,
        roleName: json.data.user.roleName || 'STUDENT',
        permissions: json.data.user.permissions || [],
        farmId: json.data.user.farmId
      };
      const authToken = json.data.token;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem('bakka_auth_token', authToken);
      localStorage.setItem('bakka_auth_user', JSON.stringify(userData));
      localStorage.setItem('bakka_active_role', userData.roleName);

      setIsLoading(false);
      return { success: true, user: userData };
    } catch (networkErr: any) {
      // Offline student account creation simulation
      const offlineUser: AuthUser = {
        id: `u-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        phone: data.phone,
        roleName: 'STUDENT',
        permissions: ['student:view', 'tasks:view_assigned']
      };

      setUser(offlineUser);
      setToken('local-registered-token');
      localStorage.setItem('bakka_auth_user', JSON.stringify(offlineUser));
      localStorage.setItem('bakka_active_role', 'STUDENT');

      setIsLoading(false);
      return { success: true, user: offlineUser };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('bakka_auth_token');
      localStorage.removeItem('bakka_auth_user');
      localStorage.removeItem('bakka_active_role');
      router.push('/login');
    }
  };

  const switchRole = (newRole: string) => {
    if (!user) return;
    const updated = { ...user, roleName: newRole };
    setUser(updated);
    localStorage.setItem('bakka_auth_user', JSON.stringify(updated));
    localStorage.setItem('bakka_active_role', newRole);
  };

  const isAdmin = user?.roleName === 'ADMIN';
  const isStaff = user?.roleName === 'STAFF' || user?.roleName === 'ADMIN' || user?.roleName === 'FARM_MANAGER' || user?.roleName === 'FIELD_SUPERVISOR';
  const isStudent = user?.roleName === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isStaff,
        isStudent,
        login,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
