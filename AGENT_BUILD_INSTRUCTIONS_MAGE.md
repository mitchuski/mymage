# The Mage Extension: Agent Build Instructions

**For:** AI Agents / Autonomous Builders  
**Project:** Mage Chrome Extension — Spellbook Projection & Ceremony Engine  
**Date:** March 2026  
**Stack:** Chrome Extension Manifest V3, TypeScript, @chenglou/pretext (bundled)  
**Repo:** github.com/mitchuski/mage-extension (new repo)  
**Companion:** AGENT_BUILD_INSTRUCTIONS_SWORDSMAN.md, AGENT_BUILD_INSTRUCTIONS_TRAINING_GROUND.md  
**Prerequisite:** The Mage extension requires the Swordsman extension to be installed. It checks on load and enters read-only mode if the Swordsman is absent.

---

## Overview

The Mage is the second extension installed. It carries the spellbook — knowledge scanning, page intelligence, spell inscription, constellation management, and the Drake emergence system. The Mage does NOT own the canvas overlay (the Swordsman does). Instead, the Mage sends rendering instructions to the Swordsman via the ceremony channel.

**Critical architectural rule:** The Mage sends data. The Swordsman renders. Only one canvas overlay exists per page. The Mage contributes: its orb position, spell nodes, constellation data, constellation wave animations, and Drake formation data. The Swordsman renders all of it.

**Why this split:** If both extensions inject canvases, z-index conflicts arise and pages break. By designating the Swordsman as the renderer and the Mage as the intelligence layer, we maintain the core duality: the blade touches the surface, the spell projects through the blade's opening.

---

## Step 1: Project Structure

```
mage-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   ├── service-worker.ts       # Background service worker
│   │   ├── knowledge-graph.ts      # Per-domain knowledge and constellation storage
│   │   ├── intel-pool.ts           # Intel pool state (future: cross-domain sharing)
│   │   └── sword-handshake.ts      # Discovery and handshake with Swordsman extension
│   ├── content/
│   │   ├── content-script.ts       # Main content script
│   │   ├── deep-scanner.ts         # Deep page analysis (privacy policy parsing, tracker categorisation)
│   │   ├── pretext-engine.ts       # Full pretext integration (text reflow data for Swordsman to render)
│   │   ├── spell-inscriber.ts      # Spell inscription mechanics
│   │   ├── constellation-manager.ts # Full constellation state, edge formation, pattern detection
│   │   ├── drake-engine.ts         # Drake emergence conditions, formation data
│   │   ├── ceremony-responder.ts   # Message channel to/from Swordsman extension
│   │   └── hexagram-engine.ts      # I Ching state machine
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   └── shared/
│       ├── types.ts
│       ├── ceremony-types.ts       # MUST match Swordsman's ceremony-types.ts exactly
│       ├── spell-library.ts        # Full grimoire (all five spellbooks)
│       └── grimoire-data/          # JSON grimoire files
│           ├── story.json
│           ├── zk.json
│           ├── canon.json
│           ├── parallel.json
│           └── plurality.json
├── lib/
│   └── pretext.bundle.js
├── assets/
│   └── icons/
├── package.json
├── tsconfig.json
└── build.ts
```

## Step 2: Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "Mage — Spellbook Projection",
  "version": "1.0.0",
  "description": "The spell that projects sovereignty across distance. Knowledge scanning, constellation mapping, ceremony engine.",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "dist/background/service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["dist/content/content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "dist/popup/popup.html",
    "default_icon": {
      "16": "assets/icons/mage-16.png",
      "48": "assets/icons/mage-48.png",
      "128": "assets/icons/mage-128.png"
    }
  },
  "externally_connectable": {
    "ids": ["SWORDSMAN_EXTENSION_ID_PLACEHOLDER"]
  }
}
```

## Step 3: Swordsman Dependency Check

File: `src/content/content-script.ts`

On load, the Mage MUST verify the Swordsman is present:

```typescript
const SWORD_EXTENSION_ID = 'PLACEHOLDER_REPLACE_WITH_REAL_ID'
let swordPresent = false
let swordOrbPosition = { x: 0, y: 0 }

async function discoverSwordsman(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(SWORD_EXTENSION_ID, {
        type: 'MAGE_PRESENT',
        domain: location.hostname,
        spellbookState: getAvailableSpells(),
        orbPosition: getMageOrbPosition()
      }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve(false)
          return
        }
        if (response.type === 'SWORD_ACKNOWLEDGE') {
          swordPresent = true
          swordOrbPosition = response.orbPosition || { x: 0, y: 0 }
          resolve(true)
        } else {
          resolve(false)
        }
      })
    } catch {
      resolve(false)
    }
  })
}

// If Swordsman not found, enter read-only mode
const hasSword = await discoverSwordsman()
if (!hasSword) {
  console.log('[Mage] Swordsman not detected. Read-only mode.')
  // Still scan the page, store data, but don't send ceremony messages
  // Don't inject any UI elements
  runReadOnlyMode()
} else {
  runFullCeremonyMode()
}
```

## Step 4: Deep Page Scanner

File: `src/content/deep-scanner.ts`

The Mage does deeper analysis than the Swordsman's basic scan:

```typescript
interface DeepScanResult {
  // Everything the Swordsman found, plus:
  trackerCategories: Map<string, string[]>  // category → tracker hostnames
  privacyPolicyAnalysis: {
    url: string | null
    score: number           // 0-1 privacy friendliness
    keywords: {
      dataSharing: string[]
      retention: string[]
      thirdParty: string[]
      userRights: string[]
    }
  }
  darkPatterns: {
    preCheckedConsent: number    // count of pre-checked consent boxes
    hiddenReject: boolean       // reject button visually de-emphasised
    confusingLanguage: boolean  // double negatives, misleading phrasing
    urgencyTactics: boolean     // "limited time" consent pressure
  }
  formAnalysis: {
    forms: FormInfo[]
    totalSensitiveFields: number
    hasHiddenInputs: boolean     // hidden inputs that might track
  }
  metaTags: {
    hasDoNotTrack: boolean
    hasGPC: boolean              // Global Privacy Control header
    opaqueTracking: string[]     // meta tags related to tracking
  }
}

// Tracker categorisation (known domains)
const TRACKER_CATEGORIES: Record<string, string> = {
  'google-analytics.com': 'analytics',
  'googletagmanager.com': 'tag-management',
  'facebook.net': 'social-tracking',
  'doubleclick.net': 'advertising',
  'hotjar.com': 'session-recording',
  'fullstory.com': 'session-recording',
  'mixpanel.com': 'analytics',
  'segment.com': 'data-collection',
  'amplitude.com': 'analytics',
  // ... extend with known tracker database
}

function deepScan(): DeepScanResult {
  // ... implementation
  // The Mage scans more thoroughly because this is its role:
  // project intelligence, not just defend boundaries
}
```

### Send Scan Results to Swordsman

After scanning, the Mage sends findings as a `CONSTELLATION_WAVE`:

```typescript
function sendScanToSwordsman(scan: DeepScanResult): void {
  const suggestedSpells = generateSpellSuggestions(scan)

  sendToSword({
    type: 'CONSTELLATION_WAVE',
    direction: 'MAGE_TO_SWORD',
    payload: {
      threatLevel: scan.privacyPolicyAnalysis.score < 0.5 ? 0.7 : 0.3,
      suggestedAssertions: suggestedSpells,
      trackerCount: Object.values(scan.trackerCategories).flat().length,
      darkPatternCount: countDarkPatterns(scan.darkPatterns),
      gapScore: calculateGapScore(scan)
    },
    animation: {
      particleCount: Math.min(20, Object.values(scan.trackerCategories).flat().length),
      pathType: 'geodesic',
      duration: 2000
    }
  })
}
```

## Step 5: Full Pretext Integration

File: `src/content/pretext-engine.ts`

The Mage owns the full pretext measurement engine. When both extensions are active, the Mage measures the page text and sends reflow data to the Swordsman for rendering.

```typescript
import { prepareWithSegments, layoutNextLine } from '../lib/pretext.bundle'

interface ReflowData {
  lines: Array<{
    text: string
    width: number
    x: number
    y: number
  }>
  sectionBounds: Array<{
    top: number
    height: number
    containerWidth: number
    containerLeft: number
  }>
}

function computeReflowData(
  swordPosition: { x: number; y: number },
  magePosition: { x: number; y: number }
): ReflowData {
  // Identify text sections on the page
  const sections = identifyTextSections()
  const allLines: ReflowData['lines'] = []

  for (const section of sections) {
    if (!section.prepared) {
      // Prepare once, cache
      section.prepared = prepareWithSegments(section.text, section.font)
    }

    let cursor = { segmentIndex: 0, graphemeIndex: 0 }
    let y = section.top

    while (true) {
      // Calculate available width at this y, excluding both orbs
      const { width, offsetX } = getAvailableWidth(
        y, // absolute page position
        [
          { x: swordPosition.x, y: swordPosition.y, exclusionRadius: 40 },
          { x: magePosition.x, y: magePosition.y, exclusionRadius: 40 }
        ],
        section.containerWidth,
        section.containerLeft
      )

      const line = layoutNextLine(section.prepared, cursor, width)
      if (line === null) break

      allLines.push({
        text: line.text,
        width: line.width,
        x: offsetX,
        y: y
      })

      cursor = line.end
      y += section.lineHeight
    }
  }

  return { lines: allLines, sectionBounds: sections.map(s => s.bounds) }
}
```

**Send reflow data to Swordsman at render frame rate:**

```typescript
// Throttled to 30fps — the Swordsman interpolates between updates
function sendReflowUpdate(): void {
  if (!swordPresent) return

  const reflow = computeReflowData(swordOrbPosition, mageOrbPosition)
  sendToSword({
    type: 'REFLOW_DATA',
    lines: reflow.lines,
    // Don't send full text — just positions and widths
    // The Swordsman uses CSS transforms to reposition existing DOM text nodes
  })
}
```

**Note:** Whether the Swordsman actually applies text reflow on arbitrary pages is a Phase 2 feature. Phase 1: the Mage computes reflow data and sends it, but the Swordsman only uses it for spell positioning intelligence. Full visual text reflow around orbs is for the agentprivacy.ai homepage first, arbitrary pages later.

## Step 6: Mage Orb Physics

File: `src/content/mage-orb.ts`

The Mage orb moves autonomously (not cursor-tethered like the Swordsman). It gravitates toward data-collecting elements:

```typescript
interface MageOrbState {
  x: number
  y: number
  vx: number
  vy: number
  attractors: Attractor[]
}

interface Attractor {
  x: number
  y: number
  strength: number  // negative = repel, positive = attract
  type: 'tracker' | 'form' | 'cookie-banner' | 'privacy-link'
}

function updateMageOrb(state: MageOrbState, dt: number): void {
  // Base orbit (Perlin noise for organic drift)
  const baseVx = Math.sin(Date.now() * 0.0007) * 0.3
  const baseVy = Math.cos(Date.now() * 0.0005) * 0.2

  // Attractor forces
  let ax = baseVx, ay = baseVy
  for (const att of state.attractors) {
    const dx = att.x - state.x
    const dy = att.y - state.y
    const dist = Math.sqrt(dx * dx + dy * dy) + 1
    const force = att.strength / (dist * dist) * 100
    ax += (dx / dist) * force
    ay += (dy / dist) * force
  }

  // Apply with damping
  state.vx = (state.vx + ax * dt) * 0.95
  state.vy = (state.vy + ay * dt) * 0.95
  state.x += state.vx
  state.y += state.vy

  // Clamp to viewport
  state.x = Math.max(20, Math.min(window.innerWidth - 20, state.x))
  state.y = Math.max(20, Math.min(window.innerHeight - 20, state.y))
}

function buildAttractors(scan: DeepScanResult): Attractor[] {
  const attractors: Attractor[] = []

  // Cookie banners attract the Mage (it wants to analyse them)
  const banner = document.querySelector('#onetrust-banner-sdk, [class*="cookie"], [id*="consent"]')
  if (banner) {
    const rect = banner.getBoundingClientRect()
    attractors.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      strength: 0.5,
      type: 'cookie-banner'
    })
  }

  // Forms attract weakly
  document.querySelectorAll('form').forEach(form => {
    const rect = form.getBoundingClientRect()
    attractors.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      strength: 0.2,
      type: 'form'
    })
  })

  return attractors
}
```

**Send position to Swordsman:**

```typescript
// 30fps throttled
setInterval(() => {
  if (swordPresent) {
    sendToSword({ type: 'MAGE_ORB_POSITION', x: mageOrb.x, y: mageOrb.y })
  }
}, 33)
```

## Step 7: Constellation Manager

File: `src/content/constellation-manager.ts`

The Mage owns the constellation state. All spell nodes, edges, and pattern detection live here.

```typescript
interface ConstellationState {
  nodes: SpellNode[]
  edges: ConstellationEdge[]
  patterns: DetectedPattern[]
  hash: string | null
}

interface ConstellationEdge {
  from: string  // node ID
  to: string    // node ID
  strength: number  // 0-1
  type: 'solid' | 'dashed'  // same-type vs mixed-type
}

interface DetectedPattern {
  type: 'triangle' | 'line' | 'star' | 'pair'
  nodeIds: string[]
}

function updateConstellation(state: ConstellationState): void {
  // Rebuild edges based on proximity
  state.edges = []
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      const dx = state.nodes[i].x - state.nodes[j].x
      const dy = state.nodes[i].y - state.nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 180) {
        const sameType = state.nodes[i].spell.yangYin === state.nodes[j].spell.yangYin
        state.edges.push({
          from: state.nodes[i].id,
          to: state.nodes[j].id,
          strength: 1 - dist / 180,
          type: sameType ? 'solid' : 'dashed'
        })
      }
    }
  }

  // Detect patterns
  state.patterns = detectPatterns(state.nodes, state.edges)

  // Compute constellation hash (privacy-preserving geometry proof)
  state.hash = computeConstellationHash(state.nodes)
}

// Send constellation state to Swordsman for rendering
function sendConstellationToSword(state: ConstellationState): void {
  sendToSword({
    type: 'CONSTELLATION_UPDATE',
    nodes: state.nodes.map(n => ({
      id: n.id, x: n.x, y: n.y,
      yangYin: n.spell.yangYin,
      opacity: n.opacity,
      pulse: n.pulse
    })),
    edges: state.edges,
    patterns: state.patterns
  })
}
```

## Step 8: Drake Emergence Engine

File: `src/content/drake-engine.ts`

The Drake forms from the constellation when conditions are met:

```typescript
interface DrakeState {
  eligible: boolean
  summoned: boolean
  formationProgress: number  // 0-1
  bodyNodes: DrakeBodyNode[]
  patrolPath: { x: number; y: number }[]
}

interface DrakeBodyNode {
  nodeId: string          // references a constellation SpellNode
  pvmCondition: string    // P, C, Q, S, network, phi, R
  position: { x: number; y: number }
  health: number          // 0-1, maps to condition value
}

function checkDrakeEligibility(
  constellation: ConstellationState,
  scan: DeepScanResult,
  repertoire: SpellRepertoire
): boolean {
  // Both extensions active (implicit — we're in the Mage)
  // User has the dragon spell
  if (!repertoire.learnedSpells.includes('drake_spell')) return false

  // Page meets complexity threshold
  const complexEnough =
    scan.trackerCategories.size >= 10 ||
    (scan.darkPatterns.preCheckedConsent > 0 || scan.darkPatterns.hiddenReject) ||
    scan.privacyPolicyAnalysis.score < 0.3 ||
    location.hostname.includes('agentprivacy.ai')

  return complexEnough
}

function computeDrakeFormation(
  constellation: ConstellationState
): DrakeBodyNode[] {
  // Need at least 7 nodes for a minimal Drake body
  if (constellation.nodes.length < 7) return []

  // Map PVM conditions to constellation nodes
  // Sort nodes by position to create a serpentine form
  const sorted = [...constellation.nodes].sort((a, b) => {
    // Sort by angle from centre to create a coiling path
    const cx = constellation.nodes.reduce((s, n) => s + n.x, 0) / constellation.nodes.length
    const cy = constellation.nodes.reduce((s, n) => s + n.y, 0) / constellation.nodes.length
    const angleA = Math.atan2(a.y - cy, a.x - cx)
    const angleB = Math.atan2(b.y - cy, b.x - cx)
    return angleA - angleB
  })

  const pvmConditions = ['P', 'C', 'Q', 'S', 'network', 'phi', 'R']

  return sorted.slice(0, 7).map((node, i) => ({
    nodeId: node.id,
    pvmCondition: pvmConditions[i % pvmConditions.length],
    position: { x: node.x, y: node.y },
    health: 1.0  // TODO: derive from actual PVM assessment
  }))
}

// Send Drake formation data to Swordsman for rendering
function sendDrakeToSword(drake: DrakeState): void {
  if (!drake.summoned) return
  sendToSword({
    type: 'DRAKE_FORMATION',
    bodyNodes: drake.bodyNodes,
    patrolPath: drake.patrolPath,
    formationProgress: drake.formationProgress
  })
}
```

## Step 9: I Ching Hexagram Engine

File: `src/content/hexagram-engine.ts`

The Mage owns the hexagram state (the Swordsman receives it for display):

```typescript
const HEXAGRAM_NAMES: string[] = [
  'Creative','Receptive','Difficulty','Youthful','Waiting','Conflict',
  'Army','Holding','Small Taming','Treading','Peace','Standstill',
  // ... all 64
]

interface HexagramState {
  lines: [0|1, 0|1, 0|1, 0|1, 0|1, 0|1]
  // lines[0] = bottom (earth), lines[5] = top (heaven)
}

function hexagramNumber(h: HexagramState): number {
  return h.lines[0]*32 + h.lines[1]*16 + h.lines[2]*8 + h.lines[3]*4 + h.lines[4]*2 + h.lines[5] + 1
}

function mutateHexagram(h: HexagramState, trigger: 'scroll' | 'spell' | 'time' | 'user'): HexagramState {
  const newLines = [...h.lines] as HexagramState['lines']
  const lineIndex = trigger === 'scroll'
    ? scrollPositionToLineIndex()
    : trigger === 'spell'
    ? currentSpellCycleIndex() % 6
    : Math.floor(Math.random() * 6)

  newLines[lineIndex] = newLines[lineIndex] === 1 ? 0 : 1
  return { lines: newLines }
}

// Map hexagram to animation parameters (sent to Swordsman)
function hexagramToAnimationParams(h: HexagramState): AnimationParams {
  return {
    orbitRadii: h.lines[0] ? 0.7 : 1.0,          // yang=tight, yin=wide
    spellSpawnRate: h.lines[1] ? 0.8 : 0.3,       // yang=dense, yin=sparse
    phaseCoupling: h.lines[2] ? 0.8 : 0.2,        // yang=high, yin=low
    edgeThreshold: h.lines[3] ? 120 : 220,        // yang=short-range, yin=long-range
    glowIntensity: h.lines[4] ? 0.4 : 0.15,       // yang=high, yin=low
    gridVisibility: h.lines[5] ? 0.08 : 0.02       // yang=dense, yin=faint
  }
}
```

## Step 10: Ceremony Responder

File: `src/content/ceremony-responder.ts`

Handle all incoming messages from Swordsman:

```typescript
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (sender.id !== SWORD_EXTENSION_ID) return

  switch (message.type) {
    case 'SWORD_PRESENT':
      swordPresent = true
      swordOrbPosition = message.orbPosition
      sendResponse({
        type: 'MAGE_ACKNOWLEDGE',
        orbPosition: getMageOrbPosition(),
        spellbookState: getAvailableSpells()
      })
      // Activate full mode
      runFullCeremonyMode()
      break

    case 'ORB_POSITION':
      swordOrbPosition = { x: message.x, y: message.y }
      // Recompute reflow if needed
      break

    case 'SLASH':
      // Swordsman blocked something — record in constellation
      recordSlashEvent(message)
      break

    case 'WARD':
      // Swordsman set a boundary — update hexagram
      updateHexagramFromWard(message)
      break

    case 'TERM_ASSERT':
      // MyTerms asserted — crystallise constellation
      crystalliseConstellation(message)
      break

    case 'CEREMONY_BEGIN':
      // Swordsman initiated a ceremony
      respondToCeremony(message)
      break

    case 'SUMMON_DRAKE':
      // Swordsman requests Drake summon
      if (checkDrakeEligibility(constellation, lastScan, repertoire)) {
        inititateDrakeFormation()
      }
      break
  }
})
```

## Step 11: Popup UI

The Mage popup shows different data from the Swordsman popup:

1. **Intelligence report** — Deep scan summary for current domain
2. **Constellation minimap** — Small canvas showing spell nodes and edges
3. **Hexagram display** — Current I Ching state with line labels
4. **Spell history** — Last 10 spells cast on this domain
5. **Drake status** — Eligible / summoned / not available
6. **Cross-domain stats** — Total domains scanned, total constellation nodes, Dragon progress

---

## Step 12: Shared Types Package

Both extensions MUST share identical type definitions for the ceremony channel. Create a shared npm package or copy the types file to both repos:

File: `shared/ceremony-types.ts` (identical in both repos)

```typescript
// ===== SWORD → MAGE =====
export type SwordMessage =
  | { type: 'SWORD_PRESENT'; domain: string; myTermsState: any; orbPosition: Position }
  | { type: 'ORB_POSITION'; x: number; y: number }
  | { type: 'SLASH'; target: string; domain: string; assertion: string; intensity: number }
  | { type: 'WARD'; boundary: string; terms: string[]; hexagramLine: number; yangState: boolean }
  | { type: 'TERM_ASSERT'; domain: string; assertions: any[]; constellationHash: string; hexagram: HexagramState }
  | { type: 'CEREMONY_BEGIN'; ceremonyType: CeremonyType; initiator: 'SWORD' }
  | { type: 'SUMMON_DRAKE'; conditions: DrakeConditions }

// ===== MAGE → SWORD =====
export type MageMessage =
  | { type: 'MAGE_PRESENT'; domain: string; spellbookState: any; orbPosition: Position }
  | { type: 'MAGE_ACKNOWLEDGE'; orbPosition: Position; spellbookState: any }
  | { type: 'MAGE_ORB_POSITION'; x: number; y: number }
  | { type: 'CONSTELLATION_WAVE'; direction: 'MAGE_TO_SWORD'; payload: WavePayload; animation: WaveAnimation }
  | { type: 'CONSTELLATION_UPDATE'; nodes: RenderNode[]; edges: RenderEdge[]; patterns: DetectedPattern[] }
  | { type: 'SCAN_RESULTS'; findings: DeepScanResult }
  | { type: 'SPELL_CAST'; spell: SpellNode }
  | { type: 'HEXAGRAM_UPDATE'; state: HexagramState; animationParams: AnimationParams }
  | { type: 'DRAKE_FORMATION'; bodyNodes: DrakeBodyNode[]; patrolPath: Position[]; formationProgress: number }
  | { type: 'CEREMONY_BEGIN'; ceremonyType: CeremonyType; initiator: 'MAGE' }
  | { type: 'REFLOW_DATA'; lines: ReflowLine[] }

// ===== SHARED TYPES =====
export type CeremonyType = 'dual_convergence' | 'hexagram_cast' | 'emoji_cast' | 'constellation_wave' | 'bilateral_exchange'
export interface Position { x: number; y: number }
export interface HexagramState { lines: [0|1, 0|1, 0|1, 0|1, 0|1, 0|1] }
```

---

## Testing Checklist

- [ ] Extension loads without errors in developer mode
- [ ] Read-only mode activates correctly when Swordsman is absent
- [ ] Full mode activates correctly when Swordsman handshake succeeds
- [ ] Deep scanner categorises trackers correctly
- [ ] Cookie banner detection works across OneTrust, Cookiebot, custom banners
- [ ] Dark pattern detection finds pre-checked consent boxes
- [ ] Mage orb position updates sent to Swordsman at 30fps
- [ ] Constellation edges form correctly between proximate nodes
- [ ] Constellation hash is deterministic (same input → same hash)
- [ ] Hexagram mutations trigger on scroll, spell, time, and user click
- [ ] Hexagram animation parameters correctly derived from line states
- [ ] Drake eligibility check works (eligible on tracker-heavy pages, always on agentprivacy.ai)
- [ ] Drake formation data serialises correctly for Swordsman rendering
- [ ] All ceremony messages match the shared type definitions
- [ ] Popup shows intelligence report and constellation minimap
- [ ] No canvas element injected (the Swordsman owns the canvas)
- [ ] Zero network requests from the extension
- [ ] All grimoire JSON files bundled correctly
- [ ] Pretext bundled locally
- [ ] Extension does not break on standard test sites

---

## Development Workflow

### Building Both Extensions Together

```bash
# Clone both repos side by side
git clone github.com/mitchuski/swordsman-extension
git clone github.com/mitchuski/mage-extension

# Install deps
cd swordsman-extension && npm install && cd ..
cd mage-extension && npm install && cd ..

# Build both
cd swordsman-extension && npm run build && cd ..
cd mage-extension && npm run build && cd ..

# Load both in Chrome:
# chrome://extensions → Developer mode → Load unpacked
# Load swordsman-extension/dist first
# Note the extension ID → update SWORD_EXTENSION_ID in mage-extension
# Load mage-extension/dist
# Note the extension ID → update MAGE_EXTENSION_ID in swordsman-extension
# Rebuild both with correct IDs

# Test handshake:
# Open any page → check console for "[Sword] Mage detected" and "[Mage] Swordsman detected"
```

### Testing Ceremony Channel

Create a test page at `test/ceremony-test.html` that logs all extension messages to the page. Load it in Chrome with both extensions active and verify:

1. Handshake completes within 1 second of page load
2. Orb positions sync bidirectionally
3. A spell cast in the Mage triggers constellation update in the Swordsman
4. Convergence ceremony fires when simulated orb positions are within threshold

---

## Agent Handoff Protocol

When passing to another agent:

1. Confirm both extension IDs are correctly cross-referenced
2. Note which ceremony message types are implemented vs. stubbed
3. List any deep scanner heuristics that need domain-specific tuning
4. Confirm grimoire JSON files are correctly loaded and parsed
5. Note the Drake emergence threshold values and whether they've been user-tested
6. Confirm the shared ceremony-types.ts is identical in both repos

---

*"The spell projects through the blade's opening. Without the opening, projection is dispossession. Without projection, the blade guards nothing worth having."*
