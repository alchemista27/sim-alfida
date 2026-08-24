import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await prisma.foundationSettings.findFirst();
  const logoUrl = settings?.logoUrl || null;
  const foundationName = settings?.foundationName || "Yayasan Alfida";

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
        ) : (
          <Icon name="hub" className="text-4xl text-tertiary" />
        )}
        <div>
          <h1 className="text-2xl font-bold font-heading text-tertiary">
            SIM-Alfida
          </h1>
          <p className="text-sm text-gray-600">
            Sistem Informasi Manajemen — {foundationName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="check_circle" className="text-secondary" />
            Sprint 0 Bootstrap Complete
          </CardTitle>
          <Badge variant="teal">Phase 1: PPDB</Badge>
        </CardHeader>
        <div className="space-y-3 text-sm">
          <p>
            Selamat datang di platform SIM-Alfida. Fondasi proyek telah siap dengan stack:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Next.js 15 (App Router, TypeScript, Tailwind CSS)</li>
            <li>Prisma ORM (18 tabel & 7 PostgreSQL Enums)</li>
            <li>Google Material Symbols Rounded Icon System</li>
            <li>8 Unit Pendidikan Yayasan Alfida & Super Admin</li>
          </ul>
          <div className="pt-4 flex gap-3">
            <Button variant="primary" size="md">
              <Icon name="login" /> Masuk ke SIM
            </Button>
            <Button variant="outline" size="md">
              <Icon name="description" /> Dokumen Wireframe
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
