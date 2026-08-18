'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PaymentFailedPage() {
  const params = useSearchParams();
  const orderNumber = params.get('order');
  const reason = params.get('reason');

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
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50"
        >
          <XCircle size={32} className="text-red-500" />
        </motion.div>

        <h1 className="mb-2 font-display text-2xl font-semibold text-ink">
          Payment failed
        </h1>

        <p className="mb-1 text-sm text-muted">
          We couldn&apos;t process your payment.
        </p>

        {orderNumber && (
          <p className="mb-2 text-sm font-medium text-ink">
            Order: <span className="font-mono">{orderNumber}</span>
          </p>
        )}

        {reason && (
          <p className="mb-6 text-xs text-red-500">
            Reason: {reason.replace(/_/g, ' ')}
          </p>
        )}

        <p className="mb-8 text-sm text-muted">
          Your order has been saved. Retry payment from your orders page, or
          place a new order.
        </p>

        <div className="flex flex-col gap-3">
          {orderNumber && (
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <RefreshCw size={16} />
              Retry payment
            </Link>
          )}

          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 rounded-lg border border-border-strong px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
          >
            <ArrowLeft size={16} />
            Back to checkout
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
