
import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getPatients, calculateAge } from "@/lib/data"; 
import type { Patient } from "@/lib/types";
import { APP_NAME } from "@/constants";
import Image from "next/image";

export const metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord des patients</h1>
          <p className="text-muted-foreground">
            Bienvenue sur {APP_NAME}. Gérez vos patients efficacement.
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un nouveau patient
          </Link>
        </Button>
      </div>

      {patients.length === 0 ? (
        <Card className="w-full py-12">
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
          {patients.map((patient: Patient) => (
            <Card key={patient.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{patient.prenom} {patient.nom}</CardTitle>
                  <Image 
                    data-ai-hint="profile avatar"
                    src={`https://placehold.co/40x40.png`} 
                    alt={`${patient.prenom} ${patient.nom}`}
                    width={40}
                    height={40}
                    className="rounded-full"
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
                <div className="mt-2 space-y-1">
                  {patient.allergies.length > 0 && (
                    <p className="text-xs">Allergies : {patient.allergies.map(a => a.description).join(', ')}</p>
                  )}
                  {patient.antecedents.length > 0 && (
                     <p className="text-xs">Antécédent récent : {patient.antecedents[0]?.description}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/patients/${patient.id}`}>Voir les détails</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

