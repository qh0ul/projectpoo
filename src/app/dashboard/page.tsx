
"use client"; // Required for hooks like useState, useEffect, useAuth

import Link from "next/link";
import { PlusCircle, Users, TrendingUp, FileText, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getPatients, calculateAge } from "@/lib/data"; 
import type { Patient } from "@/lib/types";
import { APP_NAME } from "@/constants";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// metadata can remain static or be removed if not needed for client component
// export const metadata = {
//   title: "Tableau de bord",
// };

export default function DashboardPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      setIsLoadingPatients(true);
      const fetchedPatients = await getPatients();
      setPatients(fetchedPatients);
      setIsLoadingPatients(false);
    }
    if (user) { // Only load if user is authenticated
      loadPatients();
    }
  }, [user]);

  const welcomeMessage = user?.role === 'medecin' 
    ? `Bienvenue Dr. ${user.nom || user.email.split('@')[0]}, gérez vos patients efficacement.`
    : `Bienvenue ${user?.nom || user?.email.split('@')[0]}, consultez vos informations de santé.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-card rounded-lg shadow-md border border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            {welcomeMessage}
          </p>
        </div>
        {user?.role === 'medecin' && (
          <Button asChild size="lg" className="shadow-sm hover:shadow-md transition-shadow">
            <Link href="/patients/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un nouveau patient
            </Link>
          </Button>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingPatients ? "..." : patients.length}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'medecin' ? "Patients enregistrés dans le système." : "Votre dossier est actif."}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rapports Récents</CardTitle>
            <FileText className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">
              Nouveaux rapports ou analyses disponibles.
            </p>
          </CardContent>
           <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Voir les rapports</Button>
          </CardFooter>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mon Compte</CardTitle>
            <UserCog className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{user?.nom || user?.email}</div>
             <p className="text-xs text-muted-foreground capitalize">
              Rôle : {user?.role}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Gérer le compte</Button>
          </CardFooter>
        </Card>
      </div>


      {user?.role === 'medecin' && (
        <>
          <h2 className="text-2xl font-semibold tracking-tight mt-10">Accès rapide aux patients</h2>
          {isLoadingPatients ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1,2,3].map(i => (
                    <Card key={i} className="shadow-lg animate-pulse">
                        <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div><div className="h-4 w-1/2 bg-muted rounded mt-1"></div></CardHeader>
                        <CardContent><div className="h-10 bg-muted rounded"></div></CardContent>
                        <CardFooter><div className="h-9 w-full bg-muted rounded"></div></CardFooter>
                    </Card>
                ))}
             </div>
          ) : patients.length === 0 ? (
            <Card className="w-full py-12 shadow-md">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <Users className="h-16 w-16 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Aucun patient pour le moment</h3>
                <p className="text-muted-foreground">
                  Commencez par ajouter votre premier patient à son parcours de santé.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/patients/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un patient
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {patients.slice(0,3).map((patient: Patient) => ( // Display first 3 for quick access
                <Card key={patient.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-primary">{patient.prenom} {patient.nom}</CardTitle>
                      <Image 
                        data-ai-hint="profile avatar"
                        src={`https://placehold.co/40x40.png`} 
                        alt={`${patient.prenom} ${patient.nom}`}
                        width={40}
                        height={40}
                        className="rounded-full border"
                      />
                    </div>
                    <CardDescription>
                      Âge : {calculateAge(patient.dateDeNaissance)} | Groupe Sanguin : {patient.groupeSanguin || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {patient.notes || "Aucune note supplémentaire."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full hover:bg-primary/10">
                      <Link href={`/patients/${patient.id}`}>Voir les détails</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
           {patients.length > 3 && user?.role === 'medecin' && (
            <div className="text-center mt-6">
                <Button asChild variant="secondary">
                    <Link href="/patients">Voir tous les patients</Link>
                </Button>
            </div>
          )}
        </>
      )}
      {user?.role === 'patient' && (
         <Card className="w-full py-8 shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Mon Dossier Médical</CardTitle>
            <CardDescription>Accédez aux informations de votre dossier médical.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <UserCircle className="h-16 w-16 text-primary" />
            <h3 className="text-lg font-semibold">Bonjour, {user.nom || user.email.split('@')[0]} !</h3>
            <p className="text-muted-foreground">
              Vous pouvez consulter votre dossier personnel ici.
            </p>
             {/* Assuming patient 'pat1' from mock data is the logged in patient */}
            <Button asChild className="mt-4">
              <Link href={`/patients/${MOCK_USERS.find(u => u.email === user.email)?.id || 'pat1'}`}> 
                Voir mon dossier
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// Mock user data to find patient ID for patient role
const MOCK_USERS = [
  { id: 'doc1', email: 'medecin@santeoctet.app', role: 'medecin', nom: 'Dr. Traore' },
  { id: 'pat1', email: 'patient@santeoctet.app', role: 'patient', nom: 'Amina Zineb' },
  { id: 'pat2', email: 'karim.b@example.com', role: 'patient', nom: 'Karim Benjelloun'},
];
