# Sanskara AI - Intelligent Vendor Portal for Hindu Wedding Services

## Project Overview

**URL**: https://lovable.dev/projects/0a4432d5-9a7d-4cfe-811a-36709cedae8d

Sanskara AI is a comprehensive, AI-powered vendor management platform specifically designed for Hindu wedding services. The platform streamlines wedding vendor operations with intelligent automation, real-time collaboration, and advanced business insights.

## 🎯 Key Features

### For Vendors
- **Intelligent Dashboard**: Real-time analytics, upcoming bookings, and task management
- **Multi-Step Onboarding**: Automated and manual onboarding with AI assistance
- **Service Management**: Create, edit, and manage wedding services with pricing and availability
- **Staff Management**: Manage team members with role-based access control
- **Booking Management**: Handle customer bookings, contracts, and service assignments
- **Calendar Integration**: Manage availability and schedule across multiple services
- **Payment Tracking**: Monitor payments, commissions, and financial transactions
- **Task Management**: Automated task creation from templates and manual task assignment
- **Review System**: Collect and manage customer reviews and ratings
- **Notification Center**: Real-time notifications for bookings, tasks, and updates

### For Vendor Staff
- **Dedicated Staff Portal**: Separate login and dashboard for staff members
- **Portfolio Management**: Create and manage staff portfolios with images and videos
- **Availability Management**: Individual staff availability tracking and management
- **Task Assignment**: Receive and manage assigned tasks from vendors
- **Service-Specific Access**: Role-based access to relevant services and bookings
- **Communication Tools**: Integrated messaging and notification system

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (Database, Auth, Real-time subscriptions)
- **State Management**: React Query, Context API
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Lovable platform

### Database Design
- **Multi-tenant Architecture**: Support for multiple weddings and vendors
- **Role-Based Access Control**: Separate authentication for vendors and staff
- **Real-time Updates**: Live data synchronization across all portals
- **Comprehensive Schema**: 20+ tables covering all aspects of wedding vendor management

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your Supabase credentials in .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Alternative Development Methods

#### Using Lovable (Recommended)
- Visit the [Lovable Project](https://lovable.dev/projects/0a4432d5-9a7d-4cfe-811a-36709cedae8d)
- Start prompting for changes
- All changes are automatically committed to the repository

#### Using GitHub Codespaces
- Click the "Code" button in GitHub
- Select "Codespaces" tab
- Click "New codespace" to launch the environment
- Start editing files directly in the browser

#### Using Your Preferred IDE
- Clone the repository locally
- Make changes in your IDE
- Push changes to see them reflected in Lovable

## 📱 Portal Access

### Vendor Portal Routes
- `/dashboard` - Main vendor dashboard with analytics
- `/onboarding` - Vendor onboarding (automated/manual options)
- `/manual-vendor-onboarding` - Detailed manual onboarding form
- `/bookings` - Manage customer bookings
- `/calendar` - Availability and scheduling calendar
- `/services` - Service catalog management
- `/services/add` - Add new services
- `/services/edit/:serviceId` - Edit existing services
- `/staff` - Staff member management
- `/tasks` - Task management and tracking
- `/payments` - Payment and commission tracking
- `/notifications` - Notification center
- `/profile` - Vendor profile management
- `/profile/edit` - Edit vendor profile
- `/settings` - Vendor settings and preferences
- `/reviews` - Customer reviews and ratings

### Staff Portal Routes (Prefixed with `/staff`)
- `/staff/dashboard` - Staff member dashboard
- `/staff/onboarding` - Staff onboarding process
- `/staff/reset-password` - Password reset functionality
- `/staff/tasks` - Assigned tasks management
- `/staff/bookings` - Bookings for assigned services
- `/staff/availability` - Personal availability management
- `/staff/services` - View assigned services
- `/staff/notifications` - Staff notifications
- `/staff/profile` - Staff profile management
- `/staff/settings` - Staff settings and preferences

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing for SPA navigation

### UI/UX
- **shadcn/ui** - Modern, accessible UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization components

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database with advanced features (pgvector, full-text search)
  - Authentication system with Row Level Security (RLS)
  - Real-time subscriptions for live updates
  - File storage for images and documents
  - Edge Functions for serverless backend logic

### State Management & Forms
- **React Query (TanStack Query)** - Server state management and caching
- **Context API** - React's built-in state management for global state
- **React Hook Form** - Performant form handling with easy validation
- **Zod** - TypeScript-first schema validation

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **PostCSS** - CSS post-processing
- **Stylelint** - CSS/SCSS linting

## 🗄️ Database Schema

The platform uses a comprehensive PostgreSQL database with 20+ tables organized into:

### Core Wedding Management
- `weddings` - Central wedding entity
- `users` - Customer users with wedding associations
- `wedding_members` - Multiple users per wedding support

### Vendor Management
- `vendors` - Vendor business information
- `vendor_staff` - Staff members with role-based access
- `vendor_services` - Individual services offered by vendors
- `vendor_availability` - Vendor availability calendar

### Booking & Transaction Management
- `bookings` - Customer-vendor booking agreements
- `booking_services` - Services included in bookings
- `payments` - Payment tracking and commission management
- `vendor_tasks` - Task management for bookings

### Communication & Collaboration
- `notifications` - Real-time notifications for users and staff
- `reviews` - Customer reviews and ratings
- `chat_sessions` - AI-powered chat conversations
- `chat_messages` - Individual chat messages

### Content & Media Management
- `mood_boards` - Wedding inspiration collections
- `mood_board_items` - Individual items in mood boards
- `image_artifacts` - Generated and uploaded images
- `staff_portfolios` - Staff portfolio management

### Advanced Features
- `memories` - Vector database for semantic search (pgvector)
- `task_templates` - Reusable task templates
- `workflows` - Long-term AI agent processes
- `timeline_events` - Wedding timeline management

## 🔐 Authentication & Security

### Multi-Level Authentication
- **Vendor Authentication**: Separate login for vendor owners/admins
- **Staff Authentication**: Individual staff member logins
- **Customer Authentication**: Wedding couple and family member access

### Role-Based Access Control (RBAC)
- **Vendor Owners**: Full access to vendor data and staff management
- **Vendor Staff**: Access limited to assigned services and tasks
- **Customers**: Access to their wedding data and booked vendors

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Password Reset**: Secure password recovery flow
- **Session Management**: Automatic session handling

## 🤖 AI-Powered Features

### Intelligent Automation
- **Smart Onboarding**: AI-assisted vendor setup and configuration
- **Automated Task Creation**: Task templates triggered by booking events
- **Intelligent Notifications**: Context-aware notification generation
- **Commission Calculation**: Automated commission tracking and calculation

### Advanced Analytics
- **Revenue Tracking**: Real-time revenue and commission analytics
- **Performance Metrics**: Booking success rates and customer satisfaction
- **Availability Optimization**: Smart scheduling recommendations
- **Review Analysis**: Automated sentiment analysis of customer feedback

## 📋 Task Management System

### Automated Task Creation
- **Template-Based Tasks**: Predefined task templates for common wedding services
- **Event-Triggered Tasks**: Tasks created automatically when bookings are confirmed
- **Dependency Management**: Task dependencies and sequencing
- **Progress Tracking**: Real-time task completion monitoring

### Staff Task Assignment
- **Role-Based Assignment**: Tasks assigned based on staff roles and expertise
- **Workload Balancing**: Intelligent task distribution across team members
- **Deadline Management**: Due date tracking and escalation
- **Completion Verification**: Task review and approval workflows

## 💰 Payment & Commission System

### Multi-Payment Support
- **Advance Payments**: Booking advance payment tracking
- **Full Payments**: Complete payment processing
- **Offline Payment Confirmation**: Manual payment confirmation for cash/check payments
- **Payment Method Tracking**: Support for various payment methods

### Commission Management
- **Automated Calculation**: Commission calculated based on vendor rates
- **Real-Time Tracking**: Live commission status updates
- **Payout Management**: Commission payout tracking and reporting
- **Financial Reporting**: Detailed financial analytics and reports

## 🚀 Deployment

### Lovable Platform Deployment
1. Open [Lovable](https://lovable.dev/projects/0a4432d5-9a7d-4cfe-811a-36709cedae8d)
2. Click on **Share** → **Publish**
3. Your application will be deployed automatically

### Custom Domain Setup
1. Navigate to **Project** → **Settings** → **Domains**
2. Click **Connect Domain**
3. Follow the step-by-step guide provided

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 📞 Support & Documentation

### Key Documentation Files
- `docs/vendor_side_portal_design.md` - Complete vendor portal design specifications
- `route_flow.md` - Detailed routing and authentication flow
- `overall_schema.sql` - Complete database schema documentation

### Development Guidelines
- **Code Style**: Follow ESLint and TypeScript configurations
- **Component Structure**: Use shadcn/ui patterns and Radix UI primitives
- **State Management**: Prefer React Query for server state, Context API for global state
- **Form Handling**: Use React Hook Form with Zod validation
- **Error Handling**: Implement proper error boundaries and user feedback

## 🔄 Recent Updates

### Current Version Features
- ✅ **Dual Portal Architecture**: Separate vendor and staff portals with dedicated authentication
- ✅ **Advanced Onboarding**: AI-powered and manual onboarding options for vendors
- ✅ **Staff Portfolio Management**: Individual staff member portfolios with media uploads
- ✅ **Real-time Notifications**: Live notification system for both vendors and staff
- ✅ **Task Management**: Comprehensive task creation, assignment, and tracking system
- ✅ **Payment Integration**: Multi-payment method support with commission tracking
- ✅ **Calendar Integration**: Advanced availability management for vendors and staff
- ✅ **Review System**: Customer review collection and management
- ✅ **Mobile Responsive**: Fully responsive design for all device types

### Upcoming Features
- 🔄 **WhatsApp Integration**: Automated notifications via WhatsApp
- 🔄 **Advanced Analytics**: Enhanced reporting and business intelligence
- 🔄 **Multi-language Support**: Support for multiple Indian languages
- 🔄 **API Integrations**: Third-party service integrations
- 🔄 **Mobile App**: Native mobile applications for iOS and Android

## 🤝 Contributing

### Development Workflow
1. **Fork the repository** or create a new branch
2. **Make your changes** following the established patterns
3. **Test thoroughly** across different scenarios
4. **Submit a pull request** with detailed description
5. **Code review** and approval process

### Code Standards
- Follow TypeScript strict mode guidelines
- Use semantic commit messages
- Write comprehensive component documentation
- Include proper error handling and loading states
- Ensure accessibility compliance (WCAG 2.1)

## 📄 License

This project is proprietary software developed for Sanskara AI. All rights reserved.

---

**Built with ❤️ for the Hindu wedding community**
