import React from 'react';
import { getStaffDemographics } from '@/actions/hr-dashboard';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HRDashboardPage() {
  const data = await getStaffDemographics();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading text-primary">Dashboard Kepegawaian</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Pegawai Aktif</CardTitle>
          </CardHeader>
          <div className="text-4xl font-bold text-tertiary">
            {data.totalUsers}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Peran (Role)</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {data.rolesCount.map((roleInfo) => (
              <div key={roleInfo.role} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                <span className="capitalize">{roleInfo.role.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{roleInfo._count.userId}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Unit</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {data.formattedUnitBreakdown.map((unitInfo, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                <span>{unitInfo.unitName}</span>
                <span className="font-semibold">{unitInfo.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
