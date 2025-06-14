
import type { Patient, Allergy, MedicalHistoryEntry, BloodGroup, PatientFormData } from './types';

const PATIENTS_STORAGE_KEY = 'santeoctetPatientsStore';

// Initial mock data if localStorage is empty
const INITIAL_PATIENTS_STORE: Patient[] = [
  {
    id: 'pat2', // Matches User ID from AuthContext
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
    id: 'pat3', // Matches User ID from AuthContext
    nom: 'Alami',
    prenom: 'Fatima (Patiente)',
    dateDeNaissance: '1992-11-30',
    groupeSanguin: 'O-',
    allergies: [],
    antecedents: [
      { id: 'h3', date: '2015-03-12', description: 'Fracture du bras gauche' }
    ],
    notes: 'RAS.'
  },
  {
    id: 'pat1', // Matches User ID from AuthContext (Amina Zineb)
    nom: 'Zineb',
    prenom: 'Amina',
    dateDeNaissance: '1990-01-01', // Example DOB for Amina
    groupeSanguin: 'B+',
    allergies: [{id: 'a8', description: "Lactose"}],
    antecedents: [],
    notes: 'Dossier pour Amina Zineb.'
  },
   {
    id: 'pat4',
    nom: 'Cherkaoui',
    prenom: 'Youssef (Patient)',
    dateDeNaissance: '1978-09-22',
    groupeSanguin: 'B+',
    allergies: [{ id: 'a3', description: 'Poussière' }],
    antecedents: [
      { id: 'h4', date: '2019-01-15', description: 'Chirurgie mineure au genou droit' },
      { id: 'h5', date: '2021-05-05', description: 'Vaccination Grippe annuelle' },
    ],
    notes: 'Actif, pratique la course à pied. Se plaint parfois de douleurs au genou opéré.'
  },
  {
    id: 'pat5',
    nom: 'El Fassi',
    prenom: 'Zineb',
    dateDeNaissance: '2001-03-10',
    groupeSanguin: 'AB-',
    allergies: [],
    antecedents: [],
    notes: 'Étudiante, bonne santé générale. Aucun antécédent notable. Recommandation : bilan sanguin annuel.'
  },
  {
    id: 'pat6',
    nom: 'Saidi',
    prenom: 'Omar',
    dateDeNaissance: '1965-08-25',
    groupeSanguin: 'O+',
    allergies: [{ id: 'a4', description: 'Aspirine' }],
    antecedents: [
      { id: 'h6', date: '2005-11-10', description: 'Hypertension artérielle diagnostiquée' },
      { id: 'h7', date: '2018-06-01', description: 'Pontage coronarien (triple)' },
    ],
    notes: 'Patient cardiaque, suivi par un cardiologue. Traitement quotidien pour l\'hypertension (Lisinopril 10mg). Éviter AINS.'
  },
  {
    id: 'pat7',
    nom: 'Berrada',
    prenom: 'Sofia',
    dateDeNaissance: '1998-01-12',
    groupeSanguin: 'A-',
    allergies: [{ id: 'a5', description: 'Fruits de mer (crevettes, crabe)' }],
    antecedents: [
      { id: 'h8', date: '2020-04-03', description: 'Anémie ferriprive traitée (supplémentation en fer pendant 6 mois)' },
    ],
    notes: 'Végétarienne. Vigilance sur les apports en fer et vitamine B12. Dernier bilan : normal.'
  },
  {
    id: 'pat8',
    nom: 'Tazi',
    prenom: 'Amine',
    dateDeNaissance: '1970-12-01',
    groupeSanguin: 'B-',
    allergies: [],
    antecedents: [
      { id: 'h9', date: '1995-09-15', description: 'Asthme diagnostiqué dans l\'enfance' },
      { id: 'h10', date: '2023-02-20', description: 'Pneumonie (traitée par Amoxicilline), guérie sans séquelles' },
    ],
    notes: 'Utilise un inhalateur (Salbutamol) pour l\'asthme en cas de crise. Bilans pneumologiques réguliers satisfaisants.'
  },
  {
    id: 'pat9',
    nom: 'Lazaar',
    prenom: 'Layla',
    dateDeNaissance: '1988-07-07',
    groupeSanguin: 'AB+',
    allergies: [{ id: 'a6', description: 'Pénicilline (rash cutané)' }, { id: 'a7', description: 'Acariens (rhinite allergique)'}],
    antecedents: [
      { id: 'h11', date: '2016-10-28', description: 'Diabète de type 1 diagnostiqué' },
      { id: 'h14', date: '2021-11-15', description: 'Césarienne (naissance premier enfant)'}
    ],
    notes: 'Patiente diabétique sous insuline (Lantus, Novorapid). Suivi endocrinologique strict. Porte un bracelet d\'alerte médicale. Antihistaminiques pour la rhinite.'
  },
  {
    id: 'pat10',
    nom: 'Kettani',
    prenom: 'Mehdi',
    dateDeNaissance: '2005-04-18',
    groupeSanguin: 'O+',
    allergies: [],
    antecedents: [
      { id: 'h12', date: '2010-05-22', description: 'Varicelle (enfance, sans complications)' },
      { id: 'h13', date: '2022-08-30', description: 'Entorse de la cheville droite (football), rééducation complète.' },
    ],
    notes: 'Adolescent sportif, pratique le football. Bonne santé globale. Vaccinations à jour.'
  }
];

let patientsStore: Patient[] = [];

// Function to load patients from localStorage or initialize
function loadPatientsStore() {
  if (typeof window !== 'undefined') {
    try {
      const storedPatients = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        patientsStore = JSON.parse(storedPatients);
      } else {
        patientsStore = [...INITIAL_PATIENTS_STORE]; // Use a copy
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patientsStore));
      }
    } catch (error) {
      console.error("Erreur de chargement des patients depuis localStorage:", error);
      patientsStore = [...INITIAL_PATIENTS_STORE]; // Fallback
    }
  } else {
    // For server-side rendering or environments without window, use initial mocks
    // This won't persist but allows the app to run.
    patientsStore = [...INITIAL_PATIENTS_STORE];
  }
}

// Load store on module initialization (client-side)
if (typeof window !== 'undefined') {
  loadPatientsStore();
}


function savePatientsStore() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patientsStore));
    } catch (error) {
      console.error("Erreur de sauvegarde des patients dans localStorage:", error);
    }
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPatients(): Promise<Patient[]> {
  if (typeof window !== 'undefined' && patientsStore.length === 0) { // Ensure loaded on client if empty
      loadPatientsStore();
  }
  await delay(50);
  return JSON.parse(JSON.stringify(patientsStore)); // Return a deep copy
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  if (typeof window !== 'undefined' && patientsStore.length === 0) {
      loadPatientsStore();
  }
  await delay(50);
  const patient = patientsStore.find(p => p.id === id);
  return patient ? JSON.parse(JSON.stringify(patient)) : undefined;
}

// For creating patients through the doctor's form
export async function addPatient(patientData: Omit<Patient, 'id' | 'allergies' | 'antecedents'> & {id?: string}): Promise<Patient> {
  await delay(50);
  const newPatient: Patient = {
    id: patientData.id || String(Date.now() + Math.random()), // Allow providing ID or generate
    nom: patientData.nom,
    prenom: patientData.prenom,
    dateDeNaissance: patientData.dateDeNaissance,
    groupeSanguin: patientData.groupeSanguin,
    notes: patientData.notes,
    allergies: [],
    antecedents: [],
  };
  patientsStore.push(newPatient);
  savePatientsStore();
  return JSON.parse(JSON.stringify(newPatient));
}

// Specifically for patient registration flow
export async function addPatientRecordForUser(
  userData: Pick<Patient, 'id' | 'nom' | 'prenom' | 'dateDeNaissance'>
): Promise<Patient> {
  await delay(50);
  const newPatient: Patient = {
    ...userData,
    groupeSanguin: '', // Default empty, can be updated later
    allergies: [],
    antecedents: [],
    notes: `Dossier créé lors de l'inscription le ${new Date().toLocaleDateString('fr-FR')}.`,
  };
  const existingPatientIndex = patientsStore.findIndex(p => p.id === newPatient.id);
  if (existingPatientIndex > -1) {
    patientsStore[existingPatientIndex] = { ...patientsStore[existingPatientIndex], ...newPatient}; // Update if somehow exists
  } else {
    patientsStore.push(newPatient);
  }
  savePatientsStore();
  return JSON.parse(JSON.stringify(newPatient));
}


export async function updatePatient(id: string, patientUpdateData: Partial<Omit<Patient, 'id' | 'allergies' | 'antecedents'>>): Promise<Patient | undefined> {
  await delay(50);
  const patientIndex = patientsStore.findIndex(p => p.id === id);
  if (patientIndex === -1) {
    return undefined;
  }
  patientsStore[patientIndex] = { ...patientsStore[patientIndex], ...patientUpdateData };
  savePatientsStore();
  return JSON.parse(JSON.stringify(patientsStore[patientIndex]));
}

export async function deletePatient(id: string): Promise<boolean> {
  await delay(50);
  const initialLength = patientsStore.length;
  patientsStore = patientsStore.filter(p => p.id !== id);
  const success = patientsStore.length < initialLength;
  if (success) {
    savePatientsStore();
  }
  return success;
}

export async function addAllergyToPatient(patientId: string, allergyDescription: string): Promise<Allergy | undefined> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return undefined;

  const newAllergy: Allergy = { id: `a-${Date.now()}${Math.random().toString(36).substr(2, 5)}`, description: allergyDescription };
  patient.allergies.push(newAllergy);
  savePatientsStore();
  return JSON.parse(JSON.stringify(newAllergy));
}

export async function removeAllergyFromPatient(patientId: string, allergyId: string): Promise<boolean> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return false;
  
  const initialLength = patient.allergies.length;
  patient.allergies = patient.allergies.filter(a => a.id !== allergyId);
  const success = patient.allergies.length < initialLength;
  if (success) {
    savePatientsStore();
  }
  return success;
}

export async function addMedicalHistoryToPatient(patientId: string, historyEntryData: Omit<MedicalHistoryEntry, 'id'>): Promise<MedicalHistoryEntry | undefined> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return undefined;

  const newEntry: MedicalHistoryEntry = { ...historyEntryData, id: `mh-${Date.now()}${Math.random().toString(36).substr(2, 5)}` };
  patient.antecedents.push(newEntry);
  patient.antecedents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  savePatientsStore();
  return JSON.parse(JSON.stringify(newEntry));
}

export async function removeMedicalHistoryFromPatient(patientId: string, historyId: string): Promise<boolean> {
  await delay(50);
  const patient = patientsStore.find(p => p.id === patientId);
  if (!patient) return false;

  const initialLength = patient.antecedents.length;
  patient.antecedents = patient.antecedents.filter(h => h.id !== historyId);
  const success = patient.antecedents.length < initialLength;
  if (success) {
    savePatientsStore();
  }
  return success;
}

export const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0; 
  try {
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return 0; 

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age; 
  } catch (e) {
    return 0; 
  }
}
