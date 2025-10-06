import { Type } from "@google/genai";

export const updateVendorFormDeclaration = {
  name: 'update_form',
  description: 'Update the vendor onboarding form with the provided field values',
  parameters: {
    type: Type.OBJECT,
    properties: {
      venueName: { type: Type.STRING },
      fullAddress: { type: Type.STRING },
      contactPersonName: { type: Type.STRING },
      directPhoneNumbers: { type: Type.STRING },
      emailAddress: { type: Type.STRING },
      websiteLinks: { type: Type.STRING },
      yearsInOperation: { type: Type.STRING },
    },
    required: [],
  },
};

export const fullVendorFormSchema = {
  type: 'object',
  properties: {
    venueName: { type: 'string' },
    fullAddress: { type: 'string' },
    contactPersonName: { type: 'string' },
    directPhoneNumbers: { type: 'string' },
    emailAddress: { type: 'string' },
    websiteLinks: { type: 'string' },
    yearsInOperation: { type: 'string' },
    halls: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          area_sq_ft: { type: 'string' },
          airConditioning: { type: 'string' },
          seatingCapacity: {
            type: 'object',
            properties: {
              theatre: { type: 'string' },
              roundTable: { type: 'string' },
              floating: { type: 'string' },
            },
          },
          ambience: { type: 'string' },
        },
      },
    },
    rentalCharges: {
      type: 'object',
      properties: {
        weekday: { type: 'string' },
        weekend: { type: 'string' },
        festival: { type: 'string' },
      },
    },
    cateringOptions: { type: 'string' },
    cuisineSpecialties: { type: 'array', items: { type: 'string' } },
    parking: {
      type: 'object',
      properties: {
        cars: { type: 'string' },
        twoWheelers: { type: 'string' },
      },
    },
    audioVisual: {
      type: 'object',
      properties: {
        has_sound_system: { type: 'boolean' },
        has_projector: { type: 'boolean' },
      },
    },
    advanceBooking: { type: 'string' },
    paymentTerms: { type: 'string' },
    cancellationPolicy: { type: 'string' },
    uniqueFeatures: { type: 'string' },
    idealClientProfile: { type: 'string' },
    venueRules: { type: 'string' },
  },
};
