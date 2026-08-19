import { getMyAttendanceHistory } from "@/actions/attendance";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AttendanceHistoryPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const history = await getMyAttendanceHistory(currentMonth, currentYear);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Riwayat Absensi</h1>
        <p className="text-sm text-gray-500">
          Bulan {currentDate.toLocaleString("id-ID", { month: "long" })} {currentYear}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-sm">
        <Table>
          <Thead>
            <Tr>
              <Th>Tanggal</Th>
              <Th>Check In</Th>
              <Th>Check Out</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((record: any, idx: number) => {
              let statusBadge = <Badge variant="gray">Tidak Hadir</Badge>;
              if (record.status === "HADIR") {
                statusBadge = <Badge variant="blue">Hadir</Badge>;
              } else if (record.status === "TERLAMBAT") {
                statusBadge = <Badge variant="orange">Terlambat</Badge>;
              } else if (record.status === "IZIN") {
                statusBadge = <Badge variant="amber">Izin</Badge>;
              } else if (record.status === "SAKIT") {
                statusBadge = <Badge variant="amber">Sakit</Badge>;
              } else if (record.status === "LIBUR") {
                statusBadge = <Badge variant="red">Libur</Badge>;
              } else if (record.status === "ALPA") {
                statusBadge = <Badge variant="red">Alpa</Badge>;
              }

              return (
                <Tr key={idx}>
                  <Td>
                    {new Date(record.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-"}</Td>
                  <Td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-"}</Td>
                  <Td>{statusBadge}</Td>
                </Tr>
              );
            })}
            
            {history.length === 0 && (
              <Tr>
                <Td colSpan={4} className="text-center py-6 text-gray-500">
                  Tidak ada riwayat absensi bulan ini.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
