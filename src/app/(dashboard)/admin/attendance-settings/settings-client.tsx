"use client";

import React, { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { upsertGpsConfig, upsertHoliday } from "@/actions/attendance-config";

type Unit = { id: string; name: string };
type GpsConfig = { unitId: string; latitude: number; longitude: number; radiusMeters: number };
type Holiday = { id: string; date: Date; name: string; description: string | null; unitId: string | null; unit?: Unit | null };

export default function SettingsClient({
  units,
  gpsConfigs,
  holidays
}: {
  units: Unit[];
  gpsConfigs: GpsConfig[];
  holidays: Holiday[];
}) {
  const [isPending, startTransition] = useTransition();
  const [gpsModalUnit, setGpsModalUnit] = useState<Unit | null>(null);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  const handleGpsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gpsModalUnit) return;
    const formData = new FormData(e.currentTarget);
    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));
    const radiusMeters = Number(formData.get("radiusMeters"));

    startTransition(async () => {
      await upsertGpsConfig({
        unitId: gpsModalUnit.id,
        latitude,
        longitude,
        radiusMeters
      });
      setGpsModalUnit(null);
    });
  };

  const handleHolidaySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dateStr = formData.get("date") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const unitId = formData.get("unitId") as string;

    startTransition(async () => {
      await upsertHoliday({
        date: new Date(dateStr),
        name,
        description: description || undefined,
        unitId: unitId || null
      });
      setHolidayModalOpen(false);
    });
  };

  return (
    <div className="space-y-8">
      {/* GPS Config Section */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi GPS</CardTitle>
        </CardHeader>
        <Table>
          <Thead>
            <Tr>
              <Th>Unit</Th>
              <Th>Latitude</Th>
              <Th>Longitude</Th>
              <Th>Radius (m)</Th>
              <Th>Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {units.map((unit) => {
              const config = gpsConfigs.find(c => c.unitId === unit.id);
              return (
                <Tr key={unit.id}>
                  <Td className="font-medium">{unit.name}</Td>
                  <Td>{config?.latitude ?? "-"}</Td>
                  <Td>{config?.longitude ?? "-"}</Td>
                  <Td>{config?.radiusMeters ?? "-"}</Td>
                  <Td>
                    <Button variant="outline" size="sm" onClick={() => setGpsModalUnit(unit)}>
                      Atur GPS
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>

      {/* Holidays Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hari Libur</CardTitle>
          <Button onClick={() => setHolidayModalOpen(true)} size="sm">
            <Icon name="add" className="text-sm mr-1" />
            Tambah Libur
          </Button>
        </CardHeader>
        <Table>
          <Thead>
            <Tr>
              <Th>Tanggal</Th>
              <Th>Nama Libur</Th>
              <Th>Unit</Th>
              <Th>Deskripsi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {holidays.length === 0 ? (
              <Tr>
                <Td colSpan={4} className="text-center text-gray-500 py-4">Belum ada hari libur bulan ini.</Td>
              </Tr>
            ) : (
              holidays.map((holiday) => (
                <Tr key={holiday.id}>
                  <Td>{new Date(holiday.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}</Td>
                  <Td className="font-medium">{holiday.name}</Td>
                  <Td>{holiday.unit ? holiday.unit.name : "Semua Unit"}</Td>
                  <Td>{holiday.description || "-"}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {/* GPS Modal */}
      <Modal
        isOpen={!!gpsModalUnit}
        onClose={() => setGpsModalUnit(null)}
        title={`Atur GPS - ${gpsModalUnit?.name}`}
      >
        <form onSubmit={handleGpsSubmit} className="space-y-4">
          <Input
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            required
            defaultValue={gpsConfigs.find(c => c.unitId === gpsModalUnit?.id)?.latitude}
          />
          <Input
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            required
            defaultValue={gpsConfigs.find(c => c.unitId === gpsModalUnit?.id)?.longitude}
          />
          <Input
            label="Radius (Meter)"
            name="radiusMeters"
            type="number"
            required
            defaultValue={gpsConfigs.find(c => c.unitId === gpsModalUnit?.id)?.radiusMeters || 50}
          />
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Holiday Modal */}
      <Modal
        isOpen={holidayModalOpen}
        onClose={() => setHolidayModalOpen(false)}
        title="Tambah Hari Libur"
      >
        <form onSubmit={handleHolidaySubmit} className="space-y-4">
          <Input
            label="Tanggal"
            name="date"
            type="date"
            required
          />
          <Input
            label="Nama Libur"
            name="name"
            type="text"
            required
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">Unit</label>
            <select
              name="unitId"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Semua Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">Deskripsi</label>
            <textarea
              name="description"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
              rows={3}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
