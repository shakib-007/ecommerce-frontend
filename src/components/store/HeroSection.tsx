'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const SLIDES = [
  {
    id: 'deals',
    eyebrow: 'Multi-category marketplace',
    title: 'Best deals,\nevery day.',
    body: 'Discover electronics, apparel, home and essentials — curated for value, priced for Bangladesh.',
    primaryHref: '/products',
    primaryLabel: 'Shop now',
    secondaryHref: '/products?featured=true',
    secondaryLabel: 'Featured picks',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    captionEyebrow: 'This week',
    captionTitle: 'Picked for value',
  },
  {
    id: 'electronics',
    eyebrow: 'Tech that earns its keep',
    title: 'Sound, screens\n& smart gear.',
    body: 'Headphones, wearables, and everyday electronics with honest pricing and reliable delivery.',
    primaryHref: '/products?category=electronics',
    primaryLabel: 'Shop electronics',
    secondaryHref: '/products?featured=true',
    secondaryLabel: 'Featured picks',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
    captionEyebrow: 'Electronics',
    captionTitle: 'Clear the noise',
  },
  {
    id: 'home',
    eyebrow: 'Home & essentials',
    title: 'Spaces that\nfeel finished.',
    body: 'Warm textiles, ceramics, and daily essentials that make home feel considered — not cluttered.',
    primaryHref: '/products?category=home',
    primaryLabel: 'Shop home',
    secondaryHref: '/products',
    secondaryLabel: 'Browse all',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
    captionEyebrow: 'Home edit',
    captionTitle: 'Quiet luxury daily',
  },
];

const AUTO_MS = 6000;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [index]);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 85% 20%, rgba(196,92,38,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(243,232,220,0.9), transparent 50%)',
        }}
      />

      <div className="container-store relative py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
          <div className="relative min-h-[280px] md:col-span-7 lg:col-span-6 md:min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="section-eyebrow mb-4">{slide.eyebrow}</p>

                <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink text-balance whitespace-pre-line sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>

                <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
                  {slide.body}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={slide.primaryHref}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    <ShoppingBag size={16} strokeWidth={2} />
                    {slide.primaryLabel}
                  </Link>
                  <Link
                    href={slide.secondaryHref}
                    className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface/60 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface"
                  >
                    {slide.secondaryLabel}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative md:col-span-5 lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-warm sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/4]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.image}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                      {slide.captionEyebrow}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                      {slide.captionTitle}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Dot navigation */}
        <div
          className="mt-10 flex items-center justify-center gap-2.5"
          role="tablist"
          aria-label="Hero slides"
        >
          {SLIDES.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`
                  h-2.5 rounded-full transition-all duration-300
                  ${active
                    ? 'w-7 bg-accent'
                    : 'w-2.5 bg-ink/20 hover:bg-ink/40'
                  }
                `}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
