"use client";

import React, { useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { 
  upsertLiqoGroup, 
  getLiqoMembers, 
  addLiqoMember, 
  removeLiqoMember 
} from "@/actions/bpi";

type LiqoGroup = {
  id: string;
  name: string;
  murobbiId: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  murobbi: {
    id: string;
    fullName: string;
  };
  _count: {
    members: number;
  };
};

type PotentialUser = {
  id: string;
  fullName: string;
};

type LiqoMember = {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export function LiqoClient({
  initialGroups,
  potentialMurobbis,
  potentialMutarobbis,
  stats = [],
  globalMutabaahStats,
}: {
  initialGroups: LiqoGroup[];
  potentialMurobbis: PotentialUser[];
  potentialMutarobbis: PotentialUser[];
  stats?: {
    id: string;
    name: string;
    murobbiName: string;
    memberCount: number;
    meetingCount: number;
    attendanceRate: number;
  }[];
  globalMutabaahStats?: any;
}) {
  const [activeTab, setActiveTab] = useState<"groups" | "stats" | "global-mutabaah">("groups");

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<LiqoGroup | null>(null);
  
  // Member management state
  const [members, setMembers] = useState<LiqoMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Group form state
  const [groupName, setGroupName] = useState("");
  const [murobbiId, setMurobbiId] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Member form state
  const [selectedMutarobbiId, setSelectedMutarobbiId] = useState("");
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const openNewGroupModal = () => {
    setSelectedGroup(null);
    setGroupName("");
    setMurobbiId("");
    setDescription("");
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (group: LiqoGroup) => {
    setSelectedGroup(group);
    setGroupName(group.name);
    setMurobbiId(group.murobbiId);
    setDescription(group.description || "");
    setIsGroupModalOpen(true);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertLiqoGroup({
        id: selectedGroup?.id,
        name: groupName,
        murobbiId,
        description,
      });
      setIsGroupModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan kelompok");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMembersModal = async (group: LiqoGroup) => {
    setSelectedGroup(group);
    setIsMemberModalOpen(true);
    setIsLoadingMembers(true);
    try {
      const data = await getLiqoMembers(group.id);
      setMembers(data as LiqoMember[]);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data anggota");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedMutarobbiId) return;
    
    setIsSubmittingMember(true);
    try {
      await addLiqoMember({
        groupId: selectedGroup.id,
        userId: selectedMutarobbiId,
      });
      // Refresh members list
      const data = await getLiqoMembers(selectedGroup.id);
      setMembers(data as LiqoMember[]);
      setSelectedMutarobbiId("");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal menambahkan anggota");
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;
    
    try {
      await removeLiqoMember(selectedGroup.id, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus anggota");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "groups" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Kelompok Liqo
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "stats" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Statistik Absensi
        </button>
        <button
          onClick={() => setActiveTab("global-mutabaah")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "global-mutabaah" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Statistik Mutabaah Global
        </button>
      </div>

      {activeTab === "groups" && (
        <>
          <div className="flex justify-between items-center bg-surface p-4 rounded border border-border shadow-sm">
            <div>
              <p className="text-sm text-gray-500">Total Kelompok Liqo</p>
              <p className="text-2xl font-bold text-primary">{initialGroups.length}</p>
            </div>
            <Button onClick={openNewGroupModal}>
              <Icon name="add" className="text-xl mr-1" /> Tambah Kelompok
            </Button>
          </div>

          <div className="bg-surface border border-border rounded shadow-sm overflow-hidden">
            <Table>
              <Thead>
                <Tr>
                  <Th>Nama Kelompok</Th>
                  <Th>Murobbi</Th>
                  <Th>Deskripsi</Th>
                  <Th>Jumlah Anggota</Th>
                  <Th className="text-right">Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {initialGroups.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} className="text-center py-8 text-gray-500">
                      Belum ada kelompok liqo
                    </Td>
                  </Tr>
                ) : (
                  initialGroups.map((group) => (
                    <Tr key={group.id}>
                      <Td className="font-semibold text-primary">{group.name}</Td>
                      <Td>{group.murobbi.fullName}</Td>
                      <Td className="text-gray-600 max-w-xs truncate">{group.description || "-"}</Td>
                      <Td>
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                          {group._count.members}
                        </span>
                      </Td>
                      <Td className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditGroupModal(group)}>
                          <Icon name="edit" className="text-sm mr-1" /> Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => openMembersModal(group)}>
                          <Icon name="group" className="text-sm mr-1" /> Anggota
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </>
      )}
      
      {activeTab === "stats" && (
        <div className="bg-surface border border-border rounded shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Nama Kelompok</Th>
                <Th>Murobbi</Th>
                <Th>Jumlah Anggota</Th>
                <Th>Jumlah Pertemuan</Th>
                <Th>Persentase Kehadiran</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="text-center py-8 text-gray-500">
                    Belum ada data statistik
                  </Td>
                </Tr>
              ) : (
                stats.map((stat) => (
                  <Tr key={stat.id}>
                    <Td className="font-semibold text-primary">{stat.name}</Td>
                    <Td>{stat.murobbiName}</Td>
                    <Td>{stat.memberCount}</Td>
                    <Td>{stat.meetingCount}</Td>
                    <Td>
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                        stat.attendanceRate >= 80 ? 'text-green-800 bg-green-100' :
                        stat.attendanceRate >= 50 ? 'text-yellow-800 bg-yellow-100' :
                        'text-red-800 bg-red-100'
                      }`}>
                        {stat.attendanceRate.toFixed(1)}%
                      </span>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>
      )}

      {activeTab === "global-mutabaah" && globalMutabaahStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded border border-border shadow-sm flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">Total Laporan</span>
            <span className="text-3xl font-bold text-primary">{globalMutabaahStats.totalRecords}</span>
          </div>
          <div className="bg-surface p-6 rounded border border-border shadow-sm flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">Rata-rata Sholat Jamaah</span>
            <span className="text-3xl font-bold text-primary">{globalMutabaahStats.avgSholatJamaah?.toFixed(1) || 0}</span>
          </div>
          <div className="bg-surface p-6 rounded border border-border shadow-sm flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">Persentase Dhuha</span>
            <span className="text-3xl font-bold text-primary">{globalMutabaahStats.pctSholatDhuha?.toFixed(1) || 0}%</span>
          </div>
          <div className="bg-surface p-6 rounded border border-border shadow-sm flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">Persentase Tahajud</span>
            <span className="text-3xl font-bold text-primary">{globalMutabaahStats.pctSholatTahajud?.toFixed(1) || 0}%</span>
          </div>
          <div className="bg-surface p-6 rounded border border-border shadow-sm flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">Rata-rata Tilawah</span>
            <span className="text-3xl font-bold text-primary">{globalMutabaahStats.avgTilawahPages?.toFixed(1) || 0} hal</span>
          </div>
        </div>
      )}

      {/* Modal Kelompok */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={selectedGroup ? "Edit Kelompok" : "Tambah Kelompok Baru"}
      >
        <form onSubmit={handleGroupSubmit} className="space-y-4">
          <Input
            label="Nama Kelompok"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            placeholder="Misal: Kelompok Ikhwan 1"
          />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">
              Murobbi <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={murobbiId}
              onChange={(e) => setMurobbiId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="" disabled>Pilih Murobbi</option>
              {potentialMurobbis.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </div>

          <Input
            label="Deskripsi (Opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan tambahan"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsGroupModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Anggota */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title={`Anggota ${selectedGroup?.name || ""}`}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="bg-neutral p-4 rounded border border-border">
            <h4 className="font-semibold text-sm mb-2 text-primary">Tambah Anggota</h4>
            <form onSubmit={handleAddMember} className="flex gap-2 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <select
                  required
                  value={selectedMutarobbiId}
                  onChange={(e) => setSelectedMutarobbiId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
                >
                  <option value="" disabled>Pilih Pegawai...</option>
                  {potentialMutarobbis.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={isSubmittingMember || !selectedMutarobbiId}>
                Tambah
              </Button>
            </form>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-primary">Daftar Anggota Saat Ini</h4>
            {isLoadingMembers ? (
              <p className="text-sm text-gray-500 py-4 text-center">Memuat data anggota...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center bg-surface border border-border rounded">
                Belum ada anggota di kelompok ini.
              </p>
            ) : (
              <div className="border border-border rounded overflow-hidden">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Nama</Th>
                      <Th>Email</Th>
                      <Th className="text-right">Aksi</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {members.map((member) => (
                      <Tr key={member.id}>
                        <Td>{member.user.fullName}</Td>
                        <Td className="text-gray-500">{member.user.email}</Td>
                        <Td className="text-right">
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            <Icon name="delete" className="text-sm mr-1" /> Hapus
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
