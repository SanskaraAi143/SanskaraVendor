
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <img 
          src="/sanskara-logo.jpg" 
          alt="Sanskara AI Logo" 
          className="w-full h-full object-contain rounded-lg"
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
