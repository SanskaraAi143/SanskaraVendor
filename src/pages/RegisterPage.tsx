
import React from 'react';
import { Navigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  // For now, redirect to vendor onboarding
  // This can be expanded later to handle different types of registration
  return <Navigate to="/vendor-onboarding" replace />;
};

export default RegisterPage;
