# SKOUTEX Premium Dashboard - Player-Filtering Cockpit Design

**Purpose:** Give a Director of Football instant actionable insights in the first 5 seconds.

**Philosophy:** Speed over depth. The dashboard answers: "What should I look at today?"

---

## Section Order (Top to Bottom)

1. **Hero Stats Bar** (4 metrics, one glance)
2. **Current Position Targets** (club needs + SKOUTEX picks)
3. **Recent Transfers** (league feed + filters)
4. **AI Scout Assistant CTA** (single premium button)

---

## 1. Hero Stats Bar

### Desktop (1440px+)

```
┌──────────┬──────────┬──────────┬──────────┐
│ Searches │ Players  │ Watchlist│ Avg Fit  │
│ Today    │ Analyzed │          │ Score    │
│   24     │    142   │    32    │   82     │
│  +12%    │   +8%    │   +4     │   +3%    │
└──────────┴──────────┴──────────┴──────────┘
```

### Card Specifications

**Layout:**
- Grid: 1fr 1fr 1fr 1fr (4 equal columns)
- Gap: 24px
- Container: max-width 1440px, padding 48px

**Card Style:**
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB (gray-200)
- Border radius: 16px
- Padding: 24px
- Hover state:
  - Border → #0031FF (electric blue)
  - Shadow: 0 10px 25px rgba(0, 49, 255, 0.1)
  - Transform: translateY(-2px)
  - Transition: all 200ms ease-out

**Typography:**
- **Label:**
  - Font size: 14px (text-sm)
  - Color: #6B7280 (gray-500)
  - Weight: 500 (medium)
  - Margin bottom: 4px
- **Value:**
  - Font size: 30px (text-3xl)
  - Color: #111827 (gray-900)
  - Weight: 700 (bold)
  - Line height: 1
- **Change Indicator:**
  - Font size: 14px (text-sm)
  - Color: #10B981 (green-600) for positive, #EF4444 (red-600) for negative
  - Weight: 500 (medium)
  - Position: absolute, bottom-right

**Icons:**
- Size: 20×20px
- Color: #0031FF
- Background: #EFF6FF (blue-50)
- Container: 40×40px circle, border-radius 50%
- Position: top-left of card

**Animation (On Page Load):**
- Type: Fade + slide down
- Initial state: opacity 0, translateY(-10px)
- Final state: opacity 1, translateY(0)
- Duration: 200ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Stagger: 50ms between each card (left to right)
- Start delay: 0ms

---

## 2. Current Position Targets

### Section Header

**Text:**
```
Current Position Targets
Based on your tactical needs
```

**Typography:**
- Title: 24px (text-2xl), #111827, font-semibold, margin-bottom 4px
- Subtitle: 14px (text-sm), #6B7280, margin-bottom 24px

### Layout Structure (Desktop)

Each position need displays:
1. Position header (e.g., "Centre Back Targets")
2. Priority badge (HIGH / MEDIUM / LOW)
3. 2 player cards side-by-side

```
┌─────────────────────────────────────────────────────────────────┐
│ CENTRE BACK TARGETS                                [HIGH]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  Player Card A       │      │  Player Card B       │        │
│  │  (320px × 440px)     │      │  (320px × 440px)     │        │
│  └──────────────────────┘      └──────────────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Position Header:**
- Font: 18px (text-lg), #111827, font-semibold
- Margin bottom: 16px
- Display: inline-flex with priority badge

**Priority Badge:**
- **HIGH:**
  - Background: #FEE2E2 (red-100)
  - Text: #991B1B (red-700)
  - Border: none
- **MEDIUM:**
  - Background: #FEF3C7 (amber-100)
  - Text: #92400E (amber-700)
- **LOW:**
  - Background: #DBEAFE (blue-100)
  - Text: #1E40AF (blue-700)
- Font: 11px (text-xs), uppercase, font-semibold
- Padding: 4px 8px
- Border radius: 4px
- Margin left: 12px

### Player Card Specifications (320×440px)

**Full Card Layout:**
```
┌──────────────────────────────────────┐
│ CB              [Fit 82] ←───────────┼─── Position + Fit badge
├──────────────────────────────────────┤
│                                      │
│  FIKAYO TOMORI ←─────────────────────┼─── Name (18px bold)
│  AC Milan • 26 years old ←───────────┼─── Club • Age (14px)
│                                      │
│       ┌───────────┐                  │
│       │  Circular │ ←────────────────┼─── KPI graph (120×120px)
│       │    KPI    │                  │
│       │   Graph   │                  │
│       └───────────┘                  │
│                                      │
│  ● Strong Fit ←──────────────────────┼─── Fit verdict (14px)
│                                      │
├──────────────────────────────────────┤
│ [View Profile]  [+ Shortlist] ←──────┼─── Actions
└──────────────────────────────────────┘
```

**Card Container:**
- Width: 320px
- Height: 440px
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 16px
- Padding: 24px
- Hover effects:
  - Border → #0031FF
  - Transform: translateY(-4px)
  - Shadow: 0 20px 40px rgba(0, 0, 0, 0.12)
  - Transition: all 200ms ease-out

**Position Badge (Top-Left):**
- Font: 11px (text-xs), uppercase, tracking-wide
- Color: #6B7280 (gray-500)
- Weight: 600 (semibold)
- Examples: "CB", "RW", "ST", "GK"

**Fit Score Badge (Top-Right):**
- **85-100 (Excellent):**
  - Background: #D1FAE5 (green-50)
  - Text: #059669 (green-600)
- **75-84 (Strong):**
  - Background: #DBEAFE (blue-50)
  - Text: #0031FF (electric blue)
- **65-74 (Good):**
  - Background: #E0E7FF (indigo-50)
  - Text: #4F46E5 (indigo-600)
- **50-64 (Potential):**
  - Background: #F3F4F6 (gray-100)
  - Text: #4B5563 (gray-600)
- Font: 11px (text-xs), font-semibold
- Padding: 4px 8px
- Border radius: 9999px (full rounded)
- Text: "Fit {score}"

**Player Name:**
- Font: 18px (text-lg), #111827, font-semibold
- Margin bottom: 4px
- Text transform: Uppercase first letter of each word

**Club • Age:**
- Font: 14px (text-sm), #4B5563 (gray-600)
- Separator: " • " (middle dot)
- Margin bottom: 16px

**Fit Verdict (Bottom):**
- **Layout:** Inline-flex with color dot
- **Color Dot:**
  - Size: 8px circle
  - Colors:
    - 85+: #059669 (green-600)
    - 75-84: #0031FF (blue)
    - 65-74: #4F46E5 (indigo-600)
    - 50-64: #F59E0B (amber-500)
  - Margin right: 8px
- **Text:**
  - Font: 14px (text-sm), font-medium
  - Color: matches dot
  - Labels: "Excellent Fit" / "Strong Fit" / "Good Fit" / "Potential Fit"

**Action Buttons:**
- **Container:** Flex row, gap 8px, margin-top 16px
- **View Profile:**
  - Background: #0031FF
  - Text: White, 14px, font-medium
  - Padding: 8px 16px
  - Border radius: 8px
  - Flex: 1 (takes remaining space)
  - Hover: background → #0029DD
- **Add to Shortlist:**
  - Background: Transparent
  - Border: 1px solid #D1D5DB (gray-300)
  - Size: 48px × 48px (square)
  - Icon: Plus (16px)
  - Border radius: 8px
  - Hover: border → #0031FF, background → #EFF6FF
  - Success state (after click):
    - Icon → Checkmark
    - Background: #D1FAE5 (green-50)
    - Border: #059669 (green-600)
    - Text: Green

**Animation (Per Card):**
- Type: Fade + scale
- Initial state: opacity 0, scale(0.95)
- Final state: opacity 1, scale(1)
- Duration: 250ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Stagger: 100ms between cards (left card first, then right)
- Start delay: 300ms (after section header animates in)

---

## 3. Circular KPI Graph Specification

### Graph Dimensions

- **Size:** 120×120px
- **Position:** Center of card, below player name
- **Margin bottom:** 16px

### Visual Structure

```
        Speed (9.2) ←─── Metric label + value
            ↑
            │
   Aerial ──┼── Passing
      (7.8) │    (8.5)
            │
            ○ ←─── Center dot
            │
  Tackling ─┼── Reading
      (8.1) │    (8.9)
            ↓
    Strength (7.4)
```

### Circle Track (Background)

- **Stroke width:** 8px
- **Color:** #F3F4F6 (gray-100)
- **Radius:** 52px (from center)
- **No fill**

### Circle Progress (Data Arc)

- **Stroke width:** 8px
- **Stroke-linecap:** round
- **No fill**
- **Color by value:**
  - **9.0-10.0:** #10B981 (green-500) — Elite
  - **7.5-8.9:** #0031FF (electric blue) — Strong
  - **6.0-7.4:** #6B7280 (gray-500) — Adequate
  - **<6.0:** #F59E0B (amber-500) — Weakness
- **Calculation:**
  - Arc length = (value / 10) × (2π × radius)
  - Start angle: -90deg (top of circle)
  - Stroke-dasharray: `${arcLength} ${circumference - arcLength}`

### Data Point Dots

- **Size:** 10px circle
- **Fill:** Same color as progress arc
- **Stroke:** 2px white (for contrast against arcs)
- **Position:** End of each arc segment

### Metric Labels

- **Font:** 11px (text-xs), #4B5563 (gray-600), font-medium
- **Position:** Outside circle, 8px offset from edge
- **Max length:** 8 characters (truncate with "..." if longer)
- **Placement:** Radially distributed (every 60 degrees for 6 metrics)

### Metric Values

- **Font:** 11px (text-xs), #111827 (gray-900), font-semibold
- **Format:** In parentheses, e.g., "(9.2)"
- **Position:** Below label, on same radial line

### Center Indicator

- **Size:** 6px circle
- **Color:** #0031FF
- **Opacity:** 0.5
- **Purpose:** Visual anchor point

### Position-Specific KPIs (Default 6 Metrics)

#### Centre Backs (CB)
1. **Aerial Duels Won %** — Raw 0-100 → divide by 10 → 0-10 scale
2. **Pass Completion %** — Raw 0-100 → divide by 10
3. **Tackles Won %** — Raw 0-100 → divide by 10
4. **Interceptions per 90** — Percentile rank → divide by 10
5. **Progressive Passes per 90** — Percentile rank → divide by 10
6. **Clearances per 90** — Percentile rank → divide by 10

#### Full Backs (FB)
1. **Tackles Won %**
2. **Progressive Carries per 90**
3. **Crosses Completed %**
4. **Key Passes per 90**
5. **Dribbles Won %**
6. **Defensive Actions per 90**

#### Central Midfielders (CM)
1. **Pass Completion %**
2. **Progressive Passes per 90**
3. **Ball Recoveries per 90**
4. **Key Passes per 90**
5. **Dribbles Won %**
6. **Duels Won %**

#### Wingers (W)
1. **Dribbles Won %**
2. **Key Passes per 90**
3. **Shot Accuracy %**
4. **Progressive Carries per 90**
5. **Goal Contributions per 90**
6. **Successful Crosses %**

#### Strikers (ST)
1. **Shot Conversion %**
2. **Goals per 90**
3. **xG Overperformance** — Normalize -2 to +2 → ((value + 2) / 4) × 10
4. **Aerial Duels Won %**
5. **Key Passes per 90**
6. **Dribbles Won %**

#### Goalkeepers (GK)
1. **Save %**
2. **Clean Sheets %** — (Clean sheets / matches) × 100 → divide by 10
3. **Pass Completion %**
4. **Crosses Claimed %**
5. **Sweeper Actions per 90**
6. **PSxG+/-** — Normalize -1 to +1 → ((value + 1) / 2) × 10

### Normalization Methods

#### Percentages (0-100 raw)
```
normalized_value = raw_value / 10
Example: 85% pass completion → 8.5 on graph
```

#### Per-90 Statistics
```
1. Calculate percentile rank within position + league cohort
   (e.g., player's 3.2 interceptions per 90 = 88th percentile)
2. normalized_value = percentile / 10
Example: 88th percentile → 8.8 on graph
```

#### xG Overperformance (-2 to +2)
```
normalized_value = ((raw_value + 2) / 4) × 10
Examples:
  +1.5 xG → ((1.5 + 2) / 4) × 10 = 8.75
  -0.5 xG → ((-0.5 + 2) / 4) × 10 = 3.75
  0.0 xG → ((0 + 2) / 4) × 10 = 5.0 (neutral)
```

#### PSxG+/- (-1 to +1)
```
normalized_value = ((raw_value + 1) / 2) × 10
Examples:
  +0.5 → ((0.5 + 1) / 2) × 10 = 7.5
  -0.3 → ((-0.3 + 1) / 2) × 10 = 3.5
  0.0 → ((0 + 1) / 2) × 10 = 5.0 (neutral)
```

### Missing Data Handling

**If single metric unavailable:**
- Show gray dot at 0 position (no arc)
- Label: #9CA3AF (gray-400), strikethrough text decoration
- Tooltip on hover: "Data unavailable"

**If 3+ metrics unavailable (less than 3 available):**
- Replace entire graph with text message:
  - "Limited data available"
  - Font: 14px (text-sm), #6B7280, center-aligned
  - Background: #F9FAFB (gray-50)
  - Padding: 32px
  - Border: 1px dashed #D1D5DB

### Graph Animation Sequence

**Total animation time:** ~900ms

1. **Center dot** (0-100ms)
   - Fade in from opacity 0 to 0.5
   - Easing: ease-out
   - Start: 0ms

2. **Gray track** (100-300ms)
   - Draw complete circle
   - Stroke-dasharray animation: 0 to full circumference
   - Easing: ease-out
   - Start: 100ms

3. **Data arcs** (350-750ms)
   - Each arc draws individually
   - Draw clockwise from top (12 o'clock position)
   - Duration per arc: 400ms
   - Stagger: 60ms between arcs
   - Easing: cubic-bezier(0.65, 0, 0.35, 1) — easeInOutCubic
   - Start: 350ms

4. **Data point dots** (350-750ms)
   - Fade + scale from 0
   - Appear at end of arc draw
   - Duration: 200ms
   - Synchronized with arc completion

5. **Labels** (600-800ms)
   - Fade in from opacity 0
   - Duration: 200ms
   - Easing: ease-out
   - Start: 600ms

**Reduced motion:**
- If user has `prefers-reduced-motion: reduce`:
  - Skip all animations
  - Show final state immediately

---

## 4. Recent Transfers Module

### Section Header

**Text:**
```
Recent Transfers
Last 7 days
```

**Typography:**
- Title: 24px (text-2xl), #111827, font-semibold
- Subtitle: 14px (text-sm), #6B7280, margin-top 4px

### Filter Bar (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Leagues ▼]  [Positions ▼]  [□ Target-related only]    Filters │
└─────────────────────────────────────────────────────────────────┘
```

**Layout:**
- Display: Flex row, space-between
- Gap: 12px
- Margin bottom: 24px
- Padding: 12px 16px
- Background: #F9FAFB (gray-50)
- Border radius: 12px

**Filter Dropdown Buttons:**
- Padding: 8px 12px
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Font: 14px (text-sm), #374151 (gray-700)
- Icon: ChevronDown, 16px, right-aligned
- Hover: border → #D1D5DB
- Active state:
  - Background: #EFF6FF (blue-50)
  - Border: #0031FF
  - Text: #0031FF

**Target-Related Checkbox:**
- Display: Flex row, align-center
- Gap: 8px
- Label: "Only transfers involving our current targets"
- Font: 14px (text-sm), #374151
- Checkbox: 16×16px, border 2px #D1D5DB
- Checked: background #0031FF, checkmark white

**"Filters" Label (Right):**
- Icon: Filter (lucide), 16px
- Color: #6B7280
- Font: 14px (text-sm), #6B7280
- Cursor: default (not clickable)

**Dropdown Panel:**
- Width: 280px
- Max height: 300px (scroll if needed)
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 12px
- Shadow: 0 10px 25px rgba(0, 0, 0, 0.1)
- Padding: 12px
- Position: absolute, top 100% + 8px

**Dropdown Options:**
- Multi-select checkboxes
- Padding: 8px 12px per option
- Hover: background #F9FAFB
- Font: 14px (text-sm), #374151
- Checkbox: 16×16px

**Apply Behavior:**
- Changes apply instantly (no "Apply" button)
- Fade out old cards (150ms)
- Fetch new data
- Fade in new cards (150ms)

### Transfer Card Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Shion Shinkawa                             €700K    [?]  16h ago│
│ Sagan Tosu → Sint-Truiden                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Card Container:**
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 12px
- Padding: 16px 20px
- Margin bottom: 12px
- Hover:
  - Border → #CBD5E1 (gray-300)
  - Cursor: pointer
- Transition: all 150ms ease

**Layout (Flex Row):**
1. **Player name** (left, flex-1)
   - Font: 16px (text-base), #111827, font-semibold
2. **Fee** (right)
   - Font: 14px (text-sm), #374151, font-medium
   - Examples: "€700K", "£42.5M", "Free", "Loan", "Undisclosed"
3. **Position badge** (after fee)
   - Font: 11px (text-xs), uppercase, #6B7280
   - Background: #F3F4F6 (gray-100)
   - Padding: 2px 6px
   - Border radius: 4px
   - Margin left: 8px
   - Examples: "CB", "RW", "ST"
4. **Time ago** (far right)
   - Font: 11px (text-xs), #9CA3AF (gray-400)
   - Margin left: 16px
   - Examples: "2h ago", "16h ago", "1d ago", "3d ago"

**Transfer Direction (Second Line):**
- Font: 14px (text-sm), #6B7280
- Format: "Club A → Club B"
- Arrow: "→" (not emoji, use actual character)
- Margin top: 4px

**Expand Interaction:**
- Click card to expand
- Expanded content shows:
  - Player age
  - Contract length
  - Last season stats (Apps, Goals, Assists)
- Expand icon: ChevronDown (16px, gray-400)
  - Position: absolute right, center vertically
  - Rotates 180deg when expanded
- Animation:
  - Height: auto (smooth transition)
  - Duration: 200ms
  - Easing: ease-out

**Expanded State Content:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Shion Shinkawa                             €700K    [?]  16h ago│
│ Sagan Tosu → Sint-Truiden                                  [▲]  │
│                                                                   │
│ • 25 years old                                                   │
│ • Contract: 3 years                                              │
│ • Last season: 28 apps, 3 goals, 5 assists                      │
└─────────────────────────────────────────────────────────────────┘
```

- Font: 14px (text-sm), #6B7280
- Bullet style: "•" (middle dot)
- Line height: 1.6
- Padding top: 12px (separator)

### Default Behavior

**On Page Load:**
1. Fetch transfers from user's primary league (from club context)
2. If no primary league set: Default to "Premier League"
3. Time range: Last 7 days
4. Limit: Show max 8 transfers
5. Sort: Most recent first (descending by date)

**Empty State:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    No recent transfers                           │
│                                                                   │
│              No transfers in selected filters                    │
│        Try adjusting your league or position filters            │
│                                                                   │
│                          [icon]                                  │
└─────────────────────────────────────────────────────────────────┘
```

- Icon: TrendingUp (lucide), 48px, #D1D5DB
- Text: 14px (text-sm), #6B7280, center-aligned
- Padding: 48px
- Background: #F9FAFB (gray-50)
- Border: 2px dashed #E5E7EB
- Border radius: 12px

---

## 5. AI Scout Assistant CTA

### Full Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                     [Sparkle Icon]                               │
│                                                                   │
│              ✨ Need player recommendations?                     │
│                                                                   │
│   Get intelligent, data-driven suggestions from our AI Scout    │
│   Assistant. Ask about tactics, compare players, or discover    │
│   hidden gems.                                                   │
│                                                                   │
│                  [Open Scout Assistant]                          │
│                                                                   │
│        ✨ Powered by GPT-4 • Context-aware • Real-time          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Container Specifications

**Outer Container:**
- Background: Linear gradient, 135deg
  - From: #0031FF (top-left)
  - To: #0029DD (bottom-right)
- Border radius: 24px
- Padding: 48px 32px
- Text align: center
- Margin top: 48px
- Position: relative (for decorative elements)
- Overflow: hidden

**Decorative Animated Grid (Background):**
- Pattern: 40×40px grid lines
- Color: rgba(255, 255, 255, 0.1)
- Lines: 1px solid
- Position: absolute, inset 0
- Pointer events: none
- Hover effect: scale 1.0 → 1.05 (1000ms ease)

**Floating Sparkles (6 Dots):**
- Size: 4×4px each
- Color: White
- Border radius: 50%
- Positions (% width): 15%, 30%, 45%, 60%, 75%, 90%
- Vertical positions: Randomly 20-80% height
- Opacity: 0.4 (default) → 1.0 (on hover)
- Animation on hover: translateY 0 → -8px per dot
- Stagger: 200ms delay between each dot
- Transition: 1000ms ease

### Icon (Top Center)

**Container:**
- Size: 64×64px circle
- Background: rgba(255, 255, 255, 0.2)
- Backdrop filter: blur(8px)
- Display: inline-flex, center-aligned
- Margin bottom: 16px

**Icon:**
- Component: Sparkles (lucide-react)
- Size: 32×32px
- Color: White

**Hover Animation:**
- Scale: 1.0 → 1.1
- Rotate: 0deg → 12deg
- Duration: 300ms
- Easing: ease-out

### Typography

**Headline:**
- Text: "✨ Need player recommendations?"
- Font: 20px (text-xl), White, font-semibold
- Margin bottom: 8px

**Body Text:**
- Text: "Get intelligent, data-driven suggestions from our AI Scout Assistant. Ask about tactics, compare players, or discover hidden gems."
- Font: 16px (text-base), #DBEAFE (blue-100)
- Line height: 1.6 (relaxed)
- Max width: 600px
- Margin: 0 auto 24px

### CTA Button

**Button Specifications:**
- Background: White (#FFFFFF)
- Text: "Open Scout Assistant"
- Text color: #0031FF
- Font: 14px (text-sm), font-semibold
- Padding: 12px 24px
- Border radius: 8px
- Border: none
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Display: inline-flex, center-aligned
- Cursor: pointer

**Hover State:**
- Transform: scale(1.05)
- Shadow: 0 6px 20px rgba(0, 0, 0, 0.2)
- Transition: all 200ms ease-out

**Link:**
- Destination: `/dashboard/chat`
- Type: Next.js Link component

### Hint Text (Bottom)

**Text:**
- Content: "✨ Powered by GPT-4 • Context-aware • Real-time insights"
- Font: 12px (text-xs), #BFDBFE (blue-200)
- Margin top: 16px

### Hover Effects (Container)

**Gradient Overlay:**
- Background: Linear gradient, 180deg (top to bottom)
  - From: rgba(0, 41, 221, 0.2)
  - To: transparent
- Position: absolute, inset 0
- Opacity: 0 (default) → 1 (on hover)
- Transition: 300ms ease
- Pointer events: none

---

## 6. Mobile Layout Rules (<768px)

### Thumb Zone Priority (Bottom 40%)

**Critical Actions (Must be in thumb reach):**
- View Profile button
- Add to Shortlist button
- Filter dropdowns trigger
- Transfer card tap to expand
- AI Scout Assistant CTA button

**Layout Strategy:**
- Primary CTAs: Bottom 40% of viewport
- Scrollable content: Top 60%
- Fixed elements: Avoid covering thumb zone

### Stack Order & Transformations

#### 1. Hero Stats Bar (Mobile)

**Layout:**
- Grid: 2×2 (was 4 columns)
- Card size: Full width per row
- Gap: 12px (reduced from 24px)

**Card Changes:**
- Height: 100px (reduced from auto)
- Padding: 16px (reduced from 24px)
- Font sizes:
  - Value: 24px (was 30px)
  - Label: 12px (was 14px)
  - Change: 12px (was 14px)

#### 2. Position Targets (Mobile)

**Section Layout:**
- Player cards: Stack vertically (no side-by-side)
- Container: Full width with horizontal scroll
- Scroll type: snap-x snap-mandatory
- Snap align: center

**Card Layout:**
- Width: calc(100vw - 32px) — Full width minus padding
- Height: Auto (maintains aspect ratio)
- Margin: 0 8px (gap between cards)

**Scroll Behavior:**
- Overflow-x: scroll
- Scroll-snap-type: x mandatory
- Scroll-snap-align: center
- Scroll padding: 16px
- Scrollbar: Hidden (scrollbar-hide class)

**Swipe Indicators:**
- Dots below cards
- Size: 8px circle per card
- Color: #D1D5DB (inactive), #0031FF (active)
- Gap: 8px
- Position: Center-aligned, margin-top 12px

**Player Card Changes:**
- Padding: 16px (was 24px)
- Name: 16px (was 18px)
- KPI graph: 100px (was 120px)
- Actions: Stack vertically
  - View Profile: Full width
  - Shortlist: Full width below
  - Gap: 8px

#### 3. Recent Transfers (Mobile)

**Filter Bar:**
- Type: Bottom sheet (slides up from bottom)
- Trigger: "Filters" button (full width, top of section)
- Background: White
- Border radius: 24px 24px 0 0
- Shadow: 0 -4px 20px rgba(0, 0, 0, 0.15)
- Max height: 70vh
- Overflow: scroll

**Transfer Cards:**
- Width: 100% (full width)
- Padding: 16px (reduced from 20px)
- Font sizes: Same as desktop
- Tap to expand: Full detail reveals
- No hover effects (touch-only)

#### 4. AI Scout Assistant CTA (Mobile)

**Container:**
- Padding: 32px 20px (reduced from 48px 32px)
- Border radius: 20px (reduced from 24px)

**Typography:**
- Headline: 18px (was 20px)
- Body: 14px (was 16px)
- Hint: 11px (was 12px)

**Button:**
- Width: 100% (full width)
- Padding: 14px 20px (increased for touch)

### Touch Target Specifications

**Minimum Sizes:**
- All interactive elements: 48×48px minimum
- Buttons: 44px height minimum
- Checkboxes/toggles: 24×24px minimum
- Spacing between targets: 12px minimum

**Examples:**
- Player card CTA buttons: 44px height
- Filter dropdowns: 48px height
- Transfer card tap area: Full card height (min 64px)
- AI CTA button: 48px height

### Scroll Behavior

**Position Targets:**
- Horizontal scroll only
- Snap to center of each card
- Momentum scrolling enabled
- Scroll indicators: Dots below cards

**Hero Stats / Transfers:**
- Vertical scroll only
- No horizontal scroll
- Cards stack with 12px vertical gap
- Natural scrolling behavior

**Page-Level:**
- Vertical scroll
- No overscroll bounce (iOS)
- Scroll padding top: 0
- Scroll padding bottom: 24px (safe area)

### Performance Optimizations (Mobile)

**Animation Adjustments:**
- Disable hover animations (not applicable on touch)
- Reduce animation duration by 50%
  - Example: Card load 250ms → 125ms
  - Example: KPI arc draw 400ms → 200ms
- Disable parallax effects
- Disable complex gradient animations

**Lazy Loading:**
- KPI graphs: Only render when in viewport
- Transfer cards: Virtualize if >20 cards
- Images: Load on scroll (intersection observer)

**Touch Optimizations:**
- No :hover states on touch devices
- Tap highlight color: transparent
- -webkit-tap-highlight-color: transparent
- touch-action: manipulation (prevents double-tap zoom)

---

## 7. Microcopy Reference

### Section Headers

- **Hero Stats:** (No header, just cards)
- **Position Targets:** "Current Position Targets" / "Based on your tactical needs"
- **Transfers:** "Recent Transfers" / "Last 7 days"
- **AI CTA:** "Need player recommendations?"

### Player Card

- **Position badge:** "CB", "RW", "LB", "ST", "GK" (2-3 char, uppercase)
- **Fit badge:** "Fit 82", "Fit 91", etc.
- **Verdict labels:**
  - 85-100: "Excellent Fit"
  - 75-84: "Strong Fit"
  - 65-74: "Good Fit"
  - 50-64: "Potential Fit"
- **Action buttons:**
  - Primary: "View Profile"
  - Secondary: "+" → "✓" (icon only, on success)

### Filters

- **Dropdown labels:** "Leagues", "Positions"
- **Checkbox label:** "Only transfers involving our current targets"
- **Section label:** "Filters" (right-aligned, decorative)

### Transfer Card

- **Fee formats:**
  - Paid: "€700K", "£42.5M", "$15M"
  - Special: "Free", "Loan", "Undisclosed"
- **Time ago:**
  - <1 hour: "{X}m ago" (e.g., "45m ago")
  - 1-23 hours: "{X}h ago" (e.g., "16h ago")
  - 1-6 days: "{X}d ago" (e.g., "3d ago")
  - 7+ days: "1w ago", "2w ago"
- **Direction:** "Club A → Club B" (use → symbol)
- **Expanded details:**
  - "• 25 years old"
  - "• Contract: 3 years"
  - "• Last season: 28 apps, 3 goals, 5 assists"

### AI Scout Assistant CTA

- **Headline:** "✨ Need player recommendations?"
- **Body:** "Get intelligent, data-driven suggestions from our AI Scout Assistant. Ask about tactics, compare players, or discover hidden gems."
- **Button:** "Open Scout Assistant"
- **Hint:** "✨ Powered by GPT-4 • Context-aware • Real-time insights"

### Empty States

**Position Targets:**
- Primary: "No player recommendations available"
- Secondary: "Complete your club profile to get personalized recommendations"

**Recent Transfers:**
- Primary: "No recent transfers"
- Secondary: "No transfers in selected filters"
- Hint: "Try adjusting your league or position filters"

**KPI Graph (Insufficient Data):**
- Message: "Limited data available"
- Context: Shown when <3 metrics are available

### Loading States

- **Hero Stats:** "Loading..." (skeleton cards)
- **Position Targets:** "Loading player recommendations..."
- **Transfers:** "Loading recent transfers..."
- **KPI Graph:** (Gray circle with pulsing animation, no text)

---

## 8. Animation Timing Summary

| Element | Duration | Delay | Stagger | Easing |
|---------|----------|-------|---------|--------|
| Hero Stats (each card) | 200ms | 0ms | 50ms | ease-out |
| Position Section Header | 300ms | 100ms | — | ease-out |
| Player Card (each) | 250ms | 300ms | 100ms | ease-out |
| KPI Graph: Center dot | 100ms | 0ms | — | ease-out |
| KPI Graph: Track | 200ms | 100ms | — | ease-out |
| KPI Graph: Arcs (each) | 400ms | 350ms | 60ms | easeInOutCubic |
| KPI Graph: Dots | 200ms | (arc end) | — | ease-out |
| KPI Graph: Labels | 200ms | 600ms | — | ease-out |
| Transfer Cards | 200ms | 400ms | — | ease-out |
| AI CTA | 300ms | 600ms | — | ease-out |
| Add to Shortlist (success) | 300ms | 0ms | — | ease-out |
| Card Hover (lift) | 200ms | 0ms | — | ease-out |

**Total Page Load Animation:** ~1200ms (1.2 seconds)

**Mobile Adjustments:**
- All durations reduced by 50%
- Total page load: ~600ms

---

## 9. First 5 Seconds UX Flow

**Objective:** Answer "What should I look at today?" in 5 seconds.

### Timeline

**0-1 second:**
- Hero stats fade in
- User sees: Today's activity snapshot (searches, players analyzed, watchlist size, avg fit)
- Decision: "Am I on track with my targets?"

**1-2 seconds:**
- Position targets section appears
- User sees: Top 2-3 priority positions with "HIGH" badges
- Decision: "Which positions need immediate attention?"

**2-3 seconds:**
- Player cards load with KPI graphs
- User sees: Fit scores (82, 91, etc.) + circular KPIs + verdicts
- Decision: "Which player should I investigate first?"

**3-4 seconds:**
- Recent transfers section loads
- User sees: Latest signings in their league, with fees and positions
- Decision: "Is the market moving? Are my targets getting signed elsewhere?"

**4-5 seconds:**
- AI Scout Assistant CTA appears
- User sees: Clear next action if they need deeper analysis
- Decision: "Do I need AI help to find more players?"

### Possible User Actions (After 5s)

1. **Click player card** → View full profile (detailed stats, career, video)
2. **Add to shortlist** → Save player for later review
3. **Open AI Assistant** → Ask for tactical suggestions or player comparisons
4. **Adjust transfer filters** → Explore different leagues or positions
5. **Continue scrolling** → Review more transfers or position needs

### Success Metrics

- Time to first interaction: <5 seconds
- Clicks on player cards: >40% of sessions
- Shortlist additions: >20% of viewed players
- AI Assistant opens: >15% of sessions
- Bounce rate: <10% (user stays engaged)

---

## 10. Design System Reference

### Colors

**Primary:**
- Electric Blue: #0031FF
- Hover Blue: #0029DD

**Grays:**
- gray-50: #F9FAFB
- gray-100: #F3F4F6
- gray-200: #E5E7EB
- gray-300: #D1D5DB
- gray-400: #9CA3AF
- gray-500: #6B7280
- gray-600: #4B5563
- gray-700: #374151
- gray-900: #111827

**Status Colors:**
- Green (Success): #10B981, #D1FAE5 (bg)
- Red (Error): #EF4444, #FEE2E2 (bg)
- Amber (Warning): #F59E0B, #FEF3C7 (bg)
- Blue (Info): #0031FF, #EFF6FF (bg)

**Performance Indicators:**
- Elite (9.0+): #10B981 (green-500)
- Strong (7.5-8.9): #0031FF (blue)
- Adequate (6.0-7.4): #6B7280 (gray-500)
- Weakness (<6.0): #F59E0B (amber-500)

### Typography

**Font Family:** Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)

**Font Sizes:**
- text-xs: 11px
- text-sm: 14px
- text-base: 16px
- text-lg: 18px
- text-xl: 20px
- text-2xl: 24px
- text-3xl: 30px

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing

**Padding/Margin Scale:**
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px

**Gap Scale:**
- 8px, 12px, 16px, 24px

### Border Radius

- Small: 8px (buttons, badges)
- Medium: 12px (cards, inputs)
- Large: 16px (large cards)
- XL: 24px (CTA modules)
- Full: 9999px (pills, circles)

### Shadows

**Elevation Levels:**
- sm: 0 1px 3px rgba(0, 0, 0, 0.1)
- md: 0 4px 12px rgba(0, 0, 0, 0.1)
- lg: 0 10px 25px rgba(0, 0, 0, 0.1)
- xl: 0 20px 40px rgba(0, 0, 0, 0.12)

---

## 11. Accessibility Requirements

### Keyboard Navigation

- Tab order: Hero stats → Position cards → Filters → Transfer cards → AI CTA
- Focus indicators: 2px solid #0031FF, 2px offset, border-radius matching element
- Enter/Space: Activate buttons and checkboxes
- Arrow keys: Navigate within dropdown menus
- Escape: Close dropdowns and bottom sheets

### Screen Reader Support

**ARIA Labels:**
- Player cards: "Player recommendation: {Name}, {Position}, Fit score {Score}"
- KPI graphs: "Performance metrics for {Name}: {Metric 1} {Value}, {Metric 2} {Value}..."
- Filter dropdowns: "Filter by leagues", "Filter by positions"
- Transfer cards: "Transfer: {Player} from {From} to {To}, Fee {Fee}, {Time} ago"

**Live Regions:**
- Filter changes: aria-live="polite" announces "X transfers found"
- Shortlist success: aria-live="assertive" announces "Player added to shortlist"

### Color Contrast

- Text on white: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- Interactive elements: Minimum 3:1 against background
- Focus indicators: Minimum 3:1 against background

### Motion Preferences

**Respects `prefers-reduced-motion: reduce`:**
- All animations: Duration 0.01ms (effectively instant)
- Transitions: Duration 0.01ms
- No parallax effects
- No hover scale/rotate effects
- Graph draws: Show final state immediately

---

## 12. Performance Targets

### Loading Metrics

- **First Contentful Paint (FCP):** <1.5s
- **Largest Contentful Paint (LCP):** <2.5s (hero stats visible)
- **Time to Interactive (TTI):** <3.5s
- **Cumulative Layout Shift (CLS):** <0.1 (no layout jumps)

### Optimization Strategies

**Code Splitting:**
- Lazy load AI chat route (only load on CTA click)
- Lazy load filter dropdowns (load on first open)
- Lazy load KPI graphs (intersection observer)

**Image Optimization:**
- Player photos: WebP format, 240×240px max
- Lazy load below fold images
- Blur placeholder (10px) during load

**Data Fetching:**
- Hero stats: Parallel fetch with page load
- Position targets: Fetch on mount
- Transfers: Debounce filter changes (300ms)
- Cache API responses (5 minutes)

---

**End of Specification**
