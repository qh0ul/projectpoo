
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, type PatientRegistrationData } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, AlertCircle, Loader2, ArrowLeft, CalendarIcon, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/constants';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';


const registrationFormSchema = z.object({
  prenom: z.string().min(2, { message: "Le prénom doit comporter au moins 2 caractères." }),
  nom: z.string().min(2, { message: "Le nom de famille doit comporter au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  dateDeNaissance: z.string().refine((val) => {
    const date = parseISO(val);
    return isValid(date) && val.length > 0;
  }, { message: "Une date de naissance valide est requise (JJ/MM/AAAA)." }),
  motDePasse: z.string().min(8, { message: "Le mot de passe doit comporter au moins 8 caractères." }),
  confirmationMotDePasse: z.string().min(8, { message: "Veuillez confirmer votre mot de passe." }),
}).refine(data => data.motDePasse === data.confirmationMotDePasse, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmationMotDePasse"],
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export default function PatientRegistrationPage() {
  const router = useRouter();
  const { registerPatient, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      dateDeNaissance: "",
      motDePasse: "",
      confirmationMotDePasse: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    setError(null);
    setIsSubmitting(true);
    
    const registrationData: PatientRegistrationData = {
        prenom: values.prenom,
        nom: values.nom,
        email: values.email,
        motDePasse: values.motDePasse,
        dateDeNaissance: values.dateDeNaissance, // Already yyyy-MM-dd
    };

    const result = await registerPatient(registrationData);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Inscription Réussie !",
        description: result.message,
        className: "bg-accent text-accent-foreground border-accent-foreground/30",
      });
      router.push('/login'); // Redirect to login page after successful registration
    } else {
      setError(result.message);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: result.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4 flex items-center justify-center">
            <Activity className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Créez votre compte patient pour accéder à votre carnet de santé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur d'inscription</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
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
                      <FormLabel>Nom <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom de famille" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votreadresse@email.com" {...field} />
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
                                "w-full pl-3 text-left font-normal",
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
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                name="motDePasse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Au moins 8 caractères" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmationMotDePasse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Retapez votre mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || authLoading}>
                {(isSubmitting || authLoading) ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}
                Créer mon compte
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Déjà un compte ?
            <Button variant="link" asChild className="text-primary px-1">
                <Link href="/login">
                    Se connecter
                </Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
       <p className="mt-8 text-xs text-center text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
      </p>
    </div>
  );
}
