
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'patient' | 'medecin';

interface User {
  id: string;
  email: string;
  role: UserRole;
  nom?: string; // Optional name for display
}

interface AuthContextType {
  user: User | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Mock User Data ---
// In a real app, this would come from a database via an API
const MOCK_USERS: User[] = [
  { id: 'doc1', email: 'medecin@santeoctet.app', role: 'medecin', nom: 'Dr. Traore' },
  { id: 'pat1', email: 'patient@santeoctet.app', role: 'patient', nom: 'Amina Zineb' },
  { id: 'pat2', email: 'karim.b@example.com', role: 'patient', nom: 'Karim Benjelloun'},
];

const MOCK_PASSWORDS: Record<string, string> = {
  'medecin@santeoctet.app': 'password123',
  'patient@santeoctet.app': 'password123',
  'karim.b@example.com': 'password123',
};
// --- End Mock User Data ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for a saved user session (client-side only)
    try {
      const savedUser = localStorage.getItem('santeoctetUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de l'utilisateur depuis localStorage", error);
      localStorage.removeItem('santeoctetUser'); // Clear corrupted data
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, motDePasse: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && MOCK_PASSWORDS[foundUser.email] === motDePasse) {
      setUser(foundUser);
      try {
        localStorage.setItem('santeoctetUser', JSON.stringify(foundUser));
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur dans localStorage", error);
      }
      setIsLoading(false);
      return true;
    }
    
    setUser(null);
    localStorage.removeItem('santeoctetUser');
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('santeoctetUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
