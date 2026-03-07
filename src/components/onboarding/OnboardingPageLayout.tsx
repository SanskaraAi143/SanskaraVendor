import React from 'react';

interface OnboardingPageLayoutProps {
  children: React.ReactNode;
}

const OnboardingPageLayout: React.FC<OnboardingPageLayoutProps> = ({ children }) => {
  return (
    <div
      id="app-container"
      className="flex flex-col w-full min-h-screen"
    >
      <div className="main-view-wrapper flex flex-col flex-grow relative overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default OnboardingPageLayout;