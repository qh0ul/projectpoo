"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Siren, Trash2, Loader2 } from "lucide-react";
import type { Allergy } from "@/lib/types";
import { addAllergyAction, removeAllergyAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AllergiesSectionProps {
  patientId: string;
  allergies: Allergy[];
}

export function AllergiesSection({ patientId, allergies: initialAllergies }: AllergiesSectionProps) {
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies);
  const [newAllergy, setNewAllergy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("description", newAllergy);
    
    const result = await addAllergyAction(patientId, formData);
    setIsSubmitting(false);

    if (result?.success) {
      // Re-fetch or update state based on actual new allergy from result if available
      // For now, optimistic update. Ideally, result.newAllergyId or similar would be used
      setAllergies(prev => [...prev, { id: result.newAllergyId || `temp-${Date.now()}`, description: newAllergy }]);
      setNewAllergy("");
      setIsDialogOpen(false);
      toast({ title: "Succès", description: result.message || "Allergie ajoutée." });
    } else {
      toast({ variant: "destructive", title: "Erreur", description: result?.message || "Échec de l'ajout de l'allergie." });
    }
  };

  const handleRemoveAllergy = async (allergyId: string) => {
    // Consider adding a per-item loading state if multiple removals can happen quickly
    // For now, using global isSubmitting for simplicity
    const originalAllergies = [...allergies];
    setAllergies(prev => prev.filter(a => a.id !== allergyId)); // Optimistic update
    
    setIsSubmitting(true);
    const result = await removeAllergyAction(patientId, allergyId);
    setIsSubmitting(false);

    if (result?.success) {
        toast({ title: "Succès", description: result.message || "Allergie supprimée."});
    } else {
        setAllergies(originalAllergies); // Revert on failure
        toast({ variant: "destructive", title: "Erreur", description: result?.message || "Échec de la suppression de l'allergie."});
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Siren className="mr-2 h-5 w-5 text-orange-500" />
            Allergies
          </CardTitle>
          <CardDescription>Liste des allergies et réactions connues.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une allergie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle allergie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAllergy} className="space-y-4 py-4">
              <div>
                <Label htmlFor="allergy-description" className="sr-only">
                  Description de l'allergie
                </Label>
                <Input
                  id="allergy-description"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Ex: Pénicilline, Arachides"
                  disabled={isSubmitting}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button type="button" variant="outline" disabled={isSubmitting}>Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || !newAllergy.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter allergie
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {allergies.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune allergie connue.</p>
        ) : (
          <ScrollArea className="h-40">
            <ul className="space-y-2">
              {allergies.map((allergy) => (
                <li key={allergy.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                  <span className="text-sm">{allergy.description}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveAllergy(allergy.id)} 
                    disabled={isSubmitting} 
                    className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    title="Supprimer l'allergie"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer l'allergie {allergy.description}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
