# SKOUTEX FULL AUDIT & POLISH PLAN

**Audit Date:** 2026-01-16
**Audit Scope:** Complete codebase review (60+ files, API routes, database, UI, integrations)
**Status:** 70% Complete - Solid foundation with critical security gaps and incomplete integrations

---

## 1. FEATURE AUDIT TABLE

| Feature Area | Status | Why |
|--------------|--------|-----|
| **Auth + RLS** | ✅ WORKS | Supabase middleware properly enforces routes. RLS policies prevent cross-club access. Minor gap: webhook uses DEFAULT_CLUB_ID bypass. |
| **Onboarding + club context gating** | ⚠️ PARTIAL | Context saves to DB correctly. Fit score gate has conflicting logic with club context (wage_budget field marked required in gate, optional in context). No onboarding progress UI. |
| **WhatsApp intake + secrets** | ⚠️ PARTIAL | Webhook accepts messages and extracts URLs. BUT: No phone-to-club mapping (TODO not implemented). All messages route to DEFAULT_CLUB_ID. Secrets exposed in .env.local. |
| **Resolution + ambiguity replies** | ✅ WORKS | Transfermarkt parsing works. Candidate resolution with SportMonks search works. Ambiguity handling with reply codes functional. |
| **SportMonks fetch + persistence** | ✅ WORKS | API client functional with caching. Data persists to players table with conflict handling. League whitelist is restrictive. No automatic stale data refresh. |
| **Inbound Targets UI** | ✅ WORKS | Pipeline displays all statuses correctly. Expandable cards with fit scores. Read-only (no actions like retry, delete, edit). |
| **Fit scoring + KPI rings** | ⚠️ PARTIAL | Scoring algorithm works with 5 factors. KPI rings animate properly. BUT: Dashboard recommendations use MOCK fit scores (random 75-89), not real calculations. |
| **Premium dashboard recommendations** | ⚠️ PARTIAL | UI loads featured players. BUT: Recommendation logic returns empty array with TODO comments. Not actually generating personalized suggestions. |
| **Recent Transfers filters + persistence** | ✅ WORKS | Filters work correctly. localStorage persists state. Client-side filtering only (loads all transfers then filters). |
| **Player profile tabs + season selector** | ✅ WORKS | 7 tabs implemented. Season selector with competition filter works. Video tab placeholder only. Reports depth parameter doesn't differentiate quick vs dense. |
| **Reports quick/dense** | ⚠️ PARTIAL | Report page structure exists. Print preview works. BUT: No actual PDF generation (just browser print). Quick vs Dense show identical content. |
| **Chat UI + send flow** | ⚠️ PARTIAL | Full UI implemented (sidebar, bubbles, typing indicator, markdown rendering). BUT: Conversations are mock data (lost on refresh). AI responses are hard-coded 800ms delays, not calling backend. |
| **Club branding everywhere** | ✅ WORKS | Logo and name display in sidebar, header, chat. Falls back to "SKOUTEX" if not set. BUT: No UI to upload logo (must manually set URL). |

---

## 2. BUG LIST (PRIORITISED)

### 🚨 CRITICAL (Security/Data Loss)

#### 1. Production Secrets Exposed in .env.local
- **Impact:** SMTP password, service role key, OpenAI key, SportMonks key all exposed
- **Root cause:** .env.local file contains plaintext production secrets
- **Where to inspect:** `/Users/nicolamalgeri/Documents/SKOUTEX/.env.local`
- **Fix:** Rotate ALL keys immediately. Use Vercel Secrets Manager. Add .env.local to .gitignore.
- **Files affected:**
  - `.env.local` (contains: SMTP_PASSWORD, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, SPORTMONKS_API_KEY)
  - All API routes that use these secrets

#### 2. WhatsApp Webhook Bypasses Authentication
- **Impact:** All WhatsApp messages route to DEFAULT_CLUB_ID without verifying sender
- **Root cause:** Phone-to-club mapping not implemented (TODO on line 65 in webhook)
- **Where to inspect:** `/src/api/webhooks/whatsapp/route.ts` → `resolveClubId()` function (lines 60-70)
- **Fix:** Implement phone number verification table linking phone → club_id
- **Files affected:**
  - `/src/api/webhooks/whatsapp/route.ts`
  - New migration needed: `create table club_phone_numbers`

#### 3. Mock WhatsApp Provider Never Sends Messages
- **Impact:** Users receive no confirmation messages when targets are confirmed
- **Root cause:** `getWhatsAppProvider()` always returns mock provider (TODO: "Implemented in STEP 8")
- **Where to inspect:** `/src/lib/whatsapp/providers.ts` (or inline in webhook route)
- **Fix:** Implement Twilio/Meta provider integration with actual message sending
- **Files affected:**
  - `/src/api/webhooks/whatsapp/route.ts` (lines 340-350)
  - Need to create: `/src/lib/whatsapp/twilioProvider.ts`

---

### 🔴 HIGH (Feature Broken)

#### 4. Dashboard Fit Scores Are Random Mock Data
- **Impact:** Directors see misleading fit scores (random 75-89 instead of real calculation)
- **Root cause:** `fitScore: Math.floor(Math.random() * 15) + 75` in dashboard recommendations
- **Where to inspect:** `/src/app/(dashboard)/dashboard/page.tsx` or `/src/app/(dashboard)/dashboard/premium/page.tsx`
  - Search for: `Math.random()` in position needs generation
- **Fix:** Call `scoreFit()` for each recommended player instead of random generation
- **Files affected:**
  - `/src/app/(dashboard)/dashboard/page.tsx` (lines ~100-200, positionNeeds generation)
  - `/src/lib/fit/scoreFit.ts` (use this instead of random)

#### 5. Chat Conversations Lost on Page Refresh
- **Impact:** Users lose entire chat history when closing browser
- **Root cause:** Conversations stored in component state, not database
- **Where to inspect:** `/src/app/(dashboard)/dashboard/chat/page.tsx` → `conversations` state (line ~50)
- **Fix:** Persist messages to database table (chat_conversations, chat_messages) with RLS
- **Files affected:**
  - `/src/app/(dashboard)/dashboard/chat/page.tsx`
  - New migration: `create table chat_conversations, chat_messages`
  - New API route: `/src/app/api/chat/conversations/route.ts`

#### 6. AI Chat Backend Not Connected to Frontend
- **Impact:** Chat UI shows hard-coded responses after 800ms delay, not real AI
- **Root cause:** Frontend doesn't call `/api/ai/chat`, uses mock setTimeout
- **Where to inspect:** `/src/app/(dashboard)/dashboard/chat/page.tsx` → `handleSendMessage()` function (lines ~200-220)
- **Fix:** Replace setTimeout with fetch to `/api/ai/chat` endpoint
- **Files affected:**
  - `/src/app/(dashboard)/dashboard/chat/page.tsx` (replace setTimeout with fetch)
  - `/src/app/api/ai/chat/route.ts` (already exists, needs connection)

#### 7. Conflicting Fit Score Gate Logic
- **Impact:** Fit score gate may unlock when profile actually incomplete (or vice versa)
- **Root cause:** `fitScoreGate.ts` marks `wage_budget_weekly_eur` as REQUIRED, but `context.ts` marks it optional
- **Where to inspect:**
  - `/src/lib/club-context/fitScoreGate.ts` (gate definition)
  - `/src/lib/club/context.ts` (line 267, comment says "NOT REQUIRED")
- **Fix:** Align both definitions - make wage_budget_weekly_eur consistently required or optional
- **Files affected:**
  - `/src/lib/club-context/fitScoreGate.ts`
  - `/src/lib/club/context.ts`

---

### 🟠 MEDIUM (Usability Issues)

#### 8. No Logo Upload UI
- **Impact:** Users can't set club logo without manually editing database
- **Root cause:** `logo_url` field exists but no file upload component
- **Where to inspect:** `/src/app/(dashboard)/dashboard/club/page.tsx` → club profile form
- **Fix:** Add file upload component with image validation, store in Supabase Storage
- **Files affected:**
  - `/src/app/(dashboard)/dashboard/club/page.tsx` (add file input)
  - `/src/app/api/club/logo/route.ts` (new route for upload)

#### 9. Recent Transfers Load All Data Then Filter
- **Impact:** Poor performance with large transfer datasets (100s of records)
- **Root cause:** Client-side filtering after fetching all transfers
- **Where to inspect:** `/src/components/dashboard/RecentTransfersSection.tsx` → filter logic
- **Fix:** Move filtering to API query parameters (`/api/sportmonks/transfers?leagues=39,140&positions=ST`)
- **Files affected:**
  - `/src/components/dashboard/RecentTransfersSection.tsx`
  - `/src/app/api/sportmonks/transfers/route.ts` (add query param filtering)

#### 10. No Retry Button for Failed Inbound Targets
- **Impact:** Failed targets stuck permanently unless manually deleted from DB
- **Root cause:** UI is read-only, no manual retry action
- **Where to inspect:** `/src/app/inbound-targets/page.tsx` → status display
- **Fix:** Add "Retry Resolution" button that resets status to RECEIVED and attempt counter
- **Files affected:**
  - `/src/app/inbound-targets/page.tsx` (add retry button)
  - `/src/app/api/inbound/targets/[id]/retry/route.ts` (new route)

---

## 3. DATA INTEGRITY RISKS

### Stale Data Risks

#### 1. Player Data Never Refreshes After Initial Fetch
- **Where:** `players` table has `last_fetched_at` but no background job updates it
- **Impact:** Player stats, market value, contract status could be weeks old
- **Detection:** Query `players` where `last_fetched_at < NOW() - INTERVAL '7 days'`
- **Mitigation:** Add cron job to refresh players viewed in last 30 days
- **Files affected:**
  - New: `/src/app/api/cron/refresh-players/route.ts`
  - Vercel cron config: `vercel.json`

#### 2. SportMonks Cache Could Be 5 Minutes Stale
- **Where:** `/src/lib/sportmonks/client.ts` → `fetch(url, { next: { revalidate: 300 } })`
- **Impact:** Live match data, transfer news slightly delayed
- **Detection:** Compare displayed data with SportMonks API directly
- **Mitigation:** Acceptable for most use cases; reduce revalidate to 60s for critical endpoints

#### 3. Fit Score Calculated On-Demand Only
- **Where:** `/src/app/api/inbound/targets/route.ts` calculates fit score per request
- **Impact:** Slow response times; no historical fit score tracking (can't see if fit changed over time)
- **Detection:** Check API response times >2s
- **Mitigation:** Pre-calculate fit scores on player fetch, store in `inbound_targets.fit_score` column

---

### Silent Failure Risks

#### 4. Transient Supabase Errors Not Retried
- **Where:** All API routes check `if (error)` but immediately return failure
- **Impact:** Temporary network issues cause permanent data loss
- **Detection:** Monitor Supabase error logs for 5xx responses
- **Mitigation:** Add exponential backoff retry (3 attempts with 1s/2s/4s delays)
- **Files affected:** All API routes with Supabase calls

#### 5. Fit Scoring Failures Return Null Without Logging
- **Where:** `/src/app/api/inbound/targets/route.ts` catch block returns `{ fit_percent: null }` silently
- **Impact:** Users see blank fit score with no explanation
- **Detection:** Query `inbound_targets` where `status = 'READY'` and no fit_percent in response
- **Mitigation:** Log error details to monitoring service, show user-facing error message

#### 6. Webhook Messages Could Be Processed Twice
- **Where:** No idempotency key tracking in `/src/app/api/webhooks/whatsapp/route.ts`
- **Impact:** Duplicate inbound_messages and targets if webhook retries
- **Detection:** Query `inbound_messages` grouped by `(raw_text, from_phone, received_at)` for duplicates
- **Mitigation:** Add unique constraint on `(raw_text, from_phone, received_at)` or store Twilio/Meta message ID

---

## 4. MOBILE POLISH CHECKLIST

**Top 10 Improvements for Mobile UX + Performance:**

### 1. Add Pull-to-Refresh on Key Pages
- **Where:** Inbound targets list, dashboard, player profile
- **Impact:** Native gesture for data refresh (no need to find refresh button)
- **Implementation:** Use `react-use-gesture` or native touch events

### 2. Optimize Chat Input for Mobile Keyboards
- **Where:** `/src/app/(dashboard)/dashboard/chat/page.tsx`
- **Issues:**
  - Ensure composer stays above keyboard (not behind it)
  - Add iOS `inputmode="text"` for better keyboard
  - Prevent zoom on focus (viewport maximum-scale=1)
- **Files affected:** Chat page textarea component

### 3. Add Skeleton Loaders Instead of Spinners
- **Where:** All pages with `<Loader2 className="animate-spin" />`
- **Impact:** Feels faster, reduces perceived wait time
- **Files affected:**
  - Dashboard, player profile, inbound targets, chat

### 4. Lazy Load Images in Player Cards
- **Where:** All player photo `<img>` tags
- **Implementation:**
  - Use `loading="lazy"` on all player photos
  - Add blur-up placeholder images (10px → full resolution)
- **Files affected:**
  - `/src/components/dashboard/PositionTargetCard.tsx`
  - Player profile components

### 5. Reduce Animation Duration on Mobile
- **Where:** All Tailwind animations (transitions, transforms)
- **Implementation:**
  - Halve all transition durations on mobile (300ms → 150ms)
  - Check `prefers-reduced-motion` media query
- **Files affected:** Global CSS or Tailwind config

### 6. Add Swipe Gestures for Navigation
- **Where:** Chat page, player profile tabs
- **Implementation:**
  - Swipe right on chat message to go back to conversation list
  - Swipe between player profile tabs
- **Files affected:**
  - `/src/app/(dashboard)/dashboard/chat/page.tsx`
  - Player profile tab component

### 7. Fix Horizontal Scroll Issues
- **Where:** Audit all pages for `overflow-x-auto` containers
- **Issues:** Ensure tables/cards don't exceed viewport width
- **Files affected:**
  - Reports page (tables)
  - Recent transfers section

### 8. Increase Touch Target Sizes
- **Where:** All buttons/links <48×48px (WCAG minimum)
- **Issues:** Add padding to small icon buttons
- **Files affected:**
  - Header buttons
  - KPI ring labels
  - Filter dropdowns

### 9. Optimize Bundle Size for Mobile Networks
- **Implementation:**
  - Code-split large dependencies (markdown renderer, chart libraries)
  - Lazy load chat page (not needed for most users immediately)
- **Files affected:**
  - `next.config.js` (add dynamic imports)
  - Chat page (lazy load conversation UI)

### 10. Add Offline Indicator
- **Where:** Global layout component
- **Implementation:**
  - Show banner when network unavailable
  - Cache recent player data for offline viewing (Service Worker)
- **Files affected:**
  - `/src/app/layout.tsx` (add offline detector)
  - `public/service-worker.js` (cache strategy)

---

## 5. SECURITY / COMPLIANCE CHECK

### 🚨 Secrets Leaks

#### ❌ CRITICAL: Production secrets in .env.local
**Exposed secrets:**
```
SMTP_PASSWORD=NMambition2!
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REFRESH_TOKEN=1//05tRuU1j...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-proj-...
SPORTMONKS_API_KEY=HovUUX...
GNEWS_API_KEY=...
INTERNAL_JOB_SECRET=a7b3f9...
```
**Action:** Rotate ALL keys within 24 hours. Store in Vercel env vars only.

#### ❌ CRITICAL: Service role key grants full admin access
- Can delete entire database, bypass RLS
- **Action:** Use service role only on server, never expose to client

#### ✅ OK: Anon key exposed (expected for client-side Supabase)

---

### 🔒 RLS Gaps

#### ✅ OK: All tables have proper RLS policies
- Clubs, inbound_messages, inbound_targets, players all gated by `owner_user_id`
- Policies use `auth.uid()` correctly

#### ⚠️ MINOR: inbound_targets uses nested subquery
- Works but slightly less efficient than direct foreign key check
- **Action:** Optimize query if performance issues detected

#### ❌ HIGH: WhatsApp webhook bypasses RLS via DEFAULT_CLUB_ID
- Any unauthenticated request routes to default club
- **Action:** Implement phone-to-club verification table

---

### 🌐 Webhook Risks

#### ❌ HIGH: No provider signature validation
- Webhook accepts any POST with correct `x-skoutex-secret` header
- Attacker could spoof WhatsApp messages if they obtain secret
- **Action:** Validate Twilio signature or Meta webhook signature per their docs
- **Where:** `/src/app/api/webhooks/whatsapp/route.ts` (add signature validation)

#### ⚠️ MEDIUM: No rate limiting on webhook endpoint
- Could be spammed with requests
- **Action:** Add rate limiting (10 req/min per phone number)
- **Where:** Middleware or webhook route

#### ⚠️ MEDIUM: No idempotency key tracking
- Webhook retries could create duplicate targets
- **Action:** Track Twilio MessageSid or Meta message ID to deduplicate

---

### 🔑 Default Club ID Risks

#### ❌ HIGH: DEFAULT_CLUB_ID environment variable creates backdoor
- All unauthenticated requests route to this club
- Could be abused if attacker knows the club ID
- **Action:** Remove DEFAULT_CLUB_ID fallback. Require phone-to-club mapping for all requests.

---

### 📋 GDPR / Data Privacy

#### ⚠️ MEDIUM: No soft deletes
- User data permanently deleted, no audit trail
- GDPR requires ability to prove deletion
- **Action:** Add `deleted_at` column, implement soft delete
- **Files affected:** All tables, all delete operations

#### ⚠️ MEDIUM: No data export endpoint
- Users can't export their data (GDPR right to data portability)
- **Action:** Add `/api/export` route to generate JSON/CSV of user's data
- **Files affected:** New route `/src/app/api/export/route.ts`

#### ✅ OK: RLS prevents cross-club data access

---

## 6. NEXT 7-DAY POLISH PLAN

### **DAY 1: Security Emergency (CRITICAL)** 🚨

#### Morning (4 hours)
- [ ] **Rotate all exposed API keys**
  - SMTP password (Gmail/Outlook account)
  - OpenAI API key (billing risk)
  - SportMonks API key (usage quota)
  - Google OAuth credentials
  - Supabase service role key
  - GNews API key
  - Internal job secret
- [ ] **Add .env.local to .gitignore** (if not already)
- [ ] **Remove service role key from local env**
  - Use Vercel env vars only
  - Update deployment configuration
- [ ] **Audit git history for previously committed secrets**
  - Run: `git log --all --full-history -- .env.local`
  - If found: Use BFG Repo-Cleaner to purge history

#### Afternoon (4 hours)
- [ ] **Implement webhook signature validation**
  - Twilio: Validate X-Twilio-Signature header
  - Meta: Validate X-Hub-Signature-256 header
  - File: `/src/app/api/webhooks/whatsapp/route.ts`
- [ ] **Add rate limiting to WhatsApp webhook**
  - 10 requests/minute per phone number
  - Use Redis or in-memory cache
  - File: Middleware or webhook route
- [ ] **Remove DEFAULT_CLUB_ID fallback**
  - Require phone-to-club mapping for all requests
  - Return 401 if phone not verified
  - File: `/src/app/api/webhooks/whatsapp/route.ts`

---

### **DAY 2: Fix Broken Core Features (HIGH)** 🔴

#### Morning (4 hours)
- [ ] **Fix dashboard fit scores**
  - Replace `Math.floor(Math.random() * 15) + 75` with real `scoreFit()` calls
  - File: `/src/app/(dashboard)/dashboard/page.tsx` (positionNeeds generation)
  - Import: `/src/lib/fit/scoreFit.ts`
- [ ] **Align fit score gate logic**
  - Make `wage_budget_weekly_eur` consistently required or optional
  - Files:
    - `/src/lib/club-context/fitScoreGate.ts`
    - `/src/lib/club/context.ts`
- [ ] **Add error logging to fit score failures**
  - Don't silently return null
  - Log to monitoring service (Sentry/LogRocket)
  - File: `/src/app/api/inbound/targets/route.ts`

#### Afternoon (4 hours)
- [ ] **Connect AI chat backend to frontend**
  - Replace `setTimeout()` with `fetch('/api/ai/chat')`
  - File: `/src/app/(dashboard)/dashboard/chat/page.tsx` → `handleSendMessage()`
  - Show loading state during fetch
- [ ] **Persist chat conversations to database**
  - Create tables: `chat_conversations`, `chat_messages`
  - Add RLS policies for club-based access
  - Migration: `/supabase/migrations/YYYYMMDD_chat_tables.sql`
- [ ] **Add loading state to chat send button**
  - Show spinner while waiting for AI response
  - Disable input during processing
  - File: Chat page component

---

### **DAY 3: WhatsApp Integration Completion** 📱

#### Morning (4 hours)
- [ ] **Design phone-to-club mapping table**
  - Create `club_phone_numbers` table:
    ```sql
    create table club_phone_numbers (
      id uuid primary key default gen_random_uuid(),
      club_id uuid references clubs(id),
      phone_number text unique not null,
      verified boolean default false,
      verification_code text,
      code_expires_at timestamptz,
      created_at timestamptz default now()
    );
    ```
- [ ] **Implement SMS verification flow**
  - Send verification code to phone
  - User confirms code in UI
  - Link verified phone to club
  - Files:
    - New route: `/src/app/api/club/verify-phone/route.ts`
    - New UI: Phone verification form in club settings

#### Afternoon (4 hours)
- [ ] **Replace mock WhatsApp provider with Twilio**
  - Install Twilio SDK: `npm install twilio`
  - Implement `TwilioProvider` class
  - Send actual confirmation messages
  - Files:
    - New: `/src/lib/whatsapp/twilioProvider.ts`
    - Update: `/src/app/api/webhooks/whatsapp/route.ts`
- [ ] **Test end-to-end WhatsApp flow**
  - Send message to Twilio number
  - Verify webhook receives message
  - Check resolution process
  - Confirm user receives reply message
  - Test with multiple clubs (different phone numbers)

---

### **DAY 4: Data Integrity & Reliability** 🔄

#### Morning (4 hours)
- [ ] **Add retry logic to all Supabase calls**
  - Exponential backoff: 1s → 2s → 4s
  - Max 3 attempts
  - Create utility function: `/src/lib/supabase/withRetry.ts`
  - Apply to all API routes
- [ ] **Implement idempotency key tracking for webhook**
  - Store Twilio MessageSid or Meta message ID
  - Check before processing to deduplicate
  - File: `/src/app/api/webhooks/whatsapp/route.ts`
  - Migration: Add `idempotency_key` column to `inbound_messages`
- [ ] **Add background job to refresh stale player data**
  - Cron job runs daily
  - Refreshes players with `last_fetched_at > 7 days ago`
  - Only refresh players viewed in last 30 days
  - File: `/src/app/api/cron/refresh-players/route.ts`

#### Afternoon (4 hours)
- [ ] **Pre-calculate fit scores on player fetch**
  - Store in `inbound_targets.fit_score` column
  - Don't calculate on-demand
  - Migration: Add `fit_score` int column
  - File: `/src/app/api/inbound/process-pending/route.ts`
- [ ] **Add "Retry Resolution" button for failed targets**
  - Resets status to RECEIVED
  - Resets attempt counter
  - Files:
    - UI: `/src/app/inbound-targets/page.tsx`
    - API: `/src/app/api/inbound/targets/[id]/retry/route.ts`
- [ ] **Implement soft deletes**
  - Add `deleted_at` column to all tables
  - Update all delete operations to set timestamp instead
  - Migration: `/supabase/migrations/YYYYMMDD_soft_deletes.sql`

---

### **DAY 5: Mobile UX Polish** 📱

#### Morning (4 hours)
- [ ] **Add pull-to-refresh on key pages**
  - Inbound targets, dashboard, player profile
  - Use `react-use-gesture` library
  - Show loading indicator during refresh
  - Files:
    - `/src/app/inbound-targets/page.tsx`
    - `/src/app/(dashboard)/dashboard/page.tsx`
    - Player profile page
- [ ] **Fix chat composer keyboard behavior**
  - Ensure stays above keyboard on iOS
  - Add `inputmode="text"` for better keyboard
  - Prevent zoom on focus: `<meta name="viewport" content="... maximum-scale=1">`
  - File: `/src/app/(dashboard)/dashboard/chat/page.tsx`
- [ ] **Add skeleton loaders**
  - Replace all `<Loader2 className="animate-spin" />` with content-shaped skeletons
  - Use Tailwind `animate-pulse` on gray boxes
  - Files: All pages with loading states

#### Afternoon (4 hours)
- [ ] **Lazy load images with blur-up placeholders**
  - Add `loading="lazy"` to all player photos
  - Generate 10px blurred version
  - Use Next.js `<Image>` component with blur data URL
  - Files:
    - `/src/components/dashboard/PositionTargetCard.tsx`
    - Player profile components
- [ ] **Reduce animation durations on mobile**
  - Halve all transition/animation times (300ms → 150ms)
  - Check `@media (prefers-reduced-motion: reduce)`
  - File: `tailwind.config.js` or global CSS
- [ ] **Audit touch target sizes**
  - Ensure all interactive elements ≥48×48px
  - Add padding to small icon buttons
  - Files: All components with buttons/links

---

### **DAY 6: Missing UI Features** 🎨

#### Morning (4 hours)
- [ ] **Add logo upload component to club profile**
  - File input with image validation (max 2MB, PNG/JPG only)
  - Upload to Supabase Storage
  - Save URL to `clubs.logo_url`
  - Files:
    - UI: `/src/app/(dashboard)/dashboard/club/page.tsx`
    - API: `/src/app/api/club/logo/route.ts`
- [ ] **Implement onboarding progress indicator**
  - Stepper showing required fields
  - Progress percentage (0-100%)
  - Highlight current step
  - Files:
    - Component: `/src/components/club/OnboardingProgress.tsx`
    - Use in: `/src/app/(dashboard)/dashboard/club/page.tsx`
- [ ] **Add user-facing error messages**
  - Replace generic "Failed to load" with actionable details
  - Include error codes for support
  - Show retry button where applicable
  - Files: All API error handlers

#### Afternoon (4 hours)
- [ ] **Move Recent Transfers filtering to server-side**
  - Add query params: `?leagues=39,140&positions=ST`
  - Filter in API route before returning
  - Reduce payload size
  - Files:
    - API: `/src/app/api/sportmonks/transfers/route.ts`
    - Component: `/src/components/dashboard/RecentTransfersSection.tsx`
- [ ] **Differentiate Quick vs Dense reports**
  - Quick: 1 page summary (key stats, fit score, verdict)
  - Dense: 3-5 pages (full stats, career timeline, injuries, etc.)
  - Conditional rendering based on `depth` param
  - File: `/src/app/reports/player/[playerId]/page.tsx`
- [ ] **Add download button for reports (actual PDF)**
  - Use `react-pdf` or `jsPDF` library
  - Generate downloadable PDF (not just print preview)
  - File: `/src/components/reports/PrintControls.tsx`

---

### **DAY 7: Performance & Monitoring** 📊

#### Morning (4 hours)
- [ ] **Add performance indexes to database**
  - Index on `players(sportmonks_player_id, club_id)`
  - Index on `inbound_targets(status, club_id)`
  - Index on `inbound_messages(received_at, club_id)`
  - Migration: `/supabase/migrations/YYYYMMDD_performance_indexes.sql`
- [ ] **Implement API response time monitoring**
  - Log slow queries (>2s)
  - Use middleware to track all API timings
  - Send to monitoring service (Vercel Analytics or Sentry)
  - File: `/src/middleware.ts`
- [ ] **Code-split large dependencies**
  - Lazy load markdown renderer in chat
  - Lazy load chart libraries (recharts)
  - Dynamic imports for heavy components
  - File: `next.config.js` + component files

#### Afternoon (4 hours)
- [ ] **Add offline indicator for mobile users**
  - Show banner when `navigator.onLine === false`
  - Cache recent player data for offline viewing
  - Implement Service Worker for basic caching
  - Files:
    - `/src/app/layout.tsx` (offline detector)
    - `/public/service-worker.js` (cache strategy)
- [ ] **Implement GDPR data export endpoint**
  - Generate JSON/CSV of all user's data
  - Include: club profile, players, targets, messages
  - Download as ZIP file
  - File: `/src/app/api/export/route.ts`
- [ ] **Run full security audit**
  - Use OWASP ZAP or similar tool
  - Test for SQL injection, XSS, CSRF
  - Verify all RLS policies working
  - Load test webhook (simulate 100 concurrent requests)
- [ ] **Final QA pass**
  - Test all features on mobile device
  - Check all Day 1-6 fixes working
  - Verify no regressions
  - Document known issues

---

## SUMMARY OF CRITICAL FINDINGS

### 🚨 Security Issues (IMMEDIATE ACTION REQUIRED)

1. **Production secrets exposed in .env.local** → Rotate ALL keys TODAY
2. **WhatsApp webhook bypasses authentication** → Implement phone-to-club mapping
3. **No provider signature validation** → Could spoof messages
4. **Service role key in local env** → Could delete all data
5. **Mock WhatsApp provider never sends messages** → Users get no confirmations

---

### 📊 Data Integrity Risks

1. **Conflicting fit score gate logic** → May show scores when gate locked
2. **Stale player data** → No automatic refresh (could be weeks old)
3. **No rollback capability** → Database changes permanent
4. **No soft deletes** → Cannot audit or recover deleted data
5. **Silent failures** → Transient errors cause data loss

---

### 🔧 Incomplete Features

1. **AI Chat backend not connected** → Frontend uses mock delays
2. **WhatsApp integration mock only** → No actual message sending
3. **Phone-to-club mapping not implemented** → All messages go to DEFAULT_CLUB_ID
4. **Premium features non-existent** → No tier gating or paywall
5. **PDF reports not working** → Print preview only, no downloadable export
6. **Chat persistence missing** → Conversations lost on refresh
7. **Logo upload missing** → No UI to set club branding

---

### ⚡ Performance Risks

1. **Client-side filtering** → Loads all transfers then filters (slow)
2. **No pagination** → UI loads all targets at once
3. **5-minute cache** → SportMonks data could be stale
4. **No database indexes** → Unclear if critical queries optimized
5. **On-demand fit scoring** → Slow response times (>2s)

---

## PRODUCTION READINESS ASSESSMENT

### Current Status: **NOT READY FOR PRODUCTION**

**Blockers:**
- ❌ Security: Exposed secrets must be rotated
- ❌ Security: Webhook authentication bypass
- ❌ Core Feature: Dashboard fit scores are mock data
- ❌ Core Feature: Chat conversations not persisted
- ❌ Integration: WhatsApp confirmation messages not sent

**Production-Ready After:**
- ✅ Complete Day 1-3 fixes (security + core features)
- ✅ Rotate all exposed API keys
- ✅ Implement phone-to-club mapping
- ✅ Connect AI chat backend
- ✅ Fix mock fit scores

**Estimated Time to Production:** 3 days (1 senior developer, full-time)

**Estimated Time for Full Polish:** 7 days (includes mobile UX, monitoring, GDPR compliance)

---

## TECHNICAL DEBT SUMMARY

| Category | Items | Priority |
|----------|-------|----------|
| **Security** | 5 critical issues | 🚨 IMMEDIATE |
| **Data Integrity** | 6 risks | 🔴 HIGH |
| **Incomplete Features** | 7 features | 🔴 HIGH |
| **Performance** | 5 optimizations | 🟠 MEDIUM |
| **Mobile UX** | 10 improvements | 🟡 LOW |
| **GDPR Compliance** | 2 requirements | 🟠 MEDIUM |

**Total Technical Debt Items:** 35

---

## RECOMMENDATIONS

### Immediate (Next 24 Hours)
1. Rotate all exposed API keys
2. Remove DEFAULT_CLUB_ID fallback
3. Add webhook signature validation

### Short-term (Week 1-2)
1. Fix conflicting fit score gate logic
2. Implement real WhatsApp provider integration
3. Connect AI chat backend to frontend
4. Persist chat conversations to database

### Medium-term (Month 2)
1. Add retry logic with exponential backoff
2. Implement soft deletes for audit trail
3. Add database migration rollbacks
4. Implement actual PDF export for reports
5. Add player data refresh background job

### Ongoing
1. Monitor error logs for silent failures
2. Test mobile responsiveness on actual devices
3. Add integration tests for API routes
4. Implement feature flags for premium tiers
5. Regular security audit of RLS policies

---

**End of Audit Report**

**Last Updated:** 2026-01-16
**Next Review:** After Day 7 completion
