import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import React from "react";

// Font Registration (Use standard fonts or load custom ones)
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Open Sans", fontSize: 11, lineHeight: 1.5, color: "#333" },
  headerContainer: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#0f7f6d", paddingBottom: 15, marginBottom: 20 },
  logoWrapper: { width: 70, justifyContent: "center", alignItems: "center" },
  logo: { width: 60, height: 60 },
  headerTextContainer: { flex: 1, textAlign: "center", justifyContent: "center" },
  foundationName: { fontSize: 16, fontWeight: 700, color: "#0f7f6d" },
  unitName: { fontSize: 14, fontWeight: 700, marginTop: 4 },
  unitAddress: { fontSize: 10, marginTop: 4, color: "#666" },
  title: { textAlign: "center", fontSize: 14, fontWeight: 700, marginTop: 10, marginBottom: 4, textDecoration: "underline" },
  refNumber: { textAlign: "center", fontSize: 10, marginBottom: 20 },
  content: { marginTop: 10 },
  paragraph: { marginBottom: 10, textAlign: "justify" },
  table: { marginTop: 10, marginBottom: 20, width: "100%" },
  tableRow: { flexDirection: "row", marginBottom: 5 },
  tableCellLabel: { width: "30%", fontWeight: 700 },
  tableCellSeparator: { width: "5%" },
  tableCellValue: { width: "65%" },
  footerContainer: { marginTop: 40, flexDirection: "row", justifyContent: "flex-end" },
  signatureBox: { width: 200, textAlign: "center" },
  signatureDate: { marginBottom: 30 },
  signatureName: { fontWeight: 700, textDecoration: "underline" },
  signatureNip: { fontSize: 10 },
  badgeSuccess: { color: "#06bfa2", fontWeight: 700, fontSize: 12 },
});

interface AcceptanceLetterProps {
  unit: {
    name: string;
    logoUrl?: string | null;
    principalName: string;
    principalNip?: string | null;
  };
  student: {
    name: string;
    nisn?: string | null;
    registrationNumber: string;
  };
  date: string;
}

export const AcceptanceLetterDocument = ({ unit, student, date }: AcceptanceLetterProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* KOP SURAT */}
      <View style={styles.headerContainer}>
        <View style={styles.logoWrapper}>
          {/* Menggunakan placeholder jika logo tidak ada */}
          <Image src={unit.logoUrl || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"} style={styles.logo} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.foundationName}>YAYASAN ALFIDA</Text>
          <Text style={styles.unitName}>{unit.name.toUpperCase()}</Text>
          <Text style={styles.unitAddress}>Jl. Pendidikan No. 123, Kota Cerdas, Indonesia</Text>
        </View>
      </View>

      {/* JUDUL SURAT */}
      <Text style={styles.title}>SURAT KETERANGAN KELULUSAN</Text>
      <Text style={styles.refNumber}>Nomor: 045/PPDB/{unit.name.substring(0,3).toUpperCase()}/{new Date().getFullYear()}</Text>

      {/* ISI SURAT */}
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Berdasarkan hasil serangkaian tes observasi dan seleksi Penerimaan Peserta Didik Baru (PPDB) {unit.name} Tahun Ajaran {new Date().getFullYear()}/{new Date().getFullYear()+1}, Kepala {unit.name} menerangkan bahwa calon peserta didik di bawah ini:
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>Nama Lengkap</Text>
            <Text style={styles.tableCellSeparator}>:</Text>
            <Text style={styles.tableCellValue}>{student.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>NISN</Text>
            <Text style={styles.tableCellSeparator}>:</Text>
            <Text style={styles.tableCellValue}>{student.nisn || "-"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>No. Pendaftaran</Text>
            <Text style={styles.tableCellSeparator}>:</Text>
            <Text style={styles.tableCellValue}>{student.registrationNumber}</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Dinyatakan <Text style={styles.badgeSuccess}>LULUS / DITERIMA</Text> sebagai calon peserta didik baru di {unit.name}.
        </Text>

        <Text style={styles.paragraph}>
          Demikian surat keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya. Kami mengucapkan selamat bergabung menjadi bagian dari keluarga besar Yayasan Alfida.
        </Text>
      </View>

      {/* TANDA TANGAN */}
      <View style={styles.footerContainer}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureDate}>Ditetapkan pada: {date}</Text>
          <Text style={styles.signatureName}>{unit.principalName}</Text>
          {unit.principalNip && <Text style={styles.signatureNip}>NIP. {unit.principalNip}</Text>}
        </View>
      </View>
    </Page>
  </Document>
);
