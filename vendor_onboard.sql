-- Example SQL commands to manually onboard a vendor as per the onboarding page structure
-- Replace the values with your actual data as needed

-- 1. Insert into vendors table
-- This SQL command inserts data into the 'vendors' table.
INSERT INTO vendors (
  supabase_auth_uid, vendor_name, vendor_category, contact_email, phone_number, website_url, address, pricing_range, description, portfolio_image_urls, details
) VALUES (
  'b6af969b-d4d1-47bb-a70c-832279bf9c19',
  'Sample Venue Name',
  'Venue',
  'sriramsismarriage@gmail.com',
  '+91 98765 43210',
  'https://venuewebsite.com',
  '{"full_address": "123 Main St, City, State, 123456", "city": "City", "state": "State", "country": "India"}'::jsonb,
  '{"min": 800, "max": 2000, "currency": "INR"}'::jsonb,
  'A beautiful venue for all occasions.',
  '{"image1":"https://example.com/photo1.jpg", "image2":"https://example.com/photo2.jpg"}'::jsonb,
  '{
    "wifi": false,
    "rooms": {
      "ac": yes,
      "nonAc": 10,
      "total": 20,
      "amenities": [],
      "extraCharges": 0,
      "complimentary": false
    },
    "taxes": {
      "gstApplied": false,
      "otherCharges": null,
      "gstPercentage": null
    },
    "rental": {
      "charges": {
        "weekday": null,
        "weekend": 1000,
        "festival": 3000
      },
      "duration": ["full day"],
      "hourlyRate": 20,
      "basicIncludes": [],
      "includedInCatering": false
    },
    "parking": {
      "cars": null,
      "valetCost": null,
      "twoWheelers": 0,
      "valetAvailable": true
    },
    "payment": {
      "modes": [],
      "terms": null,
      "advanceBooking": null,
      "cancellationPolicy": null
    },
    "pricing": {
      "vegDeluxe": {
        "max": null,
        "min": 0
      },
      "vegStandard": {
        "max": null,
        "min": 0
      },
      "weekdayRate": 2000,
      "weekendRate": 5000,
      "nonVegDeluxe": {
        "max": null,
        "min": 0
      },
      "auspiciousRate": 6000,
      "nonVegStandard": {
        "max": null,
        "min": null
      },
      "basicRentalInclusions": [
        "chairs"
      ],
      "rentalDurationOptions": [
        "half day",
        "full day"
      ],
      "pricePerPlateVegDeluxe": {
        "max": 3001,
        "min": 1001
      },
      "pricePerPlateVegStandard": {
        "max": 2000,
        "min": 1000
      },
      "rentalIncludedInCatering": false,
      "pricePerPlateNonVegDeluxe": {
        "max": 4003,
        "min": 3033
      },
      "basicRentalInclusionsOther": null,
      "pricePerPlateNonVegStandard": {
        "max": 3002,
        "min": 3000
      }
    },
    "catering": {
      "options": "In-house Catering Only",
      "menuCustomization": "Yes",
      "cuisineSpecialties": [
        "North Indian"
      ],
      "cuisineSpecialtiesOther": "japanese"
    },
    "amenities": {
      "acRooms": "20",
      "djServices": "In-house",
      "nonAcRooms": "20",
      "totalRooms": "40",
      "parkingCars": 0,
      "soundSystem": "Yes - Included",
      "djCostInHouse": 0,
      "roomAmenities": [
        "30"
      ],
      "wifiAvailable": true,
      "projectorScreen": "Yes - Included",
      "washroomsNumber": 0,
      "eventStaffNumber": "20",
      "extraRoomCharges": 50,
      "valetParkingCost": 3000,
      "elevatorForGuests": true,
      "parkingTwoWheelers": 400,
      "valetParkingAvailable": true,
      "complimentaryRoomsOffered": false,
      "eventStaffServicesCovered": "all types of cleaning and extra help",
      "wheelchairAccessAvailable": true,
      "washroomsCleanlinessDescription": "you have to take care"
    },
    "washrooms": {
      "number": null,
      "description": null
    },
    "decoration": {
      "options": "In-house Decorator Only",
      "packages": {
        "themes": "indian",
        "priceRange": {
          "max": null,
          "min": 0
        }
      },
      "restrictions": null,
      "basicIncluded": false,
      "customization": false,
      "restrictionsOutside": "no restriction",
      "customizationAllowed": false,
      "standardPackagesThemes": "indian",
      "standardPackagesPriceRange": {
        "max": 60000,
        "min": 40000
      }
    },
    "fireRitual": null,
    "venueRules": "booking should be done one month prior",
    "audioVisual": {
      "djCost": null,
      "projector": {
        "included": false,
        "available": false
      },
      "djServices": null,
      "soundSystem": {
        "included": false,
        "available": false
      }
    },
    "mandapSetup": "Allowed",
    "powerBackup": {
      "capacity": 0,
      "duration": 0
    },
    "taxesPayment": {
      "gstApplied": true,
      "otherCharges": "na",
      "paymentTerms": "advance amount of 5000 ",
      "gstPercentage": "19",
      "cancellationPolicy": "no refund of advance payment",
      "acceptedPaymentModes": [
        "upi",
        "netbanking"
      ],
      "advanceBookingAmount": "na"
    },
    "accessibility": {
      "elevator": true,
      "wheelchairAccess": true
    },
    "aiOperational": {
      "flexibilityLevel": "4",
      "preferredLeadMode": "WhatsApp",
      "idealClientProfile": "middle class",
      "currentBookingSystem": "Google Calendar",
      "aiMenuDecorSuggestions": "Yes",
      "willingToIntegrateSanskara": true
    },
    "aiSuggestions": null,
    "alcoholPolicy": {
      "allowed": true,
      "corkageFee": {
        "amount": 0,
        "applicable": false
      },
      "inHouseBar": true,
      "permitRequired": true,
      "corkageFeeAmount": "100",
      "corkageFeeApplicable": "Specify"
    },
    "bookingSystem": null,
    "contactPerson": "puneeth",
    "eventStaffing": {
      "services": null,
      "staffCount": 0
    },
    "ritualCultural": {
      "mandapSetupRestrictions": "your wish"
    },
    "sampleMenuUrls": [],
    "uniqueFeatures": "ai taking take of planning process for the users",
    "cateringOptions": null,
    "flexibilityLevel": 0,
    "integrateWithApp": false,
    "contactPersonName": "puneeth",
    "establishmentYear": "0",
    "menuCustomization": null,
    "preferredLeadMode": null,
    "cuisineSpecialties": [],
    "idealClientProfile": null,
    "pastEventPhotoUrls": [],
    "outsideCaterersDetails": {
      "tieUps": null,
      "royaltyFee": false,
      "kitchenAccess": false
    }
  }'::jsonb
) RETURNING vendor_id;

-- 2. Insert into vendor_staff table
-- This SQL command inserts data into the 'vendor_staff' table.
INSERT INTO vendor_staff (
  vendor_id, supabase_auth_uid, email, phone_number, display_name, role
) VALUES (
  1, -- replace with actual vendor_id
  '8f4957a7-3f32-45e2-b8e8-a25217d0d666',
  'kpuneeth714@gmail.com',
  '+91 98765 43210',
  'Owner Puneeth',
  'owner'
);

-- 3. Insert into vendor_services table for each hall/space
-- These SQL commands insert data into the 'vendor_services' table for each hall/space.
INSERT INTO vendor_services (
  vendor_id, service_name, service_category, description, base_price, min_capacity, max_capacity, customizability_details
) VALUES
  (1, 'Main Hall', 'Venue Space', 'Banquet Hall with 2000 sq ft area. Pillar-less, Large windows', NULL, 100, 300, '{"type": "banquet-hall", "area": "2000 sq ft", "airConditioning": "centralized-ac", "stage": {"available": true, "dimensions": "20ft x 15ft"}, "danceFloor": {"available": true, "size": "400 sq ft"}, "seatingCapacity": {"theatre": "300", "roundTable": "200", "floating": "350"}, "diningArrangement": {"separateDining": true, "diningCapacity": "100"}}'::jsonb),
  (1, 'Lawn 1', 'Venue Space', 'Open Lawn with 5000 sq ft area. Garden-facing', NULL, 150, 500, '{"type": "open-lawn", "area": "5000 sq ft", "airConditioning": "no-ac", "stage": {"available": false, "dimensions": ""}, "danceFloor": {"available": false, "size": ""}, "seatingCapacity": {"theatre": "500", "roundTable": "300", "floating": "600"}, "diningArrangement": {"separateDining": false, "diningCapacity": ""}}'::jsonb);

-- 4. Insert catering service if in-house catering is offered
-- This SQL command inserts data into the 'vendor_services' table for catering service if in-house catering is offered.
INSERT INTO vendor_services (
  vendor_id, service_name, service_category, description, base_price, customizability_details
) VALUES (
  1, 'In-house Catering', 'Catering', 'Specialties: North Indian, South Indian', 800, '{"cuisines": ["North Indian", "South Indian"], "pricing": {"vegStandard": {"min": "800", "max": "1200"}}, "customization": "Yes"}'::jsonb
);

-- Add more INSERTs as needed for other services or details.

