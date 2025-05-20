
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PatientForm } from "@/components/patient/patient-form";
import { createPatientAction } from "@/lib/actions";
import type { PatientFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Protect route for non-doctors
  useEffect(() => {
    if (user && user.role !== 'medecin') {
      toast({
        variant: "destructive",
        title: "Accès non autorisé",
        description: "Seuls les médecins peuvent ajouter de nouveaux patients.",
      });
      router.push('/dashboard');
    }
  }, [user, router, toast]);


  const handleSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    const result = await createPatientAction(data);
    setIsSubmitting(false);

    if (result?.success && result.patientId) {
      toast({
        title: "Succès !",
        description: result.message || "Patient créé avec succès.",
        className: "bg-accent text-accent-foreground border-accent-foreground/30",
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
  
  // Render nothing or a loader if redirecting
  if (user && user.role !== 'medecin') {
    return <div className="flex justify-center items-center h-64"><p>Redirection...</p></div>;
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild className="hover:bg-accent/10">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      <Card className="shadow-xl border border-border">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl text-primary">Ajouter un nouveau patient</CardTitle>
          </div>
          <CardDescription>
            Remplissez les détails ci-dessous pour créer un nouveau dossier patient. Tous les champs marqués d'un * sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
