
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Patient, PatientFormData, BloodGroup, BloodGroupSelectOption } from "@/lib/types";
import { BLOOD_GROUPS_OPTIONS } from "@/constants";
import { CalendarIcon, Save, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

const PatientFormSchema = z.object({
  nom: z.string().min(2, { message: "Le nom de famille doit comporter au moins 2 caractères." }),
  prenom: z.string().min(2, { message: "Le prénom doit comporter au moins 2 caractères." }),
  dateDeNaissance: z.string().refine((val) => {
    const date = parseISO(val); // Handles yyyy-MM-dd
    return isValid(date) && val.length > 0;
  }, { message: "Une date de naissance valide est requise (YYYY-MM-DD)."}),
  groupeSanguin: z.custom<BloodGroupSelectOption>().optional(),
  notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof PatientFormSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => Promise<any>;
  isSubmitting: boolean;
}

export function PatientForm({ patient, onSubmit, isSubmitting }: PatientFormProps) {
  const defaultValues: Partial<PatientFormValues> = patient
    ? {
        nom: patient.nom,
        prenom: patient.prenom,
        dateDeNaissance: patient.dateDeNaissance ? format(parseISO(patient.dateDeNaissance), 'yyyy-MM-dd') : '',
        groupeSanguin: patient.groupeSanguin || undefined,
        notes: patient.notes || '',
      }
    : {
        nom: "",
        prenom: "",
        dateDeNaissance: "",
        groupeSanguin: undefined,
        notes: "",
      };

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change for better UX
  });

  const handleFormSubmit = async (values: PatientFormValues) => {
    const dataToSubmit: PatientFormData = {
      ...values,
      dateDeNaissance: values.dateDeNaissance, // Already in yyyy-MM-dd
      groupeSanguin: (values.groupeSanguin as BloodGroup) || '', 
    };
    await onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Prénom du patient" {...field} className="text-base"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de famille <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Nom de famille du patient" {...field} className="text-base"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateDeNaissance"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de Naissance <span className="text-destructive">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal text-base h-11", // Increased height
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value && isValid(parseISO(field.value)) ? (
                          format(parseISO(field.value), "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupeSanguin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Groupe Sanguin</FormLabel>
                <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""} 
                    defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Sélectionner le groupe sanguin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BLOOD_GROUPS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes Générales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Entrez toute note pertinente concernant le patient (facultatif)"
                  className="resize-y min-h-[120px] text-base"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ces notes sont destinées aux informations générales et au suivi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto text-base py-3 px-6 shadow-md hover:shadow-lg transition-shadow">
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {patient ? "Enregistrer les modifications" : "Créer le patient"}
        </Button>
      </form>
    </Form>
  );
}
