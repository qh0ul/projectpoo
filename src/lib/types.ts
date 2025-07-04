
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodGroupSelectOption = BloodGroup | ''; // Allows for an empty selection string

export interface Allergy {
  id: string;
  description: string;
}

export interface MedicalHistoryEntry {
  id: string;
  date: string; // ISO date string yyyy-MM-dd
  description: string;
}

export interface Patient {
  id: string; // This ID should match the User ID if the patient is also a user
  nom: string;
  prenom: string;
  dateDeNaissance: string; // ISO date string yyyy-MM-dd
  groupeSanguin: BloodGroup | ''; // Can be empty
  allergies: Allergy[];
  antecedents: MedicalHistoryEntry[];
  notes?: string;
}

// For patient creation/update forms by doctors
export interface PatientFormData {
  id?: string; // Optional: Used when creating patient record for registered user
  nom: string;
  prenom: string;
  dateDeNaissance: string; // Should be validated as yyyy-MM-dd
  groupeSanguin: BloodGroupSelectOption; // Matches what the Select component uses
  notes?: string;
}
