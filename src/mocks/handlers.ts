import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock for file upload and data extraction
  http.post('/api/vendor_onboarding/upload-and-extract', async () => {
    console.log('MSW intercepted POST /api/vendor_onboarding/upload-and-extract');

    // Simulate a delay
    await new Promise(res => setTimeout(res, 1500));

    // Return a mock JSON response
    return HttpResponse.json({
      venueName: "The Grand Palace (from Document)",
      fullAddress: "456 Extracted Ave, DocuCity, 110011",
      contactPersonName: "Mr. Doc U. Ment",
      directPhoneNumbers: "9988776655",
      emailAddress: "contact@grandpalace-docs.com",
      cateringOptions: "in-house",
      pricing: {
        vegStandard: { min: "1200", max: "1800" },
      }
    });
  }),
];