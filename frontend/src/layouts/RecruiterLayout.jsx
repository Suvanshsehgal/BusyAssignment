import { LayoutDashboard, Briefcase, Users, BarChart3, Bell } from 'lucide-react';
import { AppShell } from './AppShell.jsx';
import { useAlertsCount } from '../hooks/useAlerts.js';

export const RecruiterLayout = () => {
  const { data } = useAlertsCount();
  const alertCount = data?.count ?? 0;

  const recruiterNavItems = [
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
      badge: alertCount > 0 ? alertCount : undefined,
    },
  ];

  return <AppShell navItems={recruiterNavItems} />;
};
