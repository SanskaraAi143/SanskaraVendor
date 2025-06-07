-- Example SQL commands to manually onboard a vendor as per the onboarding page structure
-- Replace the values with your actual data as needed

-- 1. Insert into vendors table
INSERT INTO vendors (
  supabase_auth_uid, vendor_name, vendor_category, contact_email, phone_number, website_url, address, pricing_range, description, portfolio_image_urls, details
) VALUES (
  'dda3fd46-31aa-4ef1-a32d-4bc0e44065af',
  'Sample Venue Name',
  'Venue',
  'sriramsismarriage@gmail.com',
  '+91 98765 43210',
  'https://venuewebsite.com',
  '{"full_address": "123 Main St, City, State, 123456", "city": "City", "state": "State", "country": "India"}'::jsonb,
  '{"min": 800, "max": 2000, "currency": "INR"}'::jsonb,
  'A beautiful venue for all occasions.',
  '["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]'::jsonb,
  '{
    "wifi": false,
    "rooms": {
        "ac": "",
        "nonAc": "",
        "total": "",
        "amenities": [],
        "extraCharges": "",
        "complimentary": false
    },
    "taxes": {
        "gstApplied": false,
        "otherCharges": "",
        "gstPercentage": ""
    },
    "rental": {
        "charges": {
            "weekday": "",
            "weekend": "",
            "festival": ""
        },
        "duration": [],
        "hourlyRate": "",
        "basicIncludes": [],
        "includedInCatering": false
    },
    "parking": {
        "cars": "",
        "valetCost": "",
        "twoWheelers": "",
        "valetAvailable": false
    },
    "payment": {
        "modes": [],
        "terms": "",
        "advanceBooking": "",
        "cancellationPolicy": ""
    },
    "pricing": {
        "vegDeluxe": {
            "max": "",
            "min": ""
        },
        "vegStandard": {
            "max": "",
            "min": ""
        },
        "weekdayRate": "2000",
        "weekendRate": "5000",
        "nonVegDeluxe": {
            "max": "",
            "min": ""
        },
        "auspiciousRate": "6000",
        "nonVegStandard": {
            "max": "",
            "min": ""
        },
        "basicRentalInclusions": [
            "chairs",
            "tables"
        ],
        "rentalDurationOptions": [
            "full day"
        ],
        "pricePerPlateVegDeluxe": {
            "max": "3001",
            "min": "1001"
        },
        "pricePerPlateVegStandard": {
            "max": "2000",
            "min": "1000"
        },
        "rentalIncludedInCatering": false,
        "pricePerPlateNonVegDeluxe": {
            "max": "4003",
            "min": "3033"
        },
        "basicRentalInclusionsOther": "nothing much",
        "pricePerPlateNonVegStandard": {
            "max": "3002",
            "min": "3000"
        }
    },
    "catering": {
        "options": "In-house Catering Only",
        "menuCustomization": "Yes",
        "cuisineSpecialties": [
            "all allowed"
        ],
        "cuisineSpecialtiesOther": "japanese"
    },
    "amenities": {
        "acRooms": "20",
        "djServices": "In-house",
        "nonAcRooms": "20",
        "totalRooms": "40",
        "parkingCars": "200",
        "soundSystem": "Yes - Included",
        "djCostInHouse": "24000",
        "roomAmenities": [
            "30"
        ],
        "wifiAvailable": true,
        "projectorScreen": "Yes - Included",
        "washroomsNumber": "10",
        "eventStaffNumber": "20",
        "extraRoomCharges": "50",
        "valetParkingCost": "3000",
        "elevatorForGuests": true,
        "parkingTwoWheelers": "400",
        "roomAmenitiesOther": "20",
        "powerBackupCapacity": "20",
        "powerBackupDuration": "30",
        "valetParkingAvailable": true,
        "complimentaryRoomsOffered": true,
        "eventStaffServicesCovered": "all types of cleaning and extra help",
        "wheelchairAccessAvailable": true,
        "washroomsCleanlinessDescription": "you have to take care"
    },
    "washrooms": {
        "number": "",
        "description": ""
    },
    "decoration": {
        "options": "In-house Decorator Only",
        "packages": {
            "themes": "",
            "priceRange": {
                "max": "",
                "min": ""
            }
        },
        "restrictions": "",
        "basicIncluded": false,
        "customization": false,
        "restrictionsOutside": "no restriction",
        "customizationAllowed": false,
        "standardPackagesThemes": "indian, punjabi",
        "standardPackagesPriceRange": {
            "max": "60000",
            "min": "40000"
        }
    },
    "fireRitual": "",
    "venueRules": "booking should be done one month prior",
    "audioVisual": {
        "djCost": "",
        "projector": {
            "included": false,
            "available": false
        },
        "djServices": "",
        "soundSystem": {
            "included": false,
            "available": false
        }
    },
    "mandapSetup": "",
    "powerBackup": {
        "capacity": "",
        "duration": ""
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
        "elevator": false,
        "wheelchairAccess": false
    },
    "aiOperational": {
        "flexibilityLevel": "4",
        "preferredLeadMode": "WhatsApp",
        "idealClientProfile": "middle class",
        "currentBookingSystem": "Google Calendar",
        "aiMenuDecorSuggestions": "Yes",
        "willingToIntegrateSanskara": true
    },
    "aiSuggestions": "",
    "alcoholPolicy": {
        "allowed": true,
        "corkageFee": {
            "amount": "",
            "applicable": false
        },
        "inHouseBar": true,
        "permitRequired": true,
        "corkageFeeAmount": "100",
        "corkageFeeApplicable": "Specify"
    },
    "bookingSystem": "",
    "contactPerson": "",
    "eventStaffing": {
        "services": "",
        "staffCount": ""
    },
    "ritualCultural": {
        "mandapSetupRestrictions": "your wish"
    },
    "sampleMenuUrls": [],
    "uniqueFeatures": "ai taking take of planning process for the users",
    "cateringOptions": "",
    "flexibilityLevel": 3,
    "integrateWithApp": false,
    "contactPersonName": "puneeth",
    "establishmentYear": "2025",
    "menuCustomization": "",
    "preferredLeadMode": "",
    "cuisineSpecialties": [],
    "idealClientProfile": "",
    "pastEventPhotoUrls": [],
    "outsideCaterersDetails": {
        "tieUps": "",
        "royaltyFee": false,
        "kitchenAccess": false
    }
  }'::jsonb
) RETURNING vendor_id;

-- 2. Insert into vendor_staff table (replace vendor_id with the value returned above)
INSERT INTO vendor_staff (
  vendor_id, supabase_auth_uid, email, phone_number, display_name, role
) VALUES (
  1, -- replace with actual vendor_id
  'example-uid-123',
  'owner@email.com',
  '+91 98765 43210',
  'Owner Name',
  'owner'
);

-- 3. Insert into vendor_services table for each hall/space
INSERT INTO vendor_services (
  vendor_id, service_name, service_category, description, base_price, min_capacity, max_capacity, customizability_details
) VALUES
  (1, 'Main Hall', 'Venue Space', 'Banquet Hall with 2000 sq ft area. Pillar-less, Large windows', NULL, 100, 300, '{"type": "banquet-hall", "area": "2000 sq ft", "airConditioning": "centralized-ac", "stage": {"available": true, "dimensions": "20ft x 15ft"}, "danceFloor": {"available": true, "size": "400 sq ft"}, "seatingCapacity": {"theatre": "300", "roundTable": "200", "floating": "350"}, "diningArrangement": {"separateDining": true, "diningCapacity": "100"}}'::jsonb),
  (1, 'Lawn 1', 'Venue Space', 'Open Lawn with 5000 sq ft area. Garden-facing', NULL, 150, 500, '{"type": "open-lawn", "area": "5000 sq ft", "airConditioning": "no-ac", "stage": {"available": false, "dimensions": ""}, "danceFloor": {"available": false, "size": ""}, "seatingCapacity": {"theatre": "500", "roundTable": "300", "floating": "600"}, "diningArrangement": {"separateDining": false, "diningCapacity": ""}}'::jsonb);

-- 4. Insert catering service if in-house catering is offered
INSERT INTO vendor_services (
  vendor_id, service_name, service_category, description, base_price, customizability_details
) VALUES (
  1, 'In-house Catering', 'Catering', 'Specialties: North Indian, South Indian', 800, '{"cuisines": ["North Indian", "South Indian"], "pricing": {"vegStandard": {"min": "800", "max": "1200"}}, "customization": "Yes"}'::jsonb
);

-- Add more INSERTs as needed for other services or details.
