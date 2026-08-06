import React from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="p-6 flex flex-col border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="w-10 h-10 rounded-full bg-teal-50 text-tertiary flex items-center justify-center">
          <Icon name={icon} className="text-xl" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-heading font-bold text-primary">
          {value}
        </h2>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trendUp ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
