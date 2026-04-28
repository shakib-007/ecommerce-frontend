// src/app/(store)/layout.tsx
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
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  );
}