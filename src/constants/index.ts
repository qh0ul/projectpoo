
import type { NavItem } from "@/components/layout/app-sidebar";
import type { BloodGroup, BloodGroupSelectOption } from "@/lib/types";
import { LayoutDashboard, UserPlus, Users } from "lucide-react";

export const APP_NAME = "SantéOctet"; // Assurer que c'est bien cette valeur

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Tableau de bord",
  },
  {
    href: "/patients",
    icon: Users,
    label: "Patients",
  },
  {
    href: "/patients/new",
    icon: UserPlus,
    label: "Ajouter Patient",
  },
];

export const BLOOD_GROUPS_OPTIONS: { value: BloodGroupSelectOption; label: string }[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  // L'option vide a été retirée pour corriger l'erreur Select.Item
];

// Type pour les options de groupe sanguin, excluant la valeur vide, utile pour les formulaires.
// Ce type est maintenant géré directement via BloodGroupSelectOption dans src/lib/types.ts
// et l'absence de l'option vide dans BLOOD_GROUPS_OPTIONS ci-dessus.

