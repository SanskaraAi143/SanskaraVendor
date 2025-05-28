
import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const FeatureCard = ({
  title,
  description,
  icon,
  className,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "glass-card p-6 sm:p-8 flex flex-col items-center text-center",
        className
      )}
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-wedrose-100 text-wedrose-600 mb-6">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-serif font-medium text-wedneutral-800 mb-3">
        {title}
      </h3>
      <p className="text-wedneutral-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
