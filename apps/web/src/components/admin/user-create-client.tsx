"use client";

import { useState } from "react";
import { UserRole } from "@sim/database";
import { createUserManual } from "@/actions/users";

const ALL_ROLES = [
  "super_admin", "admin_unit", "admin_unit_nondik", "guru", "karyawan", 
  "orang_tua", "observer", "tim_ppdb", "admin_bidang"
];

export function UserCreateClient() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "", fullName: "", username: "", password: ""
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [groupsInput, setGroupsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const groups = groupsInput.split(",").map(g => g.trim()).filter(g => g);
    
    const res = await createUserManual({
      ...formData,
      roles: selectedRoles as UserRole[],
      groups
    });

    if (res.success) {
      setOpen(false);
      setFormData({ email: "", fullName: "", username: "", password: "" });
      setSelectedRoles([]);
      setGroupsInput("");
    } else {
      alert("Gagal menambahkan pengguna: " + res.error);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="bg-tertiary hover:opacity-90 text-on-tertiary px-[20px] py-[12px] ml-3 rounded text-sm font-medium transition disabled:opacity-50 flex items-center shadow-sm"
      >
        <span className="material-symbols-rounded mr-2 text-[20px]">person_add</span>
        Tambah Pengguna
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-md shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary font-heading">Tambah Pengguna Baru</h3>
              <p className="text-sm opacity-70 font-body">Buat akun untuk pegawai secara manual.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1 font-body">NAMA LENGKAP</label>
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border-border rounded px-3 py-2 text-sm bg-surface text-primary" placeholder="Budi Santoso" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1 font-body">USERNAME</label>
                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border-border rounded px-3 py-2 text-sm bg-surface text-primary" placeholder="budisantoso" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1 font-body">EMAIL</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-border rounded px-3 py-2 text-sm bg-surface text-primary" placeholder="budi@alfida.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1 font-body">PASSWORD</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border-border rounded px-3 py-2 text-sm bg-surface text-primary pr-10" placeholder="Default: password123" />
                      <button 
                        type="button" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary opacity-50 hover:opacity-100 flex items-center justify-center h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-rounded text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                </div>

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
                    className="w-full bg-surface text-primary border-border rounded px-[14px] py-[10px] shadow-sm focus:border-tertiary text-sm"
                    placeholder="e.g. Guru Kelas, Wakil Kepala"
                  />
                </div>
              </div>

              <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-[20px] py-[12px] text-sm font-medium text-on-tertiary bg-tertiary hover:opacity-90 rounded disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
