import { prisma } from "@/lib/prisma";
import { UserUploadClient } from "@/components/admin/user-upload-client";

export default async function UserManagementPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roles: true
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data SSO pegawai dan hak akses sistem.</p>
        </div>
        <UserUploadClient />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
            <tr>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Nama Lengkap</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Groups / Jabatan</th>
              <th className="p-4 font-semibold">Akses Sistem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-900">{user.username || '-'}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-xs text-gray-500">{user.firstName} {user.lastName}</div>
                </td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.groups?.map((g: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {g}
                      </span>
                    ))}
                    {(!user.groups || user.groups.length === 0) && <span className="text-gray-400">-</span>}
                  </div>
                </td>
                <td className="p-4">
                  {user.roles?.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-200 mr-1">
                      {r.role}
                    </span>
                  ))}
                  {(!user.roles || user.roles.length === 0) && <span className="text-gray-400">Default (Orang Tua)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
