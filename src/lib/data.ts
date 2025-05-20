import type { Patient, Allergy, MedicalHistoryEntry, BloodGroup } from './types';
// import { format } from 'date-fns'; // Not used here directly for formatting output

// In-memory store for patients
let patientsStore: Patient[] = [
  {
    id: '1',
    nom: 'Benjelloun',
    prenom: 'Karim',
    dateDeNaissance: '1985-05-15',
    groupeSanguin: 'A+',
    allergies: [{ id: 'a1', description: 'Pollen' }, {id: 'a2', description: 'Arachides'}],
    antecedents: [
      { id: 'h1', date: '2010-07-20', description: 'Appendicectomie' },
      { id: 'h2', date: '2022-01-10', description: 'Vaccination COVID-19 (Pfizer)' },
    ],
    notes: 'Patient en bonne santé générale. Suivi régulier pour l\'allergie au pollen.'
  },
  {
    id: '2',
    nom: 'Alami',
    prenom: 'Fatima',
    dateDeNaissance: '1992-11-30',
    groupeSanguin: 'O-',
    allergies: [],
    antecedents: [
      { id: 'h3', date: '2015-03-12', description: 'Fracture du bras gauche' }
    ],
    notes: 'RAS.'
  },
   {
    id: '3',
    nom: 'Cherkaoui',
    prenom: 'Youssef',
    dateDeNaissance: '1978-09-22',
    groupeSanguin: 'B+',
    allergies: [{ id: 'a3', description: 'Poussière' }],
    antecedents: [
      { id: 'h4', date: '2019-01-15', description: 'Chirurgie mineure au genou' },
      { id: 'h5', date: '2021-05-05', description: 'Vaccination Grippe' },
    ],
    notes: 'Actif, pratique la course à pied. Se plaint parfois de douleurs au genou opéré.'
  },
  {
    id: '4',
    nom: 'El Fassi',
    prenom: 'Zineb',
    dateDeNaissance: '2001-03-10',
    groupeSanguin: 'AB-',
    allergies: [],
    antecedents: [],
    notes: 'Étudiante, bonne santé générale. Aucun antécédent notable.'
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPatients(): Promise<Patient[]> {
  await delay(100);
  return [...patientsStore];
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  await delay(50);
  return patientsStore.find(p => p.id === id);
}

export async function addPatient(patientData: Omit<Patient, 'id' | 'allergies' | 'antecedents'>): Promise<Patient> {
  await delay(100);
  const newPatient: Patient = {
    ...patientData,
    id: String(Date.now()), // Simple ID generation
    allergies: [],
    antecedents: [],
  };
  patientsStore.push(newPatient);
  return newPatient;
}

export async function updatePatient(id: string, patientUpdateData: Partial<Omit<Patient, 'id' | 'allergies' | 'antecedents'>>): Promise<Patient | undefined> {
  await delay(100);
  const patientIndex = patientsStore.findIndex(p => p.id === id);
  if (patientIndex === -1) {
    return undefined;
  }
  patientsStore[patientIndex] = { ...patientsStore[patientIndex], ...patientUpdateData };
  return patientsStore[patientIndex];
}

export async function deletePatient(id: string): Promise<boolean> {
  await delay(100);
  const initialLength = patientsStore.length;
  patientsStore = patientsStore.filter(p => p.id !== id);
  return patientsStore.length < initialLength;
}

export async function addAllergyToPatient(patientId: string, allergyDescription: string): Promise<Allergy | undefined> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return undefined;

  const newAllergy: Allergy = { id: `a-${Date.now()}`, description: allergyDescription };
  patient.allergies.push(newAllergy);
  return newAllergy;
}

export async function removeAllergyFromPatient(patientId: string, allergyId: string): Promise<boolean> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return false;
  
  const initialLength = patient.allergies.length;
  patient.allergies = patient.allergies.filter(a => a.id !== allergyId);
  return patient.allergies.length < initialLength;
}

export async function addMedicalHistoryToPatient(patientId: string, historyEntry: Omit<MedicalHistoryEntry, 'id'>): Promise<MedicalHistoryEntry | undefined> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return undefined;

  const newEntry: MedicalHistoryEntry = { ...historyEntry, id: `mh-${Date.now()}` };
  patient.antecedents.push(newEntry);
  patient.antecedents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Keep sorted
  return newEntry;
}

export async function removeMedicalHistoryFromPatient(patientId: string, historyId: string): Promise<boolean> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return false;

  const initialLength = patient.antecedents.length;
  patient.antecedents = patient.antecedents.filter(h => h.id !== historyId);
  return patient.antecedents.length < initialLength;
}

export const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
