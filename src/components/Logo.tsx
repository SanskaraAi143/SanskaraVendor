
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-sanskara-red rounded-full opacity-80"></div>
        <div className="absolute inset-1 bg-sanskara-gold rounded-full"></div>
        <div className="absolute inset-3 bg-sanskara-cream rounded-full flex items-center justify-center">
          <span className="text-sanskara-maroon text-xs font-bold">S</span>
        </div>
      </div>
      <div className="font-bold text-xl">
        <span className="text-sanskara-red">Sanskara</span>
        <span className="text-sanskara-gold">Staff</span>
      </div>
    </div>
  );
};

export default Logo;
