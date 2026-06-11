# Interface Contract: Website ↔ Extensions

**Version:** 1.0
**Purpose:** Define the data boundary between the agentprivacy.ai training ground (website) and the browser extensions (myswordsman, mymage).

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      agentprivacy.ai (Website)                          │
│                                                                         │
│   Training Ground → Teaches spells → Stores to localStorage             │
│                                                                         │
│   localStorage key: 'agentprivacy_spell_repertoire'                     │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │  ONE-WAY SYNC (website → extensions)
                                 │  Extensions READ from localStorage
                                 │  on agentprivacy.ai domain ONLY
                                 │
┌────────────────────────────────┼────────────────────────────────────────┐
│                                ▼                                        │
│  ┌───────────────────┐    ┌───────────────────┐                        │
│  │   MYSWORDSMAN     │◄──►│     MYMAGE        │                        │
│  │   Extension       │    │     Extension     │                        │
│  │                   │    │                   │                        │
│  │ chrome.storage    │    │ chrome.storage    │                        │
│  │ .local            │    │ .local            │                        │
│  └───────────────────┘    └───────────────────┘                        │
│                                                                         │
│              Browser Extensions (chrome.runtime.sendMessage)            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Website → Extensions Data Contract

### LocalStorage Key: `agentprivacy_spell_repertoire`

The website writes this JSON structure. Extensions read it (never write back).

```typescript
interface SpellRepertoire {
  // Schema version for forward compatibility
  version: '1.0'

  // Spells learned through training
  learnedSpells: LearnedSpell[]

  // History of spell casts on the website
  castHistory: CastEvent[]

  // Training completion state
  trainingProgress: TrainingProgress

  // Constellation state from website (optional, for resume)
  constellationSnapshot?: ConstellationSnapshot

  // Hexagram state from website (optional)
  hexagramSnapshot?: HexagramSnapshot

  // Sync metadata
  lastUpdated: number  // Unix timestamp
}

interface LearnedSpell {
  id: string                      // Unique spell identifier
  type: 'emoji' | 'proverb' | 'keyword' | 'hexagram'
  content: string                 // The spell content
  emoji?: string                  // Visual representation
  myTermsMapping: string          // e.g., 'DO_NOT_TRACK', 'DO_NOT_SELL'
  weight: number                  // Gap reduction weight
  yangYin: 'yang' | 'yin'
  learnedAt: number               // Timestamp
  learnedInSection: string        // e.g., 'manifesto', 'chronicle', 'drake'
  source: 'story' | 'zk' | 'canon' | 'parallel' | 'plurality'
}

interface CastEvent {
  spellId: string
  timestamp: number
  position: { x: number; y: number }
  section: string
}

interface TrainingProgress {
  sectionsVisited: string[]       // e.g., ['hero', 'manifesto', 'architecture']
  orbConvergenceCount: number     // Times orbs converged on website
  spellsCastCount: number         // Total spells cast on website
  drakeSpellUnlocked: boolean     // Has learned the 🐲 spell
  firstCastTimestamp?: number     // When user became "first person"
  pathUnlocked: boolean           // Can access /path page
}

interface ConstellationSnapshot {
  nodeCount: number
  patternTypes: string[]          // e.g., ['triangle', 'pair']
  hash?: string                   // Geometry hash
}

interface HexagramSnapshot {
  lines: [0|1, 0|1, 0|1, 0|1, 0|1, 0|1]
  number: number                  // 1-64
  name: string
}
```

### Path Page Unlock Criteria

The website's `/path` page checks these minimums before showing extension downloads:

```typescript
const PATH_UNLOCK_CRITERIA = {
  minSpellsCast: 3,
  minSectionsVisited: 3,
  minConvergences: 1
}
```

When criteria are met:
1. `/path` page becomes accessible
2. Swordsman extension download is shown
3. Mage extension download is gated behind Swordsman installation + VRC threshold

---

## Extension Sync Protocol

### Swordsman Reads Repertoire

When Swordsman content script runs on `agentprivacy.ai`:

```typescript
// swordsman-blade/src/content/repertoire-sync.ts

const SYNC_DOMAIN = 'agentprivacy.ai'

function shouldSync(): boolean {
  const hostname = location.hostname
  return hostname === SYNC_DOMAIN || hostname === `www.${SYNC_DOMAIN}`
}

async function syncRepertoireFromWebsite(): Promise<void> {
  if (!shouldSync()) return

  const raw = localStorage.getItem('agentprivacy_spell_repertoire')
  if (!raw) return

  try {
    const repertoire: SpellRepertoire = JSON.parse(raw)

    // Validate version
    if (repertoire.version !== '1.0') {
      console.warn('[Swordsman] Unknown repertoire version:', repertoire.version)
      return
    }

    // Store in extension storage
    await chrome.storage.local.set({
      spell_repertoire: repertoire,
      repertoire_synced_at: Date.now()
    })

    console.log('[Swordsman] Synced', repertoire.learnedSpells.length, 'spells from website')
  } catch (e) {
    console.error('[Swordsman] Failed to parse repertoire:', e)
  }
}

// Run on page load
syncRepertoireFromWebsite()
```

### Mage Does NOT Read Website Storage

The Mage extension:
- Has its own full grimoire bundled (all 5 spellbooks)
- Receives spell data from Swordsman via ceremony channel
- Never directly reads website localStorage

This maintains the architectural split:
- **Website** = learning, teaching
- **Swordsman** = carrying what was learned
- **Mage** = full knowledge, suggests spells

---

## Website Download Hosting

The website serves extension packages:

```
/public/extensions/
├── myswordsman-v1.0.0.zip       # Unpacked extension
├── myswordsman-v1.0.0.crx       # Signed (after Chrome Web Store)
├── mymage-v1.0.0.zip
├── mymage-v1.0.0.crx
└── manifest.json                # Version metadata
```

Download manifest:

```json
{
  "extensions": {
    "myswordsman": {
      "version": "1.0.0",
      "zip": "/extensions/myswordsman-v1.0.0.zip",
      "crx": "/extensions/myswordsman-v1.0.0.crx",
      "minTrainingSpells": 3,
      "minTrainingSections": 3,
      "minTrainingConvergences": 1
    },
    "mymage": {
      "version": "1.0.0",
      "zip": "/extensions/mymage-v1.0.0.zip",
      "crx": "/extensions/mymage-v1.0.0.crx",
      "requiresSwordsman": true,
      "swordsmanMinVRC": 50,
      "swordsmanMinDomains": 10
    }
  }
}
```

---

## Extension ↔ Extension Protocol

Swordsman and Mage communicate via `chrome.runtime.sendMessage` to each other's extension IDs.

### Discovery Handshake

```typescript
// Swordsman attempts to find Mage
chrome.runtime.sendMessage(MAGE_EXTENSION_ID, {
  type: 'SWORD_PRESENT',
  domain: location.hostname,
  myTermsState: getMyTermsConfig(),
  orbPosition: { x: tether.x, y: tether.y }
})

// Mage responds
{
  type: 'MAGE_ACKNOWLEDGE',
  orbPosition: { x: mageOrb.x, y: mageOrb.y },
  spellbookState: getAvailableSpells()
}
```

### Message Types

See `shared/types/ceremony-types.ts` for full protocol.

Key flows:
1. **Position sync** - 30fps throttled, both directions
2. **Scan results** - Mage → Swordsman (deep page analysis)
3. **Constellation updates** - Mage → Swordsman (render data)
4. **MyTerms assertions** - Swordsman → Mage (record keeping)
5. **Drake summon** - Swordsman → Mage (check eligibility)
6. **Drake formation** - Mage → Swordsman (render data)

---

## Version Compatibility

### Forward Compatibility

Extensions must handle unknown repertoire versions gracefully:

```typescript
function parseRepertoire(raw: string): SpellRepertoire | null {
  const data = JSON.parse(raw)

  // Known version - parse fully
  if (data.version === '1.0') {
    return data as SpellRepertoire
  }

  // Unknown version - try to extract basics
  if (data.learnedSpells && Array.isArray(data.learnedSpells)) {
    console.warn('[Sync] Unknown version, extracting basic data')
    return {
      version: '1.0',
      learnedSpells: data.learnedSpells,
      castHistory: data.castHistory || [],
      trainingProgress: data.trainingProgress || {
        sectionsVisited: [],
        orbConvergenceCount: 0,
        spellsCastCount: 0,
        drakeSpellUnlocked: false,
        pathUnlocked: false
      },
      lastUpdated: data.lastUpdated || Date.now()
    }
  }

  return null
}
```

### Extension ID Exchange

During development, use placeholder IDs:
```typescript
export const SWORDSMAN_EXTENSION_ID = 'SWORDSMAN_EXTENSION_ID_PLACEHOLDER'
export const MAGE_EXTENSION_ID = 'MAGE_EXTENSION_ID_PLACEHOLDER'
```

After Chrome Web Store publishing, replace with actual IDs and rebuild.

---

## Privacy Guarantees

1. **Website never tracks** - No analytics, no server calls for repertoire
2. **One-way sync** - Extensions read, never write to website storage
3. **Domain whitelist** - Sync only on agentprivacy.ai
4. **No cross-extension data in website** - Swordsman/Mage don't sync via website
5. **Local only** - All extension data in chrome.storage.local

---

## Testing the Contract

### Website Side

```javascript
// Test: Write valid repertoire
localStorage.setItem('agentprivacy_spell_repertoire', JSON.stringify({
  version: '1.0',
  learnedSpells: [
    {
      id: 'shield_001',
      type: 'emoji',
      content: '🛡️',
      myTermsMapping: 'DO_NOT_TRACK',
      weight: 2,
      yangYin: 'yang',
      learnedAt: Date.now(),
      learnedInSection: 'manifesto',
      source: 'story'
    }
  ],
  castHistory: [],
  trainingProgress: {
    sectionsVisited: ['hero', 'manifesto', 'architecture'],
    orbConvergenceCount: 1,
    spellsCastCount: 3,
    drakeSpellUnlocked: false,
    pathUnlocked: true
  },
  lastUpdated: Date.now()
}))
```

### Extension Side

```javascript
// Test: Read and validate
chrome.storage.local.get('spell_repertoire', (result) => {
  console.log('Synced repertoire:', result.spell_repertoire)
  console.log('Spell count:', result.spell_repertoire?.learnedSpells?.length)
})
```

---

*"The blade carries what the spellbook taught. The spellbook never forgets who learned."*
