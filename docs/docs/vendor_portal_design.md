# Vendor Portal Design

## 1. Overview
The Vendor Portal is a dedicated interface for vendors and their staff to manage their services, availability, bookings, tasks, and communication with users. The portal is tightly integrated with Supabase for authentication, database, and real-time updates.

---

## 2. Frontend

### Tech Stack
- React (or compatible framework)
- Supabase JS Client (for auth, DB, and real-time)
- Tailwind CSS (for UI)
- Optional: React Query or SWR for data fetching

### Key Pages/Components
- **Login & Auth**: Supabase Auth (email/password, magic link)
- **Dashboard**: Overview of bookings, tasks, calendar, notifications
- **Availability Calendar**: View/update available dates, see bookings
- **Service Management**: List/add/edit services, assign staff
- **Staff Management**: Invite/manage staff, assign roles
- **Booking Management**: View/manage bookings, see user details, contract links
- **Task Management**: View/complete tasks, assign to staff, see dependencies
- **Notifications**: Real-time updates (web, WhatsApp integration)
- **Profile & Settings**: Vendor info, commission, contact, portfolio
- **Reviews**: View user reviews, respond if needed

### Data Fetching
- Use Supabase client for direct table queries (row-level security enforced)
- Real-time subscriptions for bookings, tasks, notifications, availability
- Use Supabase Storage for portfolio images

---

## 3. Backend

### Supabase as Backend
- **Auth**: Supabase Auth (vendor staff, owner, service managers)
- **Database**: Direct access via Supabase client (row-level security)
- **Storage**: Supabase Storage for images/docs
- **Functions**: Supabase Edge Functions for custom logic (e.g., WhatsApp notifications, payment webhooks)
- **Real-time**: Subscriptions for bookings, tasks, notifications

### API Endpoints (if needed)
- Most data is fetched directly from Supabase tables
- Edge Functions for:
    - WhatsApp/Email notifications
    - Payment gateway integration
    - Escalation flows
    - Custom business logic (e.g., double confirmation)

---

## 4. Database (Supabase)

### Main Tables Used
- **vendors**: Vendor profile, commission, contact, etc.
- **vendor_staff**: Staff accounts, roles, auth linkage
- **vendor_services**: Services offered, details, pricing, staff assignment
- **vendor_availability**: Calendar of available/booked dates
- **bookings**: User-vendor agreements, status, payments
- **booking_services**: Services included in each booking
- **vendor_tasks**: Tasks for vendor/staff, dependencies, status
- **notifications**: Real-time notifications for staff
- **reviews**: User reviews for vendor
- **task_templates**: To-do list templates for automation
- **payments**: Payment records, status, method

### Row-Level Security (RLS)
- Enforced on all tables so vendors/staff only see their own data
- Staff roles (owner, manager, service_contact) determine access

### Example Table Relationships
- `vendor_staff.vendor_id` → `vendors.vendor_id`
- `vendor_services.vendor_id` → `vendors.vendor_id`
- `vendor_availability.vendor_id` → `vendors.vendor_id`
- `bookings.vendor_id` → `vendors.vendor_id`
- `vendor_tasks.booking_id` → `bookings.booking_id`
- `notifications.recipient_staff_id` → `vendor_staff.staff_id`

---

## 5. Real-Time & Notifications
- Use Supabase real-time for bookings, tasks, and notifications
- Edge Function triggers for WhatsApp/email on key events (booking, task assignment, etc.)

---

## 6. Security & Access
- Supabase Auth for all staff logins
- RLS policies for all tables
- Owner/manager can invite staff (email-based)
- Staff can only access data for their vendor

---

## 7. Extensibility
- Add more service categories, staff roles, or notification channels as needed
- Integrate payment gateways via Edge Functions
- Add analytics dashboard for vendor performance

---

## 8. Summary
The Vendor Portal leverages Supabase for a serverless, real-time, and secure backend, with a modern frontend for vendor operations. Most data flows are direct from frontend to Supabase, with Edge Functions for integrations and automation.
