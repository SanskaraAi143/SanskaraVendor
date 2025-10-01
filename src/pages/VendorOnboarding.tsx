import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AiOnboardingChat from '@/components/onboarding/AiOnboardingChat';
import ManualVendorOnboarding from './ManualVendorOnboarding';

const VendorOnboarding = () => {
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [aiOnboardingComplete, setAiOnboardingComplete] = useState(false);
  const navigate = useNavigate();

  const handleOnboardingComplete = (data: any) => {
    console.log('AI Onboarding complete with data:', data);
    setOnboardingData(data);
    setAiOnboardingComplete(true);
    // Navigate to the manual form, passing data via state
    navigate('/manual-vendor-onboarding', { state: { onboardingData: data } });
  };

  return (
    <div>
      {!aiOnboardingComplete ? (
        <AiOnboardingChat
          userType="vendor"
          onOnboardingComplete={handleOnboardingComplete}
        />
      ) : (
        // This part is now handled by the navigation below,
        // but we'll keep it as a fallback.
        // The navigation to ManualVendorOnboarding is preferred.
        <p>Redirecting to the manual form...</p>
      )}
    </div>
  );
};

export default VendorOnboarding;