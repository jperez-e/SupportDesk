import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  getAuth,
  saveAuth,
  removeAuth,
} from "../services/authStorage";

import {
  getCurrentUser,
} from "../services/authService";

import {
  onUnauthorized,
} from "../services/authEvents";

import type {
  AuthUser,
} from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (userData: AuthUser) => void;
  logoutUser: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const loginUser = useCallback(
    (userData: AuthUser) => {
      saveAuth(userData);
      setUser(userData);
    },
    []
  );

  const logoutUser = useCallback(
    () => {
      removeAuth();
      setUser(null);
    },
    []
  );

  // ========================================
  // ESCUCHAR SESIÓN NO AUTORIZADA
  // ========================================

  useEffect(() => {
    const unsubscribe =
      onUnauthorized(() => {
        logoutUser();
      });

    return unsubscribe;
  }, [logoutUser]);

  // ========================================
  // VALIDAR SESIÓN AL INICIAR
  // ========================================

  useEffect(() => {
    const validateSession = async () => {
      const storedAuth = getAuth();

      if (!storedAuth) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        setUser({
          userId: currentUser.userId,
          token: storedAuth.token,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        });
      } catch {
        removeAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const isAuthenticated =
    user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}