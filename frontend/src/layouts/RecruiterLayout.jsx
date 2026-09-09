import { LayoutDashboard, Briefcase, Users, BarChart3, Bell } from 'lucide-react';
import { AppShell } from './AppShell.jsx';

const RECRUITER_NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/jobs',
    label: 'Job Openings',
    icon: Briefcase,
    end: false,
  },
  {
    to: '/applications',
    label: 'Applications',
    icon: Users,
    end: false,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    end: true,
  },
  {
    to: '/alerts',
    label: 'Alerts',
    icon: Bell,
    end: true,
  },
];

export const RecruiterLayout = () => {
  return <AppShell navItems={RECRUITER_NAV_ITEMS} />;
};
