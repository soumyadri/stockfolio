"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import { isWelcomeDismissed, setWelcomeDismissed } from "./welcome";

export function useWelcomeModal() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isWelcomeDismissed()) {
      setIsOpen(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  const dismiss = useCallback(() => {
    setWelcomeDismissed();
    setIsOpen(false);
  }, []);

  const openSignup = useCallback(() => {
    setWelcomeDismissed();
    setIsOpen(false);
    openAuthModal("signup");
  }, [openAuthModal]);

  return { isOpen, dismiss, openSignup };
}
