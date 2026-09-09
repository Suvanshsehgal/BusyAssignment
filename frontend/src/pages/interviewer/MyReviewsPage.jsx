import { ClipboardCheck } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const MyReviewsPage = () => {
  return (
    <PlaceholderPage
      title="My Assigned Reviews"
      description="Candidates assigned to you for technical interviews, screening panels, and scorecard feedback."
      icon={ClipboardCheck}
      roleBadge="Interviewer Only"
    />
  );
};
