const navGroups = [
  { title: "Portal Orang Tua" },
  { title: "Portal Orang Tua (Akademik)" },
  { title: "Bina Pribadi Islami" }
];

const userRoles = [{ role: "admin_bpi" }];
const status = "authenticated";

const isSuperAdmin = userRoles.some(r => r.role === "super_admin");
const isAdminBpi = userRoles.some(r => r.role === "admin_bpi");
const isParent = userRoles.some(r => r.role === "orang_tua"); // This is false

const filteredGroups = navGroups.filter(group => {
  if (isSuperAdmin) {
    return ["Auth & Utama", "Super Admin", "Manajemen Karyawan", "Bina Pribadi Islami"].includes(group.title);
  }

  if (group.title === "Bina Pribadi Islami" && !isAdminBpi) return false;
  if (group.title === "Portal Orang Tua" && !isParent) return false;
  if (group.title === "Portal Orang Tua (Akademik)" && !isParent) return false;

  return true;
});

console.log("isParent:", isParent);
console.log("Filtered Groups:", filteredGroups);
