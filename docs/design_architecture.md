# Design Architecture and Customization Guide

## Design Philosophy

### Cultural Design Principles

Sanskara AI's design philosophy is deeply rooted in Indian cultural values while embracing modern design trends. The platform serves as a bridge between traditional Hindu wedding customs and contemporary digital experiences.

#### 1. **Cultural Sensitivity**
- **Color Psychology**: Warm earth tones (browns, golds, deep oranges) representing prosperity and tradition
- **Sacred Geometry**: Subtle incorporation of mandala patterns and paisley motifs
- **Typography**: Elegant serif fonts for headings to convey tradition, clean sans-serif for readability
- **Iconography**: Culturally relevant symbols adapted for digital interfaces

#### 2. **Accessibility and Inclusivity**
- **Multi-generational Design**: Interface suitable for all age groups
- **Regional Language Support**: Framework for multiple Indian languages
- **Cognitive Load**: Simplified workflows for complex wedding planning
- **Motor Accessibility**: Large touch targets and gesture-friendly interactions

## Component Architecture

### Design System Structure

```
design-system/
├── tokens/              # Design tokens (colors, typography, spacing)
├── components/          # Reusable UI components
├── patterns/            # Common UI patterns and layouts
├── utilities/           # Helper classes and utilities
└── guidelines/          # Design documentation and rules
```

### Color Token System

```css
/* Base Color Palette */
--color-primary-50: #fdf2f8;    /* Lightest pink */
--color-primary-100: #fce7f3;   /* Light pink */
--color-primary-200: #fbcfe8;   /* Lighter pink */
--color-primary-300: #f9a8d4;   /* Light pink */
--color-primary-400: #f472b6;   /* Medium pink */
--color-primary-500: #ec4899;   /* Primary pink */
--color-primary-600: #db2777;   /* Dark pink */
--color-primary-700: #be185d;   /* Darker pink */
--color-primary-800: #9d174d;   /* Darkest pink */
--color-primary-900: #831843;   /* Deep pink */

/* Semantic Colors */
--color-success: #10b981;       /* Success states */
--color-warning: #f59e0b;       /* Warning states */
--color-error: #ef4444;         /* Error states */
--color-info: #3b82f6;          /* Informational */

/* Neutral Colors */
--color-gray-50: #f9fafb;       /* Off-white */
--color-gray-100: #f3f4f6;      /* Light gray */
--color-gray-200: #e5e7eb;      /* Lighter gray */
--color-gray-300: #d1d5db;      /* Light gray */
--color-gray-400: #9ca3af;      /* Medium gray */
--color-gray-500: #6b7280;      /* Gray */
--color-gray-600: #4b5563;      /* Dark gray */
--color-gray-700: #374151;      /* Darker gray */
--color-gray-800: #1f2937;      /* Very dark gray */
--color-gray-900: #111827;      /* Almost black */
```

## Layout Architecture

### Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;     /* Small devices */
--breakpoint-md: 768px;     /* Tablets */
--breakpoint-lg: 1024px;    /* Laptops */
--breakpoint-xl: 1280px;    /* Desktops */
--breakpoint-2xl: 1536px;   /* Large screens */
```

### Grid System

```css
/* CSS Grid Layouts */
.vendor-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.staff-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}
```

## Component Customization

### 1. **Vendor Portal Customization**

#### Branding Customization
```typescript
interface VendorBranding {
  logo: File | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: 'primary' | 'secondary' | 'custom';
  customFontUrl?: string;
}
```

#### Dashboard Widget Customization
```typescript
interface DashboardCustomization {
  widgets: DashboardWidget[];
  layout: 'grid' | 'masonry' | 'list';
  columns: 1 | 2 | 3 | 4;
  widgetOrder: string[];
  visibility: {
    upcomingBookings: boolean;
    recentTasks: boolean;
    revenueChart: boolean;
    notifications: boolean;
  };
}
```

### 2. **Staff Portal Customization**

#### Role-Based Interface Customization
```typescript
interface StaffInterfaceCustomization {
  role: 'owner' | 'manager' | 'service_contact';
  accessibleFeatures: string[];
  dashboardLayout: StaffDashboardLayout;
  notificationPreferences: NotificationSettings;
  themePreferences: ThemeSettings;
}
```

#### Service-Specific Customization
```typescript
interface ServiceCustomization {
  serviceId: string;
  displaySettings: {
    showPortfolio: boolean;
    showPricing: boolean;
    showAvailability: boolean;
    customFields: CustomField[];
  };
  bookingSettings: {
    advanceBookingDays: number;
    cancellationPolicy: string;
    paymentTerms: PaymentTerms;
  };
}
```

## Theme System

### Light Theme Configuration

```css
/* Light Theme Variables */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
}
```

### Dark Theme Configuration

```css
/* Dark Theme Variables */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-primary: #334155;
  --border-secondary: #475569;
}
```

### Cultural Theme Variants

#### Diwali Theme
```css
[data-theme="diwali"] {
  --primary: #fbbf24;        /* Golden yellow */
  --secondary: #dc2626;      /* Deep red */
  --accent: #f59e0b;         /* Amber */
  --background: linear-gradient(135deg, #fef3c7, #fde68a);
}
```

#### Wedding Season Theme
```css
[data-theme="wedding"] {
  --primary: #be185d;        /* Deep pink */
  --secondary: #d97706;      /* Orange */
  --accent: #7c3aed;         /* Purple */
  --background: linear-gradient(135deg, #fdf2f8, #fce7f3);
}
```

## Typography System

### Font Hierarchy

```css
/* Heading Styles */
--font-display-2xl: 2.5rem;      /* Main page titles */
--font-display-xl: 2rem;         /* Section headers */
--font-display-lg: 1.75rem;      /* Subsection headers */
--font-display-md: 1.5rem;       /* Card titles */

/* Body Text */
--font-body-lg: 1.125rem;        /* Large body text */
--font-body-md: 1rem;            /* Standard body text */
--font-body-sm: 0.875rem;        /* Small body text */
--font-body-xs: 0.75rem;         /* Caption text */
```

### Responsive Typography

```css
/* Fluid Typography */
--font-size-fluid-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--font-size-fluid-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--font-size-fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--font-size-fluid-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
```

## Icon System

### Icon Categories

#### Navigation Icons
- **Dashboard**: Grid layout icon
- **Bookings**: Calendar with checkmark
- **Services**: Briefcase or tools icon
- **Staff**: Users or team icon
- **Tasks**: Checklist or clipboard
- **Payments**: Credit card or wallet
- **Settings**: Gear or cog icon

#### Status Icons
- **Success**: Checkmark in circle
- **Warning**: Exclamation triangle
- **Error**: X mark in circle
- **Info**: Information circle
- **Loading**: Spinner or hourglass

#### Cultural Icons
- **Mandala**: Decorative circular pattern
- **Paisley**: Traditional Indian motif
- **Diya**: Oil lamp symbol
- **Om Symbol**: Sacred Sanskrit character

## Spacing and Layout System

### Spacing Scale

```css
/* Consistent Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### Layout Patterns

#### Card Layouts
```css
.vendor-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease-in-out;
}

.vendor-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

#### Form Layouts
```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.form-section {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}
```

## Animation and Interaction Design

### Micro-interactions

#### Button Interactions
```css
.btn-primary {
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.btn-primary:active::before {
  width: 300px;
  height: 300px;
}
```

#### Loading States
```css
.skeleton-loader {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Customization Framework

### 1. **Runtime Customization**

#### Dynamic Theme Switching
```typescript
const ThemeContext = createContext<{
  currentTheme: string;
  setTheme: (theme: string) => void;
  customizations: CustomizationSettings;
  updateCustomization: (key: string, value: any) => void;
}>();
```

#### Component-Level Customization
```typescript
interface CustomizableComponentProps {
  customization?: ComponentCustomization;
  className?: string;
  children?: React.ReactNode;
}

const CustomizableCard: React.FC<CustomizableComponentProps> = ({
  customization,
  className,
  children
}) => {
  const customStyles = applyCustomization(customization);

  return (
    <div
      className={cn('vendor-card', className)}
      style={customStyles}
    >
      {children}
    </div>
  );
};
```

### 2. **Database-Driven Customization**

#### Vendor-Specific Settings
```sql
-- Vendor Customization Table
CREATE TABLE vendor_customizations (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(vendor_id),
  branding JSONB DEFAULT '{}',
  dashboard_settings JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### Staff-Specific Settings
```sql
-- Staff Customization Table
CREATE TABLE staff_customizations (
  staff_id UUID PRIMARY KEY REFERENCES vendor_staff(staff_id),
  interface_preferences JSONB DEFAULT '{}',
  dashboard_layout JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  theme_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Optimization

### Design Performance Considerations

#### 1. **Image Optimization**
- **Lazy Loading**: Images load only when in viewport
- **Responsive Images**: Multiple sizes for different screen sizes
- **WebP Format**: Modern image format with fallbacks
- **Image CDN**: Fast global delivery

#### 2. **Font Loading Optimization**
- **Font Display**: Swap strategy for faster text rendering
- **Font Subsetting**: Only load required characters
- **Fallback Fonts**: System fonts for immediate rendering

#### 3. **CSS Optimization**
- **Critical CSS**: Inline critical styles for faster rendering
- **CSS Splitting**: Separate component styles for code splitting
- **CSS Purging**: Remove unused styles in production

## Accessibility Features

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence through interface
- **Focus Indicators**: Visible focus states for all interactive elements
- **Skip Links**: Quick navigation to main content areas
- **Keyboard Shortcuts**: Power user keyboard combinations

#### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for complex interactions
- **Live Regions**: Dynamic content announcements
- **Alternative Text**: Descriptive alt text for all images

#### Visual Accessibility
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text
- **Focus Indicators**: High contrast focus states
- **Reduced Motion**: Respects user's motion preferences
- **Scalable Text**: Supports up to 200% zoom without horizontal scrolling

## Cultural Adaptations

### Regional Customization

#### Language and Locale Support
```typescript
interface LocaleSettings {
  language: 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  currency: 'INR' | 'USD' | 'EUR';
  numberFormat: '1,23,456.78' | '123,456.78';
  timeZone: string;
}
```

#### Cultural Calendar Integration
- **Hindu Calendar**: Important festival and auspicious dates
- **Regional Holidays**: State-specific holiday calculations
- **Muhurat Times**: Auspicious timing recommendations
- **Festival-Based Pricing**: Dynamic pricing for festival seasons

### Religious and Traditional Considerations

#### Ritual-Specific Features
- **Puja Timing**: Auspicious timing for ceremonies
- **Traditional Services**: Categorization for traditional services
- **Cultural Sensitivity**: Appropriate imagery and terminology
- **Regional Customs**: Support for different wedding traditions

## Future Enhancement Plans

### Advanced Customization Features

#### 1. **AI-Powered Personalization**
- **Usage Pattern Analysis**: Automatic interface optimization
- **Predictive Customization**: Suggest layout improvements
- **Smart Defaults**: Context-aware default settings

#### 2. **Advanced Theme Builder**
- **Visual Theme Editor**: Drag-and-drop theme customization
- **Color Palette Generator**: AI-powered color scheme suggestions
- **Template Marketplace**: Pre-built customization templates

#### 3. **Integration Customization**
- **API Connectors**: Custom third-party integrations
- **Webhook Builder**: Visual webhook configuration
- **Data Mapping**: Custom field mapping interfaces

### Performance Enhancements

#### 1. **Progressive Web App (PWA)**
- **Offline Functionality**: Core features work without internet
- **App-like Experience**: Native app installation and behavior
- **Background Sync**: Data synchronization when online

#### 2. **Advanced Caching**
- **Service Worker Caching**: Intelligent asset caching
- **API Response Caching**: Smart data caching strategies
- **Image Optimization**: Automatic format conversion and compression

## Conclusion

The design architecture of Sanskara AI represents a harmonious blend of modern web design principles with deep cultural sensitivity. The system is built to be:

- **Culturally Authentic**: Reflecting Indian wedding traditions and values
- **Highly Customizable**: Adapting to individual vendor and staff preferences
- **Technically Advanced**: Leveraging modern web technologies for optimal performance
- **Accessibility Focused**: Ensuring usability for all users regardless of abilities
- **Future-Ready**: Designed to evolve with changing needs and technologies

This comprehensive design system serves as the foundation for a platform that not only meets current requirements but also scales gracefully to accommodate future enhancements and cultural adaptations.
