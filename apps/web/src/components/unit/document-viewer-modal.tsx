"use client";

import React from "react";
import { Icon } from "@/components/ui/icon";

export function DocumentViewerModal({
  isOpen,
  onClose,
  docs,
}: {
  isOpen: boolean;
  onClose: () => void;
  docs: any[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex items-center justify-between bg-surface">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Icon name="preview" /> Pratinjau Dokumen Calon Siswa
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <Icon name="close" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-400">Tidak ada dokumen.</div>
          ) : (
            docs.map((doc) => (
              <div key={doc.id} className="bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="p-2 border-b bg-gray-50 font-medium text-sm text-gray-700 capitalize">
                  {doc.type.replace("_", " ")}
                </div>
                <div className="p-2 flex-1 flex items-center justify-center min-h-[200px] bg-neutral/30 relative">
                   {doc.mimeType?.includes("pdf") ? (
                      <div className="flex flex-col items-center">
                        <Icon name="picture_as_pdf" className="text-red-500 text-5xl mb-2" />
                        <a href={doc.fileUrl} target="_blank" className="text-sm text-blue-600 underline">Buka PDF di tab baru</a>
                      </div>
                   ) : (
                      <img src={doc.fileUrl} alt={doc.type} className="max-h-64 object-contain" />
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
