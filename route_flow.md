# Application Route Flow Logic (Updated)

This document outlines the complete routing logic for the application, including all edge cases, after the recent refactoring.

## Overview

The application uses `react-router-dom` for routing. The authentication flow is now more robust, with the `useAuth` hook determining the user's type (`vendor`, `staff`, or `customer`) and managing profiles and redirects accordingly.

## Route Breakdown

### 1. Public Routes

These routes are accessible to everyone.

- **`/`**: The main index page. It redirects logged-in users to their respective dashboards.
- **`/login`**: The login page for vendors. If a user is already logged in, they are redirected to their dashboard.
- **`/signup`**: The signup page, which currently redirects to the login page.
- **`/staff/login`**: The login page for staff members.

### 2. Protected Vendor Routes

These routes are protected by the `ProtectedRoute` component and are only accessible to authenticated vendors. If a non-vendor user tries to access these routes, they will be signed out.

- **`/dashboard`**: The main vendor dashboard.
- **`/onboarding`**: The vendor onboarding page. This page now presents options for automatic (biodata upload, AI call) or manual onboarding.
- **`/manual-vendor-onboarding`**: The page for the detailed, multi-step manual onboarding form.
- **`/bookings`**: The vendor's bookings page.
- **`/calendar`**: The vendor's calendar page.
- **`/services`**: The vendor's services page.
- **`/services/add`**: Page to add a new service.
- **`/services/edit/:serviceId`**: Page to edit an existing service.
- **`/staff`**: The vendor's staff management page.
- **`/tasks`**: The vendor's tasks page.
- **`/payments`**: The vendor's payments page.
- **`/notifications`**: The vendor's notifications page.
- **`/profile`**: The vendor's profile page.
- **`/profile/edit`**: Page to edit the vendor's profile.
- **`/settings`**: The vendor's settings page.
- **`/reviews`**: The vendor's reviews page.

#### Edge Cases for Vendor Routes:

- **Unauthenticated Access**: If a user is not logged in, they are redirected to `/login`.
- **Incorrect User Type**: If a logged-in user is not a `vendor` (e.g., `staff` or `customer`), the `ProtectedRoute` will trigger the `signOut` function, logging the user out and redirecting them to the login page.
- **Inactive Profile**: If a vendor's profile is not `is_active`, the `useAuth` context will redirect them to the `/onboarding` page.

### 3. Protected Staff Routes

These routes are protected by the `StaffProtectedRoute` component and are only accessible to authenticated staff members. All staff routes are prefixed with `/staff`.

- **`/staff/dashboard`**: The main staff dashboard.
- **`/staff/onboarding`**: The staff onboarding page.
- **`/staff/reset-password`**: The page for staff to reset their password.
- **`/staff/tasks`**: The staff's tasks page.
- **`/staff/bookings`**: The staff's bookings page.
- **`/staff/availability`**: The staff's availability page.
- **`/staff/services`**: A page for staff to view vendor services.
- **`/staff/notifications`**: The staff's notifications page.
- **`/staff/profile`**: The staff's profile page.
- **`/staff/settings`**: The staff's settings page.

#### Edge Cases for Staff Routes:

- **Unauthenticated Access**: If a user is not logged in, they are redirected to `/staff/login`.
- **Incorrect User Type**: If a logged-in user is not a `staff` member, they are redirected to `/staff/login`.
- **Inactive Profile**: If a staff member's profile is not `is_active`, the `useAuth` context will redirect them to the `/staff/onboarding` page.

### 4. Not Found

- **`*`**: A catch-all route that renders the `NotFound` page if no other route matches.

## Authentication Flow

1.  When the application loads, the `useAuth` hook checks for an authenticated user.
2.  A loading spinner is displayed while the user's session and `userType` are being determined.
3.  The `userType` is fetched from the `users` table in the database.
4.  Based on the `userType`, the corresponding profile (`vendorProfile` or `staffProfile`) is fetched.
5.  The `ProtectedRoute` and `StaffProtectedRoute` components guard the routes, ensuring only users with the correct `userType` can access them.
6.  The `useAuth` context also handles redirects based on the `is_active` status of the user's profile, guiding them to the appropriate onboarding or dashboard page.
