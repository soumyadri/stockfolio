"use client";

import { TRIAL_WALLET_BALANCE } from "../../lib/onboarding/welcome";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface WelcomeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onCreateAccount: () => void;
}

function formatTrialBalance(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function WelcomeModal({ isOpen, onDismiss, onCreateAccount }: WelcomeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onDismiss} size="lg">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          ✕
        </button>

        <div className="relative mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-400" fill="none" aria-hidden>
              <path
                d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M5 19h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Congratulations
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Your trial account is ready
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Explore Stockfolio with zero risk. Sign up and we&apos;ll credit your paper trading
            wallet instantly so you can start building your portfolio.
          </p>
        </div>

        <div className="relative mb-6 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-6 py-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Trial wallet balance
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-400 sm:text-5xl">
            {formatTrialBalance(TRIAL_WALLET_BALANCE)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Virtual funds for paper trading only</p>
        </div>

        <div className="relative flex flex-col gap-3">
          <Button variant="primary" fullWidth onClick={onCreateAccount} className="!py-3">
            Create your account
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={onDismiss}
            className="!border-slate-600 !py-3"
          >
            Explore for now
          </Button>
        </div>
      </div>
    </Modal>
  );
}
