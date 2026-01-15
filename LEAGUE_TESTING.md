# League Filtering - Testing & Verification

## Current League Configuration

The system is configured with **29 allowed leagues** from the Sportmonks Football Enterprise plan:

### Allowed Leagues (by Country)

**England (4 leagues)**
- Premier League (ID: 8)
- Championship (ID: 9)
- FA Cup (ID: 24)
- Carabao Cup (ID: 27)

**Spain (3 leagues)**
- La Liga (ID: 564)
- La Liga 2 (ID: 567)
- Copa Del Rey (ID: 570)

**Italy (3 leagues)**
- Serie A (ID: 384)
- Serie B (ID: 387)
- Coppa Italia (ID: 390)

**Germany (1 league)**
- Bundesliga (ID: 82)

**France (1 league)**
- Ligue 1 (ID: 301)

**Netherlands (1 league)**
- Eredivisie (ID: 72)

**Portugal (1 league)**
- Liga Portugal (ID: 462)

**Belgium (1 league)**
- Pro League (ID: 208)

**Other European Leagues**
- Austria - Admiral Bundesliga (ID: 181)
- Croatia - 1. HNL (ID: 244)
- Denmark - Superliga (ID: 271)
- Norway - Eliteserien (ID: 444)
- Poland - Ekstraklasa (ID: 453)
- Russia - Premier League (ID: 486)
- Scotland - Premiership (ID: 501)
- Sweden - Allsvenskan (ID: 573)
- Switzerland - Super League (ID: 591)
- Turkey - Super Lig (ID: 600)
- Ukraine - Premier League (ID: 609)

**European Competitions**
- UEFA Europa League Play-offs (ID: 1371)

---

## How League Filtering Works

### 1. **Player Search** (`/api/sportmonks/players/search`)
- Fetches players from Sportmonks API
- Filters using `filterPlayersByAllowed()`
- Only returns players who play in allowed leagues
- Checks player's `teams.team.activeSeasons` for league IDs

### 2. **Team Search** (`/api/sportmonks/teams/search`)
- Fetches teams from Sportmonks API
- Filters using `filterTeamsByAllowed()`
- Only returns teams that play in allowed leagues
- Checks team's `activeSeasons` for league IDs

### 3. **Leagues List** (`/api/sportmonks/leagues`)
- Fetches all leagues from Sportmonks API
- Filters using `filterLeaguesByAllowed()`
- Only returns the 29 allowed leagues

### 4. **Fixtures** (if used)
- Filters using `filterFixturesByAllowed()`
- Only returns fixtures from allowed leagues

### 5. **Transfers** (if used)
- Filters using `isTransferAllowed()`
- Returns transfers where either the from_team or to_team plays in allowed leagues

---

## Testing Checklist

### ✅ API Endpoint Tests

**1. Test Player Search**
```bash
curl "http://localhost:3000/api/sportmonks/players/search?q=Haaland"
```
**Expected**: Should return Erling Haaland (plays for Manchester City in Premier League)
**Verify**: Response contains only players from allowed leagues

**2. Test Team Search**
```bash
curl "http://localhost:3000/api/sportmonks/teams/search?q=Barcelona"
```
**Expected**: Should return FC Barcelona (plays in La Liga)
**Verify**: Response contains only teams from allowed leagues

**3. Test Leagues List**
```bash
curl "http://localhost:3000/api/sportmonks/leagues"
```
**Expected**: Should return exactly 29 leagues
**Verify**: All returned leagues have IDs matching the allowed list

**4. Test Player from Non-Allowed League**
```bash
curl "http://localhost:3000/api/sportmonks/players/search?q=Messi"
```
**Expected**: Should NOT return Lionel Messi (plays for Inter Miami in MLS, which is not an allowed league)
**Note**: If he appears, it means he has historical data from Barcelona/PSG (allowed leagues)

---

## Common Issues & Solutions

### Issue 1: Player Not Appearing in Search
**Possible Causes:**
1. Player's current team is not in an allowed league
2. Player's team data doesn't include `activeSeasons`
3. Sportmonks API doesn't have the player

**Solution:**
- Check player's current team in Sportmonks API directly
- Verify team plays in one of the 29 allowed leagues
- Check if `include=teams.team.activeSeasons` is being passed

### Issue 2: Too Many/Too Few Results
**Possible Causes:**
1. League filtering is not being applied
2. `ALLOWED_LEAGUE_IDS` Set is empty or incorrect
3. API response structure changed

**Solution:**
- Check `/src/lib/sportmonks/allowedLeagues.ts` - verify 29 leagues are defined
- Verify `filterPlayersByAllowed` is being called in search routes
- Check Sportmonks API response structure

### Issue 3: Historical Players Not Showing
**Expected Behavior**: Players who previously played in allowed leagues but now play elsewhere should still appear if their historical data is present.

**Why**: The filter checks ALL teams in `player.teams` array, not just current team.

---

## Manual Testing Steps

### Step 1: Test Premier League
1. Search for "Harry Kane" → Should appear (Bayern Munich in Bundesliga)
2. Search for "Salah" → Should appear (Liverpool in Premier League)

### Step 2: Test La Liga
1. Search for "Lewandowski" → Should appear (Barcelona in La Liga)
2. Search for "Vinicius" → Should appear (Real Madrid in La Liga)

### Step 3: Test Serie A
1. Search for "Osimhen" → Should appear (Napoli in Serie A)
2. Search for "Lautaro" → Should appear (Inter Milan in Serie A)

### Step 4: Test Non-Allowed Leagues
1. Search for players in:
   - MLS (USA) → Should NOT appear (unless historical data)
   - Saudi Pro League → Should NOT appear (unless historical data)
   - Chinese Super League → Should NOT appear (unless historical data)

### Step 5: Test Inbound Targets Flow
1. Send WhatsApp message with Transfermarkt URL for player in allowed league
2. Wait 1 minute for cron job
3. Check `/inbound-targets` dashboard
4. Verify player appears with full Sportmonks data
5. Verify fit score is calculated (if club context is complete)

---

## Debugging League Issues

### Check Player's League Membership
```javascript
// In browser console or Node.js REPL
const player = await fetch('/api/sportmonks/players/search?q=PlayerName').then(r => r.json());
console.log(player.data[0].teams);
// Check each team's activeSeasons for league_id
```

### Check if League ID is Allowed
```javascript
// In src/lib/sportmonks/leagueFilters.ts
import { ALLOWED_LEAGUE_IDS } from './allowedLeagues';
console.log(ALLOWED_LEAGUE_IDS.has(8)); // true (Premier League)
console.log(ALLOWED_LEAGUE_IDS.has(999)); // false (not allowed)
```

### View All Allowed League IDs
```bash
# In the project root
grep -A 50 "ALLOWED_LEAGUES = " src/lib/sportmonks/allowedLeagues.ts
```

---

## Adding/Removing Leagues

### To Add a New League:
1. Edit `/src/lib/sportmonks/allowedLeagues.ts`
2. Add league to `ALLOWED_LEAGUES` array:
   ```typescript
   { id: 123, name: "New League", country: "Country" },
   ```
3. The `ALLOWED_LEAGUE_IDS` Set will automatically include it
4. Redeploy the application

### To Remove a League:
1. Edit `/src/lib/sportmonks/allowedLeagues.ts`
2. Remove league from `ALLOWED_LEAGUES` array
3. Redeploy the application

**Note**: No database changes needed - filtering happens at runtime.

---

## Performance Considerations

### Filtering Performance
- **O(1) lookup** using `Set` for league ID checks
- **Minimal overhead** - only filters API responses
- **No database impact** - filtering happens in application layer

### API Rate Limits
- Sportmonks has rate limits (check your plan)
- League filtering reduces response size, which is good
- Consider caching filtered results if needed

---

## Production Verification

### After Deployment:

1. **Test All 29 Leagues Work**
   - Search for a player from each league
   - Verify they appear in results

2. **Test Non-Allowed Leagues Are Blocked**
   - Search for players from MLS, Saudi Pro League, etc.
   - Verify they don't appear (unless historical data)

3. **Monitor Sportmonks API Usage**
   - Check Sportmonks dashboard for API call volume
   - Verify league filtering is reducing response sizes

4. **Check Inbound Targets**
   - Send WhatsApp messages with various players
   - Verify only players from allowed leagues are processed
   - Verify fit scores calculate correctly

---

## Current Status

✅ **29 leagues configured** in `allowedLeagues.ts`
✅ **Filtering implemented** in all API routes
✅ **Type-safe** using TypeScript const assertions
✅ **Performance optimized** using Set for O(1) lookups

### Files Involved:
- `/src/lib/sportmonks/allowedLeagues.ts` - League definitions
- `/src/lib/sportmonks/leagueFilters.ts` - Filtering logic
- `/src/app/api/sportmonks/*/route.ts` - API endpoints that apply filters

---

## Next Steps (If Leagues Aren't Working)

1. ✅ Check if Sportmonks API key is valid
2. ✅ Verify cron job is running (for inbound targets)
3. ✅ Test player search manually with curl
4. ✅ Check browser console for errors
5. ✅ Verify `include=teams.team.activeSeasons` is in API calls
6. ✅ Check if Sportmonks API response structure matches expectations

If you encounter specific issues, provide:
- Player name that should appear but doesn't
- League ID they play in
- Error messages (if any)
- API response (sanitized)
