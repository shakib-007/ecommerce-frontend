import Link from 'next/link';

const shopLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/products?featured=true', label: 'Featured' },
  { href: '/products?sort=newest', label: 'New Arrivals' },
  { href: '/products?in_stock=true', label: 'In Stock' },
];

const accountLinks = [
  { href: '/login', label: 'Sign In' },
  { href: '/register', label: 'Create Account' },
  { href: '/dashboard/orders', label: 'My Orders' },
  { href: '/dashboard/wishlist', label: 'Wishlist' },
];

const infoLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-[#f5efe7]">
      <div className="container-store grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-[#faf7f2]"
          >
            shopora
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#f5efe7]/60">
            Bangladesh&apos;s trusted online marketplace. Fast delivery, genuine
            products, secure payments.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Shop
          </h4>
          <ul className="space-y-3">
            {shopLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[#f5efe7]/60 transition-colors hover:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Account
          </h4>
          <ul className="space-y-3">
            {accountLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[#f5efe7]/60 transition-colors hover:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Info
          </h4>
          <ul className="space-y-3">
            {infoLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[#f5efe7]/60 transition-colors hover:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-1 text-xs text-[#f5efe7]/45">Free shipping above</p>
            <p className="font-display text-xl font-semibold text-accent">৳2,000</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-store flex flex-col items-center justify-between gap-2 py-5 text-xs text-[#f5efe7]/35 sm:flex-row">
          <span>© {new Date().getFullYear()} Shopora. All rights reserved.</span>
          <span>SSLCommerz · Cash on Delivery · Secure Checkout</span>
        </div>
      </div>
    </footer>
  );
}
