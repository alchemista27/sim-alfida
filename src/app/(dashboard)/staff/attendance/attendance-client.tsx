"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkIn, checkOut } from "@/actions/attendance";

interface AttendanceContext {
  unitName: string;
  config: any;
  holiday?: { name: string } | null;
  attendance?: { checkInTime?: Date | null; checkOutTime?: Date | null } | null;
}

export function AttendanceClient({ context }: { context: AttendanceContext }) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Browser tidak mendukung GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setLocationError("Gagal mendapatkan lokasi. Pastikan izin GPS diberikan.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleCheckIn = () => {
    if (!location) return;
    startTransition(async () => {
      try {
        await checkIn({ latitude: location.lat, longitude: location.lng });
        setMessage({ type: "success", text: "Berhasil Check In!" });
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Gagal Check In." });
      }
    });
  };

  const handleCheckOut = () => {
    if (!location) return;
    startTransition(async () => {
      try {
        await checkOut({ latitude: location.lat, longitude: location.lng });
        setMessage({ type: "success", text: "Berhasil Check Out!" });
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Gagal Check Out." });
      }
    });
  };

  const isHoliday = !!context.holiday;
  const hasCheckedIn = !!context.attendance?.checkInTime;
  const hasCheckedOut = !!context.attendance?.checkOutTime;

  let statusBadge = <Badge variant="teal">Siap Absen</Badge>;
  if (isHoliday) {
    statusBadge = <Badge variant="red">Libur</Badge>;
  } else if (hasCheckedOut) {
    statusBadge = <Badge variant="gray">Sudah Check Out</Badge>;
  } else if (hasCheckedIn) {
    statusBadge = <Badge variant="blue">Sudah Check In</Badge>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Hari Ini</CardTitle>
        {statusBadge}
      </CardHeader>

      <div className="flex flex-col gap-4">
        <div className="text-sm">
          <p>
            <strong>Tanggal:</strong> {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Unit:</strong> {context.unitName}
          </p>
        </div>

        {isHoliday && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            Hari Libur Nasional: {context.holiday?.name}
          </div>
        )}

        {!location && !locationError && (
          <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            Mencari Lokasi GPS...
          </div>
        )}

        {locationError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {locationError}
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <Button
            className="flex-1"
            onClick={handleCheckIn}
            disabled={
              isHoliday ||
              hasCheckedIn ||
              !location ||
              !!locationError ||
              isPending
            }
          >
            {isPending && !hasCheckedIn ? "Memproses..." : "Check In"}
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            onClick={handleCheckOut}
            disabled={
              isHoliday ||
              !hasCheckedIn ||
              hasCheckedOut ||
              !location ||
              !!locationError ||
              isPending
            }
          >
            {isPending && hasCheckedIn && !hasCheckedOut
              ? "Memproses..."
              : "Check Out"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
