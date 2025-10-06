import React from 'react';
import { VendorOnboardingForm } from '../types';
import { FormField, TextAreaField } from '../FormFields';
import { ArrowRightIcon } from '../Icons';

interface Step3Props {
    formData: VendorOnboardingForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setStep: (step: number) => void;
}

export const Step3PricingCatering: React.FC<Step3Props> = ({
    formData,
    handleFormChange,
    setStep
}) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Pricing & Catering</h2>

        {/* Rental Charges */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Rental Charges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Weekday Rate" name="rentalCharges.weekday" value={formData.rentalCharges?.weekday || ''} onChange={handleFormChange} placeholder="₹" />
                <FormField label="Weekend Rate" name="rentalCharges.weekend" value={formData.rentalCharges?.weekend || ''} onChange={handleFormChange} placeholder="₹" />
                <FormField label="Festival Rate" name="rentalCharges.festival" value={formData.rentalCharges?.festival || ''} onChange={handleFormChange} placeholder="₹" />
            </div>
        </div>

        {/* Catering Options */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Catering</h3>
            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-800">Catering Options</label>
                <select name="cateringOptions" value={formData.cateringOptions || ''} onChange={(e) => handleFormChange(e as any)} className="w-full bg-white border border-gray-300 rounded-md py-2 px-3">
                    <option value="">Select option</option>
                    <option value="in-house">In-house Only</option>
                    <option value="outside">Outside Allowed</option>
                    <option value="both">Both</option>
                </select>

                <TextAreaField label="Cuisine Specialties" name="cuisineSpecialties" value={formData.cuisineSpecialties?.join(', ') || ''} onChange={handleFormChange} />
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => setStep(2)} className="py-2 px-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">&larr; Previous</button>
            <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Next <ArrowRightIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);
