import type { NavItem } from "@/components/layout/app-sidebar";
import type { BloodGroup } from "@/lib/types";
import { LayoutDashboard, UserPlus, Users } from "lucide-react";

export const APP_NAME = "HealthByte";

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/patients",
    icon: Users,
    label: "Patients",
  },
  {
    href: "/patients/new",
    icon: UserPlus,
    label: "Add Patient",
  },
  // Add more navigation items here as needed
  // e.g., { href: "/settings", icon: Settings, label: "Settings" }
];

export const BLOOD_GROUPS_OPTIONS: { value: BloodGroup | ''; label: string }[] = [
  { value: '', label: 'Select Blood Group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];
