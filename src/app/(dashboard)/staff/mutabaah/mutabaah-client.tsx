"use client";

import React, { useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveMutabaahRecord } from "@/actions/mutarobbi";

type MutabaahRecord = {
  id?: string;
  userId?: string;
  date: Date | string;
  sholatJamaah: number;
  sholatRawatib: number;
  sholatDhuha: boolean;
  sholatTahajud: boolean;
  tilawahPages: number;
  puasaSunnah: boolean;
  infaq: boolean;
};

export function StaffMutabaahClient({
  initialData,
  startDate,
  endDate
}: {
  initialData: any[];
  startDate: string;
  endDate: string;
}) {
  const [records, setRecords] = useState<Record<string, MutabaahRecord>>(() => {
    const map: Record<string, MutabaahRecord> = {};
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    
    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const existing = initialData.find(r => new Date(r.date).toISOString().split("T")[0] === dateStr);
      map[dateStr] = existing || {
        date: new Date(d),
        sholatJamaah: 0,
        sholatRawatib: 0,
        sholatDhuha: false,
        sholatTahajud: false,
        tilawahPages: 0,
        puasaSunnah: false,
        infaq: false
      };
    }
    return map;
  });

  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const dates = Object.keys(records).sort();

  const handleSave = async (dateStr: string) => {
    setSaving(prev => ({ ...prev, [dateStr]: true }));
    try {
      await saveMutabaahRecord({
        ...records[dateStr],
        date: new Date(dateStr)
      });
      alert("Berhasil disimpan!");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan!");
    } finally {
      setSaving(prev => ({ ...prev, [dateStr]: false }));
    }
  };

  const updateRecord = (dateStr: string, field: keyof MutabaahRecord, value: any) => {
    setRecords(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-surface border border-border rounded shadow-sm overflow-x-auto">
      <Table>
        <Thead>
          <Tr>
            <Th>Indikator</Th>
            {dates.map(d => (
              <Th key={d} className="text-center min-w-[120px]">
                {new Date(d).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' })}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td className="font-semibold">Sholat Jamaah (0-5)</Td>
            {dates.map(d => (
              <Td key={`sj-${d}`} className="text-center">
                <Input 
                  type="number" min={0} max={5} 
                  value={records[d].sholatJamaah} 
                  onChange={e => updateRecord(d, "sholatJamaah", parseInt(e.target.value) || 0)} 
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Sholat Rawatib (0-12)</Td>
            {dates.map(d => (
              <Td key={`sr-${d}`} className="text-center">
                <Input 
                  type="number" min={0} max={12} 
                  value={records[d].sholatRawatib} 
                  onChange={e => updateRecord(d, "sholatRawatib", parseInt(e.target.value) || 0)} 
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Sholat Dhuha</Td>
            {dates.map(d => (
              <Td key={`sd-${d}`} className="text-center">
                <input 
                  type="checkbox" 
                  checked={records[d].sholatDhuha} 
                  onChange={e => updateRecord(d, "sholatDhuha", e.target.checked)} 
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Sholat Tahajud</Td>
            {dates.map(d => (
              <Td key={`st-${d}`} className="text-center">
                <input 
                  type="checkbox" 
                  checked={records[d].sholatTahajud} 
                  onChange={e => updateRecord(d, "sholatTahajud", e.target.checked)} 
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Tilawah (Halaman)</Td>
            {dates.map(d => (
              <Td key={`tl-${d}`} className="text-center">
                <Input 
                  type="number" min={0} 
                  value={records[d].tilawahPages} 
                  onChange={e => updateRecord(d, "tilawahPages", parseInt(e.target.value) || 0)} 
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Puasa Sunnah</Td>
            {dates.map(d => (
              <Td key={`ps-${d}`} className="text-center">
                <input 
                  type="checkbox" 
                  checked={records[d].puasaSunnah} 
                  onChange={e => updateRecord(d, "puasaSunnah", e.target.checked)} 
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Infaq</Td>
            {dates.map(d => (
              <Td key={`if-${d}`} className="text-center">
                <input 
                  type="checkbox" 
                  checked={records[d].infaq} 
                  onChange={e => updateRecord(d, "infaq", e.target.checked)} 
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </Td>
            ))}
          </Tr>
          <Tr>
            <Td className="font-semibold">Aksi</Td>
            {dates.map(d => (
              <Td key={`action-${d}`} className="text-center">
                <Button size="sm" onClick={() => handleSave(d)} disabled={saving[d]}>
                  {saving[d] ? "..." : "Simpan"}
                </Button>
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
}
