"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RegistrationStatus } from "@/generated/client";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getParentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { id: user.id };
}

// ── S5-04: Upload Required Documents (Batch) ──
export async function uploadRequiredDocumentsAction(formData: FormData) {
  const user = await getParentUser();
  const registrationId = formData.get("registrationId") as string;
  
  if (!registrationId) throw new Error("Data tidak lengkap.");

  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, parentId: user.id },
    include: { academicYear: { include: { unit: true } } },
  });

  if (!reg || (reg.status !== RegistrationStatus.documents_uploaded && reg.status !== RegistrationStatus.medical_pending)) {
    throw new Error("Transisi status tidak diizinkan saat ini.");
  }

  const fileKeys = ["photo", "father_id", "mother_id", "birth_certificate", "family_card", "school_certificate"];
  const uploadPromises: Promise<any>[] = [];

  const { uploadToCloudinary } = await import("@/lib/cloudinary");

  for (const key of fileKeys) {
    const file = formData.get(key) as File | null;
    if (file && file.size > 0) {
      uploadPromises.push(
        (async () => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const uploadedUrl = await uploadToCloudinary(
            buffer,
            `sim-alfida/documents/${reg.academicYear.unit.slug}/${reg.registrationNumber}`,
            `${key}-${Date.now()}`
          );
          
          const existingDoc = await prisma.document.findFirst({
            where: { registrationId, type: key as any }
          });
          
          if (existingDoc) {
            await prisma.document.update({
              where: { id: existingDoc.id },
              data: {
                fileUrl: uploadedUrl,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
              }
            });
          } else {
            await prisma.document.create({
              data: {
                registrationId,
                type: key as any,
                fileUrl: uploadedUrl,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
              }
            });
          }
        })()
      );
    }
  }

  await Promise.all(uploadPromises);

  // Check if all 5 required docs exist (school_certificate is optional for some)
  const docsCount = await prisma.document.count({
    where: { registrationId }
  });

  if (docsCount >= 5) {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.medical_pending },
    });
  }

  revalidatePath("/parent/documents");
  redirect("/parent/medical");
}

// ── S5-07: Upload Medical Result (IMC) ──
export async function uploadMedicalResultAction(formData: FormData) {
  const user = await getParentUser();
  const registrationId = formData.get("registrationId") as string;
  const file = formData.get("file") as File;
  
  if (!registrationId || !file) throw new Error("Data tidak lengkap.");

  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, parentId: user.id },
    include: { academicYear: { include: { unit: true } } },
  });

  if (!reg || reg.status !== RegistrationStatus.medical_pending) {
    throw new Error("Transisi status tidak valid untuk upload IMC.");
  }

  const { uploadToCloudinary } = await import("@/lib/cloudinary");
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const uploadedUrl = await uploadToCloudinary(
    buffer,
    `sim-alfida/documents/${reg.academicYear.unit.slug}/${reg.registrationNumber}`,
    `medical_result-${Date.now()}`
  );

  const existingDoc = await prisma.document.findFirst({
    where: { registrationId, type: "medical_result" as any }
  });

  if (existingDoc) {
    await prisma.document.update({
      where: { id: existingDoc.id },
      data: {
        fileUrl: uploadedUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }
    });
  } else {
    await prisma.document.create({
      data: {
        registrationId,
        type: "medical_result" as any,
        fileUrl: uploadedUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }
    });
  }

  // Transition to verification
  await prisma.registration.update({
    where: { id: registrationId },
    data: { status: RegistrationStatus.verification },
  });

  revalidatePath("/parent/medical");
  redirect("/parent/dashboard");
}
