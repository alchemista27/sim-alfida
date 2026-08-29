"use client";

import React from "react";

interface PasswordMeterProps {
  password?: string;
}

export function PasswordMeter({ password = "" }: PasswordMeterProps) {
  const getScore = () => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const score = getScore();

  const getLabel = () => {
    if (!password) return "";
    if (score <= 1) return "Sangat Lemah";
    if (score === 2) return "Sederhana";
    if (score === 3) return "Kuat";
    return "Sangat Kuat";
  };

  const getColor = () => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-teal-500";
    return "bg-emerald-600";
  };

  if (!password) return null;

  return (
    <div className="mt-1 flex flex-col gap-1">
      <div className="flex h-1.5 w-full bg-gray-200 rounded-full overflow-hidden gap-1">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        Kekuatan Password: <strong className="text-primary">{getLabel()}</strong>
      </span>
    </div>
  );
}
