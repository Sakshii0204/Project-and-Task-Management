import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend HttpOnly cookie on mount
  useEffect(() => {
    let isMounted = true;
    apiService
      .getMe()
      .then((user) => {
        if (isMounted) {
          setCurrentUser(user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const user = await apiService.getMe();
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Real backend login via POST /api/auth/login
   * Backend sets HttpOnly authentication cookie
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await apiService.login(email, password);
      setCurrentUser(user);
      return { success: true, user };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real backend logout via POST /api/auth/logout
   * Backend clears HttpOnly authentication cookie
   */
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setCurrentUser(null);
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    try {
      const updated = await apiService.updateUser(currentUser.id, updates);
      setCurrentUser(updated);
      return updated;
    } catch {
      // Optimistic fallback for frontend presentation
      const fallback = { ...currentUser, ...updates };
      setCurrentUser(fallback);
      return fallback;
    }
  };

  const role = currentUser?.role;
  const rawRole = currentUser?.rawRole;

  const isAdmin = role === 'Admin' || rawRole === 'ADMIN';
  const isProjectManager = role === 'Project Manager' || rawRole === 'PROJECT_MANAGER';
  const isTeamMember = role === 'Team Member' || rawRole === 'TEAM_MEMBER';

  const hasRole = (...roles) => {
    return roles.some((r) => r === role || r === rawRole);
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    isLoading: loading,
    login,
    logout,
    restoreSession,
    updateProfile,
    isAdmin,
    isProjectManager,
    isTeamMember,
    hasRole,
    canManageProjects: isAdmin || isProjectManager,
    canCreateTasks: isAdmin || isProjectManager,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
