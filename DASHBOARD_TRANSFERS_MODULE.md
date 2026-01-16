# Recent Transfers Module - Design Specification

**Purpose:** Give Directors of Football instant market intelligence on latest signings relevant to their needs.

**Default Behavior:** Shows latest transfers from user's primary league (last 7 days).

---

## A. Module Layout

### Desktop (1440px+)

```
┌─────────────────────────────────────────────────────────────────┐
│ Recent Transfers                                                 │
│ Last 7 days                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [Leagues ▼] [Positions ▼] [□ Target-related only]      Filters │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Shion Shinkawa                          €700K   [?]     16h ago │
│ Sagan Tosu → Sint-Truiden                                  [▼] │
│                                                                   │
│ Lance Duijvestijn                        Free   [CM]      1d ago│
│ Sparta Rotterdam → Fortuna Sittard                         [▼] │
│                                                                   │
│ Matías Arezo                            €8.5M   [ST]      2d ago│
│ Granada CF → River Plate                                   [▼] │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Section Header:**
- **Title:** "Recent Transfers"
  - Font: 24px (text-2xl), #111827 (gray-900), font-semibold
  - Margin bottom: 4px
- **Subtitle:** "Last 7 days"
  - Font: 14px (text-sm), #6B7280 (gray-500)
  - Margin bottom: 24px

**Container:**
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB (gray-200)
- Border radius: 16px
- Padding: 24px
- Margin top: 48px (spacing from previous section)

### Mobile (<768px)

```
┌───────────────────────────────────┐
│ Recent Transfers                  │
│ Last 7 days                       │
├───────────────────────────────────┤
│                                   │
│ [Filters ⋮]                       │← Triggers bottom sheet
│                                   │
├───────────────────────────────────┤
│                                   │
│ ┌─────────────────────────────┐ │
│ │ Shion Shinkawa              │ │← Swipeable card
│ │ €700K • ? • 16h ago         │ │
│ │ Sagan Tosu → Sint-Truiden   │ │
│ └─────────────────────────────┘ │
│                                   │
│ ┌─────────────────────────────┐ │
│ │ Lance Duijvestijn           │ │
│ │ Free • CM • 1d ago          │ │
│ │ Sparta → Fortuna Sittard    │ │
│ └─────────────────────────────┘ │
│                                   │
└───────────────────────────────────┘
```

**Mobile Adjustments:**
- Header font: 20px (was 24px)
- Subtitle font: 13px (was 14px)
- Container padding: 16px (was 24px)
- Cards: Full width, stacked vertically
- Filter button: Full width, centered

---

## B. Filter UI Specification

### Desktop Filter Bar

```
┌─────────────────────────────────────────────────────────────────┐
│ [Leagues ▼]  [Positions ▼]  [□ Target-related only]    Filters │
└─────────────────────────────────────────────────────────────────┘
```

**Layout:**
- Display: Flex row, justify-between, align-center
- Gap: 12px
- Background: #F9FAFB (gray-50)
- Border radius: 12px
- Padding: 12px 16px
- Margin bottom: 24px

#### Filter Dropdown Buttons

**Button Specifications:**
- Size: Auto width, 40px height
- Padding: 8px 12px
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB (gray-200)
- Border radius: 8px
- Font: 14px (text-sm), #374151 (gray-700), font-medium
- Icon: ChevronDown (lucide), 16px, margin-left 8px
- Cursor: pointer

**Button States:**
- **Default:**
  - Border: #E5E7EB
  - Background: White
- **Hover:**
  - Border: #D1D5DB (gray-300)
  - Background: #F9FAFB (gray-50)
- **Active (filters applied):**
  - Background: #EFF6FF (blue-50)
  - Border: #0031FF (electric blue)
  - Text: #0031FF
  - Badge: Circle with count

**Active State Badge:**
- Size: 18px circle
- Background: #0031FF
- Text: White, 11px (text-xs), font-semibold
- Position: Absolute, top-right of button
- Transform: translate(50%, -50%)
- Example: "2" for 2 leagues selected

#### Target-Related Toggle

**Checkbox Specifications:**
- Display: Flex row, align-center, gap 8px
- Checkbox size: 18×18px
- Border: 2px solid #D1D5DB (gray-300)
- Border radius: 4px

**Checked State:**
- Background: #0031FF
- Border: #0031FF
- Checkmark: White, 12px

**Label:**
- Text: "Target-related only"
- Font: 14px (text-sm), #374151 (gray-700), font-medium
- Cursor: pointer

**Hover:**
- Checkbox border: #9CA3AF (gray-400)

#### "Filters" Label (Right-Aligned)

**Specifications:**
- Display: Flex row, align-center, gap 8px
- Icon: Filter (lucide), 16px, #6B7280 (gray-600)
- Text: "Filters"
  - Font: 14px (text-sm), #6B7280, font-medium
- Not clickable (decorative label)

### Dropdown Panel (Desktop)

```
┌──────────────────────────────────┐
│ Select Leagues                   │
├──────────────────────────────────┤
│ ☑ Premier League                 │
│ ☐ La Liga                        │
│ ☐ Serie A                        │
│ ☐ Bundesliga                     │
│ ☐ Ligue 1                        │
│ ☐ Eredivisie                     │
│ ☐ Liga Portugal                  │
│ ☐ Championship                   │
│                                  │
│ [Clear All]      [Apply]         │
└──────────────────────────────────┘
```

**Panel Container:**
- Width: 320px
- Max height: 400px (scroll if more options)
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 12px
- Shadow: 0 10px 25px rgba(0, 0, 0, 0.1)
- Position: Absolute, below button, left-aligned
- Z-index: 50
- Padding: 16px

**Panel Header:**
- Text: "Select Leagues" / "Select Positions"
- Font: 16px (text-base), #111827 (gray-900), font-semibold
- Border bottom: 1px solid #E5E7EB
- Padding bottom: 12px
- Margin bottom: 12px

**Checkbox Options:**
- Padding: 10px 12px per option
- Border radius: 8px
- Hover: Background #F9FAFB (gray-50)
- Font: 14px (text-sm), #374151 (gray-700)
- Checkbox: 16×16px, left-aligned
- Gap: 12px between checkbox and label
- Cursor: pointer

**Footer Actions:**
- Display: Flex row, justify-between
- Margin top: 16px
- Padding top: 12px
- Border top: 1px solid #E5E7EB

**Clear All Button:**
- Text: "Clear All"
- Font: 14px (text-sm), #6B7280 (gray-600), font-medium
- Background: Transparent
- Padding: 8px 12px
- Border radius: 6px
- Hover: Background #F9FAFB

**Apply Button:**
- Text: "Apply"
- Font: 14px (text-sm), White, font-semibold
- Background: #0031FF
- Padding: 8px 16px
- Border radius: 6px
- Hover: Background #0029DD
- Transition: all 150ms ease

**Behavior:**
- Opens on button click
- Closes on:
  - Apply click (saves selections)
  - Outside click (no save)
  - Escape key (no save)
- Changes apply when "Apply" clicked
- Smooth fade in/out: 150ms ease

### Mobile Filter Bottom Sheet

```
┌───────────────────────────────────┐
│           Filter Transfers        │← Header
├───────────────────────────────────┤
│                                   │
│ Leagues                           │
│ ☑ Premier League                  │
│ ☐ La Liga                         │
│ ☐ Serie A                         │
│ ☐ Bundesliga                      │
│ ☐ Ligue 1                         │
│                                   │
│ Positions                         │
│ ☐ GK  ☐ CB  ☐ FB  ☐ CM          │
│ ☐ W   ☐ ST                        │
│                                   │
│ ☑ Target-related only             │
│                                   │
│ [Clear All]        [Apply]        │
│                                   │
└───────────────────────────────────┘
```

**Trigger Button (Mobile):**
- Width: 100%
- Height: 48px
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 12px
- Text: "Filters"
- Icon: Sliders (lucide), 20px
- Font: 16px (text-base), #374151 (gray-700), font-medium
- Display: Flex row, center, gap 12px

**Bottom Sheet Container:**
- Position: Fixed, bottom 0, left 0, right 0
- Max height: 80vh
- Background: White
- Border radius: 24px 24px 0 0
- Shadow: 0 -4px 20px rgba(0, 0, 0, 0.15)
- Padding: 24px 20px 32px (safe area for iOS notch)
- Z-index: 100

**Drag Handle (Top):**
- Size: 40px × 4px
- Background: #D1D5DB (gray-300)
- Border radius: 2px
- Position: Center top, margin 8px auto
- Cursor: grab

**Sheet Header:**
- Text: "Filter Transfers"
- Font: 20px (text-xl), #111827 (gray-900), font-semibold
- Border bottom: 1px solid #E5E7EB
- Padding bottom: 16px
- Margin bottom: 20px
- Position: Sticky, top 0, background white

**Section Groups:**
- Margin bottom: 24px per section
- Label: 14px (text-sm), #6B7280, font-semibold, uppercase, tracking-wide
- Margin bottom: 12px

**Position Chips (Mobile):**
- Display: Flex row, wrap, gap 8px
- Chip size: 56px × 36px
- Background: White (unselected), #EFF6FF (selected)
- Border: 1px solid #E5E7EB (unselected), #0031FF (selected)
- Text: 14px (text-sm), #374151 (unselected), #0031FF (selected), font-medium
- Border radius: 8px
- Tap: Toggle selection
- Transition: all 100ms ease

**Footer Actions:**
- Position: Sticky, bottom 0
- Background: White
- Padding top: 16px
- Border top: 1px solid #E5E7EB
- Display: Flex row, justify-between

**Animation:**
- Slide up: translateY(100%) → translateY(0)
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Backdrop: Black overlay, opacity 0 → 0.5, 300ms fade

---

## C. Transfer Card Layout

### Desktop Card (Collapsed State)

```
┌─────────────────────────────────────────────────────────────────┐
│ Shion Shinkawa                          €700K   [?]     16h ago │
│ Sagan Tosu → Sint-Truiden                                  [▼] │
└─────────────────────────────────────────────────────────────────┘
```

**Card Container:**
- Background: White
- Border: 1px solid #E5E7EB (gray-200)
- Border radius: 12px
- Padding: 16px 20px
- Margin bottom: 12px (spacing between cards)
- Cursor: pointer
- Transition: all 150ms ease

**Hover State:**
- Border: 1px solid #CBD5E1 (gray-300)
- Background: #F9FAFB (subtle gray tint)

### Card Field Order (Desktop, Collapsed)

**Top Row (Flex, Space-Between, Align-Center):**

1. **Player Name** (left, flex-1)
   - Font: 16px (text-base), #111827 (gray-900), font-semibold
   - Examples: "Shion Shinkawa", "Lance Duijvestijn"

2. **Transfer Fee** (right)
   - Font: 14px (text-sm), #374151 (gray-700), font-medium
   - Examples: "€700K", "£42.5M", "Free", "Loan", "Undisclosed"
   - Color: #059669 (green-600) if "Free" transfer

3. **Position Badge** (after fee)
   - Size: Auto width × 22px height
   - Background: #F3F4F6 (gray-100)
   - Border radius: 4px
   - Padding: 2px 8px
   - Font: 11px (text-xs), #6B7280 (gray-600), uppercase, font-semibold
   - Margin left: 8px
   - Examples: "CB", "RW", "ST", "GK", "CM", "?" (unknown)

4. **Time Ago** (far right)
   - Font: 11px (text-xs), #9CA3AF (gray-400)
   - Margin left: 16px
   - Examples: "2h ago", "16h ago", "1d ago", "3d ago", "1w ago"

**Bottom Row (Transfer Direction):**
- Font: 14px (text-sm), #6B7280 (gray-600)
- Format: "From Club → To Club"
- Arrow: "→" (U+2192 rightwards arrow, not emoji)
- Margin top: 4px
- Examples:
  - "Sagan Tosu → Sint-Truiden"
  - "Sparta Rotterdam → Fortuna Sittard"
  - "Granada CF → River Plate"

**Expand Icon (Right Side):**
- Icon: ChevronDown (lucide), 16px
- Color: #9CA3AF (gray-400)
- Position: Absolute right (20px from edge), center vertically
- Rotation: 0deg (collapsed), 180deg (expanded)
- Transition: transform 200ms ease

### Desktop Card (Expanded State)

```
┌─────────────────────────────────────────────────────────────────┐
│ Shion Shinkawa                          €700K   [?]     16h ago │
│ Sagan Tosu → Sint-Truiden                                  [▲] │
│                                                                   │
│ • 25 years old                                                   │
│ • Contract: 3 years                                              │
│ • 2023/24 Season: 28 apps, 3 goals, 5 assists                   │
│ • Nationality: Japan                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Expanded Content:**
- Margin top: 16px (separator from top content)
- Border top: 1px solid #E5E7EB (gray-200)
- Padding top: 12px

**Bullet List:**
- Font: 14px (text-sm), #6B7280 (gray-600)
- Line height: 1.6
- Bullet: "•" (U+2022, middle dot)
- Gap: 8px between lines

**Fields (in order):**
1. **Age:** "• {age} years old"
2. **Contract:** "• Contract: {years} years" / "• Contract expires: {month} {year}"
3. **Last season stats:** "• 2023/24 Season: {apps} apps, {goals} goals, {assists} assists"
4. **Nationality:** "• Nationality: {country}"

**Animation:**
- Height: Auto transition, 200ms ease-out
- Overflow: Hidden during animation
- Content fade in: opacity 0 → 1, 150ms, 50ms delay

### Mobile Card (Compact)

```
┌───────────────────────────────────┐
│ Shion Shinkawa                    │
│ €700K • ? • 16h ago               │
│ Sagan Tosu → Sint-Truiden         │
│                                   │
│ [Tap to expand]                   │
└───────────────────────────────────┘
```

**Card Container:**
- Width: 100% (full width minus padding)
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 12px
- Padding: 16px
- Margin bottom: 12px

**Layout (Stacked):**

1. **Player Name** (top)
   - Font: 16px (text-base), #111827 (gray-900), font-semibold
   - Margin bottom: 4px

2. **Meta Row** (middle)
   - Font: 13px (text-sm), #6B7280 (gray-600)
   - Format: "€700K • CB • 16h ago"
   - Separator: " • " (space + bullet + space)

3. **Transfer Direction** (bottom)
   - Font: 14px (text-sm), #6B7280 (gray-600)
   - Margin top: 8px
   - Format: "From → To"
   - Shortened club names if >20 chars

**Tap Target:**
- Full card area: 48px minimum height
- Active state: Background #F9FAFB, scale 0.98
- Transition: 100ms ease

**Expanded (Mobile):**
- Shows same details as desktop
- Full width expansion
- Tap card header to collapse

---

## D. Exact Microcopy Strings

### Section Headers
- **Title:** "Recent Transfers"
- **Subtitle:** "Last 7 days"

### Filter Labels
- **Leagues dropdown:** "Leagues"
- **Positions dropdown:** "Positions"
- **Toggle label:** "Target-related only"
- **Section label:** "Filters" (decorative, right-aligned)

### Dropdown Panel Headers
- **Leagues:** "Select Leagues"
- **Positions:** "Select Positions"

### Filter Actions
- **Clear button:** "Clear All"
- **Apply button:** "Apply"

### Mobile Bottom Sheet
- **Header:** "Filter Transfers"
- **Section labels:**
  - "Leagues"
  - "Positions"
  - "Options"
- **Trigger button:** "Filters"

### Transfer Card Fields

**Fee Formats:**
- **Paid transfers:** "€{amount}", "£{amount}", "${amount}"
  - Examples: "€700K", "€8.5M", "£42.5M", "$15M"
- **Special cases:**
  - "Free" (display in green: #059669)
  - "Loan"
  - "Undisclosed"

**Time Ago Formats:**
- **Minutes:** "{X}m ago" (e.g., "45m ago")
- **Hours:** "{X}h ago" (e.g., "2h ago", "16h ago")
- **Days:** "{X}d ago" (e.g., "1d ago", "3d ago")
- **Weeks:** "{X}w ago" (e.g., "1w ago", "2w ago")

**Position Badges:**
- **Outfield:** "GK", "CB", "RB", "LB", "FB", "CM", "DM", "AM", "LW", "RW", "W", "ST", "CF"
- **Unknown:** "?" (if position data unavailable)

**Transfer Direction:**
- **Format:** "{From Club} → {To Club}"
- **Arrow:** "→" (U+2192 rightwards arrow)
- **Examples:**
  - "Sagan Tosu → Sint-Truiden"
  - "Sparta Rotterdam → Fortuna Sittard"
  - "Granada CF → River Plate"

**Expanded Details:**
- **Age:** "• {age} years old"
- **Contract (duration):** "• Contract: {years} years"
- **Contract (expiry):** "• Contract expires: {month} {year}"
- **Last season:** "• 2023/24 Season: {apps} apps, {goals} goals, {assists} assists"
- **Nationality:** "• Nationality: {country}"

### Empty States

**No Transfers (No Filters Applied):**
```
No recent transfers
No transfers recorded in the last 7 days
Check back later for updates
```
- Icon: TrendingUp (lucide), 48px, #D1D5DB
- Text: 14px (text-sm), #6B7280, center-aligned
- Padding: 48px

**No Results (Filters Applied):**
```
No transfers match your filters
Try adjusting your league or position selections
```
- Same styling as above

**No Primary League Set:**
```
Set your primary league
Complete your club profile to see relevant transfers
[Complete Profile]
```
- Button: "Complete Profile"
  - Links to: `/dashboard/club`
  - Style: Primary blue button

**Target-Related Toggle (No Matches):**
```
No target-related transfers
None of your current position targets have moved clubs recently
```

### Loading States
- **Initial load:** "Loading recent transfers..."
- **Filter change:** (Show skeleton cards, no text)

### Error States
- **API failure:** "Unable to load transfers"
- **Retry prompt:** "Please try again in a moment"
- **Retry button:** "Try Again"

---

## E. Interaction Rules

### Desktop Interactions

#### 1. Filter Dropdown Behavior

**Open Dropdown:**
- Click dropdown button
- Panel appears below, left-aligned
- Fade in: opacity 0 → 1, 150ms ease
- Backdrop: Transparent (no overlay)

**Select Options:**
- Click checkbox to toggle
- Multiple selections allowed
- Visual feedback: Checkmark appears immediately
- No auto-close on selection

**Apply Filters:**
- Click "Apply" button
- Panel closes: fade out 150ms
- Transfer list updates:
  - Fade out current cards: 150ms
  - Fetch new data
  - Fade in new cards: 150ms
  - Show skeleton cards during fetch

**Clear All:**
- Click "Clear All" button
- All checkboxes unchecked instantly
- Panel remains open
- Must click "Apply" to take effect

**Close Without Saving:**
- Click outside panel
- Press Escape key
- Selections revert to last applied state
- Panel fades out: 150ms

#### 2. Target-Related Toggle

**Toggle On:**
- Click checkbox
- Checkmark appears
- Transfer list filters instantly (no "Apply" needed)
- Shows only transfers involving:
  - Players in current position targets
  - Players in inbound targets list
- Transition: Fade out/in cards, 300ms total

**Toggle Off:**
- Click checkbox again
- Checkmark disappears
- Filter removes instantly
- Shows all transfers matching league/position filters

#### 3. Card Expand/Collapse

**Expand Card:**
- Click anywhere on card (except links if present)
- Chevron rotates 180deg: 200ms ease
- Card height expands: auto transition, 200ms ease-out
- Expanded content fades in: opacity 0 → 1, 150ms, 50ms delay
- Border remains same color (no highlight change)

**Collapse Card:**
- Click card again (anywhere)
- Chevron rotates back to 0deg: 200ms ease
- Card height collapses: 200ms ease-out
- Content fades out: opacity 1 → 0, 100ms

**Multiple Cards:**
- Allow multiple cards expanded simultaneously
- No accordion behavior (cards are independent)

### Mobile Interactions

#### 1. Filter Bottom Sheet

**Open Sheet:**
- Tap "Filters" button
- Sheet slides up from bottom: translateY(100%) → translateY(0), 300ms
- Backdrop appears: Black 0 → 0.5 opacity, 300ms fade
- Body scroll locked (prevent background scrolling)

**Drag to Close:**
- Drag sheet down by handle or empty space
- Threshold: 100px vertical drag
- If dragged >100px: Close sheet (slide down)
- If dragged <100px: Snap back to open position
- Momentum scrolling: Continues drag motion

**Apply Filters:**
- Tap "Apply" button
- Sheet closes: slide down 250ms
- Backdrop fades out: 250ms
- Filters apply, list updates
- Body scroll unlocked

**Close Without Saving:**
- Tap backdrop (outside sheet)
- Swipe down past threshold
- Filters revert to last applied state
- Sheet slides down, backdrop fades

#### 2. Card Interactions

**Tap to Expand:**
- Tap anywhere on card
- Active state: Scale 0.98, 100ms
- Card expands vertically: 200ms ease-out
- Details fade in: 150ms

**Tap to Collapse:**
- Tap card header or "Collapse" text
- Card contracts: 200ms ease-out
- Details fade out: 100ms

**Swipe Actions (Optional Enhancement):**
- **Swipe left:** Reveal "Add to Watchlist" button
- **Swipe right:** Reveal "View Player" button
- Swipe threshold: 60px
- Button width: 80px
- Button color: Blue #0031FF
- Swipe animation: 200ms ease-out

### Loading States

#### Initial Load
- Show 5 skeleton cards (gray rectangles with pulse)
- Pulse animation: opacity 0.5 → 1.0, 1.5s infinite
- No spinner overlay
- Skeleton matches card dimensions

#### Filter Change
- Fade out current cards: opacity 1 → 0, 150ms
- Show skeleton cards (same as initial)
- Fetch new data
- Fade in new cards: opacity 0 → 1, 150ms
- Total transition: ~500ms

#### Infinite Scroll (If >20 Transfers)
- Load more on scroll to bottom (threshold: 200px from bottom)
- Show "Loading more..." text with small spinner
- Font: 14px, #6B7280
- Spinner: 16px, #0031FF
- Append new cards below existing (no page reload)

### Error Handling

**Network Error:**
- Show error message in card format:
  - Icon: AlertCircle (lucide), 24px, #EF4444 (red-500)
  - Text: "Unable to load transfers"
  - Subtext: "Please try again in a moment"
  - Button: "Try Again"
- Preserve filters and previous cards (if any)

**Retry:**
- Tap "Try Again" button
- Show loading state (skeleton cards)
- Attempt fetch again
- Clear error on success

---

## F. Animation Specifications

### Load Animations

**Section Entrance (On Page Load):**
- Type: Fade + slide up
- Initial: opacity 0, translateY(20px)
- Final: opacity 1, translateY(0)
- Duration: 300ms
- Easing: ease-out
- Delay: 400ms (after position targets section)

**Transfer Cards (Stagger):**
- Type: Fade in
- Initial: opacity 0
- Final: opacity 1
- Duration: 200ms
- Easing: ease-out
- Stagger: 30ms per card
- Max stagger: First 5 cards only (remaining appear instantly)

### Filter Animations

**Dropdown Panel Open:**
- Type: Fade + scale
- Initial: opacity 0, scale(0.95)
- Final: opacity 1, scale(1)
- Duration: 150ms
- Easing: ease-out
- Transform origin: top-left (below button)

**Dropdown Panel Close:**
- Type: Fade + scale
- Initial: opacity 1, scale(1)
- Final: opacity 0, scale(0.95)
- Duration: 150ms
- Easing: ease-in

**Filter Badge (Count Indicator):**
- Type: Pop in
- Initial: scale(0)
- Final: scale(1)
- Duration: 200ms
- Easing: cubic-bezier(0.68, -0.55, 0.27, 1.55) — Back easing (overshoot)
- Trigger: When filters applied and count changes

**Mobile Bottom Sheet:**
- Type: Slide up
- Initial: translateY(100%)
- Final: translateY(0)
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1) — Ease out
- Backdrop: Fade 0 → 0.5 opacity, 300ms

### Card Animations

**Expand:**
- **Height:** Auto transition, 200ms ease-out
- **Chevron:** Rotate 0deg → 180deg, 200ms ease
- **Content:** Fade in opacity 0 → 1, 150ms, 50ms delay

**Collapse:**
- **Height:** Collapse transition, 200ms ease-out
- **Chevron:** Rotate 180deg → 0deg, 200ms ease
- **Content:** Fade out opacity 1 → 0, 100ms (no delay)

**Hover (Desktop Only):**
- **Border color:** #E5E7EB → #CBD5E1, 100ms ease
- **Background:** White → #F9FAFB, 100ms ease

**Active Tap (Mobile):**
- **Scale:** 1.0 → 0.98, 100ms ease
- **Return:** 0.98 → 1.0, 100ms ease

### List Update Animations

**Filter Change (3-step sequence):**

1. **Fade out** old cards:
   - Opacity: 1 → 0
   - Duration: 150ms
   - Easing: ease-in

2. **Show skeletons:**
   - Instant appearance (0ms)
   - Pulse animation: opacity 0.5 → 1.0, 1.5s infinite

3. **Fade in** new cards:
   - Opacity: 0 → 1
   - Duration: 150ms
   - Easing: ease-out
   - Stagger: 30ms per card (first 5 only)

**Total transition:** ~500ms

**Empty State:**
- Type: Fade + scale
- Initial: opacity 0, scale(0.95)
- Final: opacity 1, scale(1)
- Duration: 250ms
- Easing: ease-out
- Delay: 150ms (after cards fade out)

### Performance Optimizations

**GPU Acceleration:**
- Use `transform` and `opacity` only (no layout properties)
- Avoid animating `height` on long lists (use `max-height` with large value instead)
- Enable `will-change: transform` on bottom sheet during drag

**Reduced Motion:**
- Respect `prefers-reduced-motion: reduce`
- All animations: 0.01ms duration (effectively instant)
- Instant transitions for expand/collapse
- No fade or slide effects
- No scale transforms

**Mobile Optimizations:**
- Disable hover animations on touch devices
- Use passive event listeners for scroll detection
- Debounce filter changes: 300ms
- Virtual scrolling if >50 transfers (use intersection observer)
- Lazy load card details (only fetch on expand)

---

## Default Behavior Logic

### On Page Load (No Custom Settings)

1. Check if user has primary league set in club context
2. If yes: Fetch transfers from primary league, last 7 days
3. If no: Default to "Premier League" (most active league)
4. Sort by date: Most recent first (descending)
5. Limit: Show max 8 transfers initially
6. All positions included (no filter)
7. Target-related toggle: Off by default

### Custom Settings Persistence

**Stored in:**
- Browser localStorage: `skoutex_transfer_filters`
- Format: JSON object
  ```json
  {
    "leagues": ["Premier League", "La Liga"],
    "positions": ["CB", "ST"],
    "targetRelatedOnly": false
  }
  ```

**Load order:**
1. Check localStorage for saved filters
2. If found: Apply saved filters
3. If not found: Use default behavior (primary league)
4. Filters persist across sessions until cleared

**Clear filters:**
- Click "Clear All" in dropdown
- Filters revert to default (primary league)
- localStorage entry removed

---

**End of Specification**
