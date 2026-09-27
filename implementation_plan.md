# Implementation Plan: Fresh Relay - Food Donation Coordinator MVP

## Overview
Fresh Relay is a modern, high-impact full-stack web application connecting Food Donors (restaurants, hotels, grocers) with Volunteers/NGOs and Coordinators to salvage surplus food before expiration.

## Tech Stack & Architecture
- **Framework**: Next.js 14+ (App Router) with TypeScript & React Server Components / Client State
- **Styling**: Tailwind CSS with custom design system matching modern logistics apps (Fresh Green `#2ECC71`, Warm Blue `#3498DB`, Alert Orange `#F39C12`)
- **Icons**: Lucide React
- **Database**: SQLite with Prisma ORM (or API data layer backed by SQLite db for instant zero-config persistence)
- **Mapping**: Leaflet / React-Leaflet with custom map markers and route rendering
- **State & Real-time**: Optimistic UI state with Prisma DB synchronization via Next.js API endpoints (`/api/donations`, `/api/donations/[id]`, `/api/stats`, `/api/users`)

---

## 1. Data Schema

### `User` Model
| Field | Type | Description |
|---|---|---|
| `id` | String (PK) | Unique Identifier |
| `name` | String | Full Name |
| `role` | String | Enum: `donor`, `volunteer`, `admin` |
| `organization`| String | Associated Business/NGO (e.g. "Grand Hyatt Banquets", "District Fleet") |
| `phone` | String | Contact phone number |
| `avatar` | String | Profile avatar URL |

### `Donation` Model
| Field | Type | Description |
|---|---|---|
| `id` | String (PK) | Unique Donation ID (e.g. `DON-101`) |
| `donor_id` | String (FK) | ID of User (Donor) |
| `food_type` | String | Description of food (e.g., "Artisan Bread & Pastries", "Prepared Hot Trays") |
| `category` | String | Food category (`Hot Meals`, `Raw Produce`, `Baked Goods`, `Dairy & Chilled`, `Frozen`) |
| `quantity` | Int | Quantity amount (e.g., 120) |
| `quantity_unit`| String | Unit (`lbs`, `meals`, `crates`, `trays`) |
| `dietary_flags`| String/JSON | Array of tags (`Vegetarian`, `Nut-Free`, `Halal`, `Keep Heated`) |
| `pickup_address`| String | Full pickup street address |
| `latitude` | Float | GPS latitude for map mapping |
| `longitude` | Float | GPS longitude for map mapping |
| `instructions` | String | Gate/Dock access instructions |
| `expiry_time` | DateTime | Expiry timestamp |
| `status` | String | Enum: `available`, `claimed`, `picked_up`, `delivered` |
| `volunteer_id` | String (FK) | Nullable ID of User (Volunteer) |
| `created_at` | DateTime | Timestamp of creation |
| `updated_at` | DateTime | Timestamp of last status change |

---

## 2. Page & View Routing Structure

```
/
├── app/
│   ├── layout.tsx                # App Shell: Navigation, Header, Role Switcher, Mobile Bottom Bar
│   ├── page.tsx                  # Coordinator Dashboard (View 1)
│   ├── donations/
│   │   └── page.tsx              # Donation Listing Feed (View 2)
│   ├── post/
│   │   └── page.tsx              # Post Surplus Food Form (View 3)
│   ├── pickup/
│   │   ├── page.tsx              # Active Pickups Overview
│   │   └── [id]/page.tsx         # Interactive Pickup Details & Live Logistics Route (View 4)
│   └── impact/
│       └── page.tsx              # Impact Analytics & Leaderboards (View 5)
│   └── api/
│       ├── donations/route.ts    # GET all, POST new donation
│       ├── donations/[id]/route.ts # GET details, PATCH status/claim
│       ├── stats/route.ts        # Analytics summary metrics
│       └── seed/route.ts         # DB Reset & Seed
```

---

## 3. Core Screen Implementations

### View 1: Coordinator Dashboard (Admin) `/`
- High-level metric KPI cards: Active Pickups, Pending Claim, Delivered Today, Expiring < 2h.
- Kanban Board with 4 columns (`available`, `claimed`, `picked_up`, `delivered`).
- Live Activity Log & Broadcast Alert Banner ("Rainstorm Inbound - Eastside").
- Quick Dispatch modal & status progression.

### View 2: Donation Listing Feed (Volunteer) `/donations`
- Filterable feed (`All`, `Urgent (<2h)`, `Fresh Produce`, `Baked Goods`).
- Rich Card Components with donor name, distance, weight/meals, dietary tags, and live countdown timer.
- Single-click "Claim Pickup" with instant double-booking prevention check.

### View 3: Post Donation Form (Donor) `/post`
- Multi-section smart form: Food Category selector, Weight preset buttons (+25 lbs, +50 lbs), Packaging type, Dietary & Safety tags.
- Pickup window validation (prevents past timestamps, alerts on short rescue windows).
- Interactive Leaflet Location Map Pin preview.
- "Publish Donation to Network" with immediate DB write.

### View 4: Pickup Details & Route (Volunteer) `/pickup/[id]`
- Live route progress stepper (`Claimed` -> `En Route` -> `Loaded` -> `Transit` -> `Delivered`).
- Interactive Leaflet Map showing Pickup & Destination markers with custom SVG icons.
- Action buttons: "Mark as Picked Up" and "Mark as Delivered" updating DB state.
- Emergency / Donor contact quick actions & dock entry notes.

### View 5: Impact Analytics (Global) `/impact`
- Key Impact Metrics: Total Meals Rescued, CO2 Diverted, Waste Prevented ($ value), Community Kitchens served.
- Interactive Category Volume distribution chart.
- Leaderboards: Top Donor Roll & Rescue Volunteer Champions.
- Shareable report export trigger.

---

## 4. Database Seeding & Mock Data Strategy
5 initial donations initialized with dynamic timestamps relative to current time:
1. **Artisan Kitchen & Catering** - 120 lbs Hot Prepared Trays - Status: `available` - Expiry: +45 mins
2. **Bistro 44 Bakery** - 45 lbs Artisan Bread - Status: `available` - Expiry: +2 hours
3. **Green Grocer Market** - 180 lbs Fresh Organic Produce - Status: `claimed` - Volunteer: Marcus T. - Expiry: +3 hours
4. **Harbor Fish & Seafood** - 65 lbs Chilled Seafood - Status: `picked_up` - Volunteer: Sarah J. - Expiry: +1.5 hours
5. **Harvest Hotel Banquets** - 320 lbs Prepared Trays - Status: `delivered` - Volunteer: Carla R. - Delivered 15m ago

---

## 5. Verification Plan
1. Initialize Next.js project and install dependencies (Tailwind, Lucide React, Leaflet, Prisma/SQLite).
2. Seed SQLite database with initial 5+ records.
3. Test all API routes (`GET /api/donations`, `PATCH /api/donations/[id]`, `POST /api/donations`).
4. Validate navigation across all 5 views on Desktop & Mobile viewports.
5. Verify claim workflow prevents double claiming and updates status across screens.
6. Verify form validation blocks past date submissions.
