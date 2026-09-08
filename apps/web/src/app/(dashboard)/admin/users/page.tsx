import { prisma } from "@/lib/prisma";
import { UserUploadClient } from "@/components/admin/user-upload-client";
import { UserListClient } from "@/components/admin/user-list-client";
import { UserCreateClient } from "@/components/admin/user-create-client";

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
          <h1 className="text-[3rem] font-bold font-heading text-primary">Manajemen Pengguna</h1>
          <p className="text-base font-body text-primary opacity-70 mt-1">Kelola data SSO pegawai dan hak akses sistem.</p>
        </div>
        <div className="flex items-center">
          <UserUploadClient />
          <UserCreateClient />
        </div>
      </div>

      <UserListClient users={users} />
    </div>
  );
}
