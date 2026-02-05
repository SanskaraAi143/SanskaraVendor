import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { VendorOnboardingForm } from './types';
import { useLiveSession } from './hooks/useLiveSession';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { updateVendorFormDeclaration, fullVendorFormSchema } from './schemas/vendorSchema';
import { downloadHtml } from './lib/downloadUtils';
import { uploadFile } from '@/utils/upload';
import { Step1BasicInfo } from './steps/Step1BasicInfo.tsx';
import { Step2VenueDetails } from './steps/Step2VenueDetails.tsx';
import { Step3PricingCatering } from './steps/Step3PricingCatering.tsx';
import { Step4Amenities } from './steps/Step4Amenities.tsx';
import { Step5Policies } from './steps/Step5Policies.tsx';
import { Step6Operational } from './steps/Step6Operational.tsx';
import { ArrowLeftIcon } from './Icons';

const initialFormData: VendorOnboardingForm = {
    venueName: '', fullAddress: '', contactPersonName: '', directPhoneNumbers: '', emailAddress: '', websiteLinks: '', yearsInOperation: '',
    halls: [{ id: uuidv4() }], is_rental_included_in_catering: false, rentalCharges: {}, rentalDuration: [], hourlyRate: '', basicRentalIncludes: [],
    cateringOptions: '', outsideCaterersDetails: {}, pricing: {}, cuisineSpecialties: [], menuCustomization: '',
    is_alcohol_allowed: false, has_in_house_bar: false, is_permit_required: false, corkageFee: {},
    decorationOptions: '', outsideDecoratorRestrictions: '', is_basic_decor_included: false, basicDecorDetails: '', decorPackages: {}, is_decor_customization: false, popularThemes: '',
    is_gst_applied: false, gstPercentage: '', otherCharges: '', advanceBooking: '', paymentTerms: '', cancellationPolicy: '', paymentModes: [],
    parking: {}, rooms: {}, powerBackup: {}, audioVisual: {}, washrooms: {}, accessibility: {}, eventStaffing: {}, is_wifi_available: false,
    fireRitual: '', mandapSetup: '', bookingSystem: '', is_integrate_with_app: false, uniqueFeatures: '', idealClientProfile: '',
    flexibilityLevel: '', aiSuggestions: '', preferredLeadMode: '', venueRules: '',
};

const systemInstruction = `You are a friendly AI agent helping a user fill out a venue onboarding form. Your goal is to ask for the basic information one by one, waiting for the user's response before proceeding. Ask for Venue Name, Contact Person, Phone Number, Email, Years in Operation, and Full Address. Use the 'update_form' tool to populate the corresponding field after each question is answered. After getting these details, say 'Thank you! Please review the information and click Next.'`;

interface VendorOnboardingProps {
    onBack: () => void;
    onComplete?: (data: any) => void;
    onError?: (title: string, description: string) => void;
}

export const VendorOnboarding: React.FC<VendorOnboardingProps> = ({ onBack, onComplete, onError }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<VendorOnboardingForm>(initialFormData);
    const [venueImage, setVenueImage] = useState<string | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [vadThreshold, setVadThreshold] = useState(0.01);
    const [isSkipping, setIsSkipping] = useState(false);
    const { user, refreshVendorProfile, refreshUserType } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const updateFormFromAI = useCallback((args: Partial<VendorOnboardingForm>) => {
        const deepMerge = (target: any, source: any): any => {
            const output = { ...target };
            if (target && typeof target === 'object' && source && typeof source === 'object') {
                Object.keys(source).forEach(key => {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        if (!(key in target)) Object.assign(output, { [key]: source[key] });
                        else output[key] = deepMerge(target[key], source[key]);
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }
            return output;
        };
        setFormData(prev => deepMerge(JSON.parse(JSON.stringify(prev)), args));
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
        functionDeclarations: [updateVendorFormDeclaration],
        onFunctionCall: (name: string, args: any) => {
            if (name === 'update_form') {
                updateFormFromAI(args as Partial<VendorOnboardingForm>);
            }
        },
        vadThreshold,
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const keys = name.split('.');

        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                const nextKey = keys[i + 1];
                const isArrayIndex = !isNaN(parseInt(nextKey, 10));
                if (!current[key]) {
                    current[key] = isArrayIndex ? [] : {};
                }
                current = current[key];
            }
            const finalKey = keys[keys.length - 1];
            if (type === 'checkbox') {
                const target = (e.target as HTMLInputElement);
                if (target.dataset.group) {
                    const groupKey = target.dataset.group;
                    const groupKeys = groupKey.split('.');
                    let groupCurrent = newState;
                    for (let i = 0; i < groupKeys.length - 1; i++) { groupCurrent = groupCurrent[groupKeys[i]]; }
                    const array = groupCurrent[groupKeys[groupKeys.length - 1]] || [];
                    if (checked) {
                        if (!array.includes(value)) array.push(value);
                    } else {
                        const index = array.indexOf(value);
                        if (index > -1) array.splice(index, 1);
                    }
                    groupCurrent[groupKeys[groupKeys.length - 1]] = array;

                } else {
                    current[finalKey] = checked;
                }
            } else {
                current[finalKey] = value;
            }
            return newState;
        });
    };

    const handleAddHall = () => {
        setFormData(prev => ({ ...prev, halls: [...(prev.halls || []), { id: uuidv4() }] }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        try {
            const url = await uploadFile(file, 'venue-images');
            setFormData(prev => ({ ...prev, imageUrls: [...(prev.imageUrls || []), url] }));
        } catch (error) {
            console.error("Error uploading image:", error);
            if (onError) {
                onError("Image Upload Failed", "There was an error uploading your image. Please try again.");
            }
        }
    };

    const processFilesWithAI = async (files: { content: string; mimeType: string }[]) => {
        if (!import.meta.env.VITE_GOOGLE_API_KEY) {
            alert("VITE_GOOGLE_API_KEY environment variable not set.");
            return;
        }
        setIsProcessingFile(true);
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY as string });
            const textPrompt = `Extract the vendor's information from the provided document(s)/image(s) and format it according to the provided JSON schema. Consolidate information from all files.`;
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
                config: { responseMimeType: "application/json", responseSchema: fullVendorFormSchema }
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

    const handleSubmit = useCallback(async () => {
        try {
            if (!user) {
                if (onError) onError("Authentication Error", "User not authenticated.");
                return;
            }

            // Prepare vendor data for update
            const vendorUpdateData = {
                vendor_name: formData.venueName || '',
                contact_email: formData.emailAddress || user?.email || '',
                phone_number: formData.directPhoneNumbers || '',
                website_url: formData.websiteLinks || null,
                address: { full_address: formData.fullAddress },
                details: formData,
                portfolio_image_urls: formData.imageUrls || [],
                status: 'onboarding_complete', // Mark onboarding as complete
                updated_at: new Date().toISOString()
            };

            // Update or create the vendor record in Firestore
            const vendorRef = doc(db, 'vendors', user.uid);
            await setDoc(vendorRef, vendorUpdateData, { merge: true });

            // Fetch current vendor data to get vendor_id (which might be the doc ID or a field)
            const vendorSnap = await getDoc(vendorRef);
            const vendorData = vendorSnap.data();
            const vendorId = vendorData?.vendor_id || user.uid;

            // Check if vendor_staff record exists and update or insert
            const staffRef = doc(db, 'vendor_staff', user.uid);
            const staffSnap = await getDoc(staffRef);

            const staffData = {
                vendor_id: vendorId,
                firebase_uid: user.uid,
                email: formData.emailAddress || user?.email || '',
                phone_number: formData.directPhoneNumbers || '',
                display_name: formData.contactPersonName || '',
                role: 'owner',
                updated_at: new Date().toISOString()
            };

            if (staffSnap.exists()) {
                await updateDoc(staffRef, staffData);
            } else {
                await setDoc(staffRef, {
                    ...staffData,
                    created_at: new Date().toISOString()
                });
            }

            if (onComplete) {
                onComplete({ vendorId: vendorId });
            }

            // Force update user_type in users collection to ensure ProtectedRoute works
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { user_type: 'vendor' }, { merge: true });

            // Refresh the vendor profile in AuthContext
            await refreshVendorProfile();
            await refreshUserType();
            setStep(8);
        } catch (error: any) {
            console.error("Submission Error:", error);
            if (onError) {
                onError("Submission Error", error.message || "Failed to submit form.");
            }
        }
    }, [user, formData, onError, onComplete, refreshVendorProfile, refreshUserType]);

    const handleNext = useCallback(async () => {
        if (step < 6) {
            setStep(s => s + 1);
        } else {
            setStep(7);
            await handleSubmit();
        }
    }, [step, handleSubmit]);
    
    // Auto-redirect after completion
    useEffect(() => {
        if (step === 8) {
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, navigate]);

    const handleSkip = useCallback(async () => {
        if (!user) return;
        try {
            setIsSkipping(true);
            
            // Force update user_type in users collection to ensure ProtectedRoute works
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { user_type: 'vendor' }, { merge: true });

            const vendorRef = doc(db, 'vendors', user.uid);
            await setDoc(vendorRef, {
                status: 'onboarding_complete',
                updated_at: new Date().toISOString()
            }, { merge: true });

            await refreshVendorProfile();
            await refreshUserType();

            toast({
              title: "Onboarding Skipped",
              description: "You can complete your profile later.",
            });

            if (onComplete) {
                onComplete({});
            } else {
              // Direct navigation fallback if no onComplete handler
              console.log("Navigating to dashboard after skip");
              navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Error skipping onboarding:', error);
            if (onError) {
                onError("Skip Error", error.message || "Failed to skip onboarding.");
            }
            setIsSkipping(false);
        }
    }, [user, refreshVendorProfile, onComplete, onError, navigate]);

    const renderStepContent = () => {
        const props = {
            formData,
            handleFormChange,
            setFormData: setFormData as any,
            setStep,
            handleImageChange,
            renderStatus,
            stopSession,
            startSession,
            status,
            analyserNode,
            currentUtterance,
            isSpeaking,
            vadThreshold,
            setVadThreshold,
            handleAddHall,
            isProcessingFile,
            handleDocumentChange,
            handleNext
        };

        switch (step) {
            case 1: return <Step1BasicInfo {...props} />;
            case 2: return <Step2VenueDetails {...props} />;
            case 3: return <Step3PricingCatering {...props} />;
            case 4: return <Step4Amenities {...props} />;
            case 5: return <Step5Policies {...props} />;
            case 6: return <Step6Operational {...props} />;
            case 7: return <div className="text-center py-8"><h2 className="text-2xl font-bold mb-4">Submitting...</h2><p>Please wait while we process your information.</p></div>;
            case 8: return <div className="text-center py-8"><h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2><p>Your venue has been successfully registered with Sanskara. You will be redirected shortly.</p></div>;
            default: return null;
        }
    };

    const renderAppBody = () => {
        return (
            <div className="w-full max-w-7xl mx-auto">
                {renderStepContent()}
            </div>
        );
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Role Selection
                </button>
                <button
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm"
                >
                    {isSkipping && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Skip Onboarding for now
                </button>
            </div>
            {renderAppBody()}
        </div>
    );
};
