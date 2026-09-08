"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createSubject(data: any) {
  try {
    data.isActive = data.isActive === 'true' || data.isActive === true;
    data.level = parseInt(data.level as string) || data.level;
    
    await apiFetch(`/academic/subjects?unitId=${data.unitId || ""}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    revalidatePath("/unit/academic-subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat mata pelajaran." };
  }
}

export async function updateSubject(id: string, data: any) {
  try {
    data.isActive = data.isActive === 'true' || data.isActive === true;
    data.level = parseInt(data.level as string) || data.level;

    await apiFetch(`/academic/subjects/${id}?unitId=${data.unitId || ""}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    
    revalidatePath("/unit/academic-subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui mata pelajaran." };
  }
}

export async function deleteSubject(id: string, unitId?: string) {
  try {
    await apiFetch(`/academic/subjects/${id}?unitId=${unitId || ""}`, { method: "DELETE" });
    revalidatePath("/unit/academic-subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus mata pelajaran. Pastikan mapel ini belum digunakan (assigned)." };
  }
}

export async function assignTeacherToSubject(formData: any, academicYearId: string) {
  try {
    await apiFetch(`/academic/teachers?academicYearId=${academicYearId}`, {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menugaskan guru mapel." };
  }
}

export async function removeTeacherAssignment(id: string) {
  try {
    await apiFetch(`/academic/teachers/${id}`, { method: "DELETE" });
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus penugasan guru mapel." };
  }
}

export async function assignHomeroomTeacher(formData: any, academicYearId: string) {
  try {
    await apiFetch(`/academic/homerooms?academicYearId=${academicYearId}`, {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menugaskan wali kelas." };
  }
}

export async function removeHomeroomAssignment(id: string) {
  try {
    await apiFetch(`/academic/homerooms/${id}`, { method: "DELETE" });
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus penugasan wali kelas." };
  }
}

export async function submitBatchAttendance(formData: any, academicYearId: string) {
  try {
    await apiFetch("/academic/attendance/batch", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/teacher/attendance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan absensi." };
  }
}

export async function submitBatchGrade(formData: any, academicYearId: string) {
  try {
    await apiFetch(`/academic/grades/batch?academicYearId=${academicYearId}`, {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/teacher/grades");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan nilai." };
  }
}
