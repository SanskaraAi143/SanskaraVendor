# Process Flows Documentation

## Overview

This document details the complete process flows for all major user journeys in the Sanskara AI platform, including edge cases, error handling, and alternative paths.

## 1. Vendor Onboarding Process Flow

### 1.1 Standard Onboarding Flow

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

### 1.2 Alternative Paths

#### Path A: Manual Onboarding Only
```
Welcome Step -> Manual Onboarding -> Completion Step
     ↑              ↓                    ↓
     └─── Choose Mode ←── Biodata Upload ←───
```

#### Path B: AI Assistance Failure
```
AI Chat Assistance -> Fallback to Manual -> Human Review Required
```

### 1.3 Edge Cases and Error Handling

#### Database Connection Failure
- Graceful degradation to read-only mode
- Queue data for later sync
- Notify user of temporary limitations

#### File Upload Failure
- Retry mechanism with exponential backoff
- Alternative upload methods (direct URL, email)
- Progress tracking and resume capability

#### Validation Errors
- Real-time validation feedback
- Contextual help and suggestions
- Auto-save draft progress

## 2. Staff Invitation and Onboarding Flow

### 2.1 Complete Invitation Flow

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
└─────────────┘    └─────────────┘    └─────────────┘
        │
        v
┌─────────────┐    ┌─────────────┐
│  Staff      │ <- │  Vendor     │
│  Login      │    │  Approves   │
└─────────────┘    └─────────────┘
```

### 2.2 Alternative Scenarios

#### Scenario A: Email Delivery Failure
- SMS fallback mechanism
- Manual invitation code generation
- QR code invitation option

#### Scenario B: Account Already Exists
- Link existing account to vendor
- Merge profile information
- Role assignment and permissions

#### Scenario C: Vendor Approval Delay
- Reminder system for pending approvals
- Escalation to vendor owner
- Temporary access with limited permissions

## 3. Booking Management Process Flow

### 3.1 Standard Booking Flow

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

### 3.2 Complex Booking Scenarios

#### Multi-Service Bookings
```
Customer Request -> Service Selection -> Vendor Coordination -> Combined Booking
        ↓                    ↓                    ↓                    ↓
   Individual Services ←─── Validation ←───── Pricing ←───────────── Contract
```

#### Booking Modifications
```
Existing Booking -> Modification Request -> Impact Assessment -> Approval/Rejection
        ↓                    ↓                    ↓                    ↓
   Notify Affected ←───── Check Conflicts ←─── Update Tasks ←───── Confirm Changes
        ↓
   Staff Members
```

## 4. Payment Processing Flow

### 4.1 Standard Payment Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Customer   │ -> │   Payment   │ -> │   Vendor    │
│  Initiates  │    │  Gateway    │    │  Notified   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                │                     │
        │                │                     v
        v                v           ┌─────────────┐
┌─────────────┐    ┌─────────────┐    │ Commission  │
│  Platform   │ <- │  Webhook    │ <- │ Calculation │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 4.2 Alternative Payment Methods

#### Offline Payment Confirmation
```
Customer Pays Offline -> Vendor Reports -> Platform Verification -> Commission Release
        ↓                       ↓                       ↓                       ↓
   Proof of Payment ←─── Update Records ←───────── Validate ←───────────── Notify
```

#### Payment Failure Handling
```
Payment Attempt -> Failure Detected -> Retry Logic -> Alternative Methods
        ↓               ↓               ↓               ↓
   User Notification ←─ Analyze Cause ←─ Auto Retry ←─ Manual Intervention
```

## 5. Task Management Flow

### 5.1 Automated Task Creation

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Booking    │ -> │   Template  │ -> │   Generate  │
│ Confirmed   │    │   Matching  │    │    Tasks    │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Assign    │ -> │   Notify    │ -> │   Track     │
│    Staff    │    │   Staff     │    │  Progress   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 5.2 Manual Task Management

#### Task Creation
```
User Identifies Need -> Create Task -> Assign Staff -> Set Deadlines -> Monitor Progress
        ↓                       ↓                       ↓                       ↓
   Define Requirements ←─── Add Details ←───────────── Configure ←───────────── Alerts
```

#### Task Dependencies
```
Task A (Pre-requisite) -> Task B -> Task C (Dependent)
        ↓                       ↓                       ↓
   Must Complete ←───────── Blocks ←───────── Cannot Start
```

## 6. Notification System Flow

### 6.1 Real-time Notification Processing

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Event     │ -> │ Notification│ -> │   Deliver   │
│ Occurs      │    │  Generator  │    │   Channel   │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   In-App    │    │    Email    │    │   WhatsApp  │
│Notification │    │Notification │    │  (Future)   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 6.2 Notification Types and Triggers

#### System Notifications
- **Booking Status Changes**: Confirmation, cancellation, modifications
- **Payment Updates**: Successful payments, failures, refunds
- **Task Reminders**: Due date approaching, overdue tasks
- **Staff Assignments**: New task assignments, role changes

#### User-Generated Notifications
- **Custom Messages**: Direct communication between users and vendors
- **Review Requests**: Automated review solicitation after service completion
- **Follow-up Reminders**: Scheduled follow-ups and check-ins

## 7. Error Handling and Recovery Flows

### 7.1 Network Connectivity Issues

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │ -> │   Detect    │ -> │   Queue     │
│   Action    │    │  Offline    │    │   Actions   │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Connection │ <- │   Sync      │ <- │   Retry     │
│ Restored    │    │   When      │    │  Failed     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 7.2 Data Validation Failures

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Invalid   │ -> │   Provide   │ -> │   Correct   │
│    Data     │    │  Feedback   │    │    Data     │
└─────────────┘    └─────────────┘    └─────────────┘
        │                │                     │
        │                │                     v
        v                v           ┌─────────────┐
┌─────────────┐    ┌─────────────┐    │   Accept    │
│   Reject    │ <- │   Validate  │ <- │   Changes   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 8. Authentication and Authorization Flows

### 8.1 Login Process

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Enter     │ -> │   Validate  │ -> │   Redirect  │
│Credentials  │    │Credentials  │    │   To Role   │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vendor    │    │    Staff    │    │  Customer   │
│  Dashboard  │    │  Dashboard  │    │  Dashboard  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 8.2 Password Reset Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Forgot     │ -> │   Send      │ -> │   Enter    │
│ Password    │    │   Reset     │    │    Code     │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Validate  │ -> │   Set New   │ -> │   Confirm   │
│    Code     │    │  Password   │    │   Reset     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 9. Data Synchronization Flows

### 9.1 Real-time Data Sync

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Database  │ -> │   Real-time │ -> │   Update    │
│   Change    │    │ Subscription│    │    UI       │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Invalidate │ -> │   Refresh   │ -> │   Display   │
│   Cache     │    │    Data     │    │   Changes   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 9.2 Batch Synchronization

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Collect   │ -> │   Process   │ -> │   Update    │
│   Changes   │    │    Batch    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Notify    │ <- │   Validate  │ <- │   Success   │
│   Clients   │    │   Changes   │    │  Response   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 10. File Upload and Management Flows

### 10.1 Image Upload Process

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Select    │ -> │   Validate  │ -> │   Upload    │
│    File     │    │    File     │    │    File     │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Generate  │ -> │   Store     │ -> │   Update    │
│  Thumbnail  │    │   Metadata  │    │    UI       │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 10.2 Portfolio Management

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │ -> │   Organize  │ -> │   Publish   │
│   Images    │    │    Images   │    │  Portfolio  │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Tag       │ -> │   Set       │ -> │   Share     │
│   Images    │    │  Visibility │    │  Portfolio  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 11. Analytics and Reporting Flows

### 11.1 Data Collection

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │ -> │   Track     │ -> │   Store     │
│   Activity  │    │   Events    │    │    Data     │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Process   │ -> │   Aggregate │ -> │   Generate  │
│    Data     │    │    Data     │    │   Reports   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 11.2 Report Generation

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │ -> │   Query     │ -> │   Format    │
│   Report    │    │    Data     │    │    Data     │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Generate  │ -> │   Cache     │ -> │   Deliver   │
│   Visuals   │    │   Report    │    │    Report   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 12. System Maintenance Flows

### 12.1 Database Maintenance

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Schedule  │ -> │   Perform   │ -> │   Verify    │
│Maintenance  │    │Maintenance  │    │   Backup    │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Optimize  │ -> │   Clean     │ -> │   Monitor   │
│   Indexes   │    │    Data     │    │   System    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 12.2 Security Updates

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Identify  │ -> │   Test      │ -> │   Deploy    │
│  Security   │    │   Updates   │    │   Updates   │
└─────────────┘    └─────────────┘    └─────────────┘
                                           │
                                           v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Monitor   │ <- │   Validate  │ <- │   Rollback  │
│   System    │    │ Deployment  │    │    If       │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Conclusion

This comprehensive process flow documentation covers all major user journeys and system processes in the Sanskara AI platform. Each flow includes standard paths, alternative scenarios, and error handling mechanisms to ensure robust and reliable operation.

The flows are designed to be:
- **User-Centric**: Focused on providing smooth user experiences
- **Error-Resilient**: Including fallback mechanisms and recovery options
- **Scalable**: Supporting future growth and feature additions
- **Maintainable**: Clear and well-documented for future development

All flows are regularly reviewed and updated as the platform evolves, ensuring continued alignment with user needs and business objectives.
