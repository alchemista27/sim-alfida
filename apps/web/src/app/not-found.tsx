import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <span className="material-symbols-rounded text-teal-600 text-7xl mb-4">explore_off</span>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            404 - Halaman Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Maaf, halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau sementara tidak tersedia.
          </p>
        </div>
        <div>
          <Link href="/" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
            Kembali ke Dashboard Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
