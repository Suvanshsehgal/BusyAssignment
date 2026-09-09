import { Globe } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const CareersApplyPage = () => {
  return (
    <PlaceholderPage
      title="Submit Application"
      description="Frictionless public candidate application form. Zero login or account creation required."
      icon={Globe}
      roleBadge="Public Access"
      backTo="/careers"
      backLabel="Back to Careers"
    />
  );
};
