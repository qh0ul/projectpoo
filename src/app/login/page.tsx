
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn, AlertCircle, Loader2, Activity, UserPlus } from 'lucide-react';
import { APP_NAME } from '@/constants';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const success = await login(email, motDePasse);
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl border border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Connectez-vous pour accéder à votre carnet de santé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de connexion</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votreadresse@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                className="text-base h-11"
              />
            </div>
            <Button type="submit" className="w-full text-lg py-3 h-12" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Se connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm pt-6">
            <div className="text-center">
                <p className="text-muted-foreground">
                Pas encore de compte patient ?
                </p>
                <Button variant="link" asChild className="text-primary px-0 hover:underline">
                    <Link href="/register/patient">
                        <UserPlus className="mr-2 h-4 w-4" /> Créer un compte patient
                    </Link>
                </Button>
            </div>
        </CardFooter>
      </Card>
       <p className="mt-8 text-xs text-center text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
      </p>
    </div>
  );
}

    