'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        The page could not be loaded. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
