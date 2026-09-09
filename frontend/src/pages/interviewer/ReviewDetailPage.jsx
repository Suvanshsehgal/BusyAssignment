import { ClipboardCheck } from 'lucide-react';
import { PlaceholderPage } from '../../components/PlaceholderPage.jsx';

export const ReviewDetailPage = () => {
  return (
    <PlaceholderPage
      title="Candidate Review & Scorecard"
      description="Candidate resume, role requirements, interview competencies, and feedback rating submission."
      icon={ClipboardCheck}
      roleBadge="Interviewer Only"
      backTo="/my-reviews"
      backLabel="Back to My Reviews"
    />
  );
};
