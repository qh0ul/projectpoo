
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
import type { Patient, PatientFormData, BloodGroup, Allergy, MedicalHistoryEntry, BloodGroupSelectOption } from "./types";
// import { summarizePatientDataFlow } from "@/ai/flows/patientSummary"; 

const PatientFormSchema = z.object({
  nom: z.string().min(2, "Le nom de famille doit comporter au moins 2 caractères."),
  prenom: z.string().min(2, "Le prénom doit comporter au moins 2 caractères."),
  dateDeNaissance: z.string().min(1, "La date de naissance est requise."),
  groupeSanguin: z.custom<BloodGroupSelectOption>((val) => {
    const validBloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return val === "" || (typeof val === 'string' && validBloodGroups.includes(val as BloodGroup));
  }).optional(),
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
  } catch (error) {
    return { message: "Échec de la suppression du patient.", success: false };
  }
  redirect("/dashboard"); 
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
      message: "Validation échouée pour l'allergie.",
      success: false,
    };
  }

  try {
    const newAllergy = await dbAddAllergy(patientId, validatedFields.data.description);
    if (!newAllergy) throw new Error("Failed to create allergy in DB");
    revalidatePath(`/patients/${patientId}`);
    return { message: "Allergie ajoutée avec succès.", success: true, newAllergyId: newAllergy.id };
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
      message: "Validation échouée pour l'antécédent médical.",
      success: false,
    };
  }

  try {
    const newEntry = await dbAddMedicalHistory(patientId, validatedFields.data as Omit<MedicalHistoryEntry, 'id'>);
    if (!newEntry) throw new Error("Failed to create medical history entry in DB");
    revalidatePath(`/patients/${patientId}`);
    return { message: "Entrée d'antécédent médical ajoutée avec succès.", success: true, newEntryId: newEntry.id };
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
    // Placeholder for actual AI flow call
    console.warn("Fonctionnalité Résumé IA : Utilisation d'un résumé fictif. Implémentez l'appel réel au flux IA dans src/lib/actions.ts");
    
    const patientAge = calculateAge(patient.dateDeNaissance);
    const allergiesText = patient.allergies.length > 0 ? patient.allergies.map(a => a.description).join(', ') : 'Aucune connue';
    const historyText = patient.antecedents.length > 0 
        ? patient.antecedents.map(h => `${h.description} (en ${new Date(h.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })})`).join('; ') 
        : 'Aucun notable';

    const mockSummary = `Résumé pour ${patient.prenom} ${patient.nom}:\nÂge : ${patientAge} ans.\nGroupe Sanguin: ${patient.groupeSanguin || 'Non spécifié'}\nAllergies : ${allergiesText}.\nAntécédents médicaux : ${historyText}.\nNotes générales : ${patient.notes || 'Aucune note.'}\n\nCeci est un résumé généré automatiquement à des fins de démonstration. Pour une analyse médicale complète, veuillez consulter un professionnel de santé.`;
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { summary: mockSummary };
  } catch (error) {
    console.error("Erreur lors de la génération du résumé de santé :", error);
    return { error: "Échec de la génération du résumé de santé. " + (error instanceof Error ? error.message : String(error)) };
  }
}

