import React from 'react';

interface LoadingOverlayProps {
    show: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show }) => {
    if (!show) return null;

    return (
        <div className="absolute inset-0 z-50 flex justify-center items-center bg-white/80 backdrop-blur-sm transition-opacity">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#8B0000] rounded-full spinner"></div>
        </div>
    );
};