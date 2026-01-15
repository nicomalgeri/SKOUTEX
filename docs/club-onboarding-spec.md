# Club Onboarding Specification

**Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Source of truth for SKOUTEX club onboarding flow and fit scoring requirements

---

## Overview

This document defines the club onboarding process for SKOUTEX, ensuring we collect sufficient context to power reliable player fit scoring. The onboarding wizard collects club preferences, constraints, and strategic priorities that inform AI-powered scouting recommendations.

---

## Onboarding Steps (A → H)

### Step A: Club Identity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `club_name` | string | **Core** | Official club name |
| `country` | string | **Core** | Country of registration |
| `league` | string | **Core** | Primary league/division |
| `tier` | enum | **Core** | `top_flight` \| `second_tier` \| `third_tier` \| `lower` |

**Advanced (Optional):**
- `founded_year`: number
- `stadium_capacity`: number
- `academy_level`: `none` | `basic` | `category_1` | `category_2` | `elite`

---

### Step B: Budget & Finances

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transfer_budget_eur` | number | **Core** | Available transfer budget in EUR |
| `wage_budget_weekly_eur` | number | **Core** | Weekly wage budget ceiling in EUR |
| `currency` | string | **Core** | Preferred display currency (default: `EUR`) |

**Advanced (Optional):**
- `sell_to_buy`: boolean — Must sell before buying?
- `installment_preference`: `upfront` | `installments_ok` | `loan_preferred`
- `agent_fee_ceiling_pct`: number — Max agent fee as % of transfer

---

### Step C: Playing Style

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `formation_primary` | string | **Core** | Primary formation (e.g., `4-3-3`, `3-5-2`) |
| `style` | enum | **Core** | `possession` \| `counter_attack` \| `pressing` \| `balanced` |
| `build_up` | enum | **Core** | `short` \| `mixed` \| `direct` |

**Advanced (Optional):**
- `formation_secondary`: string
- `pressing_intensity`: `low` | `medium` | `high` | `gegenpressing`
- `wing_play_preference`: `wide` | `inverted` | `mixed`
- `set_piece_importance`: `low` | `medium` | `high`

---

### Step D: Squad Profile

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `squad_size_target` | number | **Core** | Target total squad size |
| `foreign_player_limit` | number | **Core** | Max non-domestic players allowed |
| `homegrown_requirement` | number | **Core** | Min homegrown players required |

**Advanced (Optional):**
- `current_squad_size`: number
- `average_squad_age`: number
- `youth_integration_policy`: `aggressive` | `moderate` | `conservative`

---

### Step E: Recruitment Priorities

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `priority_positions` | string[] | **Core** | Ordered list of positions to fill (max 5) |
| `age_preference` | object | **Core** | `{ min: number, max: number, ideal: number }` |
| `experience_level` | enum | **Core** | `proven` \| `emerging` \| `prospect` \| `any` |

**Advanced (Optional):**
- `preferred_leagues`: string[] — Source leagues to scout
- `preferred_nationalities`: string[] — For cultural/language fit
- `avoid_leagues`: string[] — Leagues to exclude
- `left_foot_priority`: boolean — Need left-footed players?

---

### Step F: Technical Requirements

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `physical_profile` | enum | **Core** | `athletic` \| `technical` \| `balanced` |
| `minimum_height_cm` | number | Optional | For specific positions (e.g., GK, CB) |

**Advanced (Optional):**
- `speed_importance`: `low` | `medium` | `high` | `critical`
- `aerial_importance`: `low` | `medium` | `high` | `critical`
- `technical_floor`: number — Min technical score (0-100)
- `injury_history_tolerance`: `strict` | `moderate` | `lenient`

---

### Step G: Contract Preferences

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contract_length_preference` | object | **Core** | `{ min_years: number, max_years: number }` |
| `loan_interest` | boolean | **Core** | Open to loan deals? |
| `sell_on_clause_ok` | boolean | **Core** | Accept sell-on clauses? |

**Advanced (Optional):**
- `buyback_clause_ok`: boolean
- `release_clause_policy`: `never` | `high_only` | `case_by_case`
- `image_rights_policy`: `club_owns` | `split` | `player_owns`

---

### Step H: Strategic Goals

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `season_objective` | enum | **Core** | `promotion` \| `survival` \| `mid_table` \| `top_half` \| `title` \| `european` |
| `transfer_philosophy` | enum | **Core** | `buy_young_sell_high` \| `buy_ready` \| `mix` |
| `risk_appetite` | enum | **Core** | `conservative` \| `moderate` \| `aggressive` |

**Advanced (Optional):**
- `project_timeline`: `immediate` | `1_2_years` | `3_5_years`
- `brand_value_importance`: `low` | `medium` | `high`
- `social_media_presence_factor`: boolean

---

## Club Context JSON Schema (v1)

```json
{
  "version": "1.0",
  "club_id": "",
  "updated_at": "",

  "identity": {
    "club_name": "",
    "country": "",
    "league": "",
    "tier": "second_tier",
    "founded_year": null,
    "stadium_capacity": null,
    "academy_level": "basic"
  },

  "finances": {
    "transfer_budget_eur": 0,
    "wage_budget_weekly_eur": 0,
    "currency": "EUR",
    "sell_to_buy": false,
    "installment_preference": "installments_ok",
    "agent_fee_ceiling_pct": 10
  },

  "playing_style": {
    "formation_primary": "4-3-3",
    "formation_secondary": null,
    "style": "balanced",
    "build_up": "mixed",
    "pressing_intensity": "medium",
    "wing_play_preference": "mixed",
    "set_piece_importance": "medium"
  },

  "squad": {
    "squad_size_target": 25,
    "current_squad_size": null,
    "foreign_player_limit": 17,
    "homegrown_requirement": 8,
    "average_squad_age": null,
    "youth_integration_policy": "moderate"
  },

  "recruitment": {
    "priority_positions": [],
    "age_preference": {
      "min": 18,
      "max": 32,
      "ideal": 25
    },
    "experience_level": "any",
    "preferred_leagues": [],
    "preferred_nationalities": [],
    "avoid_leagues": [],
    "left_foot_priority": false
  },

  "technical": {
    "physical_profile": "balanced",
    "minimum_height_cm": null,
    "speed_importance": "medium",
    "aerial_importance": "medium",
    "technical_floor": null,
    "injury_history_tolerance": "moderate"
  },

  "contracts": {
    "contract_length_preference": {
      "min_years": 2,
      "max_years": 5
    },
    "loan_interest": true,
    "sell_on_clause_ok": true,
    "buyback_clause_ok": false,
    "release_clause_policy": "case_by_case",
    "image_rights_policy": "split"
  },

  "strategy": {
    "season_objective": "mid_table",
    "transfer_philosophy": "mix",
    "risk_appetite": "moderate",
    "project_timeline": "1_2_years",
    "brand_value_importance": "medium",
    "social_media_presence_factor": false
  }
}
```

---

## Minimum Required Fields for Reliable Fit Scoring

The following **12 fields** are the absolute minimum required to generate a meaningful fit score:

| # | Field | Section | Why Essential |
|---|-------|---------|---------------|
| 1 | `club_name` | identity | Identification |
| 2 | `league` | identity | Competition level context |
| 3 | `tier` | identity | Quality tier expectations |
| 4 | `transfer_budget_eur` | finances | Affordability filter |
| 5 | `wage_budget_weekly_eur` | finances | Wage feasibility |
| 6 | `formation_primary` | playing_style | Positional fit mapping |
| 7 | `style` | playing_style | Tactical compatibility |
| 8 | `priority_positions` | recruitment | Search targeting |
| 9 | `age_preference` | recruitment | Age band filtering |
| 10 | `foreign_player_limit` | squad | Eligibility check |
| 11 | `season_objective` | strategy | Ambition alignment |
| 12 | `risk_appetite` | strategy | Profile matching |

### Fit Score Confidence Levels

| Fields Completed | Confidence Level | Score Display |
|------------------|------------------|---------------|
| < 12 (missing core) | **Insufficient** | "Complete profile to see fit score" |
| 12-18 | **Basic** | Score shown with "Low confidence" badge |
| 19-30 | **Good** | Score shown with "Medium confidence" badge |
| 31+ | **High** | Score shown with "High confidence" badge |

---

## Data Gaps Policy

When club context has missing fields, apply these defaults:

### Hard Constraints (Block if Missing)
- `transfer_budget_eur` → Cannot filter by price
- `wage_budget_weekly_eur` → Cannot filter by wages
- `priority_positions` → Cannot target search

### Soft Constraints (Use Defaults)
- `age_preference` → Default: `{ min: 18, max: 35, ideal: 26 }`
- `style` → Default: `"balanced"`
- `risk_appetite` → Default: `"moderate"`
- `foreign_player_limit` → Default: `25` (effectively unlimited)

### Confidence Score Formula

```
confidence_score = (fields_completed / total_fields) * 100

Display logic:
- < 40%  → "Low confidence - complete more fields"
- 40-70% → "Medium confidence"
- > 70%  → "High confidence"
```

---

## Implementation Notes

### Onboarding UX Guidelines

1. **Progressive Disclosure**: Show Core fields first, reveal Advanced on expand
2. **Smart Defaults**: Pre-fill based on league tier when possible
3. **Save Progress**: Allow partial saves, resume later
4. **Skip Option**: Allow skipping Advanced sections entirely
5. **Validation**: Real-time validation with helpful error messages

### API Integration Points

- **Save Context**: `POST /api/club/context`
- **Get Context**: `GET /api/club/context`
- **Update Context**: `PATCH /api/club/context`
- **Validate Context**: `POST /api/club/context/validate`

### Fit Score Calculation

The fit score algorithm uses weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Budget Fit | 25% | Transfer fee + wages within limits |
| Position Fit | 20% | Matches priority positions |
| Age Fit | 15% | Within age preference range |
| Style Fit | 15% | Tactical compatibility |
| Risk Fit | 10% | Matches risk appetite |
| League Fit | 10% | Source league quality alignment |
| Contract Fit | 5% | Contract terms compatibility |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial specification |

---

*This document is the source of truth for SKOUTEX club onboarding. All implementation should reference this spec.*
