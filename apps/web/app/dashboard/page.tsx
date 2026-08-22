import Link from "next/link";
import { Button } from "@stockfolio/ui";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stockfolio</h1>
          <p className="mt-1 text-slate-600">Your paper trading dashboard</p>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="text-blue-600">
            Dashboard
          </Link>
          <Link href="/wallet" className="hover:text-slate-900">
            Wallet
          </Link>
        </nav>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Welcome</h2>
        <p className="mt-2 text-slate-600">
          Phase 1 skeleton is running. The shared UI package is wired via the Button below.
        </p>
        <div className="mt-4">
          <Button>Try the demo</Button>
        </div>
      </section>
    </main>
  );
}
