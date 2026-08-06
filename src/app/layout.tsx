import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida",
  description: "Sistem Informasi Manajemen Pegawai, Karyawan, dan PPDB Yayasan Alfida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-neutral text-primary">
        {children}
      </body>
    </html>
  );
}
