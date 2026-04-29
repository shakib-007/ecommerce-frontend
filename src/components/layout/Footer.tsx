export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-bold text-gray-900">fason</p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} fason. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}