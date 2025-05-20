"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  addPatient as dbAddPatient,
  updatePatient as dbUpdatePatient,
  deletePatient as dbDeletePatient,
  getPatientById as dbGetPatientById,
  addAllergyToPatient as dbAddAllergy,
  removeAllergyFromPatient as dbRemoveAllergy,
  addMedicalHistoryToPatient as dbAddMedicalHistory,
  removeMedicalHistoryFromPatient as dbRemoveMedicalHistory
} from "./data";
import type { Patient, PatientFormData, BloodGroup } from "./types";
// Hypothetical AI flow import - replace with actual flow if available
// import { summarizePatientDataFlow } from "@/ai/flows/patientSummary"; // Adjust path as needed

const PatientFormSchema = z.object({
  nom: z.string().min(1, "Last name is required."),
  prenom: z.string().min(1, "First name is required."),
  dateDeNaissance: z.string().min(1, "Date of birth is required."),
  groupeSanguin: z.string().optional(), // zod doesn't have a direct enum for this without defining it
  notes: z.string().optional(),
});

export async function createPatientAction(formData: PatientFormData) {
  const validatedFields = PatientFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }

  const { nom, prenom, dateDeNaissance, groupeSanguin, notes } = validatedFields.data;

  try {
    const newPatient = await dbAddPatient({
      nom,
      prenom,
      dateDeNaissance,
      groupeSanguin: (groupeSanguin as BloodGroup) || '',
      notes: notes || '',
    });
    revalidatePath("/dashboard");
    revalidatePath("/patients");
    return { message: "Patient created successfully.", patientId: newPatient.id, success: true };
  } catch (error) {
    return { message: "Failed to create patient.", success: false };
  }
}

export async function updatePatientAction(id: string, formData: PatientFormData) {
  const validatedFields = PatientFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }
  
  const { nom, prenom, dateDeNaissance, groupeSanguin, notes } = validatedFields.data;

  try {
    await dbUpdatePatient(id, {
      nom,
      prenom,
      dateDeNaissance,
      groupeSanguin: (groupeSanguin as BloodGroup) || '',
      notes: notes || '',
    });
    revalidatePath("/dashboard");
    revalidatePath(`/patients/${id}`);
    revalidatePath(`/patients/${id}/edit`);
    revalidatePath("/patients");
    return { message: "Patient updated successfully.", success: true };
  } catch (error) {
    return { message: "Failed to update patient.", success: false };
  }
}

export async function deletePatientAction(id: string) {
  try {
    await dbDeletePatient(id);
    revalidatePath("/dashboard");
    revalidatePath("/patients");
  } catch (error) {
    return { message: "Failed to delete patient." };
  }
  redirect("/dashboard");
}

const AllergySchema = z.object({
  description: z.string().min(1, "Allergy description cannot be empty."),
});

export async function addAllergyAction(patientId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const validatedFields = AllergySchema.safeParse({ description });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    await dbAddAllergy(patientId, validatedFields.data.description);
    revalidatePath(`/patients/${patientId}`);
    return { message: "Allergy added successfully.", success: true };
  } catch (e) {
    return { message: "Failed to add allergy.", success: false };
  }
}

export async function removeAllergyAction(patientId: string, allergyId: string) {
    try {
        await dbRemoveAllergy(patientId, allergyId);
        revalidatePath(`/patients/${patientId}`);
        return { message: "Allergy removed successfully.", success: true };
    } catch (e) {
        return { message: "Failed to remove allergy.", success: false };
    }
}

const MedicalHistorySchema = z.object({
  date: z.string().min(1, "Date is required."),
  description: z.string().min(1, "Description is required."),
});

export async function addMedicalHistoryAction(patientId: string, formData: FormData) {
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const validatedFields = MedicalHistorySchema.safeParse({ date, description });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    await dbAddMedicalHistory(patientId, validatedFields.data);
    revalidatePath(`/patients/${patientId}`);
    return { message: "Medical history entry added successfully.", success: true };
  } catch (e) {
    return { message: "Failed to add medical history.", success: false };
  }
}

export async function removeMedicalHistoryAction(patientId: string, historyId: string) {
    try {
        await dbRemoveMedicalHistory(patientId, historyId);
        revalidatePath(`/patients/${patientId}`);
        return { message: "Medical history entry removed successfully.", success: true };
    } catch (e) {
        return { message: "Failed to remove medical history entry.", success: false };
    }
}


export async function generateHealthSummaryAction(patientId: string): Promise<{ summary?: string; error?: string }> {
  const patient = await dbGetPatientById(patientId);
  if (!patient) {
    return { error: "Patient not found." };
  }

  try {
    // IMPORTANT: This is a placeholder for the actual AI flow call.
    // You will need to import and use your Genkit flow here.
    // Example: const summary = await summarizePatientDataFlow(patient);
    // The flow must be defined in src/ai/flows (e.g. src/ai/flows/patientSummary.ts)
    // and needs to be properly configured with Genkit.
    
    // For now, returning a mock summary:
    // Ensure you have `gemini-1.5-flash-latest` or a similar model configured in your genkit setup.
    // const { summarizePatientRecord } = await import('@/ai/flows/summarizePatientRecord'); // Ensure this path is correct
    // const summary = await summarizePatientRecord(patient);
    
    // Mocking AI call for now as the flow is not provided by the user in the prompt.
    // This part needs to be replaced with actual AI call from `src/ai/flows`
    console.warn("AI Summary Feature: Using mock summary. Implement actual AI flow call in src/lib/actions.ts");
    const mockSummary = `Summary for ${patient.prenom} ${patient.nom}:\nAge: ${new Date().getFullYear() - new Date(patient.dateDeNaissance).getFullYear()}.\nAllergies: ${patient.allergies.map(a => a.description).join(', ') || 'None'}.\nMedical History: ${patient.antecedents.map(h => `${h.description} (${h.date})`).join('; ') || 'None'}.`;
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { summary: mockSummary };
  } catch (error) {
    console.error("Error generating health summary:", error);
    return { error: "Failed to generate health summary. " + (error instanceof Error ? error.message : String(error)) };
  }
}
