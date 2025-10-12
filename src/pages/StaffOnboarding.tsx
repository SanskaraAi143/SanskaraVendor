
import { StaffOnboarding as AiStaffOnboarding } from "../components/onboarding/AiStaffOnboarding.tsx";
import { useNavigate } from "react-router-dom";

const StaffOnboarding = () => {
  const navigate = useNavigate();

  const handleCompletion = (data: { navigate: (path: string) => void }) => {
    data.navigate('/staff/dashboard');
  };

  return <AiStaffOnboarding onBack={() => navigate('/')} onComplete={handleCompletion} onError={(title, description) => console.error(title, description)} />;
};

export default StaffOnboarding;
