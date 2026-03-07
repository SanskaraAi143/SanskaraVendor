import React from 'react';
import { StaffOnboarding as NewStaffOnboarding } from './features/staff/StaffOnboarding';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

interface AiStaffOnboardingProps {
  onBack: () => void;
  onComplete: (data: any) => void;
  onError: (title: string, description: string) => void;
}

export const StaffOnboarding: React.FC<AiStaffOnboardingProps> = ({ onBack, onComplete, onError }) => {
  const { user, refreshStaffProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSkip = async () => {
    if (!user) return;
    try {
      const staffRef = doc(db, 'vendor_staff', user.uid);
      // Use setDoc with merge: true to handle cases where the document doesn't exist yet
      await setDoc(staffRef, {
        is_active: true,
        updated_at: new Date().toISOString()
      }, { merge: true });

      await refreshStaffProfile();
      navigate('/staff/dashboard');
    } catch (error: any) {
      console.error('Error skipping staff onboarding:', error);
      onError("Skip Error", error.message || "Failed to skip onboarding.");
    }
  };
  const handleSubmit = async (data: any) => {
    try {
      if (!user) {
        onError("Authentication Error", "User not authenticated.");
        return;
      }

      const staffRef = doc(db, 'vendor_staff', user.uid);
      const staffSnap = await getDoc(staffRef);
      let vendorStaff = staffSnap.data();

      if (!staffSnap.exists()) {
        // Create personal vendor if staff record doesn't exist
        const vendorId = `vendor_${user.uid}`;
        const vendorRef = doc(db, 'vendors', vendorId);

        const vendorData = {
          vendor_id: vendorId,
          firebase_uid: user.uid,
          vendor_name: `${data.name || 'Staff'} Services`,
          vendor_category: 'Staff Services',
          contact_email: user.email || '',
          description: `Personal services by ${data.name || 'staff member'}`,
          details: {
            status: 'active',
            is_personal_staff_vendor: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await setDoc(vendorRef, vendorData);

        const newStaffData = {
          staff_id: user.uid,
          firebase_uid: user.uid,
          vendor_id: vendorId,
          email: user.email || '',
          display_name: data.name || '',
          role: data.role || 'staff',
          phone_number: '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await setDoc(staffRef, newStaffData);
        vendorStaff = newStaffData;
      }

      const vendorId = vendorStaff?.vendor_id || user.uid;

      // Create staff portfolio
      const portfolioRef = collection(db, 'staff_portfolios');
      
      // Sanitize undefined values for Firestore
      const genericAttributes = {
          name: data.name || null,
          role: data.role || null,
          food_options: data.food_options || null,
          pricing_details: data.pricing_details || null,
          service_type: data.service_type || null
      };

      await addDoc(portfolioRef, {
        staff_id: user.uid,
        vendor_id: vendorId,
        portfolio_type: data.portfolioType || 'individual',
        title: data.portfolioTitle || `${data.name || 'Staff'} Portfolio`,
        description: data.portfolioDescription || '',
        generic_attributes: genericAttributes,
        created_at: new Date().toISOString()
      });

      // Update staff status to active
      await updateDoc(staffRef, {
        is_active: true,
        updated_at: new Date().toISOString()
      });

      await refreshStaffProfile();

      toast({
        title: "Staff Onboarding Completed!",
        description: "Your portfolio has been successfully created with SanskaraAi.",
        variant: "default",
      });

      navigate('/staff/dashboard');
    } catch (error: any) {
      console.error('Error submitting staff onboarding:', error);
      onError("Submission Error", error.message || "Failed to complete staff onboarding.");
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Role Selection
        </button>
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm"
        >
          Skip for now
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        <NewStaffOnboarding onBack={onBack} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};