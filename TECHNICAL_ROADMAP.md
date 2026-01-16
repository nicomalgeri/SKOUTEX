# SKOUTEX Technical Roadmap
**Focus**: Pure technical improvements and features
**No commercial/marketing considerations**

---

## Current Technical Status

### ✅ Completed Features
- Authentication (Supabase)
- Club onboarding (7 steps)
- AI strategy extraction (GPT-4)
- Position multi-select dropdown
- Player search with filters
- AI scouting reports
- Fit score algorithm
- PDF export
- Watchlist management
- News integration
- Dashboard with intelligent matching
- Club branding (logos)

### 🐛 Known Technical Issues
1. Wage budget field still visible (not required but shows)
2. ClubSelector doesn't auto-fill league from Sportmonks
3. No caching on API calls (slow on repeat)
4. Some player images may not have `unoptimized` prop
5. Featured players endpoint doesn't handle edge cases well

---

## Phase 1: Core Technical Improvements (High Priority)

### 1. API Performance & Caching
**Problem**: Multiple calls to Sportmonks/OpenAI are slow and expensive

**Solution**: Implement Redis caching
```bash
npm install ioredis
```

**Files to modify**:
- `src/lib/cache/redis.ts` (create)
- `src/lib/sportmonks/client.ts` (add caching layer)
- `src/app/api/club/featured-players/route.ts` (cache results)

**Caching Strategy**:
- Player data: 24 hours
- Club data: 7 days
- League data: 30 days
- AI strategy results: No cache (user-specific)
- Featured players: 1 hour per club

### 2. Database Indexing
**Problem**: Queries getting slower as data grows

**Migrations needed**:
```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clubs_user_id ON clubs(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_club ON watchlist(user_id, club_id);
CREATE INDEX IF NOT EXISTS idx_scouting_reports_player ON scouting_reports(player_id);
CREATE INDEX IF NOT EXISTS idx_scouting_reports_created ON scouting_reports(created_at DESC);

-- Add composite indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user_created
  ON watchlist(user_id, created_at DESC);
```

### 3. Error Handling Improvements
**Problem**: Generic error messages, no error tracking

**Todo**:
- [ ] Add Sentry for error tracking
- [ ] Better error boundaries in React
- [ ] Retry logic for API failures
- [ ] Exponential backoff for rate limits
- [ ] User-friendly error messages

**Files to create**:
- `src/lib/errors/handler.ts`
- `src/lib/errors/retry.ts`
- `src/components/ErrorBoundary.tsx`

### 4. Fix Wage Budget UI
**Problem**: Field visible but not required, confusing

**Options**:
A. Remove completely from UI
B. Move to "Advanced" section
C. Make optional with clear label

**Recommended**: Option B (move to advanced)

**File**: `src/app/(dashboard)/dashboard/club/page.tsx`

---

## Phase 2: Data Quality & Validation

### 1. Sportmonks Data Sync
**Problem**: Player data can be stale

**Solution**: Background jobs to refresh data

**Files to create**:
- `src/app/api/cron/sync-players/route.ts`
- `src/lib/jobs/player-sync.ts`

**Vercel cron config**:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-players",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### 2. Input Validation & Sanitization
**Problem**: No server-side validation on most endpoints

**Todo**:
- [ ] Add Zod schemas for all API endpoints
- [ ] Validate file uploads (PDF size, format)
- [ ] Sanitize user inputs (XSS prevention)
- [ ] Rate limiting on expensive operations

**Files to create**:
- `src/lib/validation/schemas.ts`
- `src/lib/middleware/validate.ts`
- `src/lib/middleware/rate-limit.ts`

### 3. Database Constraints
**Problem**: Can create invalid data

**Migrations needed**:
```sql
-- Add constraints
ALTER TABLE clubs ADD CONSTRAINT transfer_budget_positive
  CHECK (club_context->'finances'->>'transfer_budget_eur')::numeric > 0);

ALTER TABLE watchlist ADD CONSTRAINT unique_watchlist_entry
  UNIQUE(user_id, player_id);

-- Add foreign key constraints where missing
ALTER TABLE scouting_reports
  ADD CONSTRAINT fk_scouting_club
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
```

---

## Phase 3: Advanced Features

### 1. Transfer Window System
**Technical Requirements**:
- Store transfer window configs per league
- Calculate days remaining
- Show countdown in UI
- Block/warn when window closed

**Database schema**:
```sql
CREATE TABLE transfer_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league TEXT NOT NULL,
  season TEXT NOT NULL,
  window_type TEXT CHECK (window_type IN ('summer', 'winter')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league, season, window_type)
);
```

**Files to create**:
- `src/lib/transfer-windows/config.ts`
- `src/lib/transfer-windows/calculator.ts`
- `src/components/TransferWindowBadge.tsx`

### 2. Transfer Targets Management
**Technical Requirements**:
- CRUD operations for targets
- Link to player data
- Track status changes
- Sort/filter/search

**Database schema**:
```sql
CREATE TABLE transfer_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  target_price_eur INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'scouting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, player_id)
);

CREATE INDEX idx_targets_club ON transfer_targets(club_id);
CREATE INDEX idx_targets_status ON transfer_targets(status);
```

**Files to create**:
- `src/app/api/targets/route.ts`
- `src/app/(dashboard)/dashboard/targets/page.tsx`
- `src/components/TargetCard.tsx`

### 3. Watchlist Notifications
**Technical Requirements**:
- Daily background job
- Check watchlist players for changes
- Store notifications
- Email digest

**Database schema**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC);
```

**Files to create**:
- `src/app/api/cron/check-watchlist/route.ts`
- `src/lib/notifications/generator.ts`
- `src/lib/email/watchlist-digest.ts`
- `src/app/api/notifications/route.ts`

---

## Phase 4: Performance Optimization

### 1. Frontend Optimizations
**Todo**:
- [ ] Implement React.lazy() for code splitting
- [ ] Add Suspense boundaries
- [ ] Optimize bundle size (analyze with `@next/bundle-analyzer`)
- [ ] Lazy load images below fold
- [ ] Debounce search inputs
- [ ] Implement virtual scrolling for long lists

**Files to modify**:
- `next.config.js` (add bundle analyzer)
- Large page components (add lazy loading)
- `src/components/PlayerList.tsx` (virtual scrolling)

### 2. Database Query Optimization
**Todo**:
- [ ] Add EXPLAIN ANALYZE to slow queries
- [ ] Implement pagination everywhere
- [ ] Use database views for complex joins
- [ ] Add materialized views for aggregations

**Example**:
```sql
-- Materialized view for player stats
CREATE MATERIALIZED VIEW player_stats_summary AS
SELECT
  player_id,
  COUNT(*) as report_count,
  AVG(fit_score) as avg_fit_score,
  MAX(created_at) as last_report_date
FROM scouting_reports
GROUP BY player_id;

CREATE INDEX idx_player_stats_player ON player_stats_summary(player_id);

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY player_stats_summary;
```

### 3. API Response Optimization
**Todo**:
- [ ] Use HTTP/2 Server Push
- [ ] Enable compression (gzip/brotli)
- [ ] Add ETag headers for caching
- [ ] Implement GraphQL for complex queries (optional)
- [ ] Stream large responses

---

## Phase 5: Infrastructure & DevOps

### 1. Monitoring & Observability
**Setup**:
- [ ] Add application performance monitoring (APM)
- [ ] Database query monitoring
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Log aggregation

**Tools**:
- Vercel Analytics (built-in)
- Supabase logs
- Sentry for errors
- Datadog/New Relic (optional)

### 2. Testing Infrastructure
**Todo**:
- [ ] Add unit tests (Vitest)
- [ ] Add integration tests
- [ ] Add E2E tests (Playwright)
- [ ] Set up CI/CD pipeline
- [ ] Add test coverage reporting

**Files to create**:
- `src/__tests__/` directory
- `.github/workflows/test.yml`
- `playwright.config.ts`

### 3. Database Backups
**Setup**:
- [ ] Automated daily backups (Supabase handles this)
- [ ] Point-in-time recovery enabled
- [ ] Test restore process
- [ ] Document recovery procedures

### 4. Security Hardening
**Todo**:
- [ ] Add rate limiting middleware
- [ ] Implement CSRF protection
- [ ] Add security headers
- [ ] Set up Web Application Firewall (WAF)
- [ ] Regular dependency updates
- [ ] Security audit of API endpoints

**Files to create**:
- `src/middleware.ts` (security headers)
- `src/lib/security/rate-limit.ts`
- `src/lib/security/csrf.ts`

---

## Phase 6: Scaling Considerations

### 1. Database Scaling
**When to implement**: >10K users

**Strategy**:
- Read replicas for analytics
- Connection pooling (PgBouncer)
- Partition large tables by date
- Archive old data

### 2. API Scaling
**When to implement**: >1M API calls/day

**Strategy**:
- Edge functions for user-facing APIs
- Background workers for heavy tasks
- Queue system (BullMQ + Redis)
- Dedicated service for AI operations

### 3. File Storage
**Current**: Supabase Storage
**Future**: Consider CDN for PDFs (CloudFlare R2)

---

## Phase 7: Advanced AI Features

### 1. Improve Strategy Extraction
**Current**: GPT-4 with structured output
**Improvements**:
- [ ] Fine-tune model on football data
- [ ] Add confidence scores
- [ ] Support multiple languages
- [ ] Extract more fields (formation details, etc.)

### 2. Enhanced Fit Scoring
**Current**: Rule-based algorithm
**Improvements**:
- [ ] Machine learning model
- [ ] Historical performance data
- [ ] Injury prediction model
- [ ] Market value prediction

### 3. Recommendation Engine
**New feature**: Suggest players proactively

**Technical approach**:
- Collaborative filtering
- Content-based filtering
- Hybrid approach
- Real-time updates

---

## Technical Debt & Cleanup

### High Priority
- [ ] Remove unused imports across codebase
- [ ] Consistent error handling patterns
- [ ] Type safety improvements (fix `any` types)
- [ ] Consistent component naming
- [ ] Extract magic numbers to constants

### Medium Priority
- [ ] Refactor large components (>300 lines)
- [ ] Create shared UI component library
- [ ] Standardize API response format
- [ ] Consistent loading state patterns
- [ ] Better TypeScript strict mode compliance

### Low Priority
- [ ] Add JSDoc comments
- [ ] Consistent file naming convention
- [ ] Extract inline styles to Tailwind classes
- [ ] Reduce bundle size (remove unused deps)

---

## Developer Experience (DX)

### 1. Development Tooling
**Setup**:
- [ ] ESLint rules strictness
- [ ] Prettier auto-format on save
- [ ] Husky pre-commit hooks
- [ ] Commitlint for commit messages
- [ ] TypeScript strict mode

### 2. Documentation
**Create**:
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component Storybook
- [ ] Database schema diagram
- [ ] Architecture decision records (ADRs)
- [ ] Contributing guide

### 3. Local Development
**Improve**:
- [ ] Docker Compose for local stack
- [ ] Mock data generators
- [ ] Local Supabase setup
- [ ] Hot reload optimization
- [ ] Development seed data

---

## Immediate Next Steps (Technical Only)

### This Week
1. **Fix wage budget UI** (1 hour)
   - Move to advanced section or remove

2. **Add basic caching** (2-3 hours)
   - In-memory cache for featured players
   - Simple TTL strategy

3. **Database indexes** (1 hour)
   - Add missing indexes
   - Test query performance

4. **Error boundaries** (2 hours)
   - Add React error boundaries
   - Better error messages

### Next Week
1. **Transfer windows** (1 day)
   - Database schema
   - Calculation logic
   - UI components

2. **Transfer targets** (2 days)
   - Full CRUD API
   - UI implementation
   - Integration with search

3. **Performance audit** (1 day)
   - Bundle size analysis
   - Lighthouse scores
   - Database query profiling

---

## Technical Questions to Explore

### Architecture Decisions
- [ ] Should we move to GraphQL?
- [ ] Do we need a separate AI service?
- [ ] Should reports be generated async?
- [ ] Do we need real-time features (WebSockets)?
- [ ] Should we use server components more?

### Data Strategy
- [ ] How long to keep old reports?
- [ ] Should we denormalize for performance?
- [ ] Do we need full-text search (Algolia/Elasticsearch)?
- [ ] How to handle player transfers (data consistency)?

### API Design
- [ ] RESTful vs GraphQL
- [ ] Versioning strategy
- [ ] Pagination approach (offset vs cursor)
- [ ] Rate limiting strategy

---

## Resources & Tools

### Development
- Next.js 16 docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs

### Performance
- Lighthouse CI
- Bundle analyzer
- React DevTools Profiler

### Monitoring
- Vercel Analytics
- Supabase Dashboard
- Sentry (errors)

### Testing
- Vitest (unit tests)
- Playwright (E2E)
- React Testing Library

---

*Focus on technical excellence. Build features when needed, not because they're trendy.*
