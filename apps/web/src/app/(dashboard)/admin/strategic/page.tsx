export default function StrategicDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SMART Execution Control Center</h1>
      <p className="text-gray-600">Pusat kendali kinerja strategis BPH Yayasan Alfida.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <a href="/admin/strategic/departments" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Struktur Bidang & PIC</h2>
          <p className="mt-2 text-sm text-gray-500">Kelola hierarki organisasi yayasan, biro, dan unit.</p>
        </a>
        <a href="/admin/strategic/programs" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Program Sekolah (RKT/RKJM)</h2>
          <p className="mt-2 text-sm text-gray-500">Pantau dan kelola program kerja strategis.</p>
        </a>
        <a href="/admin/strategic/kpis" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
          <h2 className="text-xl font-semibold">KPI & Target Kinerja</h2>
          <p className="mt-2 text-sm text-gray-500">Kelola Indikator Kinerja Utama (KPI) setiap program.</p>
        </a>
      </div>
    </div>
  );
}
