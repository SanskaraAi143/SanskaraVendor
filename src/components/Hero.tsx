
import React from "react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaAction?: () => void;
  image?: string;
  overlay?: boolean;
}

const Hero = ({
  title,
  subtitle,
  ctaText,
  ctaAction,
  image = "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  overlay = true,
}: HeroProps) => {
  return (
    <div className="relative min-h-[90vh] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      
      {overlay && (
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-wedneutral-900 leading-tight mb-6 animate-slide-down">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-wedneutral-700 mb-8 max-w-2xl mx-auto animate-slide-up animate-delay-200">
            {subtitle}
          </p>
          {ctaText && (
            <Button
              onClick={ctaAction}
              className="btn-primary text-base animate-fade-in animate-delay-400"
            >
              {ctaText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
