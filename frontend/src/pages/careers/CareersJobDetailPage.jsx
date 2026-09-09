import { Globe } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const CareersJobDetailPage = () => {
  return (
    <PlaceholderPage
      title="Job Details & Description"
      description="Public job requirements, qualifications, and role expectations."
      icon={Globe}
      roleBadge="Public Access"
      backTo="/careers"
      backLabel="Back to Open Jobs"
    />
  );
};
