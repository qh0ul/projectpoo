
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
import { getPatients, calculateAge } from "@/lib/data";
import type { Patient } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { deletePatientAction } from "@/lib/actions"; 

export const metadata = {
  title: "Dossiers Patients",
};

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dossiers Patients</h1>
          <p className="text-muted-foreground">
            Gérez tous les dossiers médicaux des patients.
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un nouveau patient
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tous les patients</CardTitle>
          <CardDescription>
            Liste de tous les patients enregistrés dans le système. {patients.length} patient(s) trouvé(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Aucun patient trouvé. Ajoutez un nouveau patient pour commencer.</p>
              <Button asChild>
                <Link href="/patients/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un patient
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Date de Naissance</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead className="hidden sm:table-cell">Groupe Sanguin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient: Patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.prenom} {patient.nom}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(parseISO(patient.dateDeNaissance), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell>{calculateAge(patient.dateDeNaissance)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {patient.groupeSanguin ? <Badge variant="secondary">{patient.groupeSanguin}</Badge> : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Voir les détails">
                          <Link href={`/patients/${patient.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Modifier le patient">
                          <Link href={`/patients/${patient.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Supprimer le patient" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement le dossier du patient {patient.prenom} {patient.nom}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <form action={async () => {
                                "use server"; 
                                await deletePatientAction(patient.id);
                              }}>
                                <AlertDialogAction type="submit" variant="destructive">
                                  Supprimer
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
             Affichage de {patients.length} dossiers patients.
           </CardFooter>
        )}
      </Card>
    </div>
  );
}

