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
        title: "Success!",
        description: result.message || "Patient created successfully.",
      });
      router.push(`/patients/${result.patientId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result?.message || "Failed to create patient.",
      });
    }
  };

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Patient</CardTitle>
          <CardDescription>
            Fill in the details below to create a new patient record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
