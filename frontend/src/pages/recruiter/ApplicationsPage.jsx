import { Users } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const ApplicationsPage = () => {
  return (
    <PlaceholderPage
      title="Candidate Applications"
      description="Manage candidates across all stages: Applied, Screening, Interview, Offer, and Hired."
      icon={Users}
      roleBadge="Recruiter Only"
    />
  );
};
