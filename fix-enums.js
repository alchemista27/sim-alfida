const fs = require('fs');
const path = require('path');

const ENUMS = {
  LeaveStatus: ["pending", "approved", "rejected"],
  LeaveType: ["cuti", "sakit", "izin"],
  WorkProgramStatus: ["planned", "ongoing", "completed", "canceled"],
  AttendanceStatus: ["present", "sick", "permitted", "absent"],
  GradeType: ["daily", "exam", "ats", "aas"],
  LessonPlanType: ["rpp", "prota", "promes", "modul", "silabus"],
  SubjectLevel: ["all", "tk", "sd", "smp", "sma"],
  ReportType: ["daily", "weekly", "monthly", "incidental"],
  DayOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  UnitLevel: ["tk", "sd", "smp", "sma", "pesantren"],
  UserRole: ["super_admin", "admin_unit", "guru", "karyawan", "orang_tua", "observer", "tim_ppdb"],
  RegistrationStatus: ["pending_payment", "payment_uploaded", "payment_verified", "form_filling", "documents_uploaded", "medical_pending", "medical_uploaded", "verification", "observation_scheduled", "observation_done", "accepted", "rejected", "enrolled"]
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // check if it is a client component
      if (content.includes('"use client"') || content.includes("'use client'")) {
        // Change import { ... } from "@sim/database" to import type { ... } from "@sim/database"
        if (content.match(/import\s+{([^}]+)}\s+from\s+["']@sim\/database["']/)) {
          content = content.replace(/import\s+{([^}]+)}\s+from\s+["']@sim\/database["']/g, (match, p1) => {
            // Check if it already has 'type'
            if (p1.trim().startsWith('type ')) return match;
            return `import type { ${p1} } from "@sim/database"`;
          });
          changed = true;
        }

        // Replace Enum.value with "value"
        for (const [enumName, values] of Object.entries(ENUMS)) {
          for (const val of values) {
            const regex = new RegExp(`${enumName}\\.${val}`, 'g');
            if (content.match(regex)) {
              content = content.replace(regex, `"${val}"`);
              changed = true;
            }
          }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'apps/web/src'));
