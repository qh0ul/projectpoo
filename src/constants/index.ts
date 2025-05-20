
import type { NavItem } from "@/components/layout/app-sidebar";
import type { BloodGroup } from "@/lib/types";
import { LayoutDashboard, UserPlus, Users } from "lucide-react";

export const APP_NAME = "'Mon Carnet de Santé'";

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
  // Ajoutez d'autres éléments de navigation ici au besoin
  // e.g., { href: "/parametres", icon: Settings, label: "Paramètres" }
];

export const BLOOD_GROUPS_OPTIONS: { value: Exclude<BloodGroup, ''>; label: string }[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

// Type for blood group options excluding the empty value, useful for forms
export type BloodGroupSelectOption = typeof BLOOD_GROUPS_OPTIONS[number]['value'];
