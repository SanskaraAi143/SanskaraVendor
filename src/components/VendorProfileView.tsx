import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MapPin, Building, Star, Phone, Mail, Globe } from 'lucide-react';

// This will be a detailed type definition based on what I've seen in `Profile.tsx`
// For now, a simple interface will suffice.
interface VendorProfile {
  vendor_name: string;
  vendor_category: string;
  rating?: number;
  description?: string;
  address?: {
    full_address?: string;
    city?: string;
    state?: string;
  };
  portfolio_image_urls?: string[];
  services?: any[]; // Simplified for now
  details?: any; // Simplified for now
  contact_email?: string;
  phone_number?: string;
  website_url?: string;
}

interface VendorProfileViewProps {
  profile: VendorProfile;
}

const VendorProfileView: React.FC<VendorProfileViewProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{profile.vendor_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Building className="h-4 w-4" /> {profile.vendor_category}
              </CardDescription>
            </div>
            {profile.rating && (
              <div className="flex items-center gap-1 text-xl font-bold text-amber-500">
                <Star className="h-6 w-6" /> {profile.rating.toFixed(1)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{profile.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {profile.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 hover:text-sanskara-red"><Mail className="h-4 w-4" /> {profile.contact_email}</a>}
            {profile.phone_number && <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {profile.phone_number}</span>}
            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sanskara-red"><Globe className="h-4 w-4" /> Website</a>}
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {profile.portfolio_image_urls && profile.portfolio_image_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Main Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel>
              <CarouselContent>
                {profile.portfolio_image_urls.map((url, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <img src={url} alt={`Portfolio image ${index + 1}`} className="rounded-lg object-cover h-64 w-full" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Past Event Photos */}
      {profile.details?.pastEventPhotoUrls && profile.details.pastEventPhotoUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel>
              <CarouselContent>
                {profile.details.pastEventPhotoUrls.map((url: string, index: number) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <img src={url} alt={`Past event image ${index + 1}`} className="rounded-lg object-cover h-64 w-full" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Address Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{profile.address?.full_address || 'Address not provided'}</p>
            {/* Placeholder for a map component */}
            <div className="h-48 bg-gray-200 mt-4 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map Placeholder</p>
            </div>
          </CardContent>
        </Card>

        {/* Services/Spaces */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Spaces & Services</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.services && profile.services.length > 0 ? (
              <div className="space-y-4">
                {profile.services.map((service: any) => (
                  <div key={service.service_id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold">{service.service_name}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <Badge variant="outline" className="mt-2">Capacity: {service.min_capacity} - {service.max_capacity}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p>No services listed.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Accordion */}
      <Card>
        <CardHeader>
            <CardTitle>More Details</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pricing">
                    <AccordionTrigger>Pricing</AccordionTrigger>
                    <AccordionContent>
                        {/* Pricing details will be rendered here */}
                        <pre className="text-xs bg-gray-100 p-4 rounded-md">{JSON.stringify(profile.details?.pricing, null, 2)}</pre>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="amenities">
                    <AccordionTrigger>Amenities</AccordionTrigger>
                    <AccordionContent>
                        {/* Amenities details will be rendered here */}
                         <pre className="text-xs bg-gray-100 p-4 rounded-md">{JSON.stringify(profile.details?.amenities, null, 2)}</pre>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="policies">
                    <AccordionTrigger>Policies</AccordionTrigger>
                    <AccordionContent>
                        {/* Policies details will be rendered here */}
                         <pre className="text-xs bg-gray-100 p-4 rounded-md">{JSON.stringify(profile.details?.taxesPayment, null, 2)}</pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfileView;