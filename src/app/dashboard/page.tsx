
"use client"; 

import Link from "next/link";
import { PlusCircle, Users, FileText, UserCog, UserCircle as UserCircleIcon, BarChart3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getPatients, calculateAge } from "@/lib/data"; 
import type { Patient } from "@/lib/types";
import { APP_NAME } from "@/constants";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      if (user?.role === 'medecin') { 
        setIsLoadingPatients(true);
        const fetchedPatients = await getPatients();
        setPatients(fetchedPatients);
        setIsLoadingPatients(false);
      } else {
        setIsLoadingPatients(false); 
      }
    }
    if (user) { 
      loadPatients();
    }
  }, [user]);

  const welcomeMessage = user?.role === 'medecin' 
    ? `Bienvenue Dr. ${user.nom || user.email.split('@')[0]}, gérez vos patients efficacement.`
    : `Bienvenue ${user?.prenom || user?.email.split('@')[0]}, consultez vos informations de santé.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-card rounded-lg shadow-md border">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {user?.role === 'medecin' && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingPatients ? "..." : patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Patients enregistrés.
              </p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full hover:bg-primary/10">
                    <Link href="/patients">Voir tous les patients</Link>
                </Button>
            </CardFooter>
          </Card>
        )}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user?.role === 'medecin' ? "Rapports Récents" : "Mes Documents"}
            </CardTitle>
            <FileText className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">
              {user?.role === 'medecin' ? "Nouveaux rapports ou analyses." : "Documents et ordonnances."}
            </p>
          </CardContent>
           <CardFooter>
            <Button variant="outline" size="sm" className="w-full" disabled>
                {user?.role === 'medecin' ? "Consulter (bientôt)" : "Consulter (bientôt)"}
            </Button>
          </CardFooter>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mon Compte</CardTitle>
            <UserCog className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate" title={`${user?.prenom || ''} ${user?.nom || user?.email.split('@')[0]}`}>
                {user?.prenom} {user?.nom || user?.email.split('@')[0]}
            </div>
             <p className="text-xs text-muted-foreground capitalize">
              Rôle : {user?.role}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" disabled>
                <Settings2 className="mr-2 h-4 w-4" /> Gérer (bientôt)
            </Button>
          </CardFooter>
        </Card>
        {user?.role === 'medecin' && (
             <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Statistiques</CardTitle>
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">N/A</div>
                    <p className="text-xs text-muted-foreground">
                    Aperçu des données agrégées.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" disabled>Voir les statistiques (bientôt)</Button>
                </CardFooter>
            </Card>
        )}
      </div>


      {user?.role === 'medecin' && (
        <>
          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-6">Accès rapide aux patients récents</h2>
          {isLoadingPatients ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1,2,3,4].map(i => (
                    <Card key={i} className="shadow-md animate-pulse border">
                        <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div><div className="h-4 w-1/2 bg-muted rounded mt-2"></div></CardHeader>
                        <CardContent><div className="h-10 bg-muted rounded"></div></CardContent>
                        <CardFooter><div className="h-10 w-full bg-muted rounded"></div></CardFooter>
                    </Card>
                ))}
             </div>
          ) : patients.length === 0 ? (
            <Card className="w-full py-12 shadow-md border">
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patients.slice(0,4).map((patient: Patient) => ( 
                <Card key={patient.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl text-primary">{patient.prenom} {patient.nom}</CardTitle>
                        <CardDescription className="text-xs">
                          Âge : {calculateAge(patient.dateDeNaissance)} | Groupe Sanguin : {patient.groupeSanguin || 'N/A'}
                        </CardDescription>
                      </div>
                      <Image 
                        data-ai-hint="profile avatar"
                        src={`https://placehold.co/48x48.png`} 
                        alt={`${patient.prenom} ${patient.nom}`}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-primary/30"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {patient.notes || "Aucune note particulière pour ce patient."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full hover:bg-primary/10">
                      <Link href={`/patients/${patient.id}`}>Voir le dossier</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
           {patients.length > 4 && user?.role === 'medecin' && (
            <div className="text-center mt-8">
                <Button asChild variant="secondary" size="lg">
                    <Link href="/patients">Voir tous les patients ({patients.length})</Link>
                </Button>
            </div>
          )}
        </>
      )}
      {user?.role === 'patient' && (
         <Card className="w-full py-8 shadow-xl border">
          <CardHeader className="items-center text-center">
            <UserCircleIcon className="h-20 w-20 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl text-primary">Mon Dossier Médical</CardTitle>
            <CardDescription>Accédez aux informations de votre dossier médical personnel.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <h3 className="text-xl font-semibold">Bonjour, {user.prenom || user.email.split('@')[0]} !</h3>
            <p className="text-muted-foreground max-w-md">
              Vous pouvez consulter votre dossier personnel, voir vos antécédents, allergies et autres informations importantes liées à votre santé.
            </p>
            <Button asChild className="mt-4" size="lg">
              <Link href={`/patients/${user.id}`}> 
                Voir mon dossier
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    