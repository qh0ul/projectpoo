
"use client"; 

import Link from "next/link";
import { notFound, useRouter } from "next/navigation"; 
import { getPatientById, calculateAge } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, FileText, UserCircle, HeartPulse, Droplets, StickyNote, Sparkles, Loader2 } from "lucide-react"; // Removed Siren, History
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AllergiesSection } from "@/components/patient/allergies-section";
import { MedicalHistorySection } from "@/components/patient/medical-history-section";
import { HealthSummaryGenerator } from "@/components/patient/health-summary-generator";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext"; 
import { useEffect, useState } from "react"; 
import type { Patient } from "@/lib/types"; 
import { useToast } from "@/hooks/use-toast";


export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPatientDetails() {
      setIsLoading(true);
      const fetchedPatient = await getPatientById(params.id);
      
      if (!fetchedPatient) {
        toast({
            variant: "destructive",
            title: "Patient non trouvé",
            description: "Le dossier patient demandé n'existe pas ou plus.",
         });
        notFound(); // Or router.push('/patients') or router.push('/dashboard')
        return;
      }

      // Authorization:
      // If user is a patient, they can only see their own record (user.id must match patient.id).
      // If user is a doctor, they can see any patient record.
      if (user?.role === 'patient' && user.id !== fetchedPatient.id ) {
         toast({
            variant: "destructive",
            title: "Accès non autorisé",
            description: "Vous ne pouvez consulter que votre propre dossier médical.",
         });
        router.push('/dashboard'); // Redirect to their dashboard
        return;
      }
      
      setPatient(fetchedPatient);
      if (typeof document !== 'undefined') {
        document.title = `${fetchedPatient.prenom} ${fetchedPatient.nom} - Dossier Médical`; 
      }
      setIsLoading(false);
    }

    if (user) { // Ensure user context is loaded
        fetchPatientDetails();
    } else {
      // If user is not loaded yet, wait or handle (could show a general loader)
      // For now, if no user, it might try to fetch and fail auth check, then redirect.
    }
  }, [params.id, user, router, toast]);


  if (isLoading || !patient) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement du dossier patient...</p>
      </div>
    );
  }

  const age = calculateAge(patient.dateDeNaissance);
  const canEdit = user?.role === 'medecin' || user?.id === patient.id; // Doctors or the patient themselves can edit notes/allergies

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4 hover:bg-accent/10">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center text-primary">
            <UserCircle className="mr-3 h-8 w-8" />
            {patient.prenom} {patient.nom}
          </h1>
          <p className="text-muted-foreground mt-1">
            Dossier médical détaillé.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/print/patients/${patient.id}`} target="_blank">
              <FileText className="mr-2 h-4 w-4" /> Exporter en PDF
            </Link>
          </Button>
          {user?.role === 'medecin' && ( // Only doctors can edit core patient info
            <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/patients/${patient.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Modifier Patient
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border border-border">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">Informations du Patient</CardTitle>
                <CardDescription>Détails de base et informations de contact.</CardDescription>
              </div>
               <Image 
                data-ai-hint="profile face"
                src={`https://placehold.co/80x80.png`}
                alt={`${patient.prenom} ${patient.nom}`}
                width={80}
                height={80}
                className="rounded-lg border-2 border-primary/30"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Nom complet :</span>
                  <p className="text-foreground font-medium">{patient.prenom} {patient.nom}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Date de naissance :</span>
                  <p className="text-foreground font-medium">{patient.dateDeNaissance ? format(parseISO(patient.dateDeNaissance), "d MMMM yyyy", { locale: fr }) : 'N/A'} (Âge : {age})</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground flex items-center"><Droplets className="mr-1 h-4 w-4 text-red-600"/>Groupe Sanguin :</span>
                  <p className="text-foreground font-medium">{patient.groupeSanguin || "Non spécifié"}</p>
                </div>
              </div>
              {patient.notes && (
                <div>
                  <Separator className="my-4"/>
                  <h4 className="font-semibold text-muted-foreground mb-1 flex items-center"><StickyNote className="mr-2 h-5 w-5 text-yellow-500"/>Notes Générales :</h4>
                  <p className="text-sm whitespace-pre-wrap bg-secondary/30 p-4 rounded-md border border-border text-foreground">{patient.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <AllergiesSection patientId={patient.id} allergies={patient.allergies} canEdit={canEdit} />
          <MedicalHistorySection patientId={patient.id} medicalHistory={patient.antecedents} canEdit={user?.role === 'medecin'} /> 
        </div>

        <div className="lg:col-span-1 space-y-6">
          {user?.role === 'medecin' && ( // AI Summary only for doctors for now
            <Card className="shadow-xl border border-border">
                <CardHeader>
                <CardTitle className="text-xl flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-accent" />
                    Résumé de Santé IA
                </CardTitle>
                <CardDescription>
                    Obtenez un résumé généré par IA du dossier médical de ce patient.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <HealthSummaryGenerator patientId={patient.id} />
                </CardContent>
            </Card>
          )}
           <Card className="shadow-xl border border-border" data-ai-hint="medical chart">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <HeartPulse className="mr-2 h-5 w-5 text-destructive" />
                Aperçu des Constantes
              </CardTitle>
              <CardDescription>
                Signes vitaux récents et tendances (Données fictives).
              </CardDescription>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center bg-muted/20 rounded-b-lg">
               <Image src="https://placehold.co/300x150.png" alt="Graphique des constantes (Placeholder)" width={300} height={150} data-ai-hint="medical graph" className="rounded-md border border-border"/>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
