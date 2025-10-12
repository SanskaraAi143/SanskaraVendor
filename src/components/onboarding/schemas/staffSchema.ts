import { FunctionDeclaration, Type } from "@google/genai";

export const staffFormSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The full name of the staff member." },
        role: { type: Type.STRING, description: "The professional role of the staff member, e.g., Photographer, DJ, Makeup Artist." },
        portfolioTitle: { type: Type.STRING, description: "A title for their portfolio." },
        portfolioDescription: { type: Type.STRING, description: "A brief description of their work, style, and experience." },
        portfolioType: { type: Type.STRING, description: "The type of portfolio, e.g., Photography, Videography." },
        genericAttributes: {
            type: Type.OBJECT,
            properties: {
                food_options: { type: Type.STRING, description: "Any specific food requirements or options for the staff." },
                pricing_details: { type: Type.STRING, description: "Details about their pricing structure or packages." },
                service_type: { type: Type.STRING, description: "Specific services offered, e.g., Candid Photography, Bridal Makeup." },
            }
        },
    },
};

export const updateStaffFormDeclaration: FunctionDeclaration = {
    name: 'update_staff_form',
    description: 'Updates one or more fields in the staff onboarding form.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The full name of the staff member." },
            role: { type: Type.STRING, description: "The professional role of the staff member." },
            portfolioTitle: { type: Type.STRING, description: "The title for their portfolio." },
            portfolioDescription: { type: Type.STRING, description: "A description of their work." },
        },
    },
};