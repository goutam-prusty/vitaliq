# Vitaliq

Vitaliq is a private, multi-user health analytics dashboard and tracking platform backed by **Clerk** (Authentication & Identity) and **Supabase** (PostgreSQL Persistence & Row-Level Security). The application handles health tracking logs (body composition, blood pressure, blood glucose) and compiles them into statistics, targets progress checking, and explainable health insights.

---

## 1. Project Overview

Vitaliq serves as a health ledger and analytics workbench, built around:
*   **Overview Dashboard:** High-level metrics summaries, weight goal targets progress, recent activity feeds, and prioritized actionable health insights.
*   **Global Logging Drawer:** Slide-over modal panel accessible from anywhere in the authenticated app via the `L` key shortcut, featuring full accessibility focus trapping and auto-focus fields.
*   **Trends Workbench:** Integrated chart exploration dashboard offering metric filters, date ranges, moving average overlays, goal reference lines, comparative periods overlapping, and timeline brush slider zooming.
*   **Chronological History:** Paginated timeline feed containing keyword search, category filtering, and inline delete prompts.

---

## 2. Layered Architecture

The application enforces a decoupled, unidirectional data flow:
```text
Clerk (Identity Provider) & Supabase (Postgres Database)
                      ↓
          Repositories (Row Mappers)
                      ↓
          Domains (Business Logic Orchestrators)
                      ↓
          Pure Analytics Engine (Computations)
                      ↓
          Server Actions & Components (RSC Routes)
                      ↓
          Client Presenters (Recharts & Interaction)
```

### Key Architectural Constraints
1.  **Pure Calculations:** The statistics calculators, goal progress trackers, and insights rules engines are designed as 100% side-effect-free, clock-independent pure functions. This enables identical computation on both the server (initial render) and client (brushing/zooming filters), eliminating latency.
2.  **Encapsulated Database Queries:** Page components query logs and user snapshots strictly through the domain layer (`HealthDomain`, `ProfileDomain`). Direct database client calls or repository class instantiations are barred in page components.

---

## 3. Technology Stack

*   **Core:** Next.js 15 (App Router), React 19, TypeScript
*   **Styling:** PostCSS, Tailwind CSS v4, Vanilla CSS variable themes
*   **Persistence:** Supabase JS client, PostgreSQL
*   **Authentication:** Clerk SDK, Middleware routing guards
*   **Charts:** Recharts (responsive line charts, synchronized hover, time sliders)
*   **Calculators & Math:** date-fns, date-fns-tz, Zod
*   **Testing:** Vitest

---

## 4. Setup & Installation

### 1. Prerequisites
*   Node.js 20 or newer
*   pnpm 10 or newer
*   A Supabase database instance
*   A Clerk user authentication project

### 2. Environment Variables
Create a local `.env.local` file in the root of the project:

```env
# Supabase Configuration (Database connection)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-secret

# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Timezone Configurations
APP_TIMEZONE=Asia/Kolkata
```

### 3. Database Schema Setup
Deploy the database migration scripts located inside `supabase/migrations/` directly to your Supabase instance:
```bash
# Set up tables, cascade relations, index fields, and Row-Level Security policies
# The initial schema maps Clerk user IDs (sub JWT fields) directly to SQL logs rows.
```

### 4. Running Locally
```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```
Open `http://localhost:3000` to register, log in, and begin tracking health logs.

---

## 5. Script Commands

*   `pnpm dev`: Start Next.js development server
*   `pnpm build`: Compile and build optimized production bundle
*   `pnpm lint`: Run ESLint static syntax audits
*   `pnpm typecheck`: Run TypeScript compiler checks
*   `pnpm test`: Execute Vitest unit testing suites

---

## 6. Testing Strategy

The application hosts 29 assertions across 5 core suites checking mathematical logic, data extraction, and rules mapping:
*   `tests/statistics.test.ts`: Pure statistical calculators (means, medians, moving averages, standard deviation, BMI, and body fat brackets).
*   `tests/engine.test.ts`: Time-series parser and weight targets calculator.
*   `tests/insights.test.ts`: Explainable insights triggers, streaks, inactivity boundaries, and priority sorting.
*   `tests/dates-parsing.test.ts` & `tests/categories.test.ts`: Format parsers and categories checks.

---

## 7. Production Readiness Checklist

Before pushing to production:
1.  **Row-Level Security (RLS):** Ensure RLS is active on all Supabase tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Policies must verify rows using `auth.jwt() ->> 'sub'`.
2.  **Secret Scrubbing:** Confirm `SUPABASE_SERVICE_ROLE_KEY` is loaded only in secure Server Actions or Server Components.
3.  **Build Check:** Build static compilation payloads locally using `pnpm build` with staging environment variables to guarantee successful route generation.
