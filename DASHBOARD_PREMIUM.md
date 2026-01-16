# Premium Dashboard - Feature Documentation

## Overview

The Premium Dashboard is an enhanced, director-friendly interface for SKOUTEX that provides intelligent player recommendations, visual KPI analysis, and market intelligence in a sophisticated, professional layout.

**Route**: `/dashboard/premium`

## Features

### 1. Position-Based Player Recommendations

**Component**: `PositionTargetsSection`

Shows AI-powered player recommendations organized by position needs:
- 2 recommended players per position
- Priority levels (High/Medium/Low)
- Fit scores (0-100 scale)
- Radar chart visualization of key metrics
- One-tap actions (View Profile, Add to Shortlist)

**Fit Score Verdicts**:
- 85-100: "Excellent Fit" (Green)
- 75-84: "Strong Fit" (Blue)
- 65-74: "Good Fit" (Indigo)
- 50-64: "Potential Fit" (Amber)
- <50: "Limited Fit" (Gray)

### 2. Radar Chart KPI Visualization

**Component**: `RadarChart`

Position-specific performance metrics displayed in a 6-axis radar chart:

**Centre Backs (CB)**:
- Aerial Duels Won %
- Pass Completion %
- Tackles Won %
- Interceptions per 90
- Progressive Passes per 90
- Clearances per 90

**Full Backs (FB)**:
- Tackles Won %
- Progressive Carries per 90
- Crosses Completed %
- Key Passes per 90
- Dribbles Won %
- Defensive Actions per 90

**Central Midfielders (CM)**:
- Pass Completion %
- Progressive Passes per 90
- Ball Recoveries per 90
- Key Passes per 90
- Dribbles Won %
- Duels Won %

**Wingers (W)**:
- Dribbles Won %
- Key Passes per 90
- Shot Accuracy %
- Progressive Carries per 90
- Goal Contributions per 90
- Successful Crosses %

**Strikers (ST)**:
- Shot Conversion %
- Goals per 90
- xG Overperformance
- Aerial Duels Won %
- Key Passes per 90
- Dribbles Won %

**Goalkeepers (GK)**:
- Save %
- Clean Sheets %
- Pass Completion %
- Crosses Claimed %
- Sweeper Actions per 90
- PSxG+/-

**Normalization**:
- All metrics normalized to 0-10 scale
- Based on percentile ranking within position + league cohort
- Minimum 900 minutes played for cohort inclusion
- Missing data shown as gray dots (not connected)

**Interactions**:
- Hover: Highlights axis and shows exact percentile tooltip
- Tap (mobile): Expands to modal with full stat breakdown
- Animation: 900ms entrance with radial draw from center

### 3. Recent Transfers Feed

**Component**: `RecentTransfersSection`

Customizable transfer feed with advanced filtering:

**Filters**:
- Leagues (multi-select)
- Positions (multi-select)
- Target-Related Only (toggle)

**Transfer Cards**:
- Player name and clubs (From → To)
- Transfer fee
- Position badge
- Time ago (2h, 5h, 1d, etc.)
- Expandable details (click to expand)

**Mobile Optimizations**:
- Bottom sheet for filters
- Horizontal swipe cards
- Collapsible details
- Touch-friendly targets (48px+)

### 4. AI Scout Assistant CTA

**Component**: `AIScoutAssistant`

Premium call-to-action module for the AI chat feature:

**Design**:
- Gradient background (blue-600 to blue-500)
- Animated grid pattern overlay
- Floating sparkles on hover
- Icon with scale + rotation animation
- Direct link to `/dashboard/chat`

**Copy**:
- Headline: "Need player recommendations?"
- Body: "Get intelligent, data-driven suggestions from our AI Scout Assistant."
- CTA: "Open Scout Assistant"
- Hint: "✨ Powered by GPT-4 • Context-aware • Real-time insights"

### 5. Hero Stats Bar

Quick overview metrics with change indicators:

**Default Stats**:
- Searches Today
- Players Analyzed
- Watchlist Count
- Average Fit Score

**Visual Feedback**:
- Green (+) for positive changes
- Red (-) for negative changes
- Hover effect: Border color change + shadow lift

## Technical Implementation

### Component Structure

```
src/
├── components/
│   ├── RadarChart.tsx                    # Canvas-based radar chart
│   └── dashboard/
│       ├── PositionTargetCard.tsx        # Individual player card
│       ├── PositionTargetsSection.tsx    # Position needs container
│       ├── RecentTransfersSection.tsx    # Transfer feed with filters
│       └── AIScoutAssistant.tsx          # Premium CTA module
├── lib/
│   └── radar/
│       └── kpiMappings.ts                # Position-specific KPI definitions
└── app/
    └── (dashboard)/
        └── dashboard/
            └── premium/
                └── page.tsx              # Main premium dashboard page
```

### Data Flow

**Position Targets**:
```typescript
interface PositionNeed {
  position: string;                       // "CB", "RW", etc.
  fullName: string;                       // "Centre Back"
  priority: "high" | "medium" | "low";
  recommendations: [PlayerRecommendation, PlayerRecommendation];
}

interface PlayerRecommendation {
  id: number;
  name: string;
  club: string;
  age: number;
  position: string;
  fitScore: number;                       // 0-100
  imageUrl?: string;
}
```

**Radar Chart Data**:
```typescript
interface RadarChartData {
  label: string;                          // "Aerial", "Passing", etc.
  value: number;                          // 0-10 scale
  percentile?: number;                    // Original 0-100 percentile
}
```

**Transfers**:
```typescript
interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: number;
  feeDisplay: string;                     // "£42.5M"
  position: string;
  timestamp: string;
  timeAgo: string;                        // "2h ago"
  playerId?: number;
}
```

## Animations

### Entrance Animations (Page Load)

**Stagger Pattern** (total 1200ms):
1. Hero Stats: Fade + slide down (200ms, 0ms delay)
2. Position Targets: Fade + slide up (300ms, 100ms delay)
3. Player Cards: Fade + scale stagger (250ms each, 50ms between)
4. Transfers: Fade in (200ms, 400ms delay)
5. AI Assistant: Fade + pulse (300ms, 600ms delay)

### Micro-Interactions

**Card Hover** (Desktop):
```css
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(0,0,0,0.12);
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Add to Shortlist**:
1. Button background: Blue → Green (200ms)
2. Icon: Rotate 360° + morph + to ✓ (300ms)
3. Text: "Add" → "Added" (fade crossfade)
4. Confetti burst (500ms, 10 particles)

**Radar Chart Draw**:
1. Center dot (fade in, 100ms)
2. Radial axes (outward, 300ms, stagger 30ms)
3. Data markers (fade + scale, 200ms, 400ms delay)
4. Filled area (draw from center, 400ms, 450ms delay)
5. Labels (fade in, 200ms, 700ms delay)

### Performance

- GPU-accelerated (`transform` and `opacity` only)
- No layout thrashing
- Max 3 concurrent animations on mobile
- Respects `prefers-reduced-motion`

## Responsive Design

### Desktop (1440px+)

**Layout**:
- Container: max-width 1440px, padding 48px
- Grid: 4 columns, gap 24px
- Player cards: 320px × 440px
- Transfer rows: full width, 64px height

**Interactions**:
- Hover states with lift and shadow
- Scroll controls for position targets
- Inline expand for transfers

### Mobile (<768px)

**Layout**:
- Container: padding 16px
- Player cards: Side-by-side (156px each)
- Horizontal scroll with snap points
- Transfer cards: Stacked, 80px height

**Adaptations**:
- Swipe gestures for navigation
- Bottom sheet for filters
- Reduced font sizes (20px → 16px)
- Increased touch targets (48px min)
- Simplified card layouts
- Fixed CTA zones (bottom 40%)

**Thumb Zone Rules**:
- Primary actions: Bottom 40% of screen
- Tap targets: Minimum 48px × 48px
- Spacing between elements: 12px minimum

## Integration Guide

### 1. Replace Mock Data

**Position Needs**:
```typescript
// Fetch from club context
const positionNeeds = await getClubPositionNeeds(clubId);

// Or integrate with existing targets API
const positionNeeds = await fetch('/api/targets/position-needs');
```

**Player Recommendations**:
```typescript
// Use AI recommendation engine
const recommendations = await fetch(
  `/api/ai/recommend?position=${position}&clubId=${clubId}`
);

// Or use Sportmonks search with filters
const recommendations = await searchPlayers({
  position,
  age: { min: 18, max: 28 },
  league_id: clubContext.leagues,
  limit: 2
});
```

**KPI Data**:
```typescript
// Calculate from player statistics
const radarData = generateRadarData(
  player.position,
  player.statistics,
  player.percentiles
);

// Or fetch pre-calculated from API
const radarData = await fetch(`/api/players/${id}/kpi-radar`);
```

### 2. Add Real-time Updates

**WebSocket Integration**:
```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.skoutex.com/transfers');

  ws.onmessage = (event) => {
    const newTransfer = JSON.parse(event.data);
    setTransfers(prev => [newTransfer, ...prev]);
  };

  return () => ws.close();
}, []);
```

### 3. Persist User Actions

**Shortlist**:
```typescript
const handleAddToShortlist = async (playerId: number) => {
  await fetch('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({ player_id: playerId })
  });

  // Update local state
  setIsAdded(true);
};
```

**Filter Preferences**:
```typescript
const handleFilterChange = async (filters: TransferFilters) => {
  await fetch('/api/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ transfer_filters: filters })
  });

  setFilters(filters);
};
```

## Customization

### Change Position Needs

Edit the mock data in `premium/page.tsx`:
```typescript
const mockPositionNeeds: PositionNeed[] = [
  {
    position: "CB",
    fullName: "Centre Back",
    priority: "high",
    recommendations: [/* ... */]
  },
  // Add more positions
];
```

### Modify KPI Mappings

Edit `src/lib/radar/kpiMappings.ts`:
```typescript
export const KPI_MAPPINGS: Record<PositionGroup, KPIDefinition[]> = {
  CB: [
    { key: "aerial_duels_won_pct", label: "Aerial", /* ... */ },
    // Change or add KPIs
  ],
  // Other positions
};
```

### Customize Colors

Update in component files or globals.css:
```typescript
// Component level
className="bg-blue-600 hover:bg-blue-700"

// Global CSS
:root {
  --electric-blue: #0031FF;
  --hover-blue: #4C6FFF;
}
```

## Accessibility

**Keyboard Navigation**:
- Tab order follows visual hierarchy
- Focus indicators (2px blue ring, 2px offset)
- Escape key closes filters/modals

**Screen Readers**:
- All interactive elements have `aria-label`
- ARIA roles for complex widgets
- Live regions for dynamic updates

**Motion**:
- Respects `prefers-reduced-motion`
- Instant transitions when motion disabled
- No essential info conveyed by motion alone

**Color Contrast**:
- Minimum 4.5:1 for text
- Minimum 3:1 for large text and icons
- Color not sole indicator (uses icons + text)

## Browser Support

**Tested On**:
- Chrome 120+ ✅
- Safari 17+ ✅
- Firefox 120+ ✅
- Edge 120+ ✅

**Canvas Support**:
- All modern browsers support `<canvas>`
- Falls back to static image if unavailable
- Retina/HiDPI display optimization

## Performance

**Metrics**:
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

**Optimizations**:
- Canvas rendering (hardware-accelerated)
- Virtual scrolling for long lists (if needed)
- Debounced filter changes (300ms)
- Image lazy loading
- Code splitting per route

## Future Enhancements

### Short Term
- [ ] Connect to real Sportmonks API
- [ ] Implement shortlist persistence
- [ ] Add player comparison modal
- [ ] Real-time transfer updates via WebSocket

### Medium Term
- [ ] Custom KPI selection per position
- [ ] Export player reports (PDF)
- [ ] Share recommendations via link
- [ ] Notification system for new recommendations

### Long Term
- [ ] Machine learning fit score calculation
- [ ] Historical performance tracking
- [ ] Team chemistry analysis
- [ ] Budget constraint visualization

## Troubleshooting

### Radar Chart Not Rendering

**Issue**: Canvas shows blank or doesn't draw
**Solution**:
- Check browser console for errors
- Verify data format matches `RadarChartData[]`
- Ensure values are 0-10 scale
- Check if canvas is blocked by CSP

### Swipe Not Working on Mobile

**Issue**: Horizontal scroll doesn't snap
**Solution**:
- Verify `snap-x snap-mandatory` classes
- Check if `scrollbar-hide` is applied
- Test on actual mobile device (not just responsive mode)
- Ensure touch events aren't prevented

### Animations Janky

**Issue**: Animations stutter or lag
**Solution**:
- Check if animating non-GPU properties
- Reduce concurrent animations
- Lower animation duration
- Profile with Chrome DevTools Performance tab

## Support

For questions or issues:
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for current features
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for setup guide
- Contact development team for technical support
