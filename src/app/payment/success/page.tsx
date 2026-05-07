'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const params      = useSearchParams();
  const orderNumber = params.get('order');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle size={32} className="text-green-600" />
        </motion.div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-500 text-sm mb-1">
          Thank you for your purchase.
        </p>

        {orderNumber && (
          <p className="text-sm font-medium text-gray-900 mb-6">
            Order: <span className="font-mono">{orderNumber}</span>
          </p>
        )}

        <p className="text-sm text-gray-500 mb-8">
          You will receive a confirmation email shortly.
          You can track your order status from your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/orders"
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            <Package size={16} />
            Track your order
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            Continue shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}