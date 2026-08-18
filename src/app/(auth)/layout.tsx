import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-display text-3xl font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          >
            shopora
          </Link>
          <p className="mt-1 text-sm text-muted">Best deals every day</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
          {children}
        </div>
      </div>
    </div>
  );
}
