export default function StrategicDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SMART Execution Control Center</h1>
      <p className="text-gray-600">Pusat kendali kinerja strategis BPH Yayasan Alfida.</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Master Data (Sprint 40)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/strategic/departments" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Struktur Bidang & PIC</h3>
            <p className="mt-2 text-sm text-gray-500">Kelola hierarki organisasi yayasan, biro, dan unit.</p>
          </a>
          <a href="/admin/strategic/programs" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Program Sekolah (RKT/RKJM)</h3>
            <p className="mt-2 text-sm text-gray-500">Pantau dan kelola program kerja strategis.</p>
          </a>
          <a href="/admin/strategic/kpis" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">KPI & Target Kinerja</h3>
            <p className="mt-2 text-sm text-gray-500">Kelola Indikator Kinerja Utama (KPI) setiap program.</p>
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Eksekusi & Operasional (Sprint 41)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <a href="/admin/strategic/milestones" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Milestones</h3>
            <p className="mt-2 text-sm text-gray-500">Pembagian fase program.</p>
          </a>
          <a href="/admin/strategic/tasks" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Delegasi Tugas</h3>
            <p className="mt-2 text-sm text-gray-500">Pendelegasian & pemantauan tugas.</p>
          </a>
          <a href="/admin/strategic/logs" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Log Realisasi</h3>
            <p className="mt-2 text-sm text-gray-500">Catatan harian/mingguan.</p>
          </a>
          <a href="/admin/strategic/evidence" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Evidence Register</h3>
            <p className="mt-2 text-sm text-gray-500">Unggah bukti dokumen & Cloudinary.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
