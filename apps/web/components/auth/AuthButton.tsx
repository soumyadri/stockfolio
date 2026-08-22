"use client";

import { useAuth } from "../../lib/auth/context";

export function AuthButton() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">{user.email}</span>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openAuthModal("login")}
      className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
    >
      Log in
    </button>
  );
}
