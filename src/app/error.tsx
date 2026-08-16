"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry or Winston
    console.error("Terjadi Kesalahan Sistem:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <span className="material-symbols-rounded text-red-500 text-6xl">running_with_errors</span>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            500 - Internal Server Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Maaf, telah terjadi kesalahan pada sistem kami. Tim teknis kami telah diberitahu dan sedang menangani masalah ini.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Coba Lagi
          </button>
          <Link href="/" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
