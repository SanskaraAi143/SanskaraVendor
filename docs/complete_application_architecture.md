# Sanskara AI - Complete Application Architecture Documentation

## Overview

Sanskara AI is a comprehensive, AI-powered vendor management platform specifically designed for Hindu wedding services. This document provides a complete architectural overview of the entire application ecosystem, including design decisions, process flows, customizations, limitations, and future development plans.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Vendor    │  │   Staff     │  │  Customer   │              │
│  │   Portal    │  │   Portal    │  │   Portal    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│              REACT APPLICATION (SPA)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │  TypeScript │  │   Vite      │              │
│  │   Router    │  │             │  │   Build     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│             STATE MANAGEMENT & DATA FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ React Query │  │   Context   │  │   Local     │              │
│  │   (Server)  │  │    API      │  │   State     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Supabase   │  │   WhatsApp  │  │   Payment   │              │
│  │   (BaaS)    │  │ Integration │  │ Gateways    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│              DATABASE & STORAGE                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ PostgreSQL  │  │   File      │  │   Vector    │              │
│  │   (RLS)     │  │  Storage    │  │  Database   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Design System

### UI/UX Design Principles

#### 1. **Accessibility First**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Focus management and indicators

#### 2. **Mobile-First Responsive Design**
- Breakpoints: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- Touch-friendly interface elements (44px minimum touch targets)
- Responsive typography scale
- Adaptive layouts for different screen sizes

#### 3. **Cultural Sensitivity**
- Support for Hindu wedding traditions and customs
- Culturally appropriate color schemes and imagery
- Regional language support (planned)
- Traditional Indian design elements

### Color Palette

```css
/* Primary Colors */
--primary: #8B5A3C;        /* Warm brown - traditional Indian weddings */
--primary-foreground: #FFFFFF;

/* Secondary Colors */
--secondary: #D4AF37;      /* Gold - auspicious color in Indian culture */
--secondary-foreground: #1C1917;

/* Accent Colors */
--accent: #F59E0B;         /* Amber - celebratory color */
--accent-foreground: #1C1917;

/* Status Colors */
--success: #10B981;        /* Emerald - success states */
--warning: #F59E0B;        /* Amber - warning states */
--error: #EF4444;          /* Red - error states */
--info: #3B82F6;           /* Blue - informational */

/* Neutral Colors */
--background: #FAFAF9;     /* Off-white background */
--foreground: #1C1917;     /* Dark text */
--muted: #F5F5F4;          /* Light gray for subtle elements */
--muted-foreground: #78716C;
```

### Typography Scale

```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Playfair Display', serif;  /* For headings - elegant serif */

/* Font Sizes (Responsive) */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
--text-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem);
```

## 🔄 Process Flows

### 1. Vendor Onboarding Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Welcome   │ -> │   Choose    │ -> │  Automated  │
│    Step     │    │    Mode     │    │  Onboarding │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Manual    │ <- │   Biodata   │ -> │ Document    │
│ Onboarding  │    │   Upload    │    │   Upload    │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    AI Chat  │ -> │   Audio     │ -> │ Completion  │
│ Assistance  │    │    Call     │    │    Step     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Staff Invitation and Onboarding Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Vendor     │ -> │   Send      │ -> │  Staff      │
│  Dashboard  │    │  Invitation │    │  Receives   │
└─────────────┘    └─────────────┘    │  Email      │
                                      └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Staff      │ -> │   Create    │ -> │  Complete   │
│   Clicks    │    │  Account    │    │  Profile    │
│     Link    │    └─────────────┘    └─────────────┘
└─────────────┘
        │
        v
┌─────────────┐    ┌─────────────┐
│  Staff      │ <- │  Vendor     │
│  Login      │    │  Approves   │
└─────────────┘    └─────────────┘
```

### 3. Booking Management Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Customer   │ -> │   Vendor    │ -> │   Create    │
│   Request   │    │   Receives  │    │   Booking   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                │                     │
        │                │                     v
        │                │           ┌─────────────┐
        │                │           │   Assign    │
        │                │           │    Staff    │
        │                │           └─────────────┘
        │                │                     │
        v                v                     v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Task      │    │  Payment    │    │ Notification│
│ Generation  │    │ Processing  │ <- │   System    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🛠️ Technical Architecture Deep Dive

### Frontend Architecture

#### Component Structure
```
src/components/
├── ui/                      # Base shadcn/ui components
│   ├── button.tsx          # Customizable button component
│   ├── input.tsx           # Form input components
│   ├── card.tsx            # Card layout component
│   ├── dialog.tsx          # Modal dialog component
│   └── ...
├── layout/                  # Layout-specific components
│   ├── VendorLayout.tsx    # Main vendor portal layout
│   ├── StaffLayout.tsx     # Staff portal layout
│   └── RouteContainer.tsx  # Route protection wrapper
├── features/               # Feature-specific components
│   ├── bookings/           # Booking management components
│   ├── staff/              # Staff management components
│   ├── tasks/              # Task management components
│   └── ...
└── forms/                  # Complex form components
    ├── VendorOnboardingForm.tsx
    ├── StaffInvitationForm.tsx
    └── BookingForm.tsx
```

#### State Management Architecture

```typescript
// Global State (Context API)
interface AuthContextType {
  user: User | null;
  userType: 'vendor' | 'staff' | 'customer';
  vendorProfile: VendorProfile | null;
  staffProfile: StaffProfile | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Server State (React Query)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Custom retry logic based on error type
        return failureCount < 3;
      },
    },
  },
});
```

### Backend Architecture (Supabase)

#### Row Level Security (RLS) Policies

```sql
-- Vendor Data Access Policy
CREATE POLICY "Vendors can access own data" ON vendors
  FOR ALL USING (
    auth.uid() = supabase_auth_uid OR
    auth.uid() IN (
      SELECT supabase_auth_uid FROM vendor_staff
      WHERE vendor_id = vendors.vendor_id AND role IN ('owner', 'manager')
    )
  );

-- Staff Data Access Policy
CREATE POLICY "Staff can access assigned data" ON vendor_tasks
  FOR ALL USING (
    assigned_staff_id = auth.uid() OR
    vendor_id IN (
      SELECT vendor_id FROM vendor_staff WHERE supabase_auth_uid = auth.uid()
    )
  );
```

#### Real-time Subscriptions

```typescript
// Vendor Dashboard Real-time Updates
const realtimeSubscription = supabase
  .channel('vendor_updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `vendor_id=eq.${vendorId}`,
    },
    (payload) => {
      // Handle real-time updates
      queryClient.invalidateQueries(['bookings', vendorId]);
    }
  )
  .subscribe();
```

## 🔧 Customization Capabilities

### 1. **Branding Customization**
- **Logo Upload**: Custom vendor logos and branding
- **Color Schemes**: Customizable color palettes per vendor
- **Typography**: Font selection and sizing options
- **Templates**: Customizable email and document templates

### 2. **Service Customization**
- **Service Types**: Configurable service categories and types
- **Pricing Models**: Flexible pricing structures (fixed, hourly, per person)
- **Custom Fields**: Additional service-specific data fields
- **Portfolio Display**: Customizable portfolio layouts

### 3. **Workflow Customization**
- **Task Templates**: Custom task templates per service type
- **Notification Rules**: Configurable notification triggers
- **Approval Processes**: Custom approval workflows
- **Integration Rules**: Custom business logic rules

### 4. **Staff Role Customization**
- **Role Definitions**: Custom staff roles and permissions
- **Access Levels**: Granular permission management
- **Assignment Rules**: Automated staff assignment logic
- **Communication Preferences**: Custom notification settings

## ⚙️ Configuration Management

### Environment Configuration

```typescript
// Environment Variables
interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  features: {
    aiOnboarding: boolean;
    whatsappIntegration: boolean;
    multiLanguage: boolean;
  };
  customization: {
    maxStaffPerVendor: number;
    maxServicesPerVendor: number;
    fileUploadLimit: number;
  };
}
```

### Feature Flags

```typescript
// Feature Flag Management
const featureFlags = {
  AI_ONBOARDING: process.env.VITE_AI_ONBOARDING === 'true',
  WHATSAPP_INTEGRATION: process.env.VITE_WHATSAPP_INTEGRATION === 'true',
  MULTI_LANGUAGE: process.env.VITE_MULTI_LANGUAGE === 'true',
  ADVANCED_ANALYTICS: process.env.VITE_ADVANCED_ANALYTICS === 'true',
};
```

## 🔒 Security Architecture

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │ -> │   JWT       │ -> │   Session   │
│   Form      │    │  Token      │    │ Management  │
└─────────────┘    └─────────────┘    └─────────────┘
        │                │                     │
        │                │                     v
        v                v           ┌─────────────┐
┌─────────────┐    ┌─────────────┐    │   Row       │
│   Route     │    │   Profile   │ -> │  Level      │
│ Protection  │    │   Loading   │    │  Security   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Data Security Measures

1. **Row Level Security (RLS)**
   - Database-level access control
   - Automatic query filtering based on user roles
   - Prevents unauthorized data access

2. **Input Validation & Sanitization**
   - Server-side input validation using Zod schemas
   - SQL injection prevention
   - XSS protection through React's built-in escaping

3. **File Upload Security**
   - File type validation
   - Size limits and virus scanning (planned)
   - Secure file storage with access controls

4. **API Security**
   - Rate limiting on API endpoints
   - Request validation and authentication
   - CORS configuration for cross-origin requests

## 📊 Performance Optimization

### Frontend Performance

#### Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Staff = lazy(() => import('../pages/Staff'));
```

#### Image Optimization
- **Lazy Loading**: Images load only when in viewport
- **Responsive Images**: Multiple sizes for different screen sizes
- **Image Compression**: Automatic optimization for web delivery

#### Caching Strategy
- **React Query**: Intelligent caching of API responses
- **Service Worker**: Offline support and caching (planned)
- **Browser Cache**: Static asset caching headers

### Backend Performance

#### Database Optimization
- **Indexes**: Optimized indexes for common query patterns
- **Query Optimization**: Efficient database queries with proper joins
- **Connection Pooling**: Supabase handles connection management

#### Real-time Performance
- **Selective Subscriptions**: Only subscribe to necessary data changes
- **Debounced Updates**: Prevent excessive re-renders from rapid updates
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

## 🔄 API Integration Architecture

### External Service Integrations

#### WhatsApp Integration (Planned)
```typescript
interface WhatsAppService {
  sendMessage: (phoneNumber: string, message: string) => Promise<void>;
  receiveMessage: (callback: (message: WhatsAppMessage) => void) => void;
  markAsRead: (messageId: string) => Promise<void>;
}
```

#### Payment Gateway Integration
```typescript
interface PaymentService {
  processPayment: (paymentData: PaymentData) => Promise<PaymentResult>;
  refundPayment: (paymentId: string) => Promise<RefundResult>;
  getPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
}
```

#### Calendar Integration (Future)
- Google Calendar API integration
- Outlook Calendar integration
- iCal export/import functionality

## 🧪 Testing Strategy

### Testing Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Unit      │  │ Integration │  │   E2E       │      │
│  │   Tests     │  │   Tests     │  │   Tests     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Jest      │  │  React      │  │ Playwright  │      │
│  │             │  │  Testing    │  │             │      │
│  └─────────────┘  │  Library    │  └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  └─────────────┘  ┌─────────────┐      │
│  │   Test      │                   │   Visual    │      │
│  │  Coverage   │                   │ Regression  │      │
│  └─────────────┘                   └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Test Categories

1. **Unit Tests**
   - Component logic testing
   - Utility function testing
   - Hook testing with React Testing Library

2. **Integration Tests**
   - API integration testing
   - Component interaction testing
   - State management testing

3. **End-to-End Tests**
   - Complete user journey testing
   - Cross-browser compatibility testing
   - Mobile responsiveness testing

## 🚧 Limitations and Constraints

### Current Limitations

#### 1. **Scalability Constraints**
- **Database**: PostgreSQL may require optimization for 10k+ concurrent users
- **File Storage**: Supabase storage limits may require migration for large media files
- **Real-time Connections**: WebSocket connection limits may affect large-scale deployments

#### 2. **Feature Limitations**
- **Offline Support**: Limited offline functionality (planned for future versions)
- **Multi-language**: Currently English only (Hindi, Tamil, Telugu support planned)
- **Mobile App**: Web-only currently (React Native app planned)

#### 3. **Integration Limitations**
- **Payment Gateways**: Limited to specific Indian payment gateways
- **Calendar Systems**: No third-party calendar integration yet
- **Communication**: WhatsApp integration not yet implemented

#### 4. **Performance Limitations**
- **Large Datasets**: Dashboard may slow down with extensive booking history
- **Image Loading**: Portfolio galleries may require pagination for large collections
- **Real-time Updates**: Too many concurrent updates may cause performance issues

### Technical Debt

1. **Code Organization**
   - Some components may need refactoring for better separation of concerns
   - TypeScript types may need consolidation and better organization
   - Error handling could be more consistent across components

2. **Testing Coverage**
   - Need more comprehensive test coverage for critical user flows
   - Integration tests for external service interactions
   - Performance testing for large-scale usage

3. **Documentation**
   - API documentation for external integrations
   - Component documentation for development team
   - Deployment and maintenance guides

## 🎯 Future Development Plans

### Phase 1: Core Enhancements (Next 3 months)

#### 1. **WhatsApp Integration**
- Automated notifications via WhatsApp Business API
- Two-way communication with customers
- Template message management
- Delivery status tracking

#### 2. **Advanced Analytics Dashboard**
- Revenue forecasting and trends
- Customer behavior analytics
- Service performance metrics
- Staff productivity insights

#### 3. **Multi-language Support**
- Hindi language support
- Tamil and Telugu (South Indian languages)
- Regional customization options
- Cultural preference settings

### Phase 2: Platform Expansion (6-12 months)

#### 1. **Mobile Applications**
- React Native app for iOS and Android
- Offline functionality for mobile users
- Push notifications for real-time updates
- Camera integration for portfolio building

#### 2. **Advanced AI Features**
- Intelligent pricing recommendations
- Automated customer matching
- Predictive availability management
- Smart contract generation

#### 3. **API Ecosystem**
- Public APIs for third-party integrations
- Webhook system for external service connections
- Developer portal for API documentation
- Partner integration program

### Phase 3: Market Expansion (12-24 months)

#### 1. **Multi-Country Support**
- Support for international Hindu wedding markets
- Currency and timezone management
- Cultural customization for different regions
- International payment gateway support

#### 2. **Advanced Marketplace Features**
- Vendor rating and review system
- Service comparison tools
- Advanced search and filtering
- Premium vendor features

#### 3. **Enterprise Features**
- Multi-vendor management for large companies
- Advanced reporting and business intelligence
- Custom integration development
- Dedicated support and SLA guarantees

## 📈 Success Metrics and KPIs

### User Engagement Metrics
- **Daily Active Users (DAU)**: Target 1000+ DAU within 6 months
- **Session Duration**: Average session time > 10 minutes
- **Feature Adoption**: > 80% of users using core features
- **Retention Rate**: > 70% monthly retention rate

### Business Metrics
- **Vendor Acquisition**: 500+ active vendors within first year
- **Booking Volume**: 1000+ bookings processed monthly
- **Revenue Growth**: 200% YoY growth target
- **Customer Satisfaction**: > 4.5/5 average rating

### Technical Metrics
- **Performance**: < 2 second page load times
- **Uptime**: 99.9% service availability
- **Error Rate**: < 0.1% error rate in production
- **Scalability**: Support for 10k+ concurrent users

## 🔧 Maintenance and Operations

### Deployment Strategy

#### Continuous Integration/Deployment (CI/CD)
```yaml
# GitHub Actions Workflow
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy  # Deploy to Lovable
```

#### Monitoring and Alerting
- **Application Performance Monitoring**: Track page load times, API response times
- **Error Tracking**: Automated error collection and alerting
- **User Analytics**: Track user behavior and feature usage
- **Infrastructure Monitoring**: Database performance and storage monitoring

### Backup and Recovery

#### Data Backup Strategy
- **Database Backups**: Daily automated backups with 30-day retention
- **File Storage**: Redundant storage across multiple regions
- **Configuration Backup**: Version control for all configuration files
- **Recovery Testing**: Quarterly disaster recovery testing

#### Incident Response
- **Incident Management**: Structured process for handling production issues
- **Communication Plan**: Customer communication during outages
- **Post-Mortem Process**: Analysis and improvement after incidents
- **Escalation Procedures**: Clear escalation paths for critical issues

## 📚 Documentation Strategy

### Documentation Categories

1. **Developer Documentation**
   - API documentation with OpenAPI/Swagger
   - Component library documentation
   - Architecture decision records (ADRs)
   - Development setup and contribution guides

2. **User Documentation**
   - User guides for vendor and staff portals
   - Video tutorials for complex features
   - FAQ and troubleshooting guides
   - Best practices documentation

3. **Operational Documentation**
   - Deployment and maintenance guides
   - Monitoring and alerting setup
   - Backup and recovery procedures
   - Security and compliance documentation

### Documentation Tools
- **GitBook/MkDocs**: For structured documentation
- **Storybook**: For component documentation
- **Swagger/OpenAPI**: For API documentation
- **Confluence/Jira**: For project management and operational docs

## 🎉 Conclusion

Sanskara AI represents a comprehensive solution for Hindu wedding vendor management, combining modern web technologies with culturally sensitive design and AI-powered automation. The platform is built to scale from small vendor operations to large enterprise deployments while maintaining the flexibility to adapt to various wedding traditions and regional requirements.

The architecture emphasizes security, performance, and user experience while providing a solid foundation for future enhancements and market expansion. With careful attention to cultural nuances and modern development practices, Sanskara AI is positioned to become the leading platform for Hindu wedding vendor management.

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintainer**: Sanskara AI Development Team
