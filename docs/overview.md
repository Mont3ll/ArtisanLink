# ArtisanLink Platform

## Executive Summary

ArtisanLink is a specialized digital marketplace designed to connect clients with skilled, local artisans in Kenya. The platform facilitates discovery through a map-based interface and provides artisans with the tools to manage their professional presence, portfolio, and availability. With distinct roles for Clients, Artisans, and Administrators, ArtisanLink aims to streamline the process of hiring local talent, ensure trust through a verification process, and provide a seamless user experience from search to contact.

## System Value Proposition

1.  **Localized Discovery**: Enables clients to easily find and locate local artisans through an intuitive map-based search.
2.  **Verified Professionals**: Builds trust by requiring artisans to submit a certificate of code of conduct and manage a professional portfolio.
3.  **Direct Communication**: Facilitates direct contact between clients and artisans through an integrated messaging system.
4.  **Empowered Artisans**: Provides artisans with a personal portal to manage their profile, showcase their work, and control their availability.
5.  **Integrated Local Payments**: Incorporates **M-Pesa**, Kenya's leading mobile payment system, for seamless artisan subscriptions.
6.  **Centralized Management**: Offers administrators robust tools to manage users, oversee M-Pesa subscriptions, and maintain platform integrity.

## Core System Features

### 1. Client Module

- **Functions**:

  - User registration (name, email, password, phone).
  - Email verification via a one-time password (OTP).
  - Search for artisans on an interactive map.
  - View artisan profiles and work portfolios.
  - Contact artisans directly through the application.

- **Data Points Collected**:

  - Client contact information.
  - Search history and location data.
  - Communication logs with artisans.

- **Outputs**:
  - A personalized home page with a map view of available artisans.
  - Direct messaging channel with selected artisans.

### 2. Artisan Module

- **Functions**:

  - User registration (name, email, password, profession).
  - Email verification via OTP.
  - Submission of a "Certificate of Code of Conduct" for verification.
  - Subscription payment via **M-Pesa** (monthly/annual).
  - A dedicated portal to manage personal information and upload/update "works" (portfolio).
  - Set availability status (on/off) to appear on the client-facing map.

- **Data Points Collected**:

  - Artisan professional details (profession, bio).
  - Geographic location (for map plotting).
  - Portfolio items (images, descriptions of work).
  - Certificate of Code of Conduct (file upload).
  - Availability status (boolean: on/off).
  - M-Pesa subscription status and history.

- **Outputs**:
  - A public, professional profile page.
  - A portfolio showcasing their work.
  - Visibility on the client map when availability is set to "on."

### 3. Admin Module

- **Functions**:

  - Secure login to the administration panel.
  - Full user management (view, verify, manage both Clients and Artisans).
  - Subscription management (view active subscriptions, confirm M-Pesa payments).
  - System settings configuration.
  - Content moderation (e.g., approving certificates and portfolio items).

- **Data Points Collected**:

  - System-wide user data.
  - M-Pesa transaction logs for subscriptions.
  - Artisan verification statuses.
  - Platform activity logs.

- **Outputs**:
  - A comprehensive dashboard for platform oversight.
  - Tools to manage the user lifecycle.
  - Reports on subscriptions and user growth.

## System Integration Components

### User-Facing Interfaces

- **Web Application**: A fully responsive web app built with Next.js for all user roles.
- **Client Portal**: A map-centric interface for finding and contacting artisans.
- **Artisan Portal**: A personalized dashboard for artisans to manage their profile, portfolio, and availability.

### Administrative Dashboard

- **Admin Panel**: A secure, centralized interface for platform management, user administration, and subscription oversight.

### System Interoperability

- **Authentication**: Integration with Clerk for secure, OTP-enabled user registration and login.
- **Mapping Services**: Integration with a mapping library (e.g., Mapbox, Leaflet).
- **Payment Gateway**: Integration with **Safaricom's M-Pesa Daraja API** to handle mobile money subscriptions.
- **API Documentation**: OpenAPI (Swagger) for clear documentation of internal APIs.
