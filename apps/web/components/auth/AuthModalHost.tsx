"use client";

import { useAuth } from "../../lib/auth/context";
import { AuthModal } from "./AuthModal";

export function AuthModalHost() {
  const { modalOpen, modalMode, closeAuthModal, setModalMode, handleAuthSuccess } = useAuth();

  return (
    <AuthModal
      isOpen={modalOpen}
      mode={modalMode}
      onClose={closeAuthModal}
      onModeChange={setModalMode}
      onSuccess={handleAuthSuccess}
    />
  );
}
