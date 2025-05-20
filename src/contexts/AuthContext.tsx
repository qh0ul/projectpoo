
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { addPatientRecordForUser } from '@/lib/data'; 
import type { PatientFormData } from '@/lib/types'; 

type UserRole = 'patient' | 'medecin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nom?: string; 
  prenom?: string;
}

export interface PatientRegistrationData {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  dateDeNaissance: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  logout: () => void;
  registerPatient: (data: PatientRegistrationData) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_MOCK_USERS: User[] = [
  // 15 Médecins
  { id: 'doc1', email: 'medecin@santeoctet.app', role: 'medecin', nom: 'Traore', prenom: 'Ali' },
  { id: 'doc2', email: 'dralami.cardio@santeoctet.app', role: 'medecin', nom: 'Alami', prenom: 'Sofia' },
  { id: 'doc3', email: 'drbennani.pedia@santeoctet.app', role: 'medecin', nom: 'Bennani', prenom: 'Omar' },
  { id: 'doc4', email: 'drcherkaoui.gen@santeoctet.app', role: 'medecin', nom: 'Cherkaoui', prenom: 'Fatima' },
  { id: 'doc5', email: 'drfassi.dermo@santeoctet.app', role: 'medecin', nom: 'Fassi', prenom: 'Youssef' },
  { id: 'doc6', email: 'drkadiri.endo@santeoctet.app', role: 'medecin', nom: 'Kadiri', prenom: 'Leila' },
  { id: 'doc7', email: 'drsaidi.neuro@santeoctet.app', role: 'medecin', nom: 'Saidi', prenom: 'Ahmed' },
  { id: 'doc8', email: 'drbelkacem.rhuma@santeoctet.app', role: 'medecin', nom: 'Belkacem', prenom: 'Nadia' },
  { id: 'doc9', email: 'drjouahri.onco@santeoctet.app', role: 'medecin', nom: 'Jouahri', prenom: 'Hassan' },
  { id: 'doc10', email: 'drelmansouri.psy@santeoctet.app', role: 'medecin', nom: 'El Mansouri', prenom: 'Samira' },
  { id: 'doc11', email: 'drtazi.ophta@santeoctet.app', role: 'medecin', nom: 'Tazi', prenom: 'Karim' },
  { id: 'doc12', email: 'drdaoudi.orl@santeoctet.app', role: 'medecin', nom: 'Daoudi', prenom: 'Amina' },
  { id: 'doc13', email: 'drzayani.pneumo@santeoctet.app', role: 'medecin', nom: 'Zayani', prenom: 'Rachid' },
  { id: 'doc14', email: 'dralaoui.nephro@santeoctet.app', role: 'medecin', nom: 'Alaoui', prenom: 'Meryem' },
  { id: 'doc15', email: 'drchraibi.uro@santeoctet.app', role: 'medecin', nom: 'Chraibi', prenom: 'Yassine' },
  
  // Patients initiaux (les ID doivent correspondre à ceux dans src/lib/data.ts pour la démo)
  { id: 'pat1', email: 'patient@santeoctet.app', role: 'patient', nom: 'Zineb', prenom: 'Amina' }, // Amina Zineb
  { id: 'pat2', email: 'karim.benjelloun@patient.santeoctet.app', role: 'patient', nom: 'Benjelloun', prenom: 'Karim'},
  { id: 'pat3', email: 'fatima.alami@patient.santeoctet.app', role: 'patient', nom: 'Alami', prenom: 'Fatima (Patiente)'},
  { id: 'pat4', email: 'youssef.cherkaoui@patient.santeoctet.app', role: 'patient', nom: 'Cherkaoui', prenom: 'Youssef (Patient)'},
  { id: 'pat5', email: 'zineb.elfassi@patient.santeoctet.app', role: 'patient', nom: 'El Fassi', prenom: 'Zineb'},
  { id: 'pat6', email: 'omar.saidi@patient.santeoctet.app', role: 'patient', nom: 'Saidi', prenom: 'Omar'},
  { id: 'pat7', email: 'sofia.berrada@patient.santeoctet.app', role: 'patient', nom: 'Berrada', prenom: 'Sofia'},
  { id: 'pat8', email: 'amine.tazi@patient.santeoctet.app', role: 'patient', nom: 'Tazi', prenom: 'Amine'},
  { id: 'pat9', email: 'layla.lazaar@patient.santeoctet.app', role: 'patient', nom: 'Lazaar', prenom: 'Layla'},
  { id: 'pat10', email: 'mehdi.kettani@patient.santeoctet.app', role: 'patient', nom: 'Kettani', prenom: 'Mehdi'},
];

const INITIAL_MOCK_PASSWORDS: Record<string, string> = {
  // Médecins
  'medecin@santeoctet.app': 'GynecoSecure22#',
  'dralami.cardio@santeoctet.app': 'CardioPass123!',
  'drbennani.pedia@santeoctet.app': 'PediaCare456*',
  'drcherkaoui.gen@santeoctet.app': 'GeneralMed789+',
  'drfassi.dermo@santeoctet.app': 'DermoHealth101$',
  'drkadiri.endo@santeoctet.app': 'EndoSecurePass$',
  'drsaidi.neuro@santeoctet.app': 'NeuroMind!789',
  'drbelkacem.rhuma@santeoctet.app': 'RhumaFlex#2024',
  'drjouahri.onco@santeoctet.app': 'OncoHope@123',
  'drelmansouri.psy@santeoctet.app': 'PsyCalm321&',
  'drtazi.ophta@santeoctet.app': 'OphtaVision*55',
  'drdaoudi.orl@santeoctet.app': 'ORLHealth!234',
  'drzayani.pneumo@santeoctet.app': 'PneumoBreath#56',
  'dralaoui.nephro@santeoctet.app': 'NephroCare%789',
  'drchraibi.uro@santeoctet.app': 'UroSecure@2025',

  // Patients initiaux
  'patient@santeoctet.app': 'AminaPass123',
  'karim.benjelloun@patient.santeoctet.app': 'KarimPass1985',
  'fatima.alami@patient.santeoctet.app': 'FatimaSecure1992',
  'youssef.cherkaoui@patient.santeoctet.app': 'Youssef1978P',
  'zineb.elfassi@patient.santeoctet.app': 'Zineb2001Pass',
  'omar.saidi@patient.santeoctet.app': 'OmarHealth65',
  'sofia.berrada@patient.santeoctet.app': 'SofiaCare98',
  'amine.tazi@patient.santeoctet.app': 'AmineMed70',
  'layla.lazaar@patient.santeoctet.app': 'LaylaPass1988',
  'mehdi.kettani@patient.santeoctet.app': 'MehdiSecure05',
};

const USERS_STORAGE_KEY = 'santeoctetAllUsers';
const PASSWORDS_STORAGE_KEY = 'santeoctetAllPasswords';
const SESSION_USER_STORAGE_KEY = 'santeoctetSessionUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [passwordsMap, setPasswordsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load users and passwords from localStorage or use initial mocks
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const storedPasswords = localStorage.getItem(PASSWORDS_STORAGE_KEY);

      if (storedUsers && storedPasswords) {
        setUsersList(JSON.parse(storedUsers));
        setPasswordsMap(JSON.parse(storedPasswords));
      } else {
        setUsersList(INITIAL_MOCK_USERS);
        setPasswordsMap(INITIAL_MOCK_PASSWORDS);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_USERS));
        localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PASSWORDS));
      }

      const savedSessionUser = localStorage.getItem(SESSION_USER_STORAGE_KEY);
      if (savedSessionUser) {
        setCurrentUser(JSON.parse(savedSessionUser));
      }
    } catch (error) {
      console.error("Erreur lors de la lecture depuis localStorage", error);
      localStorage.removeItem(USERS_STORAGE_KEY);
      localStorage.removeItem(PASSWORDS_STORAGE_KEY);
      localStorage.removeItem(SESSION_USER_STORAGE_KEY);
      // Fallback to initial mocks if localStorage is corrupted
      setUsersList(INITIAL_MOCK_USERS);
      setPasswordsMap(INITIAL_MOCK_PASSWORDS);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, motDePasse: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    
    const currentStoredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || JSON.stringify(INITIAL_MOCK_USERS));
    const currentStoredPasswords = JSON.parse(localStorage.getItem(PASSWORDS_STORAGE_KEY) || JSON.stringify(INITIAL_MOCK_PASSWORDS));
    
    setUsersList(currentStoredUsers);
    setPasswordsMap(currentStoredPasswords);

    const foundUser = currentStoredUsers.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && currentStoredPasswords[foundUser.email] === motDePasse) {
      setCurrentUser(foundUser);
      try {
        localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(foundUser));
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur dans localStorage", error);
      }
      setIsLoading(false);
      return true;
    }
    
    setCurrentUser(null);
    localStorage.removeItem(SESSION_USER_STORAGE_KEY);
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_USER_STORAGE_KEY);
    router.push('/login');
  }, [router]);

  const registerPatient = useCallback(async (data: PatientRegistrationData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let currentUsers: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    let currentPasswords: Record<string, string> = JSON.parse(localStorage.getItem(PASSWORDS_STORAGE_KEY) || '{}');
    
    // Ensure currentUsers and currentPasswords are arrays/objects if localStorage was empty or corrupt
    if (!Array.isArray(currentUsers)) currentUsers = [];
    if (typeof currentPasswords !== 'object' || currentPasswords === null) currentPasswords = {};


    if (currentUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      setIsLoading(false);
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    const newUserId = `pat-${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User = {
      id: newUserId,
      email: data.email,
      role: 'patient',
      nom: data.nom,
      prenom: data.prenom,
    };

    const updatedUsers = [...currentUsers, newUser];
    const updatedPasswords = { ...currentPasswords, [data.email]: data.motDePasse };

    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(updatedPasswords));
      setUsersList(updatedUsers); 
      setPasswordsMap(updatedPasswords); 

      const patientRecordData: Omit<PatientFormData, 'groupeSanguin' | 'notes'> & { id: string } = {
        id: newUserId, 
        nom: data.nom,
        prenom: data.prenom,
        dateDeNaissance: data.dateDeNaissance,
      };
      await addPatientRecordForUser(patientRecordData);

      setIsLoading(false);
      return { success: true, message: "Inscription réussie ! Vous pouvez maintenant vous connecter." };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setIsLoading(false);
      return { success: false, message: "Erreur lors de l'inscription. Veuillez réessayer." };
    }
  }, []);


  return (
    <AuthContext.Provider value={{ user: currentUser, login, logout, registerPatient, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé au sein d_un AuthProvider');
  }
  return context;
};

    