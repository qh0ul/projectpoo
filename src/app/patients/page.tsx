import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getPatients, calculateAge, deletePatient as dbDeletePatient } from "@/lib/data";
import type { Patient } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePatientAction } from "@/lib/actions"; // Using server action

export const metadata = {
  title: "Patient Records",
};

// Make this a server component to fetch data directly
export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground">
            Manage all patient health records.
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            A list of all registered patients in the system. Found {patients.length} patient(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No patients found. Add a new patient to get started.</p>
              <Button asChild>
                <Link href="/patients/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="hidden sm:table-cell">Blood Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient: Patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.prenom} {patient.nom}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(parseISO(patient.dateDeNaissance), "dd MMM yyyy")}</TableCell>
                    <TableCell>{calculateAge(patient.dateDeNaissance)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {patient.groupeSanguin ? <Badge variant="secondary">{patient.groupeSanguin}</Badge> : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="View Details">
                          <Link href={`/patients/${patient.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit Patient">
                          <Link href={`/patients/${patient.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Patient" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the patient record for {patient.prenom} {patient.nom}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <form action={async () => {
                                "use server"; // Required for form action
                                await deletePatientAction(patient.id);
                              }}>
                                <AlertDialogAction type="submit" variant="destructive">
                                  Delete
                                </AlertDialogAction>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {patients.length > 0 && (
           <CardFooter className="text-sm text-muted-foreground">
             Showing {patients.length} patient records.
           </CardFooter>
        )}
      </Card>
    </div>
  );
}
