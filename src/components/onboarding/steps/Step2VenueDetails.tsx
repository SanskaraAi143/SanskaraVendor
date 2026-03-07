import React from 'react';
import { VendorOnboardingForm } from '../types';
import { FormField, TextAreaField } from '../FormFields';
import { ArrowRightIcon } from '../Icons';

interface Step2Props {
    formData: VendorOnboardingForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setStep: (step: number) => void;
    setFormData: (data: any) => void;
    handleAddHall: () => void;
    isProcessingFile: boolean;
    handleDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Step2VenueDetails: React.FC<Step2Props> = ({
    formData,
    handleFormChange,
    setStep,
    setFormData,
    handleAddHall,
    isProcessingFile,
    handleDocumentChange
}) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Venue Details</h2>

        {/* Document Upload for Venue Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Upload Venue Documents</h3>
            <p className="text-gray-600 mb-4">Upload brochures, floor plans, or other venue documents to auto-fill details</p>
            <input
                type="file"
                multiple
                onChange={handleDocumentChange}
                disabled={isProcessingFile}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isProcessingFile && <p className="text-blue-600 mt-2">Processing documents...</p>}
        </div>

        {/* Hall Details */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Hall/Spaces</h3>
            {formData.halls?.map((hall, index) => (
                <div key={hall.id || index} className="mb-6 p-4 border border-gray-300 rounded-lg">
                    <h4 className="font-semibold mb-3">Hall {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Hall Name" name={`halls.${index}.name`} value={hall.name || ''} onChange={handleFormChange} />
                        <FormField label="Type" name={`halls.${index}.type`} value={hall.type || ''} onChange={handleFormChange} />
                        <FormField label="Area (sq ft)" name={`halls.${index}.area_sq_ft`} value={hall.area_sq_ft || ''} onChange={handleFormChange} />
                        <FormField label="Air Conditioning" name={`halls.${index}.airConditioning`} value={hall.airConditioning || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField label="Theatre Capacity" name={`halls.${index}.seatingCapacity.theatre`} value={hall.seatingCapacity?.theatre || ''} onChange={handleFormChange} />
                        <FormField label="Round Table Capacity" name={`halls.${index}.seatingCapacity.roundTable`} value={hall.seatingCapacity?.roundTable || ''} onChange={handleFormChange} />
                        <FormField label="Floating Capacity" name={`halls.${index}.seatingCapacity.floating`} value={hall.seatingCapacity?.floating || ''} onChange={handleFormChange} />
                    </div>
                    <div className="mt-4">
                        <TextAreaField label="Ambience Description" name={`halls.${index}.ambience`} value={hall.ambience || ''} onChange={handleFormChange} />
                    </div>
                </div>
            ))}
            <button type="button" onClick={handleAddHall} className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Another Hall
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => setStep(1)} className="py-2 px-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">&larr; Previous</button>
            <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Next <ArrowRightIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);
