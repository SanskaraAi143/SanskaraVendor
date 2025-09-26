import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteContainerProps {
  children: React.ReactNode;
}

const RouteContainer: React.FC<RouteContainerProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div key={location.pathname}>
      {children}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(RouteContainer);
