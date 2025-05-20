export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Allergy {
  id: string;
  description: string;
}

export interface MedicalHistoryEntry {
  id: string;
  date: string; // ISO date string
  description: string;
  // potentially add type (e.g., 'diagnosis', 'surgery', 'vaccination')
}

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateDeNaissance: string; // ISO date string
  groupeSanguin: BloodGroup | '';
  allergies: Allergy[];
  antecedents: MedicalHistoryEntry[];
  // Additional fields can be added here based on user needs
  // e.g., email, phone, address, emergencyContact
  notes?: string; // General notes section
}

export interface PatientFormData {
  nom: string;
  prenom: string;
  dateDeNaissance: string;
  groupeSanguin: BloodGroup | '';
  notes?: string;
}
