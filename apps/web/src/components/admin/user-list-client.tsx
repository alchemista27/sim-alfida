"use client";

import { useState } from "react";
import { UserRole } from "@sim/database";
import { updateUserRoles, deleteUser, resetUserPassword } from "@/actions/users";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/ui/icon";

const ALL_ROLES = [
  "super_admin", "admin_unit", "admin_unit_nondik", "guru", "karyawan", 
  "orang_tua", "observer", "tim_ppdb", "admin_bidang"
];

export function UserListClient({ users }: { users: any[] }) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [groupsInput, setGroupsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    const res = await deleteUser(deletingUser.id);
    if (res.success) {
      setDeletingUser(null);
    } else {
      alert("Gagal menghapus: " + res.error);
    }
    setDeleteLoading(false);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setSelectedRoles(user.roles?.map((r: any) => r.role) || []);
    setGroupsInput(user.groups?.join(", ") || "");
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setLoading(true);
    const groups = groupsInput.split(",").map(g => g.trim()).filter(g => g);
    const res = await updateUserRoles(editingUser.id, selectedRoles as UserRole[], groups);
    if (res.success) {
      setEditingUser(null);
    } else {
      alert("Gagal update: " + res.error);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resettingUser || !newPassword) return;
    setResetLoading(true);
    const res = await resetUserPassword(resettingUser.id, newPassword);
    if (res.success) {
      setResettingUser(null);
      setNewPassword("");
      alert("Password berhasil diubah!");
    } else {
      alert("Gagal mereset password: " + res.error);
    }
    setResetLoading(false);
  };

  return (
    <>
      <div className="bg-surface rounded-md border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-primary">
          <thead className="bg-neutral border-b border-border text-primary">
            <tr>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Nama Lengkap</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Groups / Jabatan</th>
              <th className="p-4 font-semibold">Akses Sistem</th>
              <th className="p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral/50">
                <td className="p-4 font-medium">{user.username || '-'}</td>
                <td className="p-4">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs opacity-70">{user.firstName} {user.lastName}</div>
                </td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.groups?.map((g: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral text-primary text-xs rounded border border-border">
                        {g}
                      </span>
                    ))}
                    {(!user.groups || user.groups.length === 0) && <span className="opacity-50">-</span>}
                  </div>
                </td>
                <td className="p-4">
                  {Array.from(new Set(user.roles?.map((r: any) => r.role) || [])).map((role: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded border border-secondary/20 mr-1">
                      {role}
                    </span>
                  ))}
                  {(!user.roles || user.roles.length === 0) && <span className="opacity-50">Default (Orang Tua)</span>}
                </td>
                <td className="p-4 flex gap-2 flex-wrap">
                  <button 
                    onClick={() => openEdit(user)}
                    className="text-tertiary hover:opacity-80 font-medium text-xs bg-transparent border border-tertiary px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  {user.groups?.includes("created_by_admin") && (
                    <button 
                      onClick={() => { setResettingUser(user); setNewPassword(""); }}
                      className="text-blue-600 hover:opacity-80 font-medium text-xs bg-transparent border border-blue-600 px-3 py-1 rounded"
                    >
                      Reset Pass
                    </button>
                  )}
                  {currentUser?.id !== user.id && (
                    <button 
                      onClick={() => setDeletingUser(user)}
                      className="text-white hover:opacity-80 font-medium text-xs bg-red-600 border border-red-600 px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary font-heading">Edit Peran & Jabatan</h3>
              <p className="text-sm opacity-70 font-body">{editingUser.fullName} ({editingUser.email})</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-2 font-body tracking-wide">PERAN (AKSES SISTEM)</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-border rounded bg-neutral/50">
                  {ALL_ROLES.map(role => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSelectedRoles(selectedRoles.filter(r => r !== role));
                          else setSelectedRoles([...selectedRoles, role]);
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                          isSelected 
                            ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm' 
                            : 'bg-surface text-primary border-border hover:bg-neutral'
                        }`}
                      >
                        {role.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-2 font-body tracking-wide">GROUPS / JABATAN</label>
                <input 
                  type="text"
                  value={groupsInput}
                  onChange={e => setGroupsInput(e.target.value)}
                  className="w-full bg-surface text-primary border-border rounded px-[14px] py-[10px] shadow-sm focus:border-tertiary focus:ring-1 focus:ring-tertiary text-sm"
                  placeholder="e.g. Guru Kelas, Wakil Kepala"
                />
              </div>
            </div>

            <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
              >
                Batal
              </button>
              <button 
                onClick={saveEdit}
                disabled={loading}
                className="px-[20px] py-[12px] text-sm font-medium text-on-tertiary bg-tertiary hover:opacity-90 rounded disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary font-heading">Konfirmasi Hapus</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm font-body text-primary">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold">{deletingUser.fullName}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setDeletingUser(null)}
                className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-[20px] py-[12px] text-sm font-medium text-white bg-red-600 hover:opacity-90 rounded disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resettingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary font-heading">Reset Password</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm font-body text-primary">
                Ganti password untuk akun <span className="font-bold">{resettingUser.fullName}</span> ({resettingUser.username || resettingUser.email}).
              </p>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1 font-body">PASSWORD BARU</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full border-border rounded px-3 py-2 text-sm bg-surface text-primary" 
                  placeholder="Masukkan password baru" 
                />
              </div>
            </div>

            <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setResettingUser(null)}
                className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
              >
                Batal
              </button>
              <button 
                onClick={handleResetPassword}
                disabled={resetLoading || !newPassword}
                className="px-[20px] py-[12px] text-sm font-medium text-white bg-blue-600 hover:opacity-90 rounded disabled:opacity-50"
              >
                {resetLoading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
