'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
              New arrivals every week
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Best deals,
              <br />
              every day.
            </h1>

            <p className="text-gray-400 text-lg mb-8 max-w-lg">
              Discover thousands of products across electronics,
              clothing, home and more — all at unbeatable prices.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="
                  inline-flex items-center gap-2
                  bg-white text-black
                  px-6 py-3 rounded-xl
                  font-medium text-sm
                  hover:bg-gray-100
                  transition-colors duration-200
                "
              >
                <ShoppingBag size={16} />
                Shop now
              </Link>

              <Link
                href="/products?featured=true"
                className="
                  inline-flex items-center gap-2
                  border border-white/20 text-white
                  px-6 py-3 rounded-xl
                  font-medium text-sm
                  hover:bg-white/10
                  transition-colors duration-200
                "
              >
                Featured picks
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}