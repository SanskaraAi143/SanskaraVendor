import React, { useEffect, useState } from 'react';

interface ErrorBannerProps {
    message: string;
    onHide: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onHide }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (message) {
            setIsVisible(true);
            timer = setTimeout(() => {
                setIsVisible(false);
                // Allow time for CSS transition before clearing the message
                setTimeout(onHide, 500); 
            }, 3000);
        } else {
            setIsVisible(false);
        }
        return () => clearTimeout(timer);
    }, [message, onHide]);
    
    return (
        <div className={`absolute left-1/2 -translate-x-1/2 bg-[#ff3b30] text-white py-3 px-6 rounded-lg shadow-lg z-50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] text-sm ${isVisible ? 'top-16' : '-top-24'}`}>
            {message}
        </div>
    );
};