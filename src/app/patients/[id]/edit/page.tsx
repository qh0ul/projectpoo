
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
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
    fetchPatient();
  }, [params.id]);

  const handleSubmit = async (data: PatientFormData) => {
    if (!patient) return;
    setIsSubmitting(true);
    const result = await updatePatientAction(patient.id, data);
    setIsSubmitting(false);

    if (result?.success) {
      toast({
        title: "Succès !",
        description: result.message || "Patient mis à jour avec succès.",
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Chargement des données du patient...</p>
      </div>
    );
  }

  if (!patient) {
    return <p>Patient non trouvé.</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/patients/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux détails du patient
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Modifier Patient : {patient.prenom} {patient.nom}</CardTitle>
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

