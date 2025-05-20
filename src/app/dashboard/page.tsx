import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getPatients, calculateAge } from "@/lib/data"; // Assuming getPatients is async
import type { Patient } from "@/lib/types";
import { APP_NAME } from "@/constants";
import Image from "next/image";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to {APP_NAME}. Manage your patients efficiently.
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
          </Link>
        </Button>
      </div>

      {patients.length === 0 ? (
        <Card className="w-full py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Patients Yet</h3>
            <p className="text-muted-foreground">
              Start by adding your first patient to their health journey.
            </p>
            <Button asChild className="mt-4">
              <Link href="/patients/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
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
                    src={`https://placehold.co/40x40.png`} // Placeholder for patient avatar
                    alt={`${patient.prenom} ${patient.nom}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <CardDescription>
                  Age: {calculateAge(patient.dateDeNaissance)} | Blood Group: {patient.groupeSanguin || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {patient.notes || "No additional notes."}
                </p>
                <div className="mt-2 space-y-1">
                  {patient.allergies.length > 0 && (
                    <p className="text-xs">Allergies: {patient.allergies.map(a => a.description).join(', ')}</p>
                  )}
                  {patient.antecedents.length > 0 && (
                     <p className="text-xs">Recent History: {patient.antecedents[0]?.description}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/patients/${patient.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
