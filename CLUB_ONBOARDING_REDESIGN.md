# Club Onboarding Redesign - Implementation Plan

## Overview
Transform the club onboarding from a multi-step wizard into a premium, intuitive landing page experience with AI-powered recruitment strategy input.

---

## Phase 1: Club Selection & Branding

### 1.1 Club Selector with Sportmonks Integration
**Location**: `/dashboard/club` (first screen)

**Features**:
- Search box for club name
- Calls Sportmonks `/teams/search` API
- Displays results with:
  - Club name
  - League
  - Country
  - **Club logo** (from Sportmonks `team.image_path`)
- Select club → Auto-fills:
  - `identity.club_name`
  - `identity.league` (from `team.activeSeasons[0].league`)
  - `identity.country` (from `team.country`)
  - **Club logo URL** (save to database)

**API Endpoint Needed**:
```typescript
// /api/sportmonks/teams/search?q=Barcelona
// Already exists, returns: name, country, venue, activeSeasons
```

**Database Change**:
```sql
ALTER TABLE clubs ADD COLUMN logo_url TEXT;
```

---

### 1.2 Club Logo Display

#### Sidebar (Collapsed State)
**Current**: Shows "S" letter
**New**: Show club logo

```tsx
// In Sidebar.tsx (line ~92)
{sidebarOpen ? (
  <Image src="/skoutex-logo.svg" alt="SKOUTEX" width={140} height={40} />
) : (
  club?.logo_url ? (
    <Image
      src={club.logo_url}
      alt={club.name}
      width={32}
      height={32}
      className="rounded-full"
    />
  ) : (
    <div className="w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center text-white font-bold">
      S
    </div>
  )
)}
```

#### Dashboard Header
**Add**: Club name + logo in top-right area

```tsx
// In Header.tsx or Dashboard page
<div className="flex items-center gap-3">
  {club?.logo_url && (
    <Image
      src={club.logo_url}
      alt={club.name}
      width={40}
      height={40}
      className="rounded-full"
    />
  )}
  <div>
    <h2 className="text-lg font-bold">{club?.name}</h2>
    <p className="text-sm text-gray-500">{club?.league}</p>
  </div>
</div>
```

---

## Phase 2: Remove & Simplify Fields

### 2.1 Remove Weekly Wage Budget
**File**: `/src/lib/club/context.ts`, `/dashboard/club/page.tsx`

**Remove**:
- `finances.wage_budget_weekly_eur` field
- Remove from required fields
- Remove from UI
- Remove from validation

**Update blocking fields**:
```typescript
const BLOCKING_FIELDS = [
  "finances.transfer_budget_eur", // Keep this only
  "recruitment.priority_positions",
] as const;
```

---

### 2.2 Remove Contract Preferences Section
**Remove entire step**:
- Remove "contracts" from `steps` array
- Remove `contracts` from `stepRequiredFields`
- Remove from `clubContextDefaults`
- Keep data structure (for backward compatibility) but don't show in UI

---

### 2.3 Add Thousand Separators to Transfer Budget
**Component**: Number input with formatting

```tsx
// formatNumber utility
const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  return num.toLocaleString('en-US');
};

// In input field
<input
  type="text"
  value={formatNumber(transferBudget)}
  onChange={(e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(raw))) {
      setTransferBudget(Number(raw));
    }
  }}
  placeholder="10,000,000"
/>
```

---

## Phase 3: Recruitment Priorities - Dropdown

### 3.1 Position Multi-Select
**Current**: Free text input (array of strings)
**New**: Multi-select dropdown with predefined positions

**Position Options**:
```typescript
const FOOTBALL_POSITIONS = [
  // Goalkeepers
  { value: 'GK', label: 'Goalkeeper', group: 'Goalkeeper' },

  // Defenders
  { value: 'CB', label: 'Centre-Back', group: 'Defenders' },
  { value: 'LB', label: 'Left-Back', group: 'Defenders' },
  { value: 'RB', label: 'Right-Back', group: 'Defenders' },
  { value: 'LWB', label: 'Left Wing-Back', group: 'Defenders' },
  { value: 'RWB', label: 'Right Wing-Back', group: 'Defenders' },

  // Midfielders
  { value: 'CDM', label: 'Defensive Midfielder', group: 'Midfielders' },
  { value: 'CM', label: 'Central Midfielder', group: 'Midfielders' },
  { value: 'CAM', label: 'Attacking Midfielder', group: 'Midfielders' },
  { value: 'LM', label: 'Left Midfielder', group: 'Midfielders' },
  { value: 'RM', label: 'Right Midfielder', group: 'Midfielders' },

  // Forwards
  { value: 'LW', label: 'Left Winger', group: 'Forwards' },
  { value: 'RW', label: 'Right Winger', group: 'Forwards' },
  { value: 'ST', label: 'Striker', group: 'Forwards' },
  { value: 'CF', label: 'Centre Forward', group: 'Forwards' },
] as const;
```

**UI Component**:
```tsx
import Select from 'react-select';

<Select
  isMulti
  options={FOOTBALL_POSITIONS}
  value={selectedPositions}
  onChange={(selected) => setContext({
    ...context,
    recruitment: {
      ...context.recruitment,
      priority_positions: selected.map(s => s.value)
    }
  })}
  className="react-select-container"
  classNamePrefix="react-select"
  placeholder="Select priority positions..."
  formatGroupLabel={(group) => (
    <div className="font-semibold text-gray-900">{group.label}</div>
  )}
/>
```

**Install**: `npm install react-select`

---

## Phase 4: AI-Powered Recruitment Strategy

### 4.1 Strategy Chat Component
**Location**: New section in onboarding (after basic fields)

**UI Design**:
```
┌─────────────────────────────────────────────┐
│  📋 Recruitment Strategy                     │
├─────────────────────────────────────────────┤
│                                             │
│  Use this space to describe your           │
│  recruitment strategy in natural language.  │
│  Our AI will analyze it and apply insights │
│  to your scouting profile.                  │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │  e.g., "We focus on young technical   │ │
│  │  players from La Liga and Eredivisie  │ │
│  │  with high potential. Looking for     │ │
│  │  versatile midfielders who can play   │ │
│  │  multiple positions..."               │ │
│  │                                       │ │
│  │                                       │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [🤖 Analyze Strategy]                      │
│                                             │
│  ✅ AI Insights Applied:                    │
│  • Preferred leagues: La Liga, Eredivisie   │
│  • Age range: 18-25                         │
│  • Priority positions: CM, CAM              │
│  • Technical profile: High technical skill  │
└─────────────────────────────────────────────┘
```

### 4.2 AI Analysis Endpoint
**Create**: `/api/club/analyze-strategy`

**Input**:
```typescript
{
  strategyText: string; // User's free-form text
  currentContext: Partial<ClubContext>; // Existing profile
}
```

**Output**:
```typescript
{
  insights: {
    preferred_leagues?: string[];
    avoid_leagues?: string[];
    priority_positions?: string[];
    age_preference?: { min: number; max: number; ideal: number };
    experience_level?: string;
    physical_profile?: string;
    playing_style?: string;
    risk_appetite?: string;
    // ... other inferred fields
  };
  explanation: string; // Human-readable summary
}
```

**OpenAI Prompt**:
```typescript
const prompt = `Analyze this football recruitment strategy and extract structured data:

Strategy: "${strategyText}"

Current profile: ${JSON.stringify(currentContext, null, 2)}

Extract:
1. Preferred leagues (array of league names)
2. Priority positions (array of: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST, CF)
3. Age preference (min, max, ideal ages)
4. Experience level (youth_prospect, developing, established, veteran, any)
5. Physical profile (technical, balanced, physical, pacy)
6. Playing style preference
7. Risk appetite (low, medium, high)
8. Any other relevant preferences

Return as JSON.`;
```

**Implementation**:
```typescript
import { openai } from '@/lib/ai/openai';

export async function POST(req: Request) {
  const { strategyText, currentContext } = await req.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a football recruitment strategy analyst...'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' }
  });

  const insights = JSON.parse(completion.choices[0].message.content);

  return Response.json({
    insights,
    explanation: generateExplanation(insights)
  });
}
```

---

## Phase 5: Premium Landing Page Design

### 5.1 New Layout Structure
**Replace multi-step wizard with single scrollable page**

```
┌─────────────────────────────────────────────────────┐
│  [← Back to Dashboard]                    [Save]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│              ⚽ Complete Your Club Profile          │
│         Unlock AI-powered scouting insights         │
│                                                     │
│  ────────────────────────────────────────────────   │
│                                                     │
│  🏢 Club Identity                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Search for your club...                    │   │
│  │  [🔍 Barcelona]                             │   │
│  │                                             │   │
│  │  ✓ FC Barcelona                             │   │
│  │    La Liga · Spain                          │   │
│  │    [Select]                                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  💰 Budget & Resources                              │
│  ┌─────────────────────────────────────────────┐   │
│  │  Transfer Budget (EUR)                      │   │
│  │  10,000,000                                 │   │
│  │                                             │   │
│  │  Club Tier                                  │   │
│  │  [Elite] [Strong] [Mid] [Developing]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ⚽ Playing Philosophy                              │
│  ┌─────────────────────────────────────────────┐   │
│  │  Formation: [4-3-3 ▼]                       │   │
│  │  Style: [Possession ▼]                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🎯 Recruitment Priorities                         │
│  ┌─────────────────────────────────────────────┐   │
│  │  Priority Positions                         │   │
│  │  [Select multiple positions...]             │   │
│  │  ☑ Striker  ☑ Central Midfielder            │   │
│  │  ☐ Winger   ☐ Centre-Back                   │   │
│  │                                             │   │
│  │  Age Range                                  │   │
│  │  [18] ━━●━━━━━━ [32]  Ideal: [25]          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  💬 Recruitment Strategy (AI-Powered)              │
│  ┌─────────────────────────────────────────────┐   │
│  │  Describe your strategy in your own words   │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │ We're looking for young, technical  │   │   │
│  │  │ midfielders who can control games...│   │   │
│  │  │                                     │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  │  [🤖 Analyze with AI]                       │   │
│  │                                             │   │
│  │  ✅ AI Insights:                            │   │
│  │  • Focus on players aged 20-26              │   │
│  │  • Preferred leagues: La Liga, Bundesliga   │   │
│  │  • Technical profile emphasis               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🎯 Strategic Goals                                │
│  ┌─────────────────────────────────────────────┐   │
│  │  Season Objective                           │   │
│  │  [Top 4 Finish ▼]                           │   │
│  │                                             │   │
│  │  Risk Appetite                              │   │
│  │  [Low] [●Medium] [High]                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [💾 Save Profile]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Design System

**Colors**:
- Background: `#f6f6f6`
- Cards: `#ffffff` with `border: 1px solid #e5e5e5`
- Accent: `#0031FF` (electric blue)
- Text: `#2C2C2C` (graphite grey)

**Shadows**:
- Card: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- Hover: `box-shadow: 0 4px 12px rgba(0,49,255,0.12)`

**Typography**:
- Headings: `font-weight: 700` (bold)
- Section titles: `font-size: 1.25rem`
- Body: `font-size: 0.875rem`

**Spacing**:
- Section gap: `3rem` (48px)
- Card padding: `2rem` (32px)
- Input spacing: `1rem` (16px)

---

## Phase 6: Implementation Steps

### Step 1: Database & API (1-2 hours)
1. Add `logo_url` column to `clubs` table
2. Test Sportmonks team search API
3. Create `/api/club/analyze-strategy` endpoint with OpenAI

### Step 2: Club Selector (2-3 hours)
1. Create `ClubSelector` component with search
2. Fetch teams from Sportmonks
3. Display results with logos
4. Auto-fill fields on selection
5. Save logo URL to database

### Step 3: Update Sidebar & Dashboard (1 hour)
1. Fetch club data with logo
2. Show logo in collapsed sidebar
3. Add club info to dashboard header

### Step 4: Remove Fields (30 mins)
1. Remove wage budget from context
2. Remove contracts step
3. Update validation logic

### Step 5: Position Dropdown (1 hour)
1. Install `react-select`
2. Create position options array
3. Replace text input with multi-select
4. Style to match design system

### Step 6: Number Formatting (30 mins)
1. Create `formatNumber` utility
2. Update transfer budget input
3. Add thousand separators

### Step 7: AI Strategy Chat (2-3 hours)
1. Create `StrategyChat` component
2. Text area for user input
3. "Analyze" button
4. Display insights
5. Apply to context

### Step 8: Redesign Layout (3-4 hours)
1. Remove step wizard UI
2. Create single-page layout
3. Style sections with premium design
4. Add smooth scroll anchors
5. Progress indicator (% complete)

### Step 9: Testing & Polish (1-2 hours)
1. Test club search and selection
2. Verify logo display
3. Test AI strategy analysis
4. Check form validation
5. Mobile responsiveness

**Total Estimated Time**: 12-17 hours

---

## Phase 7: Future Enhancements

### Optional Features (Post-MVP):
1. **Club comparison**: Compare your profile to similar clubs
2. **Benchmark insights**: "Clubs like yours typically spend €X"
3. **Strategy templates**: Pre-made strategies for different club tiers
4. **Voice input**: Record strategy via voice, transcribe with Whisper API
5. **Strategy evolution**: Track how strategy changes over time
6. **Collaborative editing**: Multiple scouts can update profile

---

## File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── club/
│               ├── page.tsx (redesigned)
│               ├── ClubSelector.tsx (new)
│               ├── StrategyChat.tsx (new)
│               └── PositionSelector.tsx (new)
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx (updated with logo)
│       └── Header.tsx (updated with club info)
├── lib/
│   ├── club/
│   │   ├── context.ts (updated - remove fields)
│   │   └── positions.ts (new - position options)
│   └── utils/
│       └── formatters.ts (new - number formatting)
└── app/
    └── api/
        └── club/
            └── analyze-strategy/
                └── route.ts (new - AI analysis)
```

---

## Success Metrics

1. **Onboarding completion rate** increases by 40%
2. **Time to complete** decreases from ~15 mins to ~5 mins
3. **User satisfaction** with AI strategy input: 8+/10
4. **Club logo display** works for 95%+ of clubs
5. **Mobile experience** is smooth and intuitive

---

## Notes & Considerations

### Sportmonks API Limits
- Team search: Check rate limits
- Image URLs: Verify they're public and cacheable
- Fallback: If no logo, show initials badge

### AI Strategy Parsing
- Cost: ~$0.01-0.03 per analysis (GPT-4)
- Latency: 2-5 seconds
- Fallback: If AI fails, manual entry still works
- Privacy: Don't log sensitive strategy details

### Mobile Design
- Single column layout
- Larger touch targets
- Sticky save button
- Progress bar at top

### Accessibility
- ARIA labels for all inputs
- Keyboard navigation
- Screen reader friendly
- Color contrast WCAG AA

---

## Launch Checklist

- [ ] Database migration (logo_url)
- [ ] Sportmonks API integration tested
- [ ] AI strategy endpoint deployed
- [ ] Club selector working
- [ ] Logo display in sidebar/dashboard
- [ ] Position multi-select functional
- [ ] Number formatting applied
- [ ] Premium design implemented
- [ ] Mobile responsive
- [ ] Error handling robust
- [ ] Loading states smooth
- [ ] Documentation updated
