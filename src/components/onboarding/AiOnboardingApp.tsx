import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorOnboarding } from './AiVendorOnboarding.tsx';
import { StaffOnboarding } from './AiStaffOnboarding';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type OnboardingType = 'vendor' | 'staff' | null;

const RoleSelection: React.FC<{ onSelect: (type: OnboardingType) => void }> = ({ onSelect }) => (
    <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to AI Onboarding</h1>
        <p className="text-lg text-gray-600 mb-12">Please select your role to begin a tailored onboarding experience.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
                onClick={() => onSelect('vendor')}
                className="group p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a Vendor</h2>
                <p className="text-gray-500">Onboard venues like banquet halls, lawns, and terraces with a detailed, multi-step form.</p>
            </button>
            <button
                onClick={() => onSelect('staff')}
                className="group p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">I am Staff</h2>
                <p className="text-gray-500">Onboard as a photographer, DJ, makeup artist, etc., and showcase your portfolio.</p>
            </button>
        </div>
        <div className="mt-12">
            <Button
                variant="ghost"
                onClick={() => onSelect('skip' as any)}
                className="text-gray-500 hover:text-gray-800"
            >
                Skip for now, I'll do this later
            </Button>
        </div>
    </div>
);

interface AiOnboardingAppProps {
    onComplete?: (data: any) => void;
    onError?: (title: string, description: string) => void;
}

const AiOnboardingApp: React.FC<AiOnboardingAppProps> = ({ onComplete, onError }) => {
    const [onboardingType, setOnboardingType] = useState<OnboardingType>(null);
    const { user, userType, refreshVendorProfile, refreshStaffProfile } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSkipOnboarding = async () => {
        if (!user) return;

        try {
            if (userType === 'vendor') {
                const { error } = await supabase
                    .from('vendors')
                    .update({ status: 'onboarding_complete' })
                    .eq('supabase_auth_uid', user.id);

                if (error) throw error;
                await refreshVendorProfile();
            } else if (userType === 'staff') {
                const { error } = await supabase
                    .from('vendor_staff')
                    .update({ is_active: true })
                    .eq('supabase_auth_uid', user.id);

                if (error) throw error;
                await refreshStaffProfile();
            }

            toast({
                title: "Onboarding skipped",
                description: "You can complete your profile later from settings.",
            });

            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error skipping onboarding:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to skip onboarding",
                variant: "destructive",
            });
        }
    };

    const handleBackToSelection = () => {
        setOnboardingType(null);
    };

    const handleCompletion = (data: any) => {
        if (onComplete) {
            onComplete(data);
        }
        navigate('/dashboard');
    };

    const handleError = (title: string, description: string) => {
        if (onError) {
            onError(title, description);
        }
    };

    const renderContent = () => {
        switch (onboardingType) {
            case 'vendor':
                return <VendorOnboarding onBack={handleBackToSelection} onComplete={handleCompletion} onError={handleError} />;
            case 'staff':
                return <StaffOnboarding onBack={handleBackToSelection} onComplete={handleCompletion} onError={handleError} />;
            default:
                return <RoleSelection onSelect={(type) => {
                    if (type === 'skip' as any) {
                        handleSkipOnboarding();
                    } else {
                        setOnboardingType(type);
                    }
                }} />;
        }
    };

    return (
        <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center polka-dot-bg">
            <main className="w-full">
                {renderContent()}
            </main>
        </div>
    );
};

export default AiOnboardingApp;
