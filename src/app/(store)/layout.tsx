import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
      <Footer />
    </>
  );
}
