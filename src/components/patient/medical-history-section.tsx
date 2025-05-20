"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, History, Trash2, Loader2, CalendarIcon } from "lucide-react";
import type { MedicalHistoryEntry } from "@/lib/types";
import { addMedicalHistoryAction, removeMedicalHistoryAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";


interface MedicalHistorySectionProps {
  patientId: string;
  medicalHistory: MedicalHistoryEntry[];
}

export function MedicalHistorySection({ patientId, medicalHistory: initialHistory }: MedicalHistorySectionProps) {
  const [history, setHistory] = useState<MedicalHistoryEntry[]>(initialHistory);
  const [newEntryDate, setNewEntryDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [newEntryDescription, setNewEntryDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryDescription.trim() || !newEntryDate) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("date", newEntryDate);
    formData.append("description", newEntryDescription);

    const result = await addMedicalHistoryAction(patientId, formData);
    setIsSubmitting(false);

    if (result?.success) {
      // Manually add for now, ideally re-fetch/revalidate or use returned entry
      const newEntry = { id: result.newEntryId || `temp-${Date.now()}`, date: newEntryDate, description: newEntryDescription };
      setHistory(prev => [newEntry, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setNewEntryDate(format(new Date(), 'yyyy-MM-dd'));
      setNewEntryDescription("");
      setIsDialogOpen(false);
      toast({ title: "Succès", description: result.message || "Entrée d'antécédent médical ajoutée." });
    } else {
      toast({ variant: "destructive", title: "Erreur", description: result?.message || "Échec de l'ajout de l'antécédent médical." });
    }
  };

  const handleRemoveEntry = async (entryId: string) => {
    const originalHistory = [...history];
    setHistory(prev => prev.filter(h => h.id !== entryId)); // Optimistic update
    
    setIsSubmitting(true);
    const result = await removeMedicalHistoryAction(patientId, entryId);
    setIsSubmitting(false);

    if (result?.success) {
        toast({ title: "Succès", description: result.message || "Entrée d'antécédent médical supprimée."});
    } else {
        setHistory(originalHistory); // Revert on failure
        toast({ variant: "destructive", title: "Erreur", description: result?.message || "Échec de la suppression de l'entrée."});
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <History className="mr-2 h-5 w-5 text-blue-500" />
            Antécédents Médicaux
          </CardTitle>
          <CardDescription>Maladies passées, chirurgies et événements significatifs.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une entrée
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une entrée aux antécédents médicaux</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEntry} className="space-y-4 py-4">
              <div>
                <Label htmlFor="entry-date">Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !newEntryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEntryDate ? format(parseISO(newEntryDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEntryDate ? parseISO(newEntryDate) : undefined}
                      onSelect={(date) => setNewEntryDate(date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      locale={fr} // Add locale to Calendar
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="entry-description">Description</Label>
                <Textarea
                  id="entry-description"
                  value={newEntryDescription}
                  onChange={(e) => setNewEntryDescription(e.target.value)}
                  placeholder="Ex: Bilan annuel, Vaccination antigrippale"
                  className="mt-1 min-h-[80px]"
                  disabled={isSubmitting}
                />
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>Annuler</Button>
                 </DialogClose>
                <Button type="submit" disabled={isSubmitting || !newEntryDescription.trim() || !newEntryDate}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter entrée
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun antécédent médical enregistré.</p>
        ) : (
          <ScrollArea className="h-60">
            <ul className="space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="p-3 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{entry.description}</p>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveEntry(entry.id)} 
                        disabled={isSubmitting} 
                        className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        title="Supprimer l'entrée"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer l'entrée {entry.description}</span>
                      </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
