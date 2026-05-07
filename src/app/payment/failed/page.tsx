'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PaymentFailedPage() {
  const params      = useSearchParams();
  const orderNumber = params.get('order');
  const reason      = params.get('reason');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center"
      >
        {/* Failed icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <XCircle size={32} className="text-red-500" />
        </motion.div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Failed
        </h1>

        <p className="text-gray-500 text-sm mb-1">
          We couldn&apos;t process your payment.
        </p>

        {orderNumber && (
          <p className="text-sm font-medium text-gray-700 mb-2">
            Order: <span className="font-mono">{orderNumber}</span>
          </p>
        )}

        {reason && (
          <p className="text-xs text-red-500 mb-6">
            Reason: {reason.replace(/_/g, ' ')}
          </p>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Your order has been saved. You can retry payment from your orders page,
          or place a new order.
        </p>

        <div className="flex flex-col gap-3">
          {orderNumber && (
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} />
              Retry payment
            </Link>
          )}

          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to checkout
          </Link>
        </div>
      </motion.div>
    </div>
  );
}