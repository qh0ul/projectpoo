
import type { NavItem } from "@/components/layout/app-sidebar";
import type { BloodGroup, BloodGroupSelectOption } from "@/lib/types"; // BloodGroupSelectOption was missing
import { LayoutDashboard, UserPlus, Users } from "lucide-react";

export const APP_NAME = "SantéOctet"; // Reverted to simpler name

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
];

// Type for blood group options excluding the empty value, useful for forms
// export type BloodGroupSelectOption = typeof BLOOD_GROUPS_OPTIONS[number]['value']; // Already in types.ts is better
