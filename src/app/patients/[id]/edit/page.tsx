"use client";

import { useState } from "react";
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

  useState(() => {
    async function fetchPatient() {
      const fetchedPatient = await getPatientById(params.id);
      if (!fetchedPatient) {
        notFound();
      }
      setPatient(fetchedPatient);
      setIsLoading(false);
    }
    fetchPatient();
  });

  const handleSubmit = async (data: PatientFormData) => {
    if (!patient) return;
    setIsSubmitting(true);
    const result = await updatePatientAction(patient.id, data);
    setIsSubmitting(false);

    if (result?.success) {
      toast({
        title: "Success!",
        description: result.message || "Patient updated successfully.",
      });
      router.push(`/patients/${patient.id}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result?.message || "Failed to update patient.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading patient data...</p>
      </div>
    );
  }

  if (!patient) {
    // Should be caught by notFound in effect, but as a fallback
    return <p>Patient not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/patients/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient Details
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Patient: {patient.prenom} {patient.nom}</CardTitle>
          <CardDescription>
            Update the patient's information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm patient={patient} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
