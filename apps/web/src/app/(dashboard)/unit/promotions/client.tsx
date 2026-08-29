"use client";

import { useState } from "react";
import { processPromotions } from "@/actions/promotion";
import { Icon } from "@/components/ui/icon";

export function UnitPromotionClient({ 
  classes,
  enrollments
}: { 
  classes: any[],
  enrollments: any[]
}) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, "promoted" | "retained">>(() => {
    // Initialize with existing decisions
    const initial: Record<string, "promoted" | "retained"> = {};
    enrollments.forEach(e => {
      if (e.promotionDecision) {
        initial[e.id] = e.promotionDecision.decision;
      }
    });
    return initial;
  });

  const filteredEnrollments = enrollments.filter(e => e.class.id === selectedClassId);

  const handleDecisionChange = (enrollmentId: string, decision: "promoted" | "retained") => {
    setDecisions(prev => ({ ...prev, [enrollmentId]: decision }));
  };

  const setAllPromoted = () => {
    const next = { ...decisions };
    filteredEnrollments.forEach(e => {
      next[e.id] = "promoted";
    });
    setDecisions(next);
  };

  const handleSave = async () => {
    // Collect decisions for current class that are set
    const payload = filteredEnrollments
      .filter(e => decisions[e.id])
      .map(e => ({
        enrollmentId: e.id,
        decision: decisions[e.id]
      }));

    if (payload.length === 0) {
      alert("Belum ada perubahan yang diset.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    
    const res = await processPromotions(formData);
    setLoading(false);
    
    if (res.success) {
      alert(`Berhasil menyimpan ${res.count} keputusan.`);
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-teal-500 bg-gray-50"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={setAllPromoted}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            Tandai Semua Naik
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Keputusan'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">NISN / Nama Siswa</th>
                <th className="px-4 py-3 text-center">Status Rapor AAS</th>
                <th className="px-4 py-3 text-center">Keputusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnrollments.map((e, idx) => {
                const hasFinalReport = e.lhbsReports.length > 0;
                const currentDecision = decisions[e.id];
                const savedDecision = e.promotionDecision?.decision;

                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{e.studentData.fullName}</div>
                      <div className="text-xs text-gray-500">{e.studentData.nisn || "No NISN"}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasFinalReport ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Ada (Terkunci)</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-200">Belum Ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                        <button
                          onClick={() => handleDecisionChange(e.id, "promoted")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            currentDecision === "promoted" 
                            ? 'bg-teal-600 text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Naik Kelas
                        </button>
                        <button
                          onClick={() => handleDecisionChange(e.id, "retained")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            currentDecision === "retained" 
                            ? 'bg-red-500 text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Tinggal
                        </button>
                      </div>
                      {savedDecision && currentDecision === savedDecision && (
                        <div className="text-[10px] text-green-600 mt-1 flex justify-center items-center gap-1">
                          <Icon name="check_circle" className="text-[12px]" /> Tersimpan
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredEnrollments.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada siswa di kelas ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
