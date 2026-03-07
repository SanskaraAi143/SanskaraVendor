import React from 'react';
import { VendorOnboardingForm } from '../types';
import { TextAreaField } from '../FormFields';

interface Step6Props {
    formData: VendorOnboardingForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setStep: (step: number) => void;
    handleNext: () => void;
}

export const Step6Operational: React.FC<Step6Props> = ({
    formData,
    handleFormChange,
    setStep,
    handleNext
}) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Operational Details</h2>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
                <TextAreaField label="Unique Features" name="uniqueFeatures" value={formData.uniqueFeatures || ''} onChange={handleFormChange} />
                <TextAreaField label="Ideal Client Profile" name="idealClientProfile" value={formData.idealClientProfile || ''} onChange={handleFormChange} />
                <TextAreaField label="Venue Rules" name="venueRules" value={formData.venueRules || ''} onChange={handleFormChange} />
            </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Ready to Submit!</h3>
            <p className="text-green-700">Please review all information and click submit to complete your onboarding.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => setStep(5)} className="py-2 px-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">&larr; Previous</button>
            <button onClick={handleNext} className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">Submit Onboarding</button>
        </div>
    </div>
);
