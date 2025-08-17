# SALUS Healthcare Management System
---

## Overview

GPS-based workforce management system for healthcare workers to clock in/out with location validation. Managers get real-time staff monitoring and analytics dashboard.
🌐 Production URL: https://salus-iota.vercel.app

**Key Implementation**: Custom GPS tracking, real-time perimeter validation, comprehensive analytics, and production-ready architecture.

---

## Codebase Structure

```
SALUS/
├── 📂 prisma/                    # Database layer
│   ├── migrations/               # Database migration files
│   ├── schema.prisma            # Database schema definition
│   └── seed.ts                  # Database seeding script
│
├── 📂 src/app/                   # Next.js App Router
│   ├── 📂 api/                   # API endpoints
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts         # NextAuth.js configuration
│   │   └── graphql/
│   │       └── route.ts         # GraphQL API endpoint
│   │
│   ├── 📂 auth/                  # Authentication pages
│   │   ├── signin/
│   │   │   └── page.tsx         # Sign-in form
│   │   └── signup/
│   │       └── page.tsx         # Sign-up form
│   │
│   ├── 📂 dashboard/             # Manager dashboard
│   │   └── page.tsx             # Analytics & management interface
│   │
│   ├── 📂 components/            # Reusable components
│   │   └── providers.tsx        # Context providers
│   │
│   ├── 📂 graphql/               # GraphQL layer
│   │   ├── resolvers.ts         # GraphQL resolvers
│   │   └── schema.ts            # GraphQL schema definitions
│   │
│   ├── 📂 lib/                   # Utility libraries
│   │   ├── apollo-client.ts     # Apollo Client configuration
│   │   └── auth.ts              # NextAuth configuration
│   │
│   └── 📂 types/                 # TypeScript definitions
│       ├── next-auth.d.ts       # NextAuth type extensions
│       └── role.ts              # Role type definitions
│
├── 📂 public/                    # Static assets
├── 📄 .env                      # Environment variables
├── 📄 .env.local               # Local environment overrides
├── 📄 package.json             # Dependencies & scripts
├── 📄 next.config.js           # Next.js configuration
├── 📄 tsconfig.json            # TypeScript configuration
└── 📄 README.md                # Project documentation

```

---

## Features Attempted vs Requirements

### ✅ **FULLY IMPLEMENTED**

**1. Manager Features**
- ✅ Location perimeter setup (configurable 2km radius)
- ✅ Real-time staff monitoring table (currently clocked-in staff)
- ✅ Complete shift history with GPS coordinates and timestamps
- ✅ Analytics dashboard: avg hours/day, daily clock-ins, weekly totals

**2. Care Worker Features**
- ✅ GPS-based clock in/out with perimeter validation
- ✅ Optional notes during clock operations
- ✅ "Outside perimeter" blocking with distance display
- ✅ Real-time location status monitoring

**3. Authentication**
- ✅ Email/password registration & login
- ✅ Role-based access (Manager/Care Worker)
- ✅ Secure JWT sessions with NextAuth.js
- ❌ Auth0 (used NextAuth.js alternative)
- ❌ Google OAuth (framework ready)

**4. UI/UX**
- ✅ Ant Design components throughout
- ✅ Mobile-responsive design
- ✅ Clean healthcare-focused interface

### ⚠️ **BONUS FEATURES TO BE DONE**

**5. PWA Features**
- ❌ Service workers / offline support
- ❌ Home screen installation

**6. Location Features**
- ✅ Real-time GPS tracking with distance calculations
- ✅ Haversine formula implementation
- ❌ Automatic geofencing notifications

---

## Tech Stack Implementation

| Component | Technology | Status |
|-----------|------------|---------|
| Frontend | Next.js 14 + TypeScript | ✅ Complete |
| UI | Ant Design | ✅ Complete |
| API | GraphQL + Apollo Server | ✅ Complete |
| Database | Prisma + SQLite | ✅ Complete |
| Auth | NextAuth.js (vs Auth0) | ✅ Alternative |
| State | React Context (no Redux) | ✅ Complete |
| Location | Custom GPS hooks | ✅ Advanced |

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // bcrypt hashed
  role      String   @default("CAREWORKER")
  shifts    Shift[]
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  latitude  Float    // GPS center point
  longitude Float
  radius    Int      @default(2000) // meters
  shifts    Shift[]
}

model Shift {
  id             String    @id @default(cuid())
  userId         String
  organizationId String
  clockIn        DateTime
  clockOut       DateTime?
  noteIn         String?
  noteOut        String?
  clockInLat     Float?    // GPS audit trail
  clockInLng     Float?
  clockOutLat    Float?
  clockOutLng    Float?
  
  user           User         @relation(fields: [userId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])
}
```

---

## Key Technical Implementations

**GPS Location System**
- Custom `useLocation()` hook for real-time tracking
- Haversine formula for accurate distance calculations
- Server-side perimeter validation in GraphQL resolvers

**Analytics Engine**
- Custom dashboard statistics (no external charting libraries)
- Real-time calculations via GraphQL aggregations
- Live staff monitoring with location data

**Authentication & Security**
- NextAuth.js with custom credentials provider
- bcrypt password hashing (12 salt rounds)
- Role-based GraphQL resolver authorization
- JWT session management

---

## Getting Started

```bash
npm install
cp .env.example .env.local
npx prisma generate && npx prisma migrate dev
npm run dev
```

**Environment Variables:**
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"
```

---

## Summary

All core requirements implemented with advanced features:

✅ **Delivered**: Production-ready GPS workforce management system  
✅ **Advanced**: Custom location analytics beyond requirements  
✅ **Tech Stack**: Modern Next.js 14 + GraphQL + TypeScript architecture  
⚠️ **Alternative**: NextAuth.js instead of Auth0 (equivalent functionality)  
❌ **Bonus**: PWA features not implemented

**Result**: Fully functional healthcare workforce management system exceeding MVP requirements with enterprise-level GPS tracking and real-time analytics.