import { Briefcase } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const JobsPage = () => {
  return (
    <PlaceholderPage
      title="Job Openings"
      description="Create, monitor, edit, and archive organizational job openings."
      icon={Briefcase}
      roleBadge="Recruiter Only"
    />
  );
};
