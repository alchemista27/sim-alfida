import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { DayOfWeek } from "@sim/database";

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
    marginBottom: 15,
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
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'column',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableColDay: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    backgroundColor: '#e5e7eb',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableColTime: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    textAlign: 'center',
  },
  tableColExtra: {
    width: '35%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
  },
  tableColLocation: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
  },
  cellText: {
    fontSize: 10,
  }
});

interface ExtraScheduleDocumentProps {
  student: any;
  schedules: any[];
  unit: any;
  academicYear: any;
  className: string;
}

export const ExtraScheduleDocument = ({ student, schedules, unit, academicYear, className }: ExtraScheduleDocumentProps) => {
  const dayLabels: Record<DayOfWeek, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu"
  };

  const groupedSchedules = Object.values(DayOfWeek).reduce((acc, currentDay) => {
    acc[currentDay] = schedules.filter(s => s.day === currentDay);
    return acc;
  }, {} as Record<DayOfWeek, any[]>);

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

        <Text style={styles.title}>Jadwal Ekstrakurikuler Siswa</Text>

        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Siswa</Text>
            <Text style={styles.infoValue}>: {student?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas</Text>
            <Text style={styles.infoValue}>: {className}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tahun Ajaran</Text>
            <Text style={styles.infoValue}>: {academicYear?.name}</Text>
          </View>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColDay}><Text style={styles.cellText}>Hari</Text></View>
            <View style={styles.tableColTime}><Text style={styles.cellText}>Waktu</Text></View>
            <View style={styles.tableColExtra}><Text style={styles.cellText}>Ekstrakurikuler</Text></View>
            <View style={styles.tableColLocation}><Text style={styles.cellText}>Lokasi</Text></View>
          </View>

          {/* Table Body */}
          {Object.values(DayOfWeek).map(day => {
            const daySchedules = groupedSchedules[day];
            if (daySchedules.length === 0) return null;

            return daySchedules.map((s, index) => (
              <View style={styles.tableRow} key={s.id || index}>
                {index === 0 ? (
                  <View style={styles.tableColDay}>
                    <Text style={styles.cellText}>{dayLabels[day]}</Text>
                  </View>
                ) : (
                  <View style={styles.tableColDay}><Text style={styles.cellText}> </Text></View>
                )}
                <View style={styles.tableColTime}>
                  <Text style={styles.cellText}>{s.startTime} - {s.endTime}</Text>
                </View>
                <View style={styles.tableColExtra}>
                  <Text style={styles.cellText}>{s.extraName}</Text>
                </View>
                <View style={styles.tableColLocation}>
                  <Text style={styles.cellText}>{s.location || "-"}</Text>
                </View>
              </View>
            ));
          })}
        </View>

        {schedules.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 12, color: '#666', fontStyle: 'italic' }}>
            Siswa tidak terdaftar dalam jadwal ekstrakurikuler mana pun.
          </Text>
        )}

      </Page>
    </Document>
  );
};
