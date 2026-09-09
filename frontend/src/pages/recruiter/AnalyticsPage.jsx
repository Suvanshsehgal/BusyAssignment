import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const AnalyticsPage = () => {
  return (
    <PlaceholderPage
      title="Recruitment Analytics & Trends"
      description="Aggregated pipeline KPIs, stage conversion breakdowns, and 12-week application trend charts."
      icon={BarChart3}
      roleBadge="Recruiter Only"
    />
  );
};
