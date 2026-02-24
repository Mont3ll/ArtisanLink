# ArtisanLink - System Architecture

This document describes the technical architecture of the ArtisanLink platform using Mermaid diagrams.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [API Architecture](#api-architecture)
5. [Component Architecture](#component-architecture)
6. [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Client Browser"]
        UI["React 19 UI"]
        RQ["React Query"]
    end

    subgraph NextJS["Next.js 16 Application"]
        subgraph AppRouter["App Router"]
            Pages["Page Components"]
            Layouts["Layouts"]
        end
        
        subgraph API["API Routes"]
            ClientAPI["Client APIs"]
            ArtisanAPI["Artisan APIs"]
            AdminAPI["Admin APIs"]
            PaymentAPI["Payment APIs"]
        end
        
        Proxy["Proxy (Auth Middleware)"]
    end

    subgraph ExternalServices["External Services"]
        Clerk["Clerk Auth"]
        Cloudinary["Cloudinary CDN"]
        Mapbox["Mapbox Maps"]
        MPesa["M-Pesa API"]
    end

    subgraph Database["Database Layer"]
        Prisma["Prisma ORM"]
        PostgreSQL[("PostgreSQL 15")]
    end

    UI --> RQ
    RQ --> API
    Pages --> UI
    Proxy --> AppRouter
    API --> Prisma
    Prisma --> PostgreSQL
    
    UI --> Clerk
    API --> Clerk
    UI --> Cloudinary
    UI --> Mapbox
    PaymentAPI --> MPesa
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Profile : has
    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Conversation : "participates as client"
    User ||--o{ Conversation : "participates as artisan"
    User ||--o{ Review : writes
    User ||--o{ SavedArtisan : saves
    User ||--o{ Job : "requests as client"
    User ||--o{ Job : "works as artisan"
    User ||--o{ ArtisanPayout : receives
    User ||--o{ Notification : has
    User ||--o| NotificationPreferences : has
    User ||--o{ SearchHistory : has
    
    Profile ||--o{ PortfolioItem : contains
    Profile ||--o{ Specialization : has
    Profile ||--o| Subscription : has
    Profile ||--o{ Review : receives
    Profile ||--o{ SavedArtisan : "saved by"
    Profile ||--o{ VerificationHistory : has
    
    Subscription ||--o{ Payment : has
    
    Conversation ||--o{ Message : contains
    Conversation ||--o{ Job : creates
    
    Job ||--o{ Quote : has
    Job ||--o{ JobPayment : has
    Job ||--o{ ArtisanPayout : generates
    Job ||--o{ PlatformEarning : generates
    
    Quote ||--o{ QuoteLineItem : contains

    User {
        string id PK
        string clerkId UK
        string email UK
        string firstName
        string lastName
        string phone
        enum role
        enum status
    }
    
    Profile {
        string id PK
        string userId FK
        string profession
        float hourlyRate
        enum artisanStatus
        float averageRating
        int totalReviews
    }
    
    Job {
        string id PK
        string clientId FK
        string artisanId FK
        string title
        float agreedPrice
        enum status
    }
    
    Quote {
        string id PK
        string jobId FK
        float amount
        enum status
        int round
    }
    
    Review {
        string id PK
        string profileId FK
        string clientId FK
        int rating
        string comment
        boolean isApproved
    }
```

### Core Models Relationships

```mermaid
flowchart LR
    subgraph Users
        User
        Profile
    end
    
    subgraph Jobs
        Job
        Quote
        QuoteLineItem
        JobPayment
    end
    
    subgraph Payments
        ArtisanPayout
        PlatformEarning
        Subscription
        Payment
    end
    
    subgraph Communication
        Conversation
        Message
        Notification
    end
    
    subgraph Discovery
        Review
        SavedArtisan
        SearchHistory
        PortfolioItem
    end
    
    User --> Profile
    User --> Job
    Job --> Quote
    Quote --> QuoteLineItem
    Job --> JobPayment
    JobPayment --> ArtisanPayout
    JobPayment --> PlatformEarning
    Profile --> Subscription
    Subscription --> Payment
    User --> Conversation
    Conversation --> Message
    User --> Notification
    Profile --> Review
    Profile --> PortfolioItem
    User --> SavedArtisan
    User --> SearchHistory
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Clerk
    participant P as Proxy
    participant API as API Routes
    participant DB as PostgreSQL

    U->>C: Sign in/Sign up
    C->>C: Authenticate user
    C->>U: Return session token
    
    U->>P: Request protected route
    P->>C: Verify session
    C->>P: Session valid + userId
    
    alt User exists in DB
        P->>API: Forward request
        API->>DB: Query with userId
        DB->>API: Return data
        API->>U: Response
    else New user (first login)
        P->>API: POST /api/user/sync
        API->>DB: Create User record
        DB->>API: User created
        API->>U: Redirect to dashboard
    end
```

---

## API Architecture

### API Route Structure

```mermaid
flowchart TB
    subgraph PublicAPIs["Public APIs"]
        Search["/api/search/artisans"]
        Health["/api/health"]
        ArtisanReviews["/api/artisans/[id]/reviews"]
    end
    
    subgraph AuthenticatedAPIs["Authenticated APIs"]
        subgraph ClientAPIs["/api/client/*"]
            Jobs1["jobs/"]
            SavedArtisans["saved-artisans/"]
            SearchHist["search-history/"]
            ClientStats["stats/"]
        end
        
        subgraph ArtisanAPIs["/api/artisan/*"]
            Profile["profile/"]
            Portfolio["portfolio/"]
            Jobs2["jobs/"]
            Earnings["earnings/"]
            Payments["payments/"]
        end
        
        subgraph SharedAPIs["Shared APIs"]
            Reviews["/api/reviews"]
            Conversations["/api/conversations"]
            Notifications["/api/notifications"]
            User["/api/user"]
        end
    end
    
    subgraph AdminAPIs["/api/admin/*"]
        Users["users/"]
        Verification["verification/"]
        Moderation["moderation/"]
        Analytics["analytics/"]
        Payouts["payouts/"]
        Settings["settings/"]
    end
    
    subgraph PaymentAPIs["/api/payments/*"]
        MpesaInit["mpesa/initiate"]
        MpesaCb["mpesa/callback"]
        JobInit["job/initiate"]
        JobCb["job/callback"]
        B2CResult["b2c/result"]
    end
    
    subgraph CronAPIs["/api/cron/*"]
        ProcessPayouts["process-payouts"]
        Subscriptions["subscriptions"]
    end
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Proxy
    participant APIRoute as API Route
    participant Prisma
    participant Database
    participant External as External Service

    Client->>Proxy: HTTP Request
    Proxy->>Proxy: Auth check (Clerk)
    
    alt Unauthenticated
        Proxy->>Client: 401 Unauthorized
    else Authenticated
        Proxy->>APIRoute: Forward request
        APIRoute->>APIRoute: Validate request body (Zod)
        
        alt Validation failed
            APIRoute->>Client: 400 Bad Request
        else Validation passed
            APIRoute->>Prisma: Database query
            Prisma->>Database: SQL
            Database->>Prisma: Result
            Prisma->>APIRoute: Typed result
            
            opt External service needed
                APIRoute->>External: API call
                External->>APIRoute: Response
            end
            
            APIRoute->>Client: JSON Response
        end
    end
```

---

## Component Architecture

### Frontend Component Hierarchy

```mermaid
flowchart TB
    subgraph Layout["Root Layout"]
        ThemeProvider
        QueryProvider["TanStack Query Provider"]
        ClerkProvider
        ToastProvider["Sonner Toast"]
    end
    
    subgraph DashboardLayouts["Dashboard Layouts"]
        AdminLayout["Admin Layout"]
        ArtisanLayout["Artisan Layout"]
        ClientLayout["Client Layout"]
    end
    
    subgraph SharedComponents["Shared Components"]
        Sidebar["Dashboard Sidebar"]
        Header["Dashboard Header"]
        NotificationBell
        UserButton
    end
    
    subgraph UIComponents["UI Components (shadcn)"]
        Button
        Card
        Dialog
        Form
        Table
        Select
        Input
    end
    
    subgraph FeatureComponents["Feature Components"]
        ArtisanSearch
        JobRequestDialog
        QuoteBuilder
        PaymentDialog
        ReviewForm
        PortfolioGrid
    end
    
    Layout --> DashboardLayouts
    DashboardLayouts --> SharedComponents
    SharedComponents --> UIComponents
    FeatureComponents --> UIComponents
```

### State Management

```mermaid
flowchart LR
    subgraph ServerState["Server State (React Query)"]
        UserData["User Data"]
        Jobs["Jobs"]
        Reviews["Reviews"]
        Notifications["Notifications"]
    end
    
    subgraph ClientState["Client State (React)"]
        FormState["Form State"]
        UIState["UI State (modals, tabs)"]
        FilterState["Filter/Search State"]
    end
    
    subgraph Hooks["Custom Hooks"]
        useUser
        useJobs
        useReviews
        useMobile
    end
    
    ServerState --> Hooks
    ClientState --> Hooks
    Hooks --> Components["React Components"]
```

---

## Deployment Architecture

### Production Setup

```mermaid
flowchart TB
    subgraph Internet["Internet"]
        Users["Users"]
    end
    
    subgraph CDN["CDN Layer"]
        Vercel["Vercel Edge Network"]
        CloudinaryCDN["Cloudinary CDN"]
    end
    
    subgraph Application["Application Layer"]
        NextApp["Next.js Application"]
    end
    
    subgraph Database["Database Layer"]
        PG[("PostgreSQL")]
        PrismaAccelerate["Prisma Accelerate"]
    end
    
    subgraph External["External Services"]
        Clerk["Clerk"]
        Safaricom["Safaricom M-Pesa"]
        Mapbox["Mapbox"]
    end
    
    Users --> Vercel
    Users --> CloudinaryCDN
    Vercel --> NextApp
    NextApp --> PrismaAccelerate
    PrismaAccelerate --> PG
    NextApp --> Clerk
    NextApp --> Safaricom
    NextApp --> Mapbox
```

### Environment Configuration

```mermaid
flowchart LR
    subgraph Environments
        Dev["Development"]
        Staging["Staging"]
        Prod["Production"]
    end
    
    subgraph Config["Configuration"]
        EnvVars[".env files"]
        Secrets["Vercel Secrets"]
    end
    
    subgraph Services["Service Configs"]
        DBConfig["Database URLs"]
        APIKeys["API Keys"]
        Webhooks["Webhook URLs"]
    end
    
    Environments --> Config
    Config --> Services
```

---

## Security Architecture

```mermaid
flowchart TB
    subgraph Layers["Security Layers"]
        L1["Layer 1: Edge (Vercel)"]
        L2["Layer 2: Proxy (Auth)"]
        L3["Layer 3: API Routes"]
        L4["Layer 4: Database"]
    end
    
    subgraph Controls["Security Controls"]
        Auth["Authentication (Clerk)"]
        RBAC["Role-Based Access"]
        Validation["Input Validation (Zod)"]
        RateLimit["Rate Limiting"]
        Encryption["Data Encryption"]
    end
    
    L1 --> L2 --> L3 --> L4
    
    L1 -.-> RateLimit
    L2 -.-> Auth
    L3 -.-> RBAC
    L3 -.-> Validation
    L4 -.-> Encryption
```

---

## Monitoring & Observability

```mermaid
flowchart LR
    subgraph Application
        Logs["Console Logs"]
        Errors["Error Handling"]
        Metrics["Performance Metrics"]
    end
    
    subgraph Monitoring
        HealthCheck["/api/health"]
        DBStats["/api/admin/database/stats"]
        SystemMon["/api/admin/system/monitoring"]
    end
    
    subgraph Analytics
        ActivityLogs["Activity Logs"]
        AdminDashboard["Admin Analytics"]
    end
    
    Application --> Monitoring
    Application --> Analytics
```
