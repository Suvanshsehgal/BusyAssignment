import { Bell } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const AlertsPage = () => {
  return (
    <PlaceholderPage
      title="Stalled Candidate SLA Alerts"
      description="Candidates inactive in their non-terminal stage for over 10 days with stage-specific dismissal tracking."
      icon={Bell}
      roleBadge="Recruiter Only"
    />
  );
};
