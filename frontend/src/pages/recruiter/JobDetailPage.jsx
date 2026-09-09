import { Briefcase } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const JobDetailPage = () => {
  return (
    <PlaceholderPage
      title="Job Opening Details"
      description="Detailed job view, description, status management, and candidate applications for this role."
      icon={Briefcase}
      roleBadge="Recruiter Only"
      backTo="/jobs"
      backLabel="Back to Job Openings"
    />
  );
};
