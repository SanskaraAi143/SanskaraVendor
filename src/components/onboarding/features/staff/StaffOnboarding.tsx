import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { StaffOnboardingForm } from '../../types';
import { useLiveSession } from '../../hooks/useLiveSession';
import { staffFormSchema, updateStaffFormDeclaration } from '../../schemas/staffSchema';
import { FormField, TextAreaField, SelectField } from '../../FormFields';
import { WaveformVisualizer } from '../../WaveformVisualizer';
import { MicrophoneIcon, StopCircleIcon, ArrowLeftIcon } from '../../Icons';
import { FileUpload } from '../..//FileUpload';
import { PortfolioUploader } from '../../PortfolioUploader';

const initialFormData: StaffOnboardingForm = {
    name: '',
    role: '',
    portfolioTitle: '',
    portfolioDescription: '',
    portfolioType: '',
    genericAttributes: {
        food_options: '',
        pricing_details: '',
        service_type: '',
    },
    imageUrls: [],
};

const systemInstruction = `You are a friendly AI agent helping a user fill out a staff onboarding form for roles like photographers, DJs, etc. Your goal is to ask for the information one by one, waiting for the user's response before proceeding. Ask for Name, Role (e.g., Photographer), Portfolio Title, and Portfolio Description. Use the 'update_staff_form' tool to populate the corresponding field after each question is answered. After getting these details, say 'Thank you! Please review the information and fill out the rest of the form.'`;


export const StaffOnboarding: React.FC<{ onBack: () => void; onSubmit: (data: StaffOnboardingForm) => void; }> = ({ onBack, onSubmit }) => {
    const [formData, setFormData] = useState<StaffOnboardingForm>(initialFormData);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [vadThreshold, setVadThreshold] = useState(0.01);

    const updateFormFromAI = useCallback((args: Partial<StaffOnboardingForm>) => {
        setFormData(prev => ({
            ...prev,
            ...args,
            genericAttributes: {
                ...prev.genericAttributes,
                ...args.genericAttributes,
            }
        }));
    }, []);

    const {
        status,
        startSession,
        stopSession,
        analyserNode,
        currentUtterance,
        renderStatus,
        isSpeaking,
    } = useLiveSession({
        systemInstruction,
        functionDeclarations: [updateStaffFormDeclaration],
        onFunctionCall: (name, args) => {
            if (name === 'update_staff_form') {
                updateFormFromAI(args as Partial<StaffOnboardingForm>);
            }
        },
        vadThreshold
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const handlePortfolioChange = (files: File[]) => {
        setFormData(prev => ({...prev, imageUrls: files}));
    }

    const processFilesWithAI = async (files: { content: string; mimeType: string }[]) => {
        if (!process.env.API_KEY) {
            alert("API_KEY environment variable not set.");
            return;
        }
        setIsProcessingFile(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const textPrompt = `Extract the staff member's information from the provided document(s)/image(s) for roles like photographer, DJ, etc., and format it according to the provided JSON schema. Consolidate information from all files.`;
            const parts: any[] = [{ text: textPrompt }];

            for (const file of files) {
                 if (file.mimeType.startsWith('text/')) {
                    parts.push({ text: `\n\n--- DOCUMENT: ${file.mimeType} ---\n${file.content}` });
                } else {
                    parts.push({ inlineData: { data: file.content, mimeType: file.mimeType } });
                }
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: { responseMimeType: "application/json", responseSchema: staffFormSchema }
            });

            const jsonText = response.text.trim();
            const extractedData = JSON.parse(jsonText);
            updateFormFromAI(extractedData);

        } catch (error) {
            console.error("Error processing files with AI:", error);
            alert("Could not extract information from the files. Please check the content and try again.");
        } finally {
            setIsProcessingFile(false);
        }
    };

    const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const filePromises = Array.from(files).map(file => {
            return new Promise<{ content: string; mimeType: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    if (file.type.startsWith('text/')) {
                        resolve({ content: result, mimeType: file.type });
                    } else {
                        const base64Content = result.split(',')[1];
                        resolve({ content: base64Content, mimeType: file.type });
                    }
                };
                reader.onerror = (error) => reject(error);
                if (file.type.startsWith('text/')) reader.readAsText(file);
                else reader.readAsDataURL(file);
            });
        });

        try {
            const fileData = await Promise.all(filePromises);
            await processFilesWithAI(fileData);
        } catch (error) {
            console.error("Error reading files:", error);
        } finally {
            e.target.value = '';
        }
    };


    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            <button onClick={onBack} className="absolute -top-14 left-0 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold">
                <ArrowLeftIcon className="w-5 h-5"/> Back to Role Selection
            </button>
            <div className="bg-gray-800 text-white rounded-2xl p-6 flex flex-col shadow-2xl border border-gray-700 max-h-[90vh] min-h-[70vh]">
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">AI Staff Onboarding</h1>
                            <p className="text-gray-400">Let's set up your profile.</p>
                        </div>
                        <div className="text-sm font-medium p-2 rounded-lg bg-gray-700/50">{renderStatus()}</div>
                    </div>
                </div>
                <div className="flex-grow my-4 flex flex-col items-center justify-center relative">
                    <WaveformVisualizer analyserNode={analyserNode} currentUtterance={currentUtterance} />
                     <div className={`absolute top-0 text-sm text-cyan-300 transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                        Speaking...
                    </div>
                </div>
                <div className="flex-shrink-0 mt-2">
                    <div className="mb-4">
                        <label htmlFor="vad-slider-staff" className="block text-sm font-medium text-gray-400">Mic Sensitivity</label>
                        <input
                            id="vad-slider-staff"
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
                    {status === 'CONNECTED' ? 
                        (<button onClick={() => stopSession()} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"><StopCircleIcon className="w-6 h-6" /> End Session</button>) : 
                        (<button onClick={() => startSession()} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors" disabled={status === 'CONNECTING'}><MicrophoneIcon className="w-6 h-6" /> Start Voice Session</button>
                    )}
                </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Staff Profile</h2>
                <div className="space-y-6">
                    <FileUpload 
                        isProcessing={isProcessingFile}
                        onFileChange={handleDocumentChange}
                        title="Auto-fill with your Resume or Bio"
                        description="Upload a .txt, .pdf, or .doc file, and the AI will parse it to fill out the form."
                    />
                    <div className="border-t border-gray-200 pt-6 space-y-6">
                        <FormField label="Full Name" name="name" value={formData.name || ''} onChange={handleFormChange} required />
                        <FormField label="Role" name="role" value={formData.role || ''} onChange={handleFormChange} placeholder="e.g., Photographer, DJ, Makeup Artist" required />
                    </div>
                    <div className="border-t border-gray-200 pt-6 space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Portfolio Details</h3>
                        <FormField label="Portfolio Title" name="portfolioTitle" value={formData.portfolioTitle || ''} onChange={handleFormChange} placeholder="e.g., Wedding Photography Showcase" />
                        <TextAreaField label="Portfolio Description" name="portfolioDescription" value={formData.portfolioDescription || ''} onChange={handleFormChange} placeholder="A brief description of your work and style." />
                         <SelectField label="Portfolio Type" name="portfolioType" value={formData.portfolioType || ''} onChange={handleFormChange as any}>
                            <option>Photography</option>
                            <option>Videography</option>
                            <option>DJ Mixes</option>
                            <option>Makeup Artistry</option>
                            <option>Event Planning</option>
                            <option>Other</option>
                        </SelectField>
                        <PortfolioUploader onFilesChange={handlePortfolioChange} />
                    </div>

                    <div className="border-t border-gray-200 pt-6 space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Service Details</h3>
                        <FormField label="Service Type" name="genericAttributes.service_type" value={formData.genericAttributes?.service_type || ''} onChange={handleFormChange} placeholder="e.g., Candid Photography, Bridal Makeup"/>
                        <TextAreaField label="Pricing Details" name="genericAttributes.pricing_details" value={formData.genericAttributes?.pricing_details || ''} onChange={handleFormChange} placeholder="Describe your pricing structure, e.g., 'Starts at ₹50,000 per day'."/>
                        <TextAreaField label="Food Options (if applicable)" name="genericAttributes.food_options" value={formData.genericAttributes?.food_options || ''} onChange={handleFormChange} placeholder="e.g., 'Vegetarian meals required for staff for full-day events'"/>
                    </div>
                     <div className="mt-8 pt-6 border-t border-gray-200">
                        <button onClick={() => onSubmit(formData)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg">Submit Profile</button>
                    </div>
                </div>
            </div>
        </div>
    );
};