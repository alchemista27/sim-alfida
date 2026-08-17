import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica', // We use standard fonts for simplicity, you can register custom fonts later
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 100,
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    alignItems: 'center',
    width: 200,
  },
  signatureDate: {
    fontSize: 11,
    marginBottom: 40, // Space for signature
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  signatureRole: {
    fontSize: 11,
  }
});

interface LessonPlanDocumentProps {
  plan: any;
  unit: any;
}

export const LessonPlanDocument = ({ plan, unit }: LessonPlanDocumentProps) => {
  // Parse JSON content if possible
  let tujuan = "";
  let langkah = "";
  let asesmen = "";
  
  try {
    const parsed = JSON.parse(plan.content);
    tujuan = parsed.tujuan || "";
    langkah = parsed.langkah || "";
    asesmen = parsed.asesmen || "";
  } catch (e) {
    tujuan = plan.content;
  }

  const typeLabels = {
    prota: "Program Tahunan (Prota)",
    promes: "Program Semester (Promes)",
    rpp: "Rencana Pelaksanaan Pembelajaran (RPP)"
  };
  
  const planType = typeLabels[plan.type as keyof typeof typeLabels] || "Dokumen Perencanaan";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Kop Surat */}
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

        {/* Title */}
        <Text style={styles.title}>{planType}</Text>

        {/* Info */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mata Pelajaran</Text>
            <Text style={styles.infoValue}>: {plan.subject?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guru Pengampu</Text>
            <Text style={styles.infoValue}>: {plan.teacher?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tahun Ajaran</Text>
            <Text style={styles.infoValue}>: {plan.academicYear?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Topik / Judul</Text>
            <Text style={styles.infoValue}>: {plan.title}</Text>
          </View>
        </View>

        {/* Content Sections */}
        {tujuan && (
          <View>
            <Text style={styles.sectionTitle}>A. Tujuan Pembelajaran</Text>
            <Text style={styles.content}>{tujuan}</Text>
          </View>
        )}

        {langkah && (
          <View>
            <Text style={styles.sectionTitle}>B. Langkah-langkah Kegiatan</Text>
            <Text style={styles.content}>{langkah}</Text>
          </View>
        )}

        {asesmen && (
          <View>
            <Text style={styles.sectionTitle}>C. Penilaian / Asesmen</Text>
            <Text style={styles.content}>{asesmen}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}>Mengetahui,</Text>
            <Text style={{ fontSize: 11, marginBottom: 40 }}>Kepala Sekolah</Text>
            <Text style={styles.signatureName}>_______________________</Text>
            <Text style={styles.signatureRole}>NIP. </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}>Kota Cerdas, {new Date().toLocaleDateString('id-ID')}</Text>
            <Text style={{ fontSize: 11, marginBottom: 40 }}>Guru Mata Pelajaran</Text>
            <Text style={styles.signatureName}>{plan.teacher?.fullName}</Text>
            <Text style={styles.signatureRole}>NIP. {plan.teacher?.id?.substring(0,8)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
