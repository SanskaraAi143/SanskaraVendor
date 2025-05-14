
import React from 'react';
import ServiceForm from '@/components/service/ServiceForm';

const AddService: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Add New Service</h1>
        <p className="text-muted-foreground mt-1">
          Create a new service offering for your customers
        </p>
      </div>
      
      <ServiceForm />
    </div>
  );
};

export default AddService;
