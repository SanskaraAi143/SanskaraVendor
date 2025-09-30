import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Phone, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AudioCallManager from './AudioCallManager';

const AutofillVendorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { isUploading, uploadError, uploadFile } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const { vendorProfile, updateVendor } = useAuth();

  const handleManualOnboarding = () => {
    navigate('/manual-vendor-onboarding');
  };


  const handleFileCardClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const publicUrl = await uploadFile(file, 'vendors', 'biodata');

    if (publicUrl) {
      toast({
        title: 'Upload successful',
        description: 'Your biodata has been uploaded.',
      });
      // TODO: Handle the returned publicUrl, e.g., save it to state or database
    } else if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sanskara-red mb-2">Profile Autofill</h1>
          <p className="text-gray-600">
            Skip the long forms — Just upload or talk, and build your profile in no time.
          </p>
        </div>

        <Card className="shadow-lg p-6 space-y-6">
          <Card
            className="p-6 text-center cursor-pointer hover:bg-gray-50"
            onClick={handleFileCardClick}
          >
            <div className="flex flex-col items-center">
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-sanskara-red mb-4 animate-spin" />
              ) : (
                <FileUp className="w-12 h-12 text-sanskara-red mb-4" />
              )}
              <h2 className="text-lg font-semibold">
                {isUploading ? 'Uploading...' : 'Tap to upload biodata'}
              </h2>
              <p className="text-sm text-gray-500">Upload a PDF or image file up to 5MB in size</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={isUploading}
              />
            </div>
          </Card>

          <Dialog open={isAudioModalOpen} onOpenChange={setIsAudioModalOpen}>
            <DialogTrigger asChild>
              <Card className="p-6 text-center cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="mb-4">
                        <span className="text-4xl">✨</span>
                    </div>
                  <h2 className="text-lg font-semibold">Get AI call</h2>
                  <p className="text-sm text-gray-500 mb-4">Let AI Build Your Profile - Fast & Easy</p>
                  <Button>
                    <Phone className="w-4 h-4 mr-2" />
                    Get AI call
                  </Button>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Onboarding Call</DialogTitle>
                <DialogDescription>
                  Our AI assistant will call you to complete your profile.
                </DialogDescription>
              </DialogHeader>
              <AudioCallManager />
            </DialogContent>
          </Dialog>

          <Button variant="link" className="w-full" onClick={handleManualOnboarding}>
            Skip & Fill Manually
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AutofillVendorOnboarding;