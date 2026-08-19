import { getTodayAttendanceContext } from "@/actions/attendance";
import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage() {
  try {
    const context = await getTodayAttendanceContext();
    
    if (!context) {
      throw new Error("Gagal mengambil data absensi.");
    }
    
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold font-heading text-primary">Absensi Harian</h1>
        <AttendanceClient context={context} />
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg max-w-md w-full">
          <h2 className="text-lg font-bold mb-2">Terjadi Kesalahan</h2>
          <p>{error instanceof Error ? error.message : "Tidak dapat memuat konfigurasi absensi."}</p>
        </div>
      </div>
    );
  }
}
