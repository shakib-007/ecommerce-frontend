'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const orderNumber = params.get('order');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_8px_30px_rgba(28,25,23,0.04)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
        >
          <CheckCircle size={32} className="text-emerald-600" />
        </motion.div>

        <h1 className="mb-2 font-display text-2xl font-semibold text-ink">
          Order placed successfully
        </h1>

        <p className="mb-1 text-sm text-muted">Thank you for your purchase.</p>

        {orderNumber && (
          <p className="mb-6 text-sm font-medium text-ink">
            Order: <span className="font-mono">{orderNumber}</span>
          </p>
        )}

        <p className="mb-8 text-sm text-muted">
          You will receive a confirmation email shortly. Track your order from
          your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/orders"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Package size={16} />
            Track your order
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            Continue shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
