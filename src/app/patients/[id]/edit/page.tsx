
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { PatientForm } from "@/components/patient/patient-form";
import { updatePatientAction } from "@/lib/actions";
import { getPatientById } from "@/lib/data";
import type { Patient, PatientFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Edit3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function EditPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'medecin') {
      toast({
        variant: "destructive",
        title: "Accès non autorisé",
        description: "Seuls les médecins peuvent modifier les dossiers patients.",
      });
      router.push('/dashboard');
      return;
    }

    async function fetchPatient() {
      setIsLoading(true);
      const fetchedPatient = await getPatientById(params.id);
      if (!fetchedPatient) {
        notFound();
      } else {
        setPatient(fetchedPatient);
      }
      setIsLoading(false);
    }
    if (user?.role === 'medecin') {
       fetchPatient();
    }
  }, [params.id, user, router, toast]);

  const handleSubmit = async (data: PatientFormData) => {
    if (!patient) return;
    setIsSubmitting(true);
    const result = await updatePatientAction(patient.id, data);
    setIsSubmitting(false);

    if (result?.success) {
      toast({
        title: "Succès !",
        description: result.message || "Patient mis à jour avec succès.",
        className: "bg-accent text-accent-foreground border-accent-foreground/30",
      });
      router.push(`/patients/${patient.id}`);
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: result?.message || "Échec de la mise à jour du patient.",
      });
    }
  };

  if (user && user.role !== 'medecin') {
    return <div className="flex justify-center items-center h-64"><p>Redirection...</p></div>;
  }


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des données du patient...</p>
      </div>
    );
  }

  if (!patient) {
    // This case should be handled by notFound() or if user is not a doctor.
    return <p>Patient non trouvé ou accès non autorisé.</p>; 
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="hover:bg-accent/10">
        <Link href={`/patients/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux détails du patient
        </Link>
      </Button>
      <Card className="shadow-xl border border-border">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Edit3 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl text-primary">Modifier Patient : {patient.prenom} {patient.nom}</CardTitle>
          </div>
          <CardDescription>
            Mettez à jour les informations du patient ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm patient={patient} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
