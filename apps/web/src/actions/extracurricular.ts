"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function joinExtracurricular(enrollmentId: string, extraId: string, academicYearId: string) {
  try {
    await apiFetch("/academic/extracurricular/join", {
      method: "POST",
      body: JSON.stringify({ enrollmentId, extraId, academicYearId })
    });
    revalidatePath("/parent/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function leaveExtracurricular(memberId: string) {
  try {
    await apiFetch(`/academic/extracurricular/leave/${memberId}`, { method: "DELETE" });
    revalidatePath("/parent/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertExtracurricular(data: any) {
  try {
    await apiFetch("/academic/extracurricular", { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/unit/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function assignCoach({extraId, coachId}: {extraId: string, coachId: string}, academicYearId?: string) {
  try {
    await apiFetch(`/academic/extracurricular/${extraId}/coaches`, { method: "POST", body: JSON.stringify({ userId: coachId, academicYearId }) });
    revalidatePath("/unit/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function removeCoach(id: string) {
  try {
    await apiFetch(`/academic/extracurricular/coaches/${id}`, { method: "DELETE" });
    revalidatePath("/unit/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function upsertExtraSchedule(data: any) {
  try {
    await apiFetch(`/academic/extracurricular/${data.extraId}/schedules`, { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function deleteExtraSchedule(id: string) {
  try {
    await apiFetch(`/academic/extracurricular/schedules/${id}`, { method: "DELETE" });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function upsertExtraJournal(data: any) {
  try {
    await apiFetch(`/academic/extracurricular/${data.extraId}/journals`, { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function deleteExtraJournal(id: string) {
  try {
    await apiFetch(`/academic/extracurricular/journals/${id}`, { method: "DELETE" });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function upsertExtraGrade(data: any) {
  try {
    await apiFetch(`/academic/extracurricular/${data.extraId}/grades`, { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
