import React from 'react';
import { VendorOnboardingForm } from '../types';
import { FormField, TextAreaField } from '../FormFields';
import { ArrowRightIcon } from '../Icons';

interface Step5Props {
    formData: VendorOnboardingForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setStep: (step: number) => void;
}

export const Step5Policies: React.FC<Step5Props> = ({
    formData,
    handleFormChange,
    setStep
}) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Policies & Payment</h2>

        {/* Payment Terms */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Payment & Cancellation</h3>
            <div className="space-y-4">
                <FormField label="Advance Booking %" name="advanceBooking" value={formData.advanceBooking || ''} onChange={handleFormChange} />
                <TextAreaField label="Payment Terms" name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleFormChange} />
                <TextAreaField label="Cancellation Policy" name="cancellationPolicy" value={formData.cancellationPolicy || ''} onChange={handleFormChange} />
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => setStep(4)} className="py-2 px-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">&larr; Previous</button>
            <button onClick={() => setStep(6)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Next <ArrowRightIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);
