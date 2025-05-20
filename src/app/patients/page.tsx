
"use client";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye, Users, Search, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting patient ID

  useEffect(() => {
    if (user && user.role !== 'medecin') {
      toast({
        variant: "destructive",
        title: "Accès non autorisé",
        description: "Cette section est réservée aux médecins.",
      });
      router.push('/dashboard');
      return;
    }
    async function loadPatients() {
      setIsLoading(true);
      const fetchedPatients = await getPatients();
      setPatients(fetchedPatients);
      setIsLoading(false);
    }
    if(user?.role === 'medecin') {
      loadPatients();
    }
  }, [user, router, toast]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(patient =>
      `${patient.prenom} ${patient.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handleDeletePatient = async (patientId: string) => {
    setIsDeleting(patientId);
    const result = await deletePatientAction(patientId);
    setIsDeleting(null);

    if (result?.success === false) { 
      toast({variant: "destructive", title: "Erreur", description: result.message});
    } else {
      toast({title: "Succès", description: "Patient supprimé."});
      setPatients(prev => prev.filter(p => p.id !== patientId)); 
    }
  };

  if (user && user.role !== 'medecin') {
    return <div className="flex justify-center items-center h-64"><p>Redirection...</p></div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Dossiers Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez tous les dossiers médicaux des patients.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un patient
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl border border-border">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl">Liste des Patients</CardTitle>
            <CardDescription>
              {isLoading ? "Chargement..." : `${filteredPatients.length} patient(s) trouvé(s).`}
            </CardDescription>
          </div>
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par nom ou ID..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement des données des patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Aucun patient ne correspond à votre recherche." : "Aucun patient trouvé. Ajoutez un nouveau patient pour commencer."}
              </p>
              <Button asChild>
                <Link href="/patients/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un patient
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredPatients.map((patient: Patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{patient.prenom} {patient.nom}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(parseISO(patient.dateDeNaissance), "dd MMM yyyy", { locale: fr })}</TableCell>
                      <TableCell>{calculateAge(patient.dateDeNaissance)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {patient.groupeSanguin ? <Badge variant={patient.groupeSanguin.includes('O') ? "default" : "secondary"}>{patient.groupeSanguin}</Badge> : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button variant="ghost" size="icon" asChild title="Voir les détails" className="hover:text-primary">
                            <Link href={`/patients/${patient.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Modifier le patient" className="hover:text-accent-foreground">
                            <Link href={`/patients/${patient.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Supprimer le patient" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
                                {isDeleting === patient.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                                <AlertDialogAction 
                                  variant="destructive"
                                  onClick={() => handleDeletePatient(patient.id)}
                                  disabled={isDeleting === patient.id}
                                >
                                  {isDeleting === patient.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {filteredPatients.length > 0 && (
           <CardFooter className="text-sm text-muted-foreground border-t pt-4">
             Affichage de {filteredPatients.length} sur {patients.length} dossiers patients.
           </CardFooter>
        )}
      </Card>
    </div>
  );
}
