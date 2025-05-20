"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PatientForm } from "@/components/patient/patient-form";
import { createPatientAction } from "@/lib/actions";
import type { PatientFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    const result = await createPatientAction(data);
    setIsSubmitting(false);

    if (result?.success && result.patientId) {
      toast({
        title: "Succès !",
        description: result.message || "Patient créé avec succès.",
      });
      router.push(`/patients/${result.patientId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: result?.message || "Échec de la création du patient.",
      });
    }
  };

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Ajouter un nouveau patient</CardTitle>
          <CardDescription>
            Remplissez les détails ci-dessous pour créer un nouveau dossier patient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
