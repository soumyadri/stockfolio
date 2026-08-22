import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center">
      <h1 className="text-2xl font-bold text-white">Stock not found</h1>
      <p className="text-slate-400">This symbol isn&apos;t in our catalog yet.</p>
      <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300">
        ← Back to dashboard
      </Link>
    </main>
  );
}
