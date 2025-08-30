# ArtisanLink Platform

# Implementation Timeline and Procedure

**Project:** ArtisanLink Platform
**Objective:** Develop and deploy a working prototype within 6 weeks.
**Developers:** Brad (Backend Engineer), Eugene 'Doc' (Frontend Developer)
**Date:** 2025-08-05

## Executive Summary

This document outlines an intensive 6-week plan to build a functional prototype of the ArtisanLink platform. The timeline is tailored for a two-person team and prioritizes the core user stories: client discovery via a map, artisan profile management, and admin oversight. Full automation of M-Pesa payments is deferred to a later phase to ensure the core product loop is validated first.

## Prototype Scope Definition

### Included in Prototype:

- Client and Artisan registration with OTP email verification.
- A home page for clients featuring a map to locate artisans.
- Artisans can set their location, manage a portfolio, and toggle their availability.
- **Simplified Subscriptions**: An "isSubscribed" flag on the Artisan model, manually toggled by the Admin to simulate a successful M-Pesa payment.
- Basic Admin dashboard to view and manage users.

### Deferred for Future Phases:

- Full **M-Pesa Daraja API integration** for automated subscriptions.
- Automated approval workflow for certificates.
- The "Sourcing Section" for suppliers.
- Real-time notifications and in-app messaging.

## Implementation Timeline

### Week 1: Project Setup & Data Foundations (Aug 4 - Aug 10, 2025)

#### Tasks:

- [ ] Project Kickoff: Align on prototype scope and developer roles.
- [ ] Initialize Next.js project; Set up Docker with PostgreSQL (and PostGIS).
- [ ] Prisma Schema: Define models for `User`, `Profile`, `PortfolioItem`, etc.
- [ ] Clerk Integration: Set up user registration and login flows with OTP.
- [ ] Set up GitHub repository.
- [ ] Define initial API specs in Swagger for Users and Profiles.

#### Deliverables:

- Running local environment.
- Finalized Prisma schema and initial database migration.
- Users can register and log in via an OTP code sent to their email.

#### Team Focus:

- **Brad (Backend)**: Backend setup, Docker, Prisma/PostGIS, Clerk OTP logic.
- **Eugene 'Doc' (Frontend)**: Frontend project setup, core layout, UI components (Shadcn/UI).

---

### Week 2: Artisan Portal & Map Data API (Aug 11 - Aug 17, 2025)

#### Tasks:

- [ ] **Backend**: Develop API routes for Artisans to update their profile, upload images, and toggle availability.
- [ ] **Backend**: Create the key API endpoint: `GET /api/artisans/map`.
- [ ] **Frontend**: Build the Artisan's private portal/dashboard.
- [ ] **Frontend**: Implement forms for profile editing and a gallery manager for their "works".

#### Deliverables:

- A functional Artisan dashboard where they can manage their profile.
- An API endpoint that provides the necessary data for the client-facing map.

#### Team Focus:

- **Brad (Backend)**: All backend API development.
- **Eugene 'Doc' (Frontend)**: Build the complete UI for the Artisan portal and connect it to the APIs.

---

### Week 3: The Client Map Experience (Aug 18 - Aug 24, 2025)

#### Tasks:

- [ ] **Frontend**: Integrate Mapbox into the client's home page.
- [ ] **Frontend**: Call the map data API and plot artisans as pins on the map.
- [ ] **Frontend**: Implement UI for clicking a pin to open an artisan's profile.
- [ ] **Frontend**: Build the full public Artisan Profile page.
- [ ] Animate map interactions with GSAP.

#### Deliverables:

- A live, interactive map where clients can see and select artisans.
- Publicly viewable artisan profile pages.

#### Team Focus:

- **Eugene 'Doc' (Frontend)**: Lead on all map integration and client-side UI.
- **Brad (Backend)**: Support frontend, ensure API is performant, and assist with data formatting.

---

### Week 4: Contact & Communication Flow (Aug 25 - Aug 31, 2025)

#### Tasks:

- [ ] **Backend**: Design and implement database models for `Conversations` and `Messages`.
- [ ] **Backend**: Develop API routes for starting a conversation and sending/receiving messages.
- [ ] **Frontend**: Add a "Contact Me" button on the artisan profile page.
- [ ] **Frontend**: Create a basic messaging interface where a client and artisan can exchange messages.

#### Deliverables:

- Clients can initiate contact with an artisan.
- A basic, functional in-app messaging system is in place.

#### Team Focus:

- **Brad (Backend)**: Backend messaging logic and API development.
- **Eugene 'Doc' (Frontend)**: Build the frontend messaging UI.

---

### Week 5: Admin Panel & System Polish (Sep 1 - Sep 7, 2025)

#### Tasks:

- [ ] **Backend**: Build API endpoints for admin-specific actions (fetch users, update subscription status).
- [ ] **Frontend**: Build a simple, protected Admin dashboard.
- [ ] **Frontend**: Implement a table to display all users.
- [ ] **Frontend**: Add a button/toggle in the admin panel to manually mark an Artisan as "Subscribed."
- [ ] Conduct end-to-end testing of all flows and fix bugs.

#### Deliverables:

- A functional Admin dashboard to manage users and subscriptions manually.
- A stable, tested application with major bugs resolved.

#### Team Focus:

- **Brad (Backend)**: Admin backend logic.
- **Eugene 'Doc' (Frontend)**: Admin frontend UI and leading the testing/polish effort.

---

### Week 6: Finalization & Deployment (Sep 8 - Sep 14, 2025)

#### Tasks:

- [ ] Final regression testing.
- [ ] Write a comprehensive `README.md`.
- [ ] Finalize Swagger API documentation.
- [ ] Deploy the prototype to Vercel.
- [ ] Final smoke testing on the live environment.
- [ ] Demo the prototype and plan the next phase (M-Pesa API integration).

#### Deliverables:

- Deployed, working prototype on a public URL.
- Complete documentation for developers.
- A clear backlog for post-prototype development.

#### Team Focus:

- **Brad (Backend) & Eugene 'Doc' (Frontend)**: Collaborative effort to ensure a smooth launch.
