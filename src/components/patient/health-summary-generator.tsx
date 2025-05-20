
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Terminal } from "lucide-react";
import { generateHealthSummaryAction } from "@/lib/actions";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HealthSummaryGeneratorProps {
  patientId: string;
}

export function HealthSummaryGenerator({ patientId }: HealthSummaryGeneratorProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    const result = await generateHealthSummaryAction(patientId);

    if (result.summary) {
      setSummary(result.summary);
    } else if (result.error) {
      setError(result.error);
    } else {
      setError("Une erreur inconnue s'est produite lors de la génération du résumé.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Générer un résumé IA
      </Button>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur lors de la génération du résumé</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && (
        <Alert variant="default" className="bg-primary/10 border-primary/30">
           <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Résumé du dossier médical</AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-48 mt-2">
                 <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}
       {!summary && !error && !isLoading && (
        <p className="text-sm text-center text-muted-foreground py-4">
          Cliquez sur le bouton ci-dessus pour générer un résumé de santé par IA.
        </p>
      )}
    </div>
  );
}

