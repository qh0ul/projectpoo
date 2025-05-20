
import type { NavItem } from "@/components/layout/app-sidebar";
import type { BloodGroup, BloodGroupSelectOption } from "@/lib/types";
import { LayoutDashboard, UserPlus, Users, LogIn } from "lucide-react";

export const APP_NAME = "SantéOctet";

export const NAV_ITEMS_PUBLIC: NavItem[] = [
   {
    href: "/login",
    icon: LogIn,
    label: "Connexion",
  },
];

export const NAV_ITEMS_AUTHENTICATED: NavItem[] = [
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
