import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-[#e8d5b7] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #c8a96e, #e8d5b7)",
                clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              }}
            >
              <span className="text-[#0a0a0a] font-black text-xs">fs</span>
            </div>
            <span className="text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
              fason
            </span>
          </div>
          <p className="text-sm text-[rgba(232,213,183,0.5)] leading-relaxed">
            Bangladesh&apos;s trusted online marketplace. Fast delivery, genuine products, secure payments.
          </p>
          <div className="flex gap-3 mt-6">
            {["Facebook", "Instagram", "Twitter"].map((s) => (
              <a key={s} href="#" className="w-9 h-9 border border-[rgba(200,169,110,0.2)] flex items-center justify-center text-[#c8a96e] hover:border-[#c8a96e] transition-colors text-xs font-bold">
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#c8a96e] mb-5">Shop</h4>
          <ul className="space-y-3">
            {[
              { href: "/products", label: "All Products" },
              { href: "/products?featured=true", label: "Featured" },
              { href: "/products?sort=newest", label: "New Arrivals" },
              { href: "/products?in_stock=true", label: "In Stock" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-[rgba(232,213,183,0.6)] hover:text-[#c8a96e] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#c8a96e] mb-5">Account</h4>
          <ul className="space-y-3">
            {[
              { href: "/login", label: "Sign In" },
              { href: "/register", label: "Create Account" },
              { href: "/dashboard/orders", label: "My Orders" },
              { href: "/dashboard/profile", label: "Profile" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-[rgba(232,213,183,0.6)] hover:text-[#c8a96e] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#c8a96e] mb-5">Info</h4>
          <ul className="space-y-3">
            {[
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/privacy", label: "Privacy Policy" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-[rgba(232,213,183,0.6)] hover:text-[#c8a96e] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-3 border border-[rgba(200,169,110,0.15)]">
            <p className="text-xs text-[rgba(232,213,183,0.4)] mb-1">Free shipping above</p>
            <p className="text-lg font-black text-[#c8a96e]" style={{ fontFamily: "'Georgia', serif" }}>৳2,000</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(200,169,110,0.1)] px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[rgba(232,213,183,0.3)]">
          <span>© {new Date().getFullYear()} ShopBD. All rights reserved.</span>
          <span>SSLCommerz · Cash on Delivery · Secure Checkout</span>
        </div>
      </div>
    </footer>
  );
}