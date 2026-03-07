import AiOnboardingApp from "@/components/onboarding/AiOnboardingApp";
import { useNavigate } from "react-router-dom";

const VendorOnboarding = () => {
  const navigate = useNavigate();

  const handleCompletion = () => {
    navigate('/dashboard');
  };

  return <AiOnboardingApp onComplete={handleCompletion} />;
};

export default VendorOnboarding;
