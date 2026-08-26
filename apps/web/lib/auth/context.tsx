"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearAuth, getStoredToken, getStoredUser, storeAuth } from "./token";
import type { AuthUser } from "../graphql/auth";

type AuthMode = "login" | "signup";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authReady: boolean;
  modalOpen: boolean;
  modalMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setModalMode: (mode: AuthMode) => void;
  handleAuthSuccess: (token: string, authUser: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>("login");

  useEffect(() => {
    setUser(getStoredUser());
    setAuthReady(true);
  }, []);

  const handleAuthSuccess = useCallback((token: string, authUser: AuthUser) => {
    storeAuth(token, authUser);
    setUser(authUser);
    setModalOpen(false);
  }, []);

  const openAuthModal = useCallback((mode: AuthMode = "login") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user && getStoredToken()),
      modalOpen,
      modalMode,
      openAuthModal,
      closeAuthModal,
      setModalMode,
      handleAuthSuccess,
      logout,
    }),
    [user, authReady, modalOpen, modalMode, openAuthModal, closeAuthModal, handleAuthSuccess, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
