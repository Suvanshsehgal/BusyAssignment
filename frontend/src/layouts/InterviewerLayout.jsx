import { ClipboardCheck } from 'lucide-react';
import { AppShell } from './AppShell.jsx';

const INTERVIEWER_NAV_ITEMS = [
  {
    to: '/my-reviews',
    label: 'My Reviews',
    icon: ClipboardCheck,
    end: false,
  },
];

export const InterviewerLayout = () => {
  return <AppShell navItems={INTERVIEWER_NAV_ITEMS} />;
};
