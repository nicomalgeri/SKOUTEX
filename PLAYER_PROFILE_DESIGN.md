# SKOUTEX Player Profile - Design Specification

**BeSoccer-inspired, premium director-friendly player profile**

Reference: BeSoccer player pages (structure only, no scraping)
Data: SportMonks API + SKOUTEX deterministic calculations
Target: Technical directors, scouts, club decision-makers

---

## 1. Top Header Layout

### Desktop (1440px+)

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Search]                    [+ Add to Watchlist] [⋮]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────┐                                                       │
│  │        │   DARÍO PAREJO                                       │
│  │ Photo  │   Central Midfielder • 35 years old                 │
│  │ 120px  │   Villarreal CF • Spain                             │
│  │        │                                                       │
│  └────────┘   [Market Value: €2.5M]  [Contract: Jun 2025]       │
│                                                                   │
│               ┌──────────┬──────────┬──────────┬──────────┐     │
│               │   Fit    │  Apps    │  Goals   │  Assists │     │
│               │   82     │   34     │    2     │    8     │     │
│               └──────────┴──────────┴──────────┴──────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy

1. **Player photo** (left, 120×120px, rounded-lg)
2. **Name** (text-2xl, font-bold, #2C2C2C)
3. **Position • Age** (text-sm, gray-600)
4. **Current club • Nationality** (text-sm, gray-500)
5. **Market value + Contract expiry** (inline pills, blue-50 bg)
6. **4-stat quick bar** (fits in one glance, no scrolling)

### Action Buttons (Top-Right)

- **Back arrow** (subtle, gray-500)
- **"+ Add to Watchlist"** (primary button if not added, green with checkmark if added)
- **"⋮" menu** (Export PDF, Share link, Request live scout report)

---

## 2. Tab Structure

### 7 Tabs (Horizontal scrollable on mobile)

#### 1. Overview (Default)
- Season summary card
- Last 5 matches table
- Performance radar chart
- Season-over-season comparison line chart

#### 2. Statistics
- Detailed per-90 metrics table
- Percentile bars vs position cohort
- Heatmap (average position)
- xG/xA timeline

#### 3. Career
- Full career transfers timeline
- Trophies/honors list
- Season-by-season stats table (collapsible by year)

#### 4. Scouting
- AI-generated strengths/weaknesses
- Fit analysis vs club context (if unlocked)
- Similar players module
- Scout notes (editable text area)

#### 5. Physical
- Injury history timeline
- Suspension history
- Minutes played trend
- Physical attributes (height, weight, preferred foot)

#### 6. Video (If Available)
- Embedded highlight reels
- Match clips
- "Request video analysis" CTA if empty

#### 7. Reports
- Generated PDF reports list
- "Generate new report" button
- Shared reports (if any)

### Tab Styling

- **Active:** Electric blue (#0031FF) underline, bold
- **Inactive:** Gray-500, regular weight
- **Hover:** Gray-700, subtle slide-up underline animation

---

## 3. Season Selector UX

### Position
Sticky below tabs, above content (floats with scroll)

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Tabs: [Overview] [Statistics] [Career] ...                       │
├─────────────────────────────────────────────────────────────────┤
│ Season: [2024/25 ▼] [All Competitions ▼]      Updated: 2h ago   │
└─────────────────────────────────────────────────────────────────┘
```

### Components

1. **Season dropdown** (2024/25, 2023/24, 2022/23, Career Total)
2. **Competition filter** (All, League Only, Cup, Europe, International)
3. **"Updated X ago"** timestamp (right-aligned, text-xs, gray-500)

### Behavior

- Selecting **"Career Total"** shows aggregated stats across all seasons
- Competition filter applies to current tab content
- Changes trigger smooth fade-out → data update → fade-in (300ms)
- Loading state: skeleton cards, no full-page spinner

### Mobile

- Sticky bar collapses to single row
- Dropdowns go full-width in bottom sheet

---

## 4. Season Summary Module

### Layout (Overview Tab, Top Card)

```
┌─────────────────────────────────────────────────────────────────┐
│  2024/25 SEASON SUMMARY                                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │ Appearances │   Goals     │  Assists    │  Minutes    │     │
│  │     34      │      2      │      8      │   2,840     │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
│                                                                   │
│  ┌────────────────────────┬────────────────────────┐            │
│  │  Pass Completion       │  Progressive Passes    │            │
│  │  91.2% (94th %ile)     │  12.4 per 90 (88th)    │            │
│  │  ████████████████░░    │  ████████████████░░░░  │            │
│  ├────────────────────────┼────────────────────────┤            │
│  │  Key Passes per 90     │  Duels Won %           │            │
│  │  2.8 (82nd %ile)       │  58% (65th %ile)       │            │
│  │  ████████████████░░░░  │  █████████████░░░░░░░  │            │
│  └────────────────────────┴────────────────────────┘            │
│                                                                   │
│  Form: [W][W][D][L][W]   |   Availability: ✓ Fit               │
└─────────────────────────────────────────────────────────────────┘
```

### Metrics Shown (Position-Dependent)

- **All positions:** Apps, Goals, Assists, Minutes
- **Midfielders:** Pass %, Progressive Passes, Key Passes, Duels Won
- **Defenders:** Tackles Won %, Interceptions, Clearances, Aerial %
- **Forwards:** Shot Conversion, xG Overperformance, Dribbles Won, Progressive Carries
- **GK:** Save %, Clean Sheets, PSxG+/-, Pass Completion

### Visual Rules

- **Percentile bars:** 0-49 gray, 50-74 blue, 75-89 indigo, 90-100 green
- **Form badges:** W (green), D (amber), L (red), 20px circles
- **Availability:** ✓ Fit (green), ⚠ Doubt (amber), ✗ Injured (red)

---

## 5. Career/Transfers Module

### Timeline Design (Career Tab)

```
┌─────────────────────────────────────────────────────────────────┐
│  CAREER TIMELINE                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  2023  ───●───────────────────────────────────                  │
│           │                                                       │
│           ▼ Transfer • Jul 2023                                  │
│           Villarreal CF ← Valencia CF                            │
│           Free Transfer                                          │
│           Contract: 2 years                                      │
│           Stats: 68 apps, 4 goals, 12 assists                   │
│                                                                   │
│  2020  ───●───────────────────────────────────                  │
│           │                                                       │
│           ▼ Transfer • Sep 2020                                  │
│           Valencia CF ← Villarreal CF                            │
│           €22M                                                   │
│           Contract: 3 years                                      │
│           Stats: 102 apps, 8 goals, 19 assists                  │
│                                                                   │
│  2017  ───●───────────────────────────────────                  │
│           │                                                       │
│           ▼ Transfer • Jul 2017                                  │
│           Villarreal CF ← Real Madrid (youth)                    │
│           Undisclosed                                            │
│           Stats: 143 apps, 12 goals, 28 assists                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Hierarchy

1. Year markers (left, bold, gray-700)
2. Vertical timeline (blue line, 2px)
3. Transfer nodes (blue dot, 12px)
4. Arrow + "Transfer • Date"
5. Club movement (To ← From)
6. Fee (highlight if >€10M)
7. Contract duration
8. Aggregated stats for that period

### Interaction

- **Click node** → expands to show season-by-season breakdown
- **Hover** → tooltip with exact transfer date + source
- **Trophy icons** inline if won during period

---

## 6. Injuries/Suspensions Module

### Layout (Physical Tab)

```
┌─────────────────────────────────────────────────────────────────┐
│  INJURY HISTORY                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┬──────────────┬──────────────┬──────────────┐     │
│  │   Date   │   Type       │   Duration   │   Matches    │     │
│  │          │              │              │   Missed     │     │
│  ├──────────┼──────────────┼──────────────┼──────────────┤     │
│  │ Dec 2024 │ Hamstring    │  21 days     │      6       │     │
│  │ Aug 2023 │ Ankle sprain │  14 days     │      3       │     │
│  │ Mar 2022 │ Thigh strain │  28 days     │      8       │     │
│  └──────────┴──────────────┴──────────────┴──────────────┘     │
│                                                                   │
│  Total Days Injured (24/25): 21  |  Availability: 94%           │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  SUSPENSIONS                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┬──────────────┬──────────────┐                    │
│  │   Date   │   Reason     │   Matches    │                    │
│  ├──────────┼──────────────┼──────────────┤                    │
│  │ Nov 2024 │ Yellow cards │      1       │                    │
│  │ May 2024 │ Red card     │      1       │                    │
│  └──────────┴──────────────┴──────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Empty States

- **No injuries:** "✓ No injuries recorded this season" (green bg, center-aligned)
- **No suspensions:** "No disciplinary issues" (gray bg)
- **No data:** "Injury data unavailable" (dashed border, muted)

### Visual Cues

- **Recent injury** (<7 days): Red badge "RECENT"
- **Chronic pattern** (3+ similar injuries): Amber warning icon
- **Availability %:** >90 green, 80-89 amber, <80 red

---

## 7. Attributes Module

### Compact KPI Card (Scouting Tab)

```
┌─────────────────────────────────────────────────────────────────┐
│  KEY ATTRIBUTES                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┬─────────────────┬─────────────────┐        │
│  │   TECHNICAL     │   PHYSICAL      │   MENTAL        │        │
│  ├─────────────────┼─────────────────┼─────────────────┤        │
│  │ Passing     9.2 │ Pace        6.8 │ Vision      8.9 │        │
│  │ Dribbling   7.1 │ Stamina     7.5 │ Decisions   9.0 │        │
│  │ First Touch 8.8 │ Strength    7.2 │ Composure   8.7 │        │
│  │ Long Balls  8.5 │ Acceleration 6.5│ Teamwork    9.1 │        │
│  └─────────────────┴─────────────────┴─────────────────┘        │
│                                                                   │
│  Ratings are percentile-based (0-10 scale vs position cohort)   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Calculation Logic

- Derived from SportMonks per-90 stats
- Normalized to 0-10 scale using percentiles
- Position-specific weights (e.g., "Passing" for CM uses pass completion + progressive passes + key passes)

### Color Coding

- **9.0-10.0:** Green (elite)
- **7.5-8.9:** Blue (strong)
- **6.0-7.4:** Gray (adequate)
- **<6.0:** Amber (weakness)

### Interaction

- **Hover attribute** → tooltip explains calculation
- **Click attribute** → shows percentile bar + rank (e.g., "Top 12% of CMs in La Liga")

---

## 8. Mobile Layout Rules (<768px)

### Priority Collapse Order

#### 1. Header
- Photo shrinks to 80×80px
- Contract/Market value move below name (stacked)
- 4-stat bar becomes 2×2 grid

#### 2. Tabs
- Horizontal scroll (snap-x)
- Active tab centers in viewport
- "More" indicator (gradient fade-out on right edge)

#### 3. Season Selector
- Dropdowns go full-width
- Stacks vertically (Season dropdown, then Competition filter)
- "Updated" timestamp moves to bottom-right of bar

#### 4. Season Summary
- 4-column stats become 2×2 grid
- Percentile bars stack vertically
- Form badges move below availability badge

#### 5. Career Timeline
- Left margin collapses (year markers inline)
- Transfer details stack vertically
- Stats summary hidden behind "View stats" toggle

#### 6. Attributes Module
- 3 columns become 1 column (Technical → Physical → Mental)
- Each section collapsible with chevron
- Default: Technical expanded, others collapsed

### Touch Targets

- Minimum **48×48px** for all interactive elements
- Tab bar: **56px** height
- Buttons: **44px** minimum height
- Dropdown toggles: **48px** tap area

### Bottom Navigation (Sticky)

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back]              [+ Watchlist]              [⋮ Menu]        │
└─────────────────────────────────────────────────────────────────┘
```

- Floats above content (z-index 50)
- Blur backdrop (backdrop-blur-lg)
- Safe area insets respected (iOS notch)

---

## Additional UX Notes

### Loading States

- Skeleton cards (animated pulse, gray-200)
- No spinners for <500ms operations
- Progressive image loading (blur-up from 10px placeholder)

### Error States

- "Data temporarily unavailable" (soft gray, retry button)
- "Season data not found" (suggests switching to Career Total)
- "You need to complete your club profile to see fit analysis" (links to onboarding)

### Accessibility

- All percentile bars have ARIA labels ("Passing: 91.2%, 94th percentile")
- Keyboard navigation: Tab through sections, Enter to expand
- Focus indicators: 2px blue ring, 2px offset
- Screen reader: "Jump to section" skip links

### Performance

- Lazy load tabs (only fetch data when tab clicked)
- Virtual scrolling for Career timeline if >50 transfers
- Image compression: WebP with JPEG fallback
- Critical CSS inline, rest deferred

---

## Data Sources

### SportMonks API Fields

- **Player Info:** `name`, `display_name`, `date_of_birth`, `position`, `image_path`
- **Career:** `transfers` (with `date`, `from_team`, `to_team`, `amount`)
- **Statistics:** `statistics` (with `minutes`, `goals`, `assists`, `passes`, etc.)
- **Injuries:** `injuries` (with `type`, `start_date`, `end_date`)
- **Market Value:** `market_value` (from `valuations`)
- **Contract:** `current_team.pivot.end` (contract expiry)

### SKOUTEX Calculations

- **Fit Score:** Club context matching algorithm (gated by onboarding completion)
- **Percentiles:** Position + league cohort ranking
- **Attributes:** Weighted composite metrics from per-90 stats
- **Form:** Last 5 match results from `fixtures`
- **Availability:** Injury status + suspension check

---

## Implementation Priority

### Phase 1 (MVP)
1. Header layout with player info
2. Overview tab (season summary + stats)
3. Career tab (transfers timeline)
4. Season selector

### Phase 2 (Core Features)
5. Statistics tab (detailed metrics)
6. Physical tab (injuries/suspensions)
7. Scouting tab (AI analysis, fit score)

### Phase 3 (Premium Features)
8. Attributes module
9. Video tab
10. Reports tab
11. Mobile optimizations

---

**End of Specification**
