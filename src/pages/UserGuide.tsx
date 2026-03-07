import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, User, Building, Image, Settings, ClipboardList, Menu } from 'lucide-react';

const UserGuide: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'vendor';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">How to Use Sanskara Vendor Platform</h1>
        <p className="text-muted-foreground">Comprehensive guide for Vendors and Staff members.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1">
          <TabsTrigger value="vendor" className="text-lg py-3">Vendor Guide (Admins)</TabsTrigger>
          <TabsTrigger value="staff" className="text-lg py-3">Staff Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="vendor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6 text-sanskara-red" /> Getting Started as a Vendor</CardTitle>
              <CardDescription>Master your dashboard and manage your business presence.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                
                <AccordionItem value="profile-setup">
                  <AccordionTrigger className="text-lg font-medium">1. Complete Your Profile</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="mb-2">Your profile is the first thing clients see. Make it shine!</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Go to <strong>View Profile</strong> from the dashboard header.</li>
                      <li>Click <strong>Edit Profile</strong> to unlock all fields.</li>
                      <li><strong>Basic Info:</strong> Ensure your name, category, and description are compelling.</li>
                      <li><strong>Address:</strong> Provide a localized address so clients can find you on the map.</li>
                      <li><strong>Pricing & Policies:</strong> Transparency builds trust. Fill out detailed pricing for services, food, and amenities.</li>
                      <li><strong>Save Changes:</strong> Always remember to click the Save button at the bottom right!</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="portfolio">
                  <AccordionTrigger className="text-lg font-medium">2. Managing Your Portfolio (Photos)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="mb-2">Visuals sell your services. We support two types of galleries:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border p-4 rounded-lg bg-slate-50">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Image className="h-4 w-4" /> Main Portfolio</h4>
                        <p className="text-sm">Upload high-quality images of your venue or main service offerings. These appear at the top of your profile.</p>
                      </div>
                      <div className="border p-4 rounded-lg bg-slate-50">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><ClipboardList className="h-4 w-4" /> Past Events Gallery</h4>
                        <p className="text-sm">Showcase your versatility! Upload photos from specific past weddings to show different themes, setups, and styles.</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="services">
                  <AccordionTrigger className="text-lg font-medium">3. Adding Services / Spaces</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p>If you are a Venue, you likely have multiple halls, lawns, or dining areas. Add them separately!</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Go to <strong>Spaces / Services</strong> tab in your profile or dashboard.</li>
                      <li>Click <strong>Add Service</strong>.</li>
                      <li>Define specific details like <em>Seating Capacity</em>, <em>AC Availability</em>, and <em>Price per plate/hour</em> for that specific hall.</li>
                      <li>This helps clients book the specific space that fits their guest list!</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="staff-mgmt">
                  <AccordionTrigger className="text-lg font-medium">4. Managing Your Staff</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p>Delegate tasks efficiently by onboarding your team.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Go to the <strong>Staff</strong> tab in your dashboard.</li>
                      <li>Click <strong>Add New Staff</strong>.</li>
                      <li>Generate a signup link or manually add their details.</li>
                      <li>Once they sign up, you can assign them specific <strong>Bookings</strong> or <strong>Tasks</strong>.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-6 w-6 text-sanskara-blue" /> Staff Handbook</CardTitle>
              <CardDescription>Everything you need to know about using the Staff Dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
               <Accordion type="single" collapsible className="w-full">
                
                <AccordionItem value="staff-onboarding">
                  <AccordionTrigger className="text-lg font-medium">1. Your Personal Profile</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="mb-2">Even as staff, you can showcase your expertise!</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Use the <strong>View Profile</strong> button on your dashboard.</li>
                      <li>Update your photo and basic details.</li>
                      <li>If you offer specialized personal services (like a specific Chef or Makeup Artist under a vendor), make sure your skills are listed.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tasks">
                  <AccordionTrigger className="text-lg font-medium">2. Managing Tasks</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p>Stay on top of your to-do list.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Your Dashboard shows a summary of <strong>Pending</strong> and <strong>Upcoming</strong> tasks.</li>
                      <li>Click on any task to view full details details or mark it as <strong>In Progress</strong> / <strong>Completed</strong>.</li>
                      <li>Keep your Vendor Manager updated by leaving notes on tasks (feature coming soon!).</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bookings">
                  <AccordionTrigger className="text-lg font-medium">3. Viewing Bookings</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p>Know where you need to be and when.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The <strong>Upcoming Bookings</strong> section lists events assigned to you or your team.</li>
                      <li>Check the <strong>Event Date</strong> and client name carefully.</li>
                      <li>Click 'View Details' to see specific requirements for that event.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserGuide;
