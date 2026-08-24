import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', borderBottom: 1, paddingBottom: 10, marginBottom: 20 },
  logoBox: { width: 60, height: 60, marginRight: 15 },
  logo: { width: '100%', height: '100%' },
  kopText: { flex: 1, justifyContent: 'center' },
  yayasanName: { fontSize: 16, fontWeight: 'bold' },
  unitName: { fontSize: 14, marginTop: 4 },
  address: { fontSize: 10, marginTop: 4, color: '#444' },
  title: { fontSize: 14, textAlign: 'center', fontWeight: 'bold', marginVertical: 10, textDecoration: 'underline' },
  content: { fontSize: 12, lineHeight: 1.5, marginTop: 10 },
  row: { flexDirection: 'row', marginTop: 5 },
  label: { width: 150 },
  value: { flex: 1, fontWeight: 'bold' },
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'flex-end' },
  signatureBox: { width: 200, alignItems: 'center' },
  signDate: { fontSize: 12, marginBottom: 10 },
  signImage: { width: 100, height: 60, marginVertical: 5 },
  signName: { fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' },
});

export const ImcLetterDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          {data.unitLogo ? <Image src={data.unitLogo} style={styles.logo} /> : null}
        </View>
        <View style={styles.kopText}>
          <Text style={styles.yayasanName}>YAYASAN ALFIDA</Text>
          <Text style={styles.unitName}>{data.unitName}</Text>
          <Text style={styles.address}>Jl. Raya Pendidikan No. 1, Kota Alfida. Telp: (021) 123456</Text>
        </View>
      </View>

      <Text style={styles.title}>SURAT PENGANTAR IDENTIFIKASI MEDIS CALON SISWA (IMC)</Text>
      
      <View style={styles.content}>
        <Text>Kepada Yth.,</Text>
        <Text>Pimpinan Laboratorium / Klinik Kesehatan</Text>
        <Text>di tempat</Text>
        
        <Text style={{ marginTop: 15 }}>Dengan hormat,</Text>
        <Text style={{ marginTop: 5 }}>Mohon bantuan Bapak/Ibu untuk dapat melakukan pemeriksaan kesehatan (Identifikasi Medis) terhadap calon siswa kami berikut ini:</Text>
        
        <View style={{ marginTop: 15, marginLeft: 20 }}>
          <View style={styles.row}>
            <Text style={styles.label}>No. Pendaftaran</Text>
            <Text style={styles.value}>: {data.registrationNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <Text style={styles.value}>: {data.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tempat, Tanggal Lahir</Text>
            <Text style={styles.value}>: {data.birthPlace}, {data.birthDate}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 15 }}>Adapun hasil pemeriksaan mohon diserahkan kembali kepada orang tua/wali untuk diunggah pada sistem PPDB SIM-Alfida.</Text>
        <Text style={{ marginTop: 5 }}>Atas bantuan dan kerjasamanya kami ucapkan terima kasih.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.signatureBox}>
          <Text style={styles.signDate}>{data.dateStr}</Text>
          <Text style={styles.signDate}>Kepala Sekolah,</Text>
          {data.signature ? <Image src={data.signature} style={styles.signImage} /> : <View style={{ height: 60 }} />}
          <Text style={styles.signName}>{data.principalName}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
