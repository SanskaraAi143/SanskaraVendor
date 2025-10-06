import { VendorOnboardingForm } from '../types';

export const downloadHtml = (formData: VendorOnboardingForm, venueImage: string | null) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${formData.venueName || 'Venue'} - Onboarding Form</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .section h3 { margin-top: 0; color: #333; }
            .field { margin-bottom: 10px; }
            .field label { font-weight: bold; display: inline-block; width: 200px; }
            .field span { display: inline-block; margin-left: 10px; }
            .venue-image { max-width: 300px; margin: 20px auto; display: block; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${formData.venueName || 'Venue Onboarding Form'}</h1>
            ${venueImage ? `<img src="${venueImage}" alt="Venue" class="venue-image">` : ''}
        </div>

        <div class="section">
            <h3>Basic Information</h3>
            <div class="field"><label>Venue Name:</label> <span>${formData.venueName || 'N/A'}</span></div>
            <div class="field"><label>Contact Person:</label> <span>${formData.contactPersonName || 'N/A'}</span></div>
            <div class="field"><label>Phone:</label> <span>${formData.directPhoneNumbers || 'N/A'}</span></div>
            <div class="field"><label>Email:</label> <span>${formData.emailAddress || 'N/A'}</span></div>
            <div class="field"><label>Years in Operation:</label> <span>${formData.yearsInOperation || 'N/A'}</span></div>
            <div class="field"><label>Address:</label> <span>${formData.fullAddress || 'N/A'}</span></div>
            <div class="field"><label>Website:</label> <span>${formData.websiteLinks || 'N/A'}</span></div>
        </div>

        <div class="section">
            <h3>Venue Details</h3>
            ${formData.halls?.map((hall, index) => `
                <div class="field"><label>Hall ${index + 1}:</label> <span>${hall.name || 'N/A'} (${hall.type || 'N/A'})</span></div>
                <div class="field"><label>Area:</label> <span>${hall.area_sq_ft || 'N/A'} sq ft</span></div>
                <div class="field"><label>Seating:</label> <span>Theatre: ${hall.seatingCapacity?.theatre || 'N/A'}, Round Table: ${hall.seatingCapacity?.roundTable || 'N/A'}, Floating: ${hall.seatingCapacity?.floating || 'N/A'}</span></div>
                <div class="field"><label>Ambience:</label> <span>${hall.ambience || 'N/A'}</span></div>
            `).join('') || '<div class="field">No hall details provided</div>'}
        </div>

        <div class="section">
            <h3>Pricing & Catering</h3>
            <div class="field"><label>Rental Charges:</label> <span>Weekday: ₹${formData.rentalCharges?.weekday || 'N/A'}, Weekend: ₹${formData.rentalCharges?.weekend || 'N/A'}, Festival: ₹${formData.rentalCharges?.festival || 'N/A'}</span></div>
            <div class="field"><label>Catering Options:</label> <span>${formData.cateringOptions || 'N/A'}</span></div>
            <div class="field"><label>Cuisine Specialties:</label> <span>${formData.cuisineSpecialties?.join(', ') || 'N/A'}</span></div>
        </div>

        <div class="section">
            <h3>Amenities</h3>
            <div class="field"><label>Parking:</label> <span>Cars: ${formData.parking?.cars || 'N/A'}, Two-wheelers: ${formData.parking?.twoWheelers || 'N/A'}</span></div>
            <div class="field"><label>Sound System:</label> <span>${formData.audioVisual?.has_sound_system ? 'Available' : 'Not Available'}</span></div>
            <div class="field"><label>Projector:</label> <span>${formData.audioVisual?.has_projector ? 'Available' : 'Not Available'}</span></div>
        </div>

        <div class="section">
            <h3>Policies</h3>
            <div class="field"><label>Advance Booking:</label> <span>${formData.advanceBooking || 'N/A'}</span></div>
            <div class="field"><label>Payment Terms:</label> <span>${formData.paymentTerms || 'N/A'}</span></div>
            <div class="field"><label>Cancellation Policy:</label> <span>${formData.cancellationPolicy || 'N/A'}</span></div>
        </div>

        <div class="section">
            <h3>Additional Information</h3>
            <div class="field"><label>Unique Features:</label> <span>${formData.uniqueFeatures || 'N/A'}</span></div>
            <div class="field"><label>Ideal Client Profile:</label> <span>${formData.idealClientProfile || 'N/A'}</span></div>
            <div class="field"><label>Venue Rules:</label> <span>${formData.venueRules || 'N/A'}</span></div>
        </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formData.venueName || 'venue'}_onboarding.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
