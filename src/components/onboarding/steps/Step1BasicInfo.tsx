import React from 'react';
import { VendorOnboardingForm, SessionStatus } from '../types';
import { FormField, TextAreaField } from '../FormFields';
import { WaveformVisualizer } from '../WaveformVisualizer';
import { MicrophoneIcon, StopCircleIcon, ArrowRightIcon } from '../Icons';

interface Step1Props {
    formData: VendorOnboardingForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setStep: (step: number) => void;
    setFormData: (data: any) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isProcessingFile: boolean;
    renderStatus: () => React.ReactElement;
    stopSession: () => void;
    startSession: () => void;
    status: SessionStatus;
    analyserNode: AnalyserNode | null;
    currentUtterance: { user: string; agent: string };
    isSpeaking: boolean;
    vadThreshold: number;
    setVadThreshold: (value: number) => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
    formData,
    handleFormChange,
    setStep,
    setFormData,
    handleImageChange,
    isProcessingFile,
    renderStatus,
    stopSession,
    startSession,
    status,
    analyserNode,
    currentUtterance,
    isSpeaking,
    vadThreshold,
    setVadThreshold
}) => (
    <div className="w-full max-w-7xl mx-auto">
        {/* AI Voice Box - Small rectangular box at the top */}
        <div className="bg-gray-800 text-white rounded-lg p-4 mb-6 shadow-lg border border-gray-700 h-64 flex flex-col justify-between"> {/* Increased height to h-64 */}
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-lg font-bold">AI Onboarding Agent</h1>
                    <p className="text-gray-400 text-sm">Speak naturally. I'll fill out the form.</p>
                </div>
                <div className="text-xs font-medium p-1 rounded bg-gray-700/50">{renderStatus()}</div>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center w-full"> {/* Centered content */}
                <div className="w-full max-w-full px-4 flex-grow flex items-center justify-center"> {/* Waveform takes more horizontal space and centers vertically */}
                    <WaveformVisualizer analyserNode={analyserNode} currentUtterance={currentUtterance} />
                </div>
            </div>
            <div className="w-full flex flex-col items-center space-y-2 px-4 flex-shrink-0"> {/* Mic sensitivity and buttons at the bottom */}
                <div className="w-64"> {/* Increased width for slider */}
                    <label htmlFor="vad-slider-vendor" className="block text-xs font-medium text-gray-400 mb-1 text-center">Mic Sensitivity</label>
                    <input
                        id="vad-slider-vendor"
                        type="range"
                        min="0.005"
                        max="0.05"
                        step="0.001"
                        value={vadThreshold}
                        onChange={(e) => setVadThreshold(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">Lower value = more sensitive</p>
                </div>
                <div className="flex justify-center w-full"> {/* Centered button container */}
                    {status === SessionStatus.CONNECTED ?
                        (<button onClick={() => stopSession()} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-10 rounded-lg transition-colors duration-300 w-64 text-xl"><StopCircleIcon className="w-7 h-7" /> End Session</button>) :
                        (<button onClick={startSession} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-10 rounded-lg transition-colors duration-300 disabled:bg-gray-500 w-64 text-xl" disabled={status === SessionStatus.CONNECTING}><MicrophoneIcon className="w-7 h-7" /> Start Voice Session</button>
                    )}
                </div>
            </div>
            {isSpeaking && (
                <div className="absolute top-2 right-2 text-xs text-cyan-300">
                    Speaking...
                </div>
            )}
        </div>

        {/* Full-width form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1"><FormField label="Venue Name" name="venueName" value={formData.venueName || ''} onChange={handleFormChange} required /></div>
                <div className="md:col-span-1"><FormField label="Contact Person Name (Owner/Manager)" name="contactPersonName" value={formData.contactPersonName || ''} onChange={handleFormChange} required /></div>
                <div className="md:col-span-1"><FormField label="Direct Phone Number(s)" name="directPhoneNumbers" value={formData.directPhoneNumbers || ''} onChange={handleFormChange} placeholder="+91 98765 43210" required /></div>
                <div className="md:col-span-1"><FormField label="Email Address" name="emailAddress" type="email" value={formData.emailAddress || ''} onChange={handleFormChange} placeholder="sriramsismarriage@gmail.com" required /></div>
                <div className="md:col-span-2"><FormField label="Years in Operation / Establishment Year" name="yearsInOperation" value={formData.yearsInOperation || ''} onChange={handleFormChange} placeholder="2015 or 8 years" required /></div>
                <div className="md:col-span-2"><TextAreaField label="Full Address with Pin Code" name="fullAddress" value={formData.fullAddress || ''} onChange={handleFormChange} required /></div>
                <div className="md:col-span-2"><TextAreaField label="Website or Social Media Links" name="websiteLinks" value={formData.websiteLinks || ''} onChange={handleFormChange} placeholder="Website: https://..., Instagram: @..., Facebook: ..." /></div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 mb-1">Upload High-Quality Photos of Venue <span className="text-red-500">*</span></label>
                    <input type="file" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
                <button onClick={() => setStep(2)} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">Next <ArrowRightIcon className="w-5 h-5"/></button>
            </div>
        </div>
    </div>
);
