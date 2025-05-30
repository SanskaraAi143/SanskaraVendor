
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <img 
          src="/lovable-uploads/e0659ecc-af25-430d-a0d0-f80dcf110b33.png" 
          alt="Sanskara AI Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="font-bold text-xl">
        <span className="text-sanskara-red">Sanskara</span>
        <span className="text-sanskara-gold"> AI</span>
      </div>
    </div>
  );
};

export default Logo;
