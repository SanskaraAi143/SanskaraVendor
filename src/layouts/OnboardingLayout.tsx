import React, { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import AiChatStep from '../components/onboarding/AiChatStep';
import DocumentUploadStep from '../components/onboarding/DocumentUploadStep';
import ManualVendorOnboarding from '../pages/ManualVendorOnboarding';
import StaffOnboarding from '../pages/StaffOnboarding';
import WelcomeStep from '../components/onboarding/WelcomeStep'; // Import actual WelcomeStep
import CompletionStep from '../components/onboarding/CompletionStep'; // Import actual CompletionStep
import OnboardingPageLayout from '../components/onboarding/OnboardingPageLayout';
import { parseJsonData } from '../utils/dataUtils';
import { useToast } from '@/components/ui/use-toast';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorBanner } from '../components/ui/ErrorBanner';

// Define the shape of the onboarding data
interface OnboardingData {
  [key: string]: any;
}

// Define the shape of the context for navigation and data management
interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (newData: Partial<OnboardingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  currentStep: string;
  mergeOnboardingData: (conversationalData: any, documentData: any) => void;
  handleError: (title: string, description: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Define the steps in the onboarding flow
const onboardingSteps = {
  WELCOME: 'Welcome',
  AI_CHAT: 'AI Chat',
  DOCUMENT_UPLOAD: 'Document Upload',
  MANUAL_VENDOR_ONBOARDING: 'Manual Vendor Onboarding',
  STAFF_ONBOARDING: 'Staff Onboarding',
  COMPLETION: 'Completion',
};

interface OnboardingLayoutProps {
  children?: ReactNode;
  isVendor?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children, isVendor = true }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [conversationalData, setConversationalData] = useState<any>({});
  const [documentData, setDocumentData] = useState<any>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading overlay
  const [error, setError] = useState(''); // New state for error banner
  const { toast } = useToast();

  const stepsArray = [
    onboardingSteps.WELCOME,
    onboardingSteps.AI_CHAT,
    onboardingSteps.DOCUMENT_UPLOAD,
    isVendor ? onboardingSteps.MANUAL_VENDOR_ONBOARDING : onboardingSteps.STAFF_ONBOARDING,
    onboardingSteps.COMPLETION,
  ];

  const currentStep = stepsArray[currentStepIndex];

  const updateOnboardingData = useCallback((newData: Partial<OnboardingData>) => {
    setOnboardingData((prevData) => ({ ...prevData, ...newData }));
  }, []);

  const deepMerge = (target: any, source: any) => {
    const output = { ...target };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  };

  const mergeOnboardingData = useCallback((convoData: any, docData: any) => {
    // Document data takes precedence, so we merge conversational data into document data
    let merged = deepMerge(convoData, docData);

    // Specific handling for genericAttributes which might be a JSON string
    if (merged.genericAttributes && typeof merged.genericAttributes === 'string') {
      merged.genericAttributes = parseJsonData(merged.genericAttributes, {});
    }

    // Handle halls array for vendor onboarding
    if (merged.halls && Array.isArray(merged.halls)) {
      merged.halls = merged.halls.map((hall: any) => {
        // Ensure nested objects within halls are properly parsed if they come as strings
        if (hall.seatingCapacity && typeof hall.seatingCapacity === 'string') {
          hall.seatingCapacity = parseJsonData(hall.seatingCapacity, {});
        }
        if (hall.diningArrangement && typeof hall.diningArrangement === 'string') {
          hall.diningArrangement = parseJsonData(hall.diningArrangement, {});
        }
        if (hall.stage && typeof hall.stage === 'string') {
          hall.stage = parseJsonData(hall.stage, {});
        }
        if (hall.danceFloor && typeof hall.danceFloor === 'string') {
          hall.danceFloor = parseJsonData(hall.danceFloor, {});
        }
        return hall;
      });
    }

    // Handle pricing ranges which might be JSON strings
    if (merged.pricing) {
      Object.keys(merged.pricing).forEach(key => {
        if (merged.pricing[key] && typeof merged.pricing[key] === 'string') {
          merged.pricing[key] = parseJsonData(merged.pricing[key], {});
        }
      });
    }

    // Handle other potential JSON strings for vendor onboarding
    if (merged.outsideCaterersDetails && typeof merged.outsideCaterersDetails === 'string') {
      merged.outsideCaterersDetails = parseJsonData(merged.outsideCaterersDetails, {});
    }
    if (merged.corkageFee && typeof merged.corkageFee === 'string') {
      merged.corkageFee = parseJsonData(merged.corkageFee, {});
    }
    if (merged.decorPackages && typeof merged.decorPackages === 'string') {
      merged.decorPackages = parseJsonData(merged.decorPackages, {});
    }
    if (merged.parking && typeof merged.parking === 'string') {
      merged.parking = parseJsonData(merged.parking, {});
    }
    if (merged.rooms && typeof merged.rooms === 'string') {
      merged.rooms = parseJsonData(merged.rooms, {});
    }
    if (merged.powerBackup && typeof merged.powerBackup === 'string') {
      merged.powerBackup = parseJsonData(merged.powerBackup, {});
    }
    if (merged.audioVisual && typeof merged.audioVisual === 'string') {
      merged.audioVisual = parseJsonData(merged.audioVisual, {});
    }
    if (merged.washrooms && typeof merged.washrooms === 'string') {
      merged.washrooms = parseJsonData(merged.washrooms, {});
    }
    if (merged.accessibility && typeof merged.accessibility === 'string') {
      merged.accessibility = parseJsonData(merged.accessibility, {});
    }
    if (merged.eventStaffing && typeof merged.eventStaffing === 'string') {
      merged.eventStaffing = parseJsonData(merged.eventStaffing, {});
    }
    
    setOnboardingData(merged);
  }, []);

  const handleError = useCallback((title: string, description: string) => {
    setError(`${title}: ${description}`); // Set error message for the banner
    toast({
      title,
      description,
      variant: "destructive",
    });
    setIsNavigating(false); // Reset navigation state on error
  }, [toast]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const goToNextStep = useCallback(() => {
    setIsNavigating(true);
    // In a real application, you might have validation logic here
    // If validation fails, call handleError and return
    if (currentStepIndex < stepsArray.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
    setIsNavigating(false);
    setIsLoading(false); // Also reset loading state
  }, [currentStepIndex, stepsArray.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleAiChatCompletion = useCallback((data: any) => {
    setConversationalData(data);
    mergeOnboardingData(data, documentData);
    goToNextStep();
  }, [documentData, mergeOnboardingData, goToNextStep]);

  const handleManualVendorOnboardingCompletion = useCallback((data: any) => {
    updateOnboardingData(data);
    goToNextStep();
  }, [updateOnboardingData, goToNextStep]);

  const handleStaffOnboardingCompletion = useCallback((data: any) => {
    updateOnboardingData(data);
    goToNextStep();
  }, [updateOnboardingData, goToNextStep]);

  const handleDocumentUploadCompletion = useCallback((data: any) => {
    setDocumentData(data);
    mergeOnboardingData(conversationalData, data);
    goToNextStep();
  }, [conversationalData, mergeOnboardingData, goToNextStep]);

  const renderStepComponent = () => {
    switch (currentStep) {
      case onboardingSteps.WELCOME:
        return <WelcomeStep onCompletion={goToNextStep} onError={handleError} />;
      case onboardingSteps.AI_CHAT:
        return <AiChatStep onCompletion={handleAiChatCompletion} onError={handleError} userType={isVendor ? 'vendor' : 'staff'} />;
      case onboardingSteps.DOCUMENT_UPLOAD:
        return <DocumentUploadStep onCompletion={handleDocumentUploadCompletion} onError={handleError} isVendor={isVendor} />;
      case onboardingSteps.MANUAL_VENDOR_ONBOARDING:
        return <ManualVendorOnboarding onboardingData={onboardingData} onCompletion={handleManualVendorOnboardingCompletion} onError={handleError} />;
      case onboardingSteps.STAFF_ONBOARDING:
        return <StaffOnboarding onboardingData={onboardingData} onCompletion={handleStaffOnboardingCompletion} onError={handleError} />;
      case onboardingSteps.COMPLETION:
        return <CompletionStep onCompletion={goToNextStep} onError={handleError} />;
      default:
        return <WelcomeStep onCompletion={goToNextStep} onError={handleError} />;
    }
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData, goToNextStep, goToPreviousStep, currentStep, mergeOnboardingData, handleError }}>
      <OnboardingPageLayout>
        <div className="flex flex-col w-full min-h-screen p-4 sm:p-6 lg:p-8 relative">
          <LoadingOverlay show={isLoading || isNavigating} />
          <ErrorBanner message={error} onHide={clearError} />
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Onboarding Process</h1>
          <div className="mb-6">
            <p className="text-center text-lg text-gray-600">Current Step: <span className="font-semibold">{currentStep}</span></p>
            <div className="flex justify-center mt-2">
              {stepsArray.map((step, index) => (
                <div key={step} className={`h-2 w-16 mx-1 rounded-full ${index <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              ))}
            </div>
          </div>
          <div className="w-full flex-grow">
              {renderStepComponent()}
          </div>
          <div className="flex justify-between mt-8 w-full">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0 || isNavigating || isLoading}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={goToNextStep}
              disabled={currentStepIndex === stepsArray.length - 1 || isNavigating || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
            >
              {isNavigating || isLoading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
      </OnboardingPageLayout>
    </OnboardingContext.Provider>
  );
};

export default OnboardingLayout;