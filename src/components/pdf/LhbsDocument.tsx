import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  yayasanName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unitName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  address: {
    fontSize: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  infoTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoCol: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 10,
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'column',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colNo: { width: '5%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
  colMapel: { width: '40%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4 },
  colNilai: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
  colPredikat: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
  colDeskripsi: { width: '30%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4 },
  colExtraName: { width: '60%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4 },
  colExtraNilai: { width: '35%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
  colAttdReason: { width: '60%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4 },
  colAttdDays: { width: '35%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
  cellText: { fontSize: 9 },
  cellTextBold: { fontSize: 9, fontWeight: 'bold' },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  sigBox: {
    width: '30%',
    alignItems: 'center',
  },
  sigDate: {
    fontSize: 10,
    marginBottom: 50,
  },
  sigName: {
    fontSize: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  sigTitle: {
    fontSize: 9,
    marginTop: 2,
  },
  principalSigImg: {
    width: 80,
    height: 40,
    position: 'absolute',
    top: 15,
  }
});

interface LhbsDocumentProps {
  report: any;
  student: any;
  unit: any;
  className: string;
  academicYear: any;
  homeroomTeacher: any;
}

export const LhbsDocument = ({ report, student, unit, className, academicYear, homeroomTeacher }: LhbsDocumentProps) => {
  const isMid = report.semester === 'mid';
  const title = isMid ? "LAPORAN HASIL BELAJAR TENGAH SEMESTER (ATS)" : "LAPORAN HASIL BELAJAR AKHIR SEMESTER (AAS)";
  
  const grades = (report.gradesSnapshot as any[]) || [];
  const extras = (report.extraSnapshot as any[]) || [];
  const attd = (report.attendanceSum as any) || { sick: 0, permitted: 0, absent: 0 };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {unit?.logoUrl ? (
            <Image src={unit.logoUrl} style={{ width: 60, height: 60, marginRight: 15 }} />
          ) : (
            <View style={styles.logoPlaceholder} />
          )}
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.yayasanName}>YAYASAN ALFIDA</Text>
            <Text style={styles.unitName}>{unit?.name || "UNIT PENDIDIKAN"}</Text>
            <Text style={styles.address}>Jl. Pendidikan No. 123, Kota Cerdas. Telp: (021) 1234567</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>

        {/* Info Siswa */}
        <View style={styles.infoTable}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Nama Siswa</Text><Text style={styles.infoValue}>: {student?.fullName}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>NISN</Text><Text style={styles.infoValue}>: {student?.nisn || "-"}</Text></View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Kelas</Text><Text style={styles.infoValue}>: {className}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Semester</Text><Text style={styles.infoValue}>: {isMid ? "Ganjil / Tengah" : "Genap / Akhir"}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Tahun Ajaran</Text><Text style={styles.infoValue}>: {academicYear?.name}</Text></View>
          </View>
        </View>

        {/* Tabel Akademik */}
        <Text style={styles.sectionTitle}>A. SIKAP DAN AKADEMIK</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colNo}><Text style={styles.cellTextBold}>No</Text></View>
            <View style={styles.colMapel}><Text style={styles.cellTextBold}>Mata Pelajaran</Text></View>
            <View style={styles.colNilai}><Text style={styles.cellTextBold}>Nilai Akhir</Text></View>
            <View style={styles.colPredikat}><Text style={styles.cellTextBold}>Predikat</Text></View>
            <View style={styles.colDeskripsi}><Text style={styles.cellTextBold}>Deskripsi Capaian</Text></View>
          </View>
          
          {grades.map((g, idx) => (
            <View style={styles.tableRow} key={idx}>
              <View style={styles.colNo}><Text style={styles.cellText}>{idx + 1}</Text></View>
              <View style={styles.colMapel}><Text style={styles.cellText}>{g.subjectName}</Text></View>
              <View style={styles.colNilai}><Text style={styles.cellTextBold}>{g.finalScore}</Text></View>
              <View style={styles.colPredikat}><Text style={styles.cellTextBold}>{g.predikat}</Text></View>
              <View style={styles.colDeskripsi}><Text style={styles.cellText}>{g.predikat === 'A' ? 'Sangat Baik' : g.predikat === 'B' ? 'Baik' : g.predikat === 'C' ? 'Cukup' : 'Kurang'}</Text></View>
            </View>
          ))}
          {grades.length === 0 && (
            <View style={styles.tableRow}>
              <View style={[styles.colNo, { width: '100%' }]}><Text style={styles.cellText}>Belum ada nilai akademik yang tercatat.</Text></View>
            </View>
          )}
        </View>

        {/* Tabel Ekstrakurikuler */}
        <Text style={styles.sectionTitle}>B. EKSTRAKURIKULER</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colNo}><Text style={styles.cellTextBold}>No</Text></View>
            <View style={styles.colExtraName}><Text style={styles.cellTextBold}>Kegiatan Ekstrakurikuler</Text></View>
            <View style={styles.colExtraNilai}><Text style={styles.cellTextBold}>Predikat</Text></View>
          </View>
          
          {extras.map((ex, idx) => (
            <View style={styles.tableRow} key={idx}>
              <View style={styles.colNo}><Text style={styles.cellText}>{idx + 1}</Text></View>
              <View style={styles.colExtraName}><Text style={styles.cellText}>{ex.extraName}</Text></View>
              <View style={styles.colExtraNilai}><Text style={styles.cellTextBold}>{ex.score}</Text></View>
            </View>
          ))}
          {extras.length === 0 && (
            <View style={styles.tableRow}>
              <View style={[styles.colNo, { width: '100%' }]}><Text style={styles.cellText}>Tidak mengikuti ekstrakurikuler.</Text></View>
            </View>
          )}
        </View>

        {/* Tabel Kehadiran */}
        <Text style={styles.sectionTitle}>C. KETIDAKHADIRAN</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colNo}><Text style={styles.cellTextBold}>No</Text></View>
            <View style={styles.colAttdReason}><Text style={styles.cellTextBold}>Alasan</Text></View>
            <View style={styles.colAttdDays}><Text style={styles.cellTextBold}>Jumlah</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.colNo}><Text style={styles.cellText}>1</Text></View>
            <View style={styles.colAttdReason}><Text style={styles.cellText}>Sakit</Text></View>
            <View style={styles.colAttdDays}><Text style={styles.cellText}>{attd.sick} hari</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.colNo}><Text style={styles.cellText}>2</Text></View>
            <View style={styles.colAttdReason}><Text style={styles.cellText}>Izin</Text></View>
            <View style={styles.colAttdDays}><Text style={styles.cellText}>{attd.permitted} hari</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.colNo}><Text style={styles.cellText}>3</Text></View>
            <View style={styles.colAttdReason}><Text style={styles.cellText}>Tanpa Keterangan</Text></View>
            <View style={styles.colAttdDays}><Text style={styles.cellText}>{attd.absent} hari</Text></View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.sigBox}>
            <Text style={[styles.sigDate, { color: '#fff' }]}>Date Placeholder</Text>
            <Text style={styles.sigTitle}>Mengetahui,</Text>
            <Text style={[styles.sigTitle, { marginBottom: 40 }]}>Orang Tua/Wali</Text>
            <Text style={styles.sigName}>...................................</Text>
          </View>
          <View style={styles.sigBox}>
            <Text style={styles.sigDate}>Kota Cerdas, {new Date().toLocaleDateString('id-ID')}</Text>
            <Text style={styles.sigTitle}>Wali Kelas</Text>
            <Text style={{ marginBottom: 40 }}></Text>
            <Text style={styles.sigName}>{homeroomTeacher?.fullName || "..................................."}</Text>
            <Text style={styles.sigTitle}>NIP. -</Text>
          </View>
          <View style={styles.sigBox}>
            <Text style={[styles.sigDate, { color: '#fff' }]}>Date Placeholder</Text>
            <Text style={styles.sigTitle}>Mengetahui,</Text>
            <Text style={[styles.sigTitle, { marginBottom: 40 }]}>Kepala {unit?.name || "Sekolah"}</Text>
            {unit?.principalSignatureUrl && (
              <Image src={unit.principalSignatureUrl} style={styles.principalSigImg} />
            )}
            <Text style={styles.sigName}>{unit?.principalName || "..................................."}</Text>
            <Text style={styles.sigTitle}>NIP. {unit?.principalNip || "-"}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};
