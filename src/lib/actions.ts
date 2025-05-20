
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
  removeMedicalHistoryFromPatient as dbRemoveMedicalHistory,
  calculateAge
} from "./data";
import type { Patient, PatientFormData, BloodGroup } from "./types";
// Hypothetical AI flow import - replace with actual flow if available
// import { summarizePatientDataFlow } from "@/ai/flows/patientSummary"; // Adjust path as needed

const PatientFormSchema = z.object({
  nom: z.string().min(1, "Le nom de famille est requis."),
  prenom: z.string().min(1, "Le prénom est requis."),
  dateDeNaissance: z.string().min(1, "La date de naissance est requise."),
  groupeSanguin: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPatientAction(formData: PatientFormData) {
  const validatedFields = PatientFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation échouée. Veuillez vérifier les champs.",
      success: false,
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
    return { message: "Patient créé avec succès.", patientId: newPatient.id, success: true };
  } catch (error) {
    return { message: "Échec de la création du patient.", success: false };
  }
}

export async function updatePatientAction(id: string, formData: PatientFormData) {
  const validatedFields = PatientFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation échouée. Veuillez vérifier les champs.",
      success: false,
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
    return { message: "Patient mis à jour avec succès.", success: true };
  } catch (error) {
    return { message: "Échec de la mise à jour du patient.", success: false };
  }
}

export async function deletePatientAction(id: string) {
  try {
    await dbDeletePatient(id);
    revalidatePath("/dashboard");
    revalidatePath("/patients");
    // It's generally better to return a status rather than redirecting from an action
    // The redirect can be handled by the component calling this action based on the result.
    // However, to keep current behavior:
  } catch (error) {
    // Consider returning an error message to be displayed
    // For now, the redirect will happen even if deletion fails on the server,
    // which might not be ideal.
    return { message: "Échec de la suppression du patient.", success: false };
  }
  redirect("/dashboard");
  // return { message: "Patient supprimé avec succès.", success: true }; // Alternative return
}

const AllergySchema = z.object({
  description: z.string().min(1, "La description de l'allergie ne peut pas être vide."),
});

export async function addAllergyAction(patientId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const validatedFields = AllergySchema.safeParse({ description });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation échouée.",
      success: false,
    };
  }

  try {
    await dbAddAllergy(patientId, validatedFields.data.description);
    revalidatePath(`/patients/${patientId}`);
    return { message: "Allergie ajoutée avec succès.", success: true };
  } catch (e) {
    return { message: "Échec de l'ajout de l'allergie.", success: false };
  }
}

export async function removeAllergyAction(patientId: string, allergyId: string) {
    try {
        await dbRemoveAllergy(patientId, allergyId);
        revalidatePath(`/patients/${patientId}`);
        return { message: "Allergie supprimée avec succès.", success: true };
    } catch (e) {
        return { message: "Échec de la suppression de l'allergie.", success: false };
    }
}

const MedicalHistorySchema = z.object({
  date: z.string().min(1, "La date est requise."),
  description: z.string().min(1, "La description est requise."),
});

export async function addMedicalHistoryAction(patientId: string, formData: FormData) {
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const validatedFields = MedicalHistorySchema.safeParse({ date, description });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation échouée.",
      success: false,
    };
  }

  try {
    await dbAddMedicalHistory(patientId, validatedFields.data);
    revalidatePath(`/patients/${patientId}`);
    return { message: "Entrée d'antécédent médical ajoutée avec succès.", success: true };
  } catch (e) {
    return { message: "Échec de l'ajout de l'antécédent médical.", success: false };
  }
}

export async function removeMedicalHistoryAction(patientId: string, historyId: string) {
    try {
        await dbRemoveMedicalHistory(patientId, historyId);
        revalidatePath(`/patients/${patientId}`);
        return { message: "Entrée d'antécédent médical supprimée avec succès.", success: true };
    } catch (e) {
        return { message: "Échec de la suppression de l'entrée d'antécédent médical.", success: false };
    }
}


export async function generateHealthSummaryAction(patientId: string): Promise<{ summary?: string; error?: string }> {
  const patient = await dbGetPatientById(patientId);
  if (!patient) {
    return { error: "Patient non trouvé." };
  }

  try {
    // IMPORTANT: Ceci est un placeholder pour l'appel réel au flux IA.
    // Vous devrez importer et utiliser votre flux Genkit ici.
    // Exemple : const summary = await summarizePatientDataFlow(patient);
    // Le flux doit être défini dans src/ai/flows (par ex. src/ai/flows/patientSummary.ts)
    // et doit être correctement configuré avec Genkit.
    
    console.warn("Fonctionnalité Résumé IA : Utilisation d'un résumé fictif. Implémentez l'appel réel au flux IA dans src/lib/actions.ts");
    
    const patientAge = calculateAge(patient.dateDeNaissance);
    const allergiesText = patient.allergies.length > 0 ? patient.allergies.map(a => a.description).join(', ') : 'Aucune connue';
    const historyText = patient.antecedents.length > 0 ? patient.antecedents.map(h => `${h.description} (en ${new Date(h.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })})`).join('; ') : 'Aucun notable';

    const mockSummary = `Résumé pour ${patient.prenom} ${patient.nom}:\nÂge : ${patientAge} ans.\nAllergies : ${allergiesText}.\nAntécédents médicaux : ${historyText}.\nNotes générales : ${patient.notes || 'Aucune note.'}`;
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { summary: mockSummary };
  } catch (error) {
    console.error("Erreur lors de la génération du résumé de santé :", error);
    return { error: "Échec de la génération du résumé de santé. " + (error instanceof Error ? error.message : String(error)) };
  }
}
