
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-sanskara-gold/20 border-t-sanskara-gold animate-spin-slow"></div>
        </div>
      </div>
      <div className="ml-4">
        <h2 className="text-xl font-bold gradient-text">Loading SanskaraVendors</h2>
        <p className="text-sanskara-maroon/70">Please wait...</p>
      </div>
    </div>
  );
};

export default Loader;
