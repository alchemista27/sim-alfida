import React from "react";
import { RegistrationStatus } from "@/generated/client";
import { STEP_INDEX_MAP } from "@/lib/ppdb-fsm";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

const STEPS = [
  { label: "Pembayaran", icon: "payments" },
  { label: "Bukti Diunggah", icon: "upload_file" },
  { label: "Terverifikasi", icon: "verified" },
  { label: "Isi Formulir", icon: "assignment" },
  { label: "Berkas Diupload", icon: "folder_open" },
  { label: "Surat IMC", icon: "local_hospital" },
  { label: "Hasil IMC", icon: "health_and_safety" },
  { label: "Verifikasi Berkas", icon: "fact_check" },
  { label: "Jadwal Observasi", icon: "event_available" },
  { label: "Observasi Selesai", icon: "groups" },
  { label: "Diterima", icon: "emoji_events" },
];

export function PpdbStepper({ status }: { status: RegistrationStatus }) {
  const currentIdx = STEP_INDEX_MAP[status];
  const isRejected = status === "rejected";

  if (isRejected) {
    return (
      <Card className="p-4 border-red-200 bg-red-50 mb-6">
        <div className="flex items-center gap-3 text-red-700">
          <Icon name="cancel" className="text-2xl" />
          <div>
            <p className="font-bold text-sm">Pendaftaran Ditolak</p>
            <p className="text-xs mt-0.5">Mohon maaf, pendaftaran Anda tidak dapat dilanjutkan.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border shadow-sm overflow-x-auto mb-6">
      <h2 className="text-base font-bold text-primary mb-5">Status Pendaftaran</h2>
      <div className="flex gap-2 min-w-max">
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <div key={i} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1 w-14">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${
                    isDone
                      ? "bg-green-100 text-green-600"
                      : isActive
                      ? "bg-teal-100 text-tertiary ring-2 ring-tertiary"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  <Icon name={isDone ? "check" : step.icon} className="text-sm" />
                </div>
                <span
                  className={`text-[10px] text-center leading-tight ${
                    isActive
                      ? "text-tertiary font-bold"
                      : isDone
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-4 h-0.5 mb-5 ${isDone ? "bg-green-300" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
