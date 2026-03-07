import * as React from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

interface WelcomeStepProps {
  onCompletion: (data?: any) => void;
  onError: (title: string, description: string) => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onCompletion, onError }) => {
  return (
    <div className="w-full p-8 text-center">
      <h2 className="text-xl font-medium mb-4 text-[#4A4A4A]">Welcome to SanskaraAI</h2>
      <p className="mb-8 text-[#6c757d]">Your personal guide for reflection and connection. Tap the large button to speak, or swipe up to chat.</p>
      <Button onClick={() => onCompletion()} className="w-full py-3 px-4 rounded-full border-none cursor-pointer font-medium text-base transition-colors bg-[#8B0000] text-white hover:bg-[#a50000]">
        Begin Journey
      </Button>
    </div>
  );
};

export default WelcomeStep;