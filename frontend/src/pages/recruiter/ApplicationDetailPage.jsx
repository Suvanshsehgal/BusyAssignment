import { Users } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const ApplicationDetailPage = () => {
  return (
    <PlaceholderPage
      title="Candidate Profile & Timeline"
      description="Candidate details, stage progression actions, interview panels, scorecards, and audit history."
      icon={Users}
      roleBadge="Recruiter Only"
      backTo="/applications"
      backLabel="Back to Applications"
    />
  );
};
