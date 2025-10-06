import React from 'react';
import { VendorOnboardingForm } from '../types';
import { FormField, TextAreaField } from '../FormFields';
import { ArrowRightIcon } from '../Icons';

interface Step4Props {
    formData: VendorOnboardingForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setStep: (step: number) => void;
}

export const Step4Amenities: React.FC<Step4Props> = ({
    formData,
    handleFormChange,
    setStep
}) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Amenities & Services</h2>

        {/* Parking */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Parking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Car Parking Capacity" name="parking.cars" value={formData.parking?.cars || ''} onChange={handleFormChange} />
                <FormField label="Two-Wheeler Capacity" name="parking.twoWheelers" value={formData.parking?.twoWheelers || ''} onChange={handleFormChange} />
            </div>
        </div>

        {/* Audio Visual */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Audio/Visual Equipment</h3>
            <div className="space-y-4">
                <label className="flex items-center">
                    <input type="checkbox" name="audioVisual.has_sound_system" checked={formData.audioVisual?.has_sound_system || false} onChange={handleFormChange} className="mr-2" />
                    Sound System Available
                </label>
                <label className="flex items-center">
                    <input type="checkbox" name="audioVisual.has_projector" checked={formData.audioVisual?.has_projector || false} onChange={handleFormChange} className="mr-2" />
                    Projector Available
                </label>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => setStep(3)} className="py-2 px-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">&larr; Previous</button>
            <button onClick={() => setStep(5)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Next <ArrowRightIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);
