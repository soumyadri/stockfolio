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
import { AuthModal } from "../../components/auth/AuthModal";

type AuthMode = "login" | "signup";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  openAuthModal: (mode?: AuthMode) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>("login");

  useEffect(() => {
    setUser(getStoredUser());
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

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getStoredToken()),
      openAuthModal,
      logout,
    }),
    [user, openAuthModal, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onModeChange={setModalMode}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
