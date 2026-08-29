export default function RootLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-50/50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">Memuat halaman...</p>
    </div>
  );
}
