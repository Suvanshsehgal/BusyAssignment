import { LayoutDashboard } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const DashboardPage = () => {
  return (
    <PlaceholderPage
      title="Recruiter Dashboard"
      description="Executive hiring overview, funnel conversion rates, and recruitment team metrics."
      icon={LayoutDashboard}
      roleBadge="Recruiter Only"
    />
  );
};
