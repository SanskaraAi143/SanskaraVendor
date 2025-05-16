# Vendor Portal Design Document

This document outlines the database, frontend, and backend design for the Vendor Portal of the Vendor Management Platform. It is based on the provided vendor-side flow and the overall Supabase database schema.

## 1. Database Design (Supabase)

The following tables from the `overall_schema_sql.txt` are central to the Vendor Portal functionality. Supabase will be used for the database, authentication, and real-time capabilities.

**Primary Vendor-Side Tables:**

1.  **`vendors`**
    *   **Purpose:** Stores core information about each vendor business. The `supabase_auth_uid` field links to the Supabase auth user ID of the primary vendor owner/admin.
    *   **Key Columns for Portal:** `vendor_id`, `vendor_name`, `vendor_category`, `contact_email`, `phone_number`, `website_url`, `address`, `description`, `portfolio_image_urls`, `is_active`, `supabase_auth_uid` (for owner login), `commission_rate`.

2.  **`vendor_staff`**
    *   **Purpose:** Manages individual staff members within a vendor's organization, including owners, managers, and service-specific contacts. Each staff member will have their own Supabase login via `supabase_auth_uid`. This table is crucial for implementing separate logins for vendor owners/managers and service members.
    *   **Key Columns for Portal:** `staff_id`, `vendor_id`, `supabase_auth_uid` (for individual staff login), `email`, `phone_number` (for WhatsApp, login), `display_name`, `role` (e.g., 'owner', 'manager', 'service_contact'), `is_active`.
    *   **Note:** The `role` column will be used for Row Level Security (RLS) in Supabase to control access to different portal features.

3.  **`vendor_services`**
    *   **Purpose:** Details specific services offered by a vendor (e.g., Catering, Decor, DJ).
    *   **Key Columns for Portal:** `service_id`, `vendor_id`, `service_name`, `service_category`, `description`, `base_price`, `customizability_details`, `is_in_house`, `is_negotiable`, `responsible_staff_id` (links to `vendor_staff` who manages this service), `is_active`.

4.  **`vendor_availability`**
    *   **Purpose:** Allows vendors to manage and display their availability for specific dates.
    *   **Key Columns for Portal:** `availability_id`, `vendor_id`, `available_date`, `status` (e.g., 'available', 'booked_tentative', 'booked_confirmed'), `notes`.

5.  **`bookings`**
    *   **Purpose:** Represents a confirmed engagement between a user and a vendor. Vendors will view and manage aspects of these bookings.
    *   **Key Columns for Portal:** `booking_id`, `user_id` (to identify the client), `vendor_id`, `event_date`, `booking_status`, `total_amount`, `advance_amount_due`, `paid_amount`, `commission_amount`, `notes_for_vendor`.

6.  **`booking_services`**
    *   **Purpose:** Lists the specific `vendor_services` included in a `booking`.
    *   **Key Columns for Portal:** `booking_service_id`, `booking_id`, `vendor_service_id`, `negotiated_price`, `service_specific_notes`.

7.  **`payments`**
    *   **Purpose:** Tracks payments made by users for bookings. Vendors need visibility, especially to confirm offline payments and understand commission status.
    *   **Key Columns for Portal:** `payment_id`, `booking_id`, `amount`, `payment_method`, `payment_status`, `payment_type` (advance/full), `paid_at`.

8.  **`vendor_tasks`**
    *   **Purpose:** To-do items assigned to the vendor or specific vendor staff related to a booking.
    *   **Key Columns for Portal:** `vendor_task_id`, `booking_id`, `assigned_staff_id` (links to `vendor_staff`), `vendor_id`, `title`, `description`, `is_complete`, `due_date`, `priority`, `status`, `dependency_task_id`.

9.  **`reviews`**
    *   **Purpose:** Allows vendors to see reviews and ratings submitted by users for their services.
    *   **Key Columns for Portal:** `review_id`, `booking_id`, `user_id`, `vendor_id`, `rating`, `comment`, `created_at`.

10. **`notifications`**
    *   **Purpose:** Stores notifications for vendor staff (e.g., new booking requests, visit requests, task reminders, user messages).
    *   **Key Columns for Portal:** `notification_id`, `recipient_staff_id` (links to `vendor_staff`), `message`, `notification_type`, `related_entity_type`, `related_entity_id`, `is_read`.

11. **`task_templates`** (as defined in `overall_schema_sql.txt`)
    *   **Purpose:** To store predefined sets of tasks for vendors (and users) that can be instantiated when a booking is confirmed or a specific event occurs.
    *   **Key Columns:** `template_id`, `template_name`, `target_actor` ('vendor'), `trigger_event`, `tasks` (JSONB).

**Note on "Appointments/Visits":**
The `vendor_side_plan.txt` mentions an `Appointments/Visits` table. While the provided `overall_schema_sql.txt` doesn't explicitly have this, pre-wedding visits can be managed:
*   Initially through AI-facilitated communication and notifications.
*   The `user_shortlisted_vendors` table has a `status` field (e.g., 'visit_scheduled') and `notes` which can track this.
*   If more structured data for visits (feedback from both sides post-visit before formal booking) is needed, a dedicated `appointments` table as outlined in the `vendor_side_plan.txt` (`id, user_id, vendor_id, service_id, date, status, feedback, etc.`) could be added. For now, we will assume interactions leading to visits are managed via notifications and status updates on `user_shortlisted_vendors` or directly leading to a `booking`.

**Supabase Auth Integration:**
*   Vendor owners will have their `supabase_auth_uid` stored in the `vendors` table.
*   All other vendor staff, including service managers, will have their `supabase_auth_uid` stored in the `vendor_staff` table.
*   Login differentiation (Vendor Admin vs. Service Member) will be handled by checking the `role` in the `vendor_staff` table after authentication.

## 2. Frontend Design (Vendor Portal)

The Vendor Portal will be a web application providing the following views and components:

**2.1. Authentication:**
*   **Login Page:**
    *   Option for "Vendor Login" (for owners/admins linked via `vendors.supabase_auth_uid` or `vendor_staff` with admin roles) and "Service Account Login" (for staff linked via `vendor_staff.supabase_auth_uid` with 'service_contact' or similar roles).
    *   Uses Supabase Auth for email/password or social logins if configured.
*   **Registration/Onboarding Flow (for new Vendors):**
    *   Collects `vendors` table details.
    *   Allows initial setup of primary admin in `vendor_staff`.

**2.2. Main Dashboard:**
*   **Calendar View:**
    *   Displays events (from `bookings.event_date`), scheduled tasks (from `vendor_tasks.due_date`), and date availability (from `vendor_availability`).
    *   Filterable by month/week/day.
*   **Key Metrics/Quick View:**
    *   Upcoming tasks.
    *   New booking/visit requests (notifications).
    *   Recent messages or updates.

**2.3. Availability Management:**
*   **Calendar Interface:**
    *   Allows vendors to view their `vendor_availability` status for each day.
    *   Functionality to mark dates as 'available', 'booked_tentative', 'booked_confirmed', or 'unavailable_custom'.
    *   Add notes for specific date statuses.

**2.4. Bookings Management:**
*   **List View:** Displays all `bookings` associated with the vendor.
    *   Columns: Client Name (from `users` via `user_id`), Event Date, Status, Total Amount.
    *   Filters: By status, date range.
*   **Booking Detail View:**
    *   Shows all details from the `bookings` table.
    *   Lists `booking_services` associated with the booking.
    *   Displays payment status from the `payments` table.
    *   Interface to communicate with the user (via platform messaging, linked to AI chat).
    *   Option to confirm offline payments (this would trigger an update to the `payments` table and potentially notify the platform admin/AI for commission).

**2.5. Service Management (for Vendor Admins/Owners):**
*   **List View:** Displays all `vendor_services` offered by the vendor.
*   **CRUD Operations:**
    *   Add new service: Form for all fields in `vendor_services`.
    *   Edit existing service.
    *   Activate/Deactivate service.
    *   Assign `responsible_staff_id` by selecting from `vendor_staff` (filtered for appropriate roles like 'service_contact').

**2.6. Staff Management (for Vendor Admins/Owners):**
*   **List View:** Displays all `vendor_staff` associated with the vendor.
*   **CRUD Operations:**
    *   Invite new staff: Sends an invite email (Supabase Auth handles user creation). Upon acceptance, links to `vendor_staff`.
    *   Edit staff details (name, role).
    *   Activate/Deactivate staff accounts.
    *   This is where service members are onboarded by providing their contact (email/phone for login) and assigning them to services.

**2.7. Profile Management:**
*   Interface to edit vendor profile details stored in the `vendors` table (name, place, description, portfolio images, etc.).

**2.8. Task Management:**
*   **List View:** Displays all `vendor_tasks` assigned to the vendor or specific staff members logged in.
    *   Filterable by status, due date, priority, assigned staff (if admin view).
*   **Task Detail View:**
    *   Update task status, add notes.
    *   View dependencies.

**2.9. Notifications Center:**
*   Displays a list of `notifications` (new booking/visit requests, availability check requests, task reminders, user messages/custom requests).
*   Mark notifications as read.
*   Links to relevant sections (e.g., a booking request notification links to the booking detail).

**2.10. Reviews Management:**
*   **List View:** Displays all `reviews` submitted by users for the vendor.
    *   Shows rating, comment, date.
    *   (Optional: Ability for vendor to respond publicly if feature is added).

**2.11. Payment Overview:**
*   A section showing a summary of payments related to their bookings, including amounts paid, due, and commission status (derived from `bookings` and `payments` tables).

## 3. Backend Design (Supabase & Custom APIs/Functions)

Supabase will handle much of the backend heavy lifting. Custom serverless functions (Supabase Functions or other) might be needed for more complex logic.

**3.1. Authentication & Authorization:**
*   **Supabase Auth:** Used for user (vendor staff) authentication.
*   **Row Level Security (RLS):** Extensively used on Supabase tables to ensure:
    *   Vendors can only access/modify their own data (`vendors`, `vendor_staff`, `vendor_services`, `vendor_availability`, `bookings`, `vendor_tasks`).
    *   Service members (`vendor_staff` with 'service_contact' role) can only access/modify data related to the services they are responsible for (e.g., tasks assigned to them or related to their `vendor_services.responsible_staff_id`).
    *   Vendor owners/admins have broader access within their vendor scope.

**3.2. Supabase Realtime:**
*   Used for:
    *   Pushing new notifications to the Vendor Portal in real-time.
    *   Real-time updates on task statuses.
    *   Reflecting availability changes made by other staff members (if applicable).

**3.3. API Endpoints / Supabase Client SDK Usage:**

Most CRUD operations will be performed directly using the Supabase client SDK from the frontend, protected by RLS. Specific backend logic might be encapsulated in Supabase Edge Functions:

*   **Vendor Profile:**
    *   `GET /rest/v1/vendors?select=*&vendor_id=eq.{vendor_id}`
    *   `PATCH /rest/v1/vendors?vendor_id=eq.{vendor_id}`
*   **Staff Management:**
    *   `GET /rest/v1/vendor_staff?select=*&vendor_id=eq.{vendor_id}`
    *   `POST /rest/v1/vendor_staff` (to add staff - an Edge Function might handle invitation logic)
    *   `PATCH /rest/v1/vendor_staff?staff_id=eq.{staff_id}`
    *   `DELETE /rest/v1/vendor_staff?staff_id=eq.{staff_id}`
*   **Service Management:**
    *   `GET /rest/v1/vendor_services?select=*&vendor_id=eq.{vendor_id}`
    *   `POST, PATCH, DELETE /rest/v1/vendor_services`
*   **Availability Management:**
    *   `GET /rest/v1/vendor_availability?select=*&vendor_id=eq.{vendor_id}`
    *   `POST, PATCH /rest/v1/vendor_availability` (handle upserts on `(vendor_id, available_date)`)
*   **Bookings & Related Data:**
    *   `GET /rest/v1/bookings?select=*,booking_services(*),payments(*),users(display_name)&vendor_id=eq.{vendor_id}`
*   **Tasks:**
    *   `GET /rest/v1/vendor_tasks?select=*&vendor_id=eq.{vendor_id}` (or `assigned_staff_id=eq.{current_staff_id}`)
    *   `POST, PATCH /rest/v1/vendor_tasks`
*   **Notifications:**
    *   `GET /rest/v1/notifications?select=*&recipient_staff_id=eq.{current_staff_id}`
    *   `PATCH /rest/v1/notifications?notification_id=eq.{notification_id}` (to mark as read)
*   **Reviews:**
    *   `GET /rest/v1/reviews?select=*&vendor_id=eq.{vendor_id}`

**3.4. Key Backend Logic (Potentially Supabase Functions):**

*   **Notification Generation:**
    *   Database triggers or functions to create `notifications` entries for vendors when:
        *   A user requests to contact or check availability.
        *   A new booking is tentatively made.
        *   A task is assigned or nearing its due date.
        *   A user sends a custom request/message.
*   **WhatsApp Integration:**
    *   A Supabase Function triggered by certain events (e.g., availability check not updated, urgent notification) that calls a third-party API (like Twilio) to send WhatsApp messages to `vendor_staff.phone_number`.
    *   Endpoint to receive WhatsApp replies for availability confirmation (if two-way sync is implemented).
*   **Commission Logic:**
    *   Functions or triggers to calculate `commission_amount` on `bookings` when a payment is confirmed or a booking status changes.
    *   Logic to handle updates when a vendor reports an offline payment (`payments` table update, commission calculation).
*   **To-Do List Curation from Templates:**
    *   A Supabase Function triggered upon booking confirmation (e.g., `bookings.booking_status` = 'confirmed').
    *   This function reads from `task_templates` where `target_actor` = 'vendor'.
    *   It then creates multiple entries in the `vendor_tasks` table, linking them to the `booking_id` and potentially assigning them based on service type or default roles.
*   **Escalation Logic:**
    *   Scheduled functions or background workers to check `vendor_tasks`. If a task assigned to a `service_contact` is overdue or unresponsive (requires a mechanism to track responsiveness), a notification is created for the vendor owner/manager (`vendor_staff` with 'owner'/'manager' role for that `vendor_id`).
*   **Handling Offline Payment Confirmation:**
    *   An endpoint or function that vendors can trigger to report an offline payment. This would:
        *   Update the `payments` table (or create a new record).
        *   Update `bookings.paid_amount`.
        *   Trigger commission calculation.

