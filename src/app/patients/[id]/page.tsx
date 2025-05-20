import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientById, calculateAge } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, FileText, UserCircle, HeartPulse, Droplets, Siren, History, StickyNote, Sparkles } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { AllergiesSection } from "@/components/patient/allergies-section";
import { MedicalHistorySection } from "@/components/patient/medical-history-section";
import { HealthSummaryGenerator } from "@/components/patient/health-summary-generator";
import Image from "next/image";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const patient = await getPatientById(params.id);
  if (!patient) {
    return { title: "Patient Not Found" };
  }
  return { title: `${patient.prenom} ${patient.nom} - Health Record` };
}

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  const age = calculateAge(patient.dateDeNaissance);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            {patient.prenom} {patient.nom}
          </h1>
          <p className="text-muted-foreground">
            Viewing detailed health record.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
            <Link href={`/print/patients/${patient.id}`} target="_blank">
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/patients/${patient.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Patient
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">Patient Information</CardTitle>
                <CardDescription>Basic details and contact information.</CardDescription>
              </div>
               <Image 
                data-ai-hint="profile face"
                src={`https://placehold.co/80x80.png`}
                alt={`${patient.prenom} ${patient.nom}`}
                width={80}
                height={80}
                className="rounded-lg border"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Full Name:</span>
                  <p>{patient.prenom} {patient.nom}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Date of Birth:</span>
                  <p>{format(parseISO(patient.dateDeNaissance), "MMMM d, yyyy")} (Age: {age})</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground flex items-center"><Droplets className="mr-1 h-4 w-4 text-red-500"/>Blood Group:</span>
                  <p>{patient.groupeSanguin || "Not specified"}</p>
                </div>
              </div>
              {patient.notes && (
                <div>
                  <Separator className="my-3"/>
                  <h4 className="font-semibold text-muted-foreground mb-1 flex items-center"><StickyNote className="mr-1 h-4 w-4 text-yellow-500"/>General Notes:</h4>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{patient.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <AllergiesSection patientId={patient.id} allergies={patient.allergies} />
          <MedicalHistorySection patientId={patient.id} medicalHistory={patient.antecedents} />
        </div>

        {/* Right Column / AI Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-accent-foreground" />
                AI Health Summary
              </CardTitle>
              <CardDescription>
                Get an AI-generated summary of this patient's health record.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthSummaryGenerator patientId={patient.id} />
            </CardContent>
          </Card>
           <Card className="shadow-lg" data-ai-hint="medical chart">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <HeartPulse className="mr-2 h-5 w-5 text-destructive" />
                Vitals Overview (Placeholder)
              </CardTitle>
              <CardDescription>
                Recent vital signs and trends.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center">
               <Image src="https://placehold.co/300x150.png" alt="Vitals Chart Placeholder" width={300} height={150} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
