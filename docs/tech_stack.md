# ArtisanLink Platform

## Technical Stack Documentation

### Executive Summary

This document specifies the technical stack for the ArtisanLink platform. The stack is chosen to facilitate rapid prototype development within a 4-6 week timeframe by a two-person team (Brad, Backend Engineer; Eugene 'Doc', Frontend Developer). It leverages a modern, cohesive set of technologies that prioritize security, user experience, and the specific functional requirements of the platform for the Kenyan market, including M-Pesa integration.

### Stack Overview

| Component        | Technology                        | Rationale                                    |
| ---------------- | --------------------------------- | -------------------------------------------- |
| Frontend         | Next.js 14                        | SEO for artisan profiles, performance, SSR   |
| UI Framework     | Tailwind CSS + shadcn/ui          | Rapid, utility-first, accessible components  |
| Mapping          | Mapbox / Leaflet.js               | Core functionality for artisan discovery     |
| Animation        | GSAP                              | High-performance, engaging UI animations     |
| Backend          | Next.js API Routes                | Unified codebase, serverless deployment      |
| Authentication   | Clerk                             | Fast, secure, OTP, and managed user profiles |
| Database         | PostgreSQL                        | Robust, supports geospatial data (PostGIS)   |
| ORM              | Prisma                            | Type-safe, modern database toolkit           |
| API Specs        | Swagger (OpenAPI)                 | Automated, clear API documentation           |
| Containerization | Docker                            | Consistent local development environment     |
| Payment Gateway  | **M-Pesa (Safaricom Daraja API)** | Primary payment method in Kenya              |

## Detailed Technology Recommendations

### 1. Frontend & UI

#### Next.js 14, Tailwind CSS, shadcn/ui, GSAP, Mapbox/Leaflet.js

**Recommendation Rationale:**
This frontend stack is ideal for **Eugene 'Doc'** to build a highly interactive and responsive user interface. Mapbox integration will be a key part of the frontend work, providing the core discovery experience for clients.

### 2. Backend & Database

#### Next.js API Routes, Clerk, PostgreSQL with Docker, Prisma

**Recommendation Rationale:**
This backend stack provides **Brad** with a powerful and efficient environment. PostgreSQL with the PostGIS extension is crucial for handling artisan location data. Prisma and Next.js API Routes will allow for rapid development of the required backend logic.

### 3. Tooling and Integrations

#### M-Pesa (Safaricom Daraja API)

**Recommendation Rationale:**

- **Market Requirement**: M-Pesa is the ubiquitous mobile payment service in Kenya. Supporting it is non-negotiable for a product targeting this market.
- **Direct Integration**: The Daraja API allows for direct integration with the platform's backend.
- **User Experience**: The "STK Push" functionality allows the backend to send a payment prompt directly to the artisan's phone, creating a seamless subscription experience.
- **Confirmation**: The API provides callbacks (webhooks) that the backend will use to listen for successful payment notifications and automatically update the artisan's subscription status. This will be a key integration task for **Brad**.

### Phased Implementation Recommendation

1.  **Phase 1: Prototype (Weeks 1-6)**

    - Core platform setup with user registration (Client, Artisan) and OTP verification.
    - Map-based discovery of artisans and profile management.
    - **Simplified Subscription**: A subscription status flag in the database, manually toggled by the Admin to simulate a successful payment. Full API integration is deferred.

2.  **Phase 2: Monetization & Verification (Months 2-3)**

    - Full backend integration with the **M-Pesa Daraja API** to automate the artisan subscription process.
    - Admin workflow for verifying "Certificate of Code of Conduct."

3.  **Phase 3: Feature Expansion (Months 4-5)**
    - Build out the "Sourcing Section" for suppliers.
    - Advanced search filters for the map.
    - Artisan rating and review system.

## Conclusion

This technical stack is robust yet agile, providing the team with the best tools to build the ArtisanLink prototype quickly. It directly addresses all core features, including the critical requirement for M-Pesa payments, while laying a clear foundation for future automation and expansion.
