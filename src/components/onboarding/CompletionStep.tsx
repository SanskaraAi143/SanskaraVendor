import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext'; // Assuming this hook provides user role

interface CompletionStepProps {
  onCompletion: (data?: any) => void;
  onError: (title: string, description: string) => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onCompletion, onError }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    // Signal completion immediately as this is the final step
    onCompletion();
  }, [onCompletion]);

  const handleGoToDashboard = () => {
    try {
      if (user?.role === 'vendor') {
        navigate('/dashboard');
      } else if (user?.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        // Default or fallback if role is not defined or unknown
        navigate('/');
      }
    } catch (error: any) {
      onError("Navigation Error", error.message || "Failed to navigate to dashboard.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 md:p-10 bg-transparent">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Onboarding Complete!</h1>
      <p className="text-center text-gray-600 mb-8">
        Congratulations! You have successfully completed your onboarding process.
        You can now proceed to your dashboard.
      </p>
      <Button
        onClick={handleGoToDashboard}
        className="w-full py-3 px-4 rounded-full border-none cursor-pointer font-medium text-base transition-colors bg-[#8B0000] text-white hover:bg-[#a50000]"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default CompletionStep;