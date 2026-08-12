'use client';

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type NavigateOptions = {
  /** Scroll to top (use for pagination). Default false for filters/sort. */
  scroll?: boolean;
  /** Keep current page number. Default false (resets to 1). */
  keepPage?: boolean;
};

type ProductsNavContextValue = {
  isPending: boolean;
  navigate: (
    updates: Record<string, string | undefined>,
    options?: NavigateOptions
  ) => void;
  clearAll: () => void;
};

const ProductsNavContext = createContext<ProductsNavContextValue | null>(null);

export function ProductsNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (
      updates: Record<string, string | undefined>,
      options: NavigateOptions = {}
    ) => {
      const { scroll = false, keepPage = false } = options;
      const next = new URLSearchParams(params.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      });

      if (!keepPage && !Object.prototype.hasOwnProperty.call(updates, 'page')) {
        next.set('page', '1');
      }

      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `/products?${qs}` : '/products', { scroll });
      });
    },
    [params, router]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push('/products', { scroll: false });
    });
  }, [router]);

  return (
    <ProductsNavContext.Provider value={{ isPending, navigate, clearAll }}>
      {children}
    </ProductsNavContext.Provider>
  );
}

export function useProductsNav() {
  const ctx = useContext(ProductsNavContext);
  if (!ctx) {
    throw new Error('useProductsNav must be used within ProductsNavProvider');
  }
  return ctx;
}
