"use client";

import { useState, type FormEvent } from "react";
import { generateDemoCredentials } from "../../lib/auth/demo";
import { loginUser, registerUser, type AuthUser } from "../../lib/graphql/auth";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

type AuthMode = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (token: string, user: AuthUser) => void;
}

export function AuthModal({ isOpen, mode, onClose, onModeChange, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setError(null);
    onModeChange(nextMode);
  };

  const submitAuth = async (submitEmail: string, submitPassword: string, authMode: AuthMode) => {
    setLoading(true);
    setError(null);

    try {
      const result =
        authMode === "login"
          ? await loginUser(submitEmail, submitPassword)
          : await registerUser(submitEmail, submitPassword);

      resetForm();
      onSuccess(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitAuth(email.trim(), password, mode);
  };

  const handleDemo = () => {
    const credentials = generateDemoCredentials();
    setEmail(credentials.email);
    setPassword(credentials.password);
    void submitAuth(credentials.email, credentials.password, "signup");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              isLogin
                ? "border border-slate-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("signup")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              !isLogin
                ? "border border-slate-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign up
          </button>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {isLogin ? "Log in to see your portfolio." : "Sign up to start paper trading."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-700" />
        <span className="text-xs text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      <button
        type="button"
        onClick={handleDemo}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50"
      >
        <span className="text-xs">▶</span>
        Try the demo
      </button>
    </Modal>
  );
}
