import { getPatientById, calculateAge } from "@/lib/data";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/constants";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale
import { Metadata } from "next";

// This layout will ensure no other UI elements are printed
function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>Dossier Médical Imprimable</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            .no-print { display: none; }
            h1, h2, h3 { color: #1a2b48; margin-bottom: 0.5em; }
            h1 { font-size: 24pt; border-bottom: 2px solid #7BB4E3; padding-bottom: 0.2em; margin-bottom: 1em;}
            h2 { font-size: 18pt; margin-top: 1.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.1em;}
            h3 { font-size: 14pt; margin-top: 1em; color: #555; }
            p, li { font-size: 11pt; line-height: 1.4; }
            .section { margin-bottom: 2em; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1em;}
            .info-item strong { color: #444; }
            ul { padding-left: 20px; }
            .header-app-name { 
              text-align: right; 
              font-size: 10pt; 
              color: #7BB4E3; /* Soft Blue */
              margin-bottom: 2em; 
            }
            @page {
              size: A4;
              margin: 1in;
            }
          }
          /* Screen styles for the "Print this page" button */
          .print-button-container {
            text-align: center;
            padding: 20px;
          }
          .print-button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #7BB4E3; /* Soft Blue */
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const patient = await getPatientById(params.id);
  if (!patient) {
    return { title: "Dossier Patient Non Trouvé" };
  }
  return { title: `Imprimer - ${patient.prenom} ${patient.nom}` };
}


export default async function PrintPatientPage({ params }: { params: { id: string } }) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  const age = calculateAge(patient.dateDeNaissance);

  return (
    <PrintLayout>
      <div className="print-button-container no-print">
        <button className="print-button" onClick={() => window.print()}>Imprimer cette page</button>
      </div>
      
      <div className="header-app-name">{APP_NAME} - Dossier Médical Numérique</div>
      <h1>Dossier Médical : {patient.prenom} {patient.nom}</h1>

      <div className="section">
        <h2>Informations du Patient</h2>
        <div className="info-grid">
          <p className="info-item"><strong>Nom complet :</strong> {patient.prenom} {patient.nom}</p>
          <p className="info-item"><strong>Date de naissance :</strong> {format(parseISO(patient.dateDeNaissance), "d MMMM yyyy", { locale: fr })}</p>
          <p className="info-item"><strong>Âge :</strong> {age} ans</p>
          <p className="info-item"><strong>Groupe Sanguin :</strong> {patient.groupeSanguin || "Non spécifié"}</p>
        </div>
         {patient.notes && (
          <>
            <h3>Notes Générales :</h3>
            <p style={{whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>{patient.notes}</p>
          </>
        )}
      </div>

      <div className="section">
        <h2>Allergies</h2>
        {patient.allergies.length > 0 ? (
          <ul>
            {patient.allergies.map((allergy) => (
              <li key={allergy.id}>{allergy.description}</li>
            ))}
          </ul>
        ) : (
          <p>Aucune allergie connue.</p>
        )}
      </div>

      <div className="section">
        <h2>Antécédents Médicaux</h2>
        {patient.antecedents.length > 0 ? (
          <ul>
            {patient.antecedents.map((entry) => (
              <li key={entry.id}>
                <strong>{format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })} :</strong> {entry.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun antécédent médical enregistré.</p>
        )}
      </div>
      
      {/* You could add a placeholder or instruction for AI summary if it's printed */}
      {/* 
      <div className="section">
        <h2>Résumé de Santé</h2>
        <p><i>Le résumé de santé généré par IA peut être consulté dans l'application.</i></p>
      </div>
      */}

    </PrintLayout>
  );
}
