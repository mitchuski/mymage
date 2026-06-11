# Dual Extension Architecture: Mage + Swordsman

## The Two-Extension Model

**Version:** 1.0
**Date:** March 2026
**Dependencies:** `@chenglou/pretext`, Chrome Extension Manifest V3, agentprivacy.ai training

---

## Vision: Cryptographic Separation at the Extension Layer

The dual-agent architecture isn't just a website metaphor—it's **enforced at the browser level** through two separate extensions that communicate through spells, proverbs, and cryptographic keys.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                   │
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐               │
│  │   MAGE EXTENSION    │◄───────►│ SWORDSMAN EXTENSION │               │
│  │     (Soulbae)       │  Spells │     (Soulbis)       │               │
│  │                     │ Proverbs│                     │               │
│  │  • Understanding    │  Keys   │  • Action           │               │
│  │  • Page Analysis    │◄───────►│  • MyTerms          │               │
│  │  • Learning Context │         │  • Agreements       │               │
│  │  • Privacy Intel    │         │  • Inscriptions     │               │
│  └─────────────────────┘         └─────────────────────┘               │
│           │                               │                             │
│           └───────────┬───────────────────┘                             │
│                       │                                                 │
│              [Shared Spell Wallet]                                      │
│              [Encrypted Message Channel]                                │
│              [Convergence Protocol]                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Two Extensions?

1. **Privilege Separation**: Mage never needs to modify the page or assert terms. Swordsman never needs to analyze content deeply. Different capabilities, different permissions.

2. **Information Theoretic Guarantee**: `I(X; Y_S, Y_M) = I(X; Y_S) + I(X; Y_M)` — Information leakage is additive, not multiplicative. Compromise of one extension doesn't give full picture.

3. **User Mental Model**: Users learn the dual-agent separation on agentprivacy.ai. The extension architecture matches the conceptual architecture.

4. **Communication as Ritual**: The orbs don't just share state—they **cast spells to each other**. The communication IS the gameplay.

---

## The Mage Extension (Soulbae)

### Identity
- **Color**: Teal (#1D9E75 light / #5DCAA5 dark)
- **Symbol**: ✦ (sparkle/star)
- **Role**: Understanding, Analysis, Privacy Intelligence
- **Orb Behavior**: Weaves through content, gravitates toward text, links, data flows

### Capabilities

```typescript
// Mage Extension Permissions
{
  "permissions": [
    "activeTab",           // Read current tab content
    "storage",             // Store spell wallet
    "scripting"            // Inject content script
  ],
  "host_permissions": [
    "<all_urls>"           // Analyze any page
  ]
}
```

### Core Functions

#### 1. Page Privacy Analysis
```typescript
interface MageAnalysis {
  domain: string
  timestamp: number

  // What the Mage sees
  intelligence: {
    trackers: TrackerInfo[]
    cookies: CookieAnalysis
    forms: DataCollectionForm[]
    darkPatterns: DarkPattern[]
    privacyPolicy: PolicySummary | null
    termsOfService: TosSummary | null
  }

  // Mage's assessment (I Ching derived)
  hexagram: {
    lines: [number, number, number, number, number, number]  // 6-bit state
    number: number        // 1-64
    name: string          // "Creative", "Receptive", etc.
  }

  // Privacy gap calculation
  gap: {
    score: number         // 0-100
    factors: string[]     // Why the gap exists
  }
}
```

#### 2. Spell Suggestion Engine
```typescript
// Mage suggests spells based on what it learned
interface SpellSuggestion {
  spell: Spell
  reason: string            // "12 trackers detected"
  position?: {              // Where to cast it
    near: 'cookie-banner' | 'form' | 'tos-link' | 'tracker-element'
    coordinates: { x: number, y: number }
  }
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

// The Mage doesn't cast - it suggests
function suggestSpellsToSwordsman(analysis: MageAnalysis): SpellSuggestion[] {
  // Uses pretext to find ToS clauses, cookie banners, etc.
  // Sends suggestions to Swordsman via the spell channel
}
```

#### 3. Learning Context Provider
```typescript
// Mage provides educational context
interface LearningContext {
  // What this page is doing
  explanation: string

  // Reference to agentprivacy.ai training
  relatedTale?: {
    id: string
    title: string
    url: string
  }

  // Privacy tips
  tips: string[]
}
```

### Mage Orb Behavior

The Mage orb on page represents **the site's terms/practices**:

```typescript
const mageOrbBehavior = {
  // Anchored to page content
  anchor: {
    type: 'content-gravity',
    attractors: [
      { selector: '[class*="cookie"]', weight: 0.8 },
      { selector: 'form', weight: 0.6 },
      { selector: '[class*="consent"]', weight: 0.9 },
      { selector: '.privacy-policy', weight: 0.5 },
    ]
  },

  // Autonomous drift (Perlin noise)
  movement: {
    type: 'perlin-drift',
    speed: 0.3,
    amplitude: 50,
  },

  // Reacts to Swordsman approach
  onSwordsmanApproach: (distance: number) => {
    if (distance < 150) {
      // Start glowing brighter
      // Show "ready to converge" state
    }
  },

  // Visual state reflects site's privacy posture
  appearance: (analysis: MageAnalysis) => ({
    opacity: 0.3 + (analysis.gap.score / 100) * 0.5,  // More opaque = worse privacy
    pulseSpeed: analysis.intelligence.trackers.length * 0.1,
    glowColor: analysis.gap.score > 50 ? '#FF6B6B' : '#5DCAA5',
  })
}
```

---

## The Swordsman Extension (Soulbis)

### Identity
- **Color**: Deep purple (#534AB7 light / #AFA9EC dark)
- **Symbol**: ⚔ (crossed swords)
- **Role**: Action, Assertion, MyTerms, Sovereignty
- **Orb Behavior**: Follows cursor, guardian posture, boundary enforcement

### Capabilities

```typescript
// Swordsman Extension Permissions
{
  "permissions": [
    "storage",             // Store MyTerms, agreements
    "scripting",           // Inject overlay
    "declarativeNetRequest" // Optional: block trackers
  ],
  "host_permissions": [
    "<all_urls>"           // Assert terms anywhere
  ]
}
```

### Core Functions

#### 1. MyTerms Configuration
```typescript
interface MyTermsConfig {
  // Core privacy preferences
  preferences: {
    doNotTrack: boolean
    doNotSell: boolean
    dataMinimisation: boolean
    cookiePreference: 'all' | 'essential-only' | 'none'
    credentialDisclosure: 'selective' | 'full' | 'none'
    agentDelegation: 'self-only' | 'emissary-allowed'
  }

  // Spell palette (what user can cast)
  spellPalette: Spell[]

  // Default bundles
  bundles: {
    'social-media-defensive': Spell[]
    'e-commerce-minimal': Spell[]
    'news-reading': Spell[]
  }

  // Auto-assert domains
  autoAssert: {
    domains: string[]
    bundle: string
  }

  // Keys for inter-extension communication
  keys: {
    spellSigningKey: CryptoKey      // Signs spells sent to Mage
    proverbEncryptionKey: CryptoKey // Encrypts proverbs in transit
  }
}
```

#### 2. Spell Casting Engine
```typescript
async function castSpell(
  spell: Spell,
  position: { x: number, y: number },
  context: CastingContext
): Promise<CastResult> {

  // 1. Sign the spell with Swordsman's key
  const signedSpell = await signSpell(spell, config.keys.spellSigningKey)

  // 2. Broadcast to Mage extension
  await sendToMage({
    type: 'SPELL_CAST',
    spell: signedSpell,
    position,
    timestamp: Date.now()
  })

  // 3. Render spell node on overlay
  renderSpellNode(spell, position)

  // 4. Calculate gap reduction
  const gapDelta = calculateGapReduction(spell, context.currentGap)

  // 5. Check for convergence
  if (context.currentGap - gapDelta <= 0) {
    await initiateConvergence(spell)
  }

  return {
    success: true,
    newGap: context.currentGap - gapDelta,
    convergenceTriggered: context.currentGap - gapDelta <= 0
  }
}
```

#### 3. Agreement Formation
```typescript
interface MyTermsAgreement {
  version: '1.0'
  domain: string
  timestamp: string

  // What was asserted
  assertions: Array<{
    type: string              // 'DO_NOT_SELL', etc.
    spell: Spell              // The spell that made this assertion
    weight: number
  }>

  // State at time of assertion
  hexagramState: number[]     // From Mage's analysis
  gapScore: number            // Final gap (should be 0)

  // Proof of process
  constellationHash: string   // Hash of spell geometry
  signatureChain: string[]    // Signatures of all spells cast

  // For verification
  mageAnalysisHash: string    // Hash of Mage's analysis at convergence
  swordsmanConfigHash: string // Hash of Swordsman's config
}
```

### Swordsman Orb Behavior

The Swordsman orb represents **YOU**:

```typescript
const swordsmanOrbBehavior = {
  // Tethered to cursor
  tether: {
    type: 'spring-physics',
    stiffness: 0.06,
    damping: 0.75,
    maxDistance: 100,
  },

  // Follows cursor with guardian lag
  movement: {
    followDelay: 80,          // ms behind cursor
    snapOnFastMove: true,     // Catches up when cursor moves fast
    idleDrift: 'gentle-float' // Small movements when cursor still
  },

  // Appearance reflects your readiness
  appearance: (state: SwordsmanState) => ({
    size: state.spellReady ? 24 : 20,
    glow: state.spellReady ? 0.4 : 0.15,
    pulseSpeed: state.nearConvergence ? 2 : 0.5,
  }),

  // The tether line to cursor
  tetherLine: {
    style: 'dashed',
    opacity: (distance: number) => Math.max(0.1, 1 - distance / 100),
    color: '#534AB7'
  }
}
```

---

## Inter-Extension Communication Protocol

### The Spell Channel

Extensions communicate through Chrome's `runtime.sendMessage` API, but the messages are **spells**:

```typescript
// Message types between extensions
type SpellChannelMessage =
  // Mage → Swordsman
  | { type: 'ANALYSIS_COMPLETE', analysis: MageAnalysis }
  | { type: 'SPELL_SUGGESTION', suggestions: SpellSuggestion[] }
  | { type: 'HEXAGRAM_UPDATE', hexagram: Hexagram }
  | { type: 'CONVERGENCE_READY', position: Vector2 }

  // Swordsman → Mage
  | { type: 'SPELL_CAST', spell: SignedSpell, position: Vector2 }
  | { type: 'CONVERGENCE_INITIATED' }
  | { type: 'AGREEMENT_FORMED', agreement: MyTermsAgreement }
  | { type: 'REQUEST_ANALYSIS', domain: string }

  // Bidirectional
  | { type: 'ORB_POSITION_UPDATE', orb: 'mage' | 'swordsman', position: Vector2 }
  | { type: 'PROVERB_EXCHANGE', proverb: EncryptedProverb }
```

### Cryptographic Binding

Spells are signed. Proverbs are encrypted. Keys establish trust:

```typescript
// When extensions first connect
async function establishExtensionTrust() {
  // Swordsman generates ephemeral keypair
  const swordsmanKeys = await generateKeyPair()

  // Exchange public keys
  await sendToMage({
    type: 'KEY_EXCHANGE',
    publicKey: swordsmanKeys.publicKey
  })

  const magePublicKey = await waitForMageKey()

  // Derive shared secret for proverb encryption
  const sharedSecret = await deriveSharedSecret(
    swordsmanKeys.privateKey,
    magePublicKey
  )

  return { swordsmanKeys, magePublicKey, sharedSecret }
}

// Sign a spell before sending
async function signSpell(spell: Spell, privateKey: CryptoKey): Promise<SignedSpell> {
  const spellData = JSON.stringify({
    id: spell.id,
    type: spell.type,
    content: spell.content,
    timestamp: Date.now()
  })

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(spellData)
  )

  return {
    ...spell,
    signature: arrayBufferToBase64(signature)
  }
}

// Encrypt proverbs in transit
async function encryptProverb(proverb: string, sharedSecret: CryptoKey): Promise<EncryptedProverb> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedSecret,
    new TextEncoder().encode(proverb)
  )

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv)
  }
}
```

### The Convergence Protocol

When orbs converge, it's a **ritual** with multiple steps:

```typescript
async function convergenceProtocol(context: ConvergenceContext) {
  // Phase 1: Swordsman initiates
  await swordsman.broadcast({ type: 'CONVERGENCE_INITIATED' })

  // Phase 2: Mage acknowledges and provides final analysis
  const mageAck = await mage.respond({
    type: 'CONVERGENCE_ACKNOWLEDGED',
    finalAnalysis: context.analysis,
    hexagramState: context.hexagram.lines
  })

  // Phase 3: Orbs approach (both extensions animate)
  await Promise.all([
    swordsman.animateApproach(context.convergencePoint),
    mage.animateApproach(context.convergencePoint)
  ])

  // Phase 4: Spell constellation crystallizes
  const constellation = crystallizeConstellation(context.castSpells)
  const constellationHash = await hashConstellation(constellation)

  // Phase 5: Agreement formation
  const agreement: MyTermsAgreement = {
    version: '1.0',
    domain: context.domain,
    timestamp: new Date().toISOString(),
    assertions: context.castSpells.map(s => ({
      type: s.myTermsMapping,
      spell: s,
      weight: s.weight
    })),
    hexagramState: mageAck.hexagramState,
    gapScore: 0,
    constellationHash,
    signatureChain: context.castSpells.map(s => s.signature),
    mageAnalysisHash: await hashAnalysis(mageAck.finalAnalysis),
    swordsmanConfigHash: await hashConfig(swordsman.config)
  }

  // Phase 6: Both extensions record the agreement
  await Promise.all([
    swordsman.recordAgreement(agreement),
    mage.recordAgreement(agreement)
  ])

  // Phase 7: Cursor state change
  swordsman.setCursorState('sovereign')

  // Phase 8: Celebration animation
  await playConvergenceAnimation(context.convergencePoint)

  return agreement
}
```

---

## The Orb Game: Unified Experience

### How It Works Across Two Extensions

1. **Page Load**:
   - Mage extension analyzes page → broadcasts `ANALYSIS_COMPLETE`
   - Swordsman receives analysis → calculates initial gap → positions orbs

2. **Orb Rendering**:
   - Each extension renders its own orb on its own canvas overlay
   - Position updates broadcast via `ORB_POSITION_UPDATE`
   - Both canvases layered (Mage z-index slightly lower)

3. **Spell Casting**:
   - User selects spell in Swordsman's palette
   - User clicks to cast → Swordsman renders spell node
   - Swordsman broadcasts `SPELL_CAST` to Mage
   - Mage verifies signature, updates hexagram, broadcasts update

4. **Gap Reduction**:
   - Swordsman calculates gap reduction based on spell weight
   - If gap approaches zero, Swordsman broadcasts `CONVERGENCE_INITIATED`
   - Both extensions enter convergence mode

5. **Convergence**:
   - Both orbs animate toward convergence point
   - Agreement formed collaboratively
   - Both extensions record the agreement
   - Cursor transforms to sovereign state

### Canvas Overlay Coordination

```typescript
// Mage's canvas (lower z-index)
const mageCanvas = {
  id: 'mage-overlay',
  zIndex: 2147483646,
  renders: ['mageOrb', 'analysisIndicators', 'suggestionPins']
}

// Swordsman's canvas (higher z-index)
const swordsmanCanvas = {
  id: 'swordsman-overlay',
  zIndex: 2147483647,
  renders: ['swordsmanOrb', 'spellNodes', 'constellation', 'cursorState']
}

// Convergence point rendered on BOTH canvases for the animation
// Creates the visual effect of orbs from different layers meeting
```

---

## Spell Wallet: Shared State

### Storage Architecture

```typescript
// Shared via chrome.storage.sync (accessible by both extensions)
interface SharedSpellWallet {
  // Learned spells (from agentprivacy.ai training)
  spells: Map<string, Spell>

  // Agreements formed
  agreements: Map<string, MyTermsAgreement>

  // Training progress
  training: {
    completedTales: string[]
    unlockedSpells: string[]
    level: 1 | 2 | 3 | 4 | 5
  }

  // Last sync with agentprivacy.ai
  lastSync: number
}

// Each extension also has private storage
interface MagePrivateStorage {
  analysisCache: Map<string, MageAnalysis>
  suggestionHistory: SpellSuggestion[]
}

interface SwordsmanPrivateStorage {
  myTermsConfig: MyTermsConfig
  castingHistory: CastRecord[]
  constellations: Map<string, Constellation>
}
```

### Sync with agentprivacy.ai

When user is on agentprivacy.ai:

```typescript
// Content script on agentprivacy.ai
window.addEventListener('spell-learned', async (event) => {
  const spell = event.detail

  // Both extensions listen for this
  await chrome.runtime.sendMessage(MAGE_EXTENSION_ID, {
    type: 'SPELL_LEARNED',
    spell
  })

  await chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, {
    type: 'SPELL_LEARNED',
    spell
  })

  // Update shared wallet
  const wallet = await chrome.storage.sync.get('spellWallet')
  wallet.spells.set(spell.id, spell)
  await chrome.storage.sync.set({ spellWallet: wallet })
})
```

---

## I Ching Integration

### Hexagram as Shared State

The Mage calculates the hexagram. The Swordsman uses it for spell selection:

```typescript
// Mage calculates hexagram from page analysis
function calculateHexagram(analysis: MageAnalysis): Hexagram {
  const lines: number[] = []

  // Line 1 (Earth/Key custody): Based on detected auth patterns
  lines.push(analysis.intelligence.forms.some(f => f.hasPasswordField) ? 0 : 1)

  // Line 2 (Credential disclosure): Based on data collection intensity
  lines.push(analysis.intelligence.forms.length > 2 ? 0 : 1)

  // Line 3 (Agent delegation): Based on third-party scripts
  lines.push(analysis.intelligence.trackers.length > 5 ? 0 : 1)

  // Line 4 (Data residency): Based on cookie analysis
  lines.push(analysis.intelligence.cookies.thirdParty > 3 ? 0 : 1)

  // Line 5 (Interaction mode): Based on dark patterns
  lines.push(analysis.intelligence.darkPatterns.length > 0 ? 0 : 1)

  // Line 6 (Trust boundary): Overall assessment
  lines.push(analysis.gap.score > 50 ? 0 : 1)

  return {
    lines,
    number: linesToHexagramNumber(lines),
    name: getHexagramName(lines)
  }
}

// Swordsman uses hexagram to modulate orb behavior
function modulateOrbFromHexagram(hexagram: Hexagram): OrbModulation {
  return {
    orbitRadius: hexagram.lines[0] ? 0.8 : 1.2,      // Line 1 → orbit size
    spellDensity: hexagram.lines[1] ? 'high' : 'low', // Line 2 → spell frequency
    coupling: hexagram.lines[2] ? 0.7 : 0.3,         // Line 3 → orb entanglement
    edgeRange: hexagram.lines[3] ? 100 : 200,        // Line 4 → constellation edges
    glowIntensity: hexagram.lines[4] ? 0.8 : 0.4,    // Line 5 → visual intensity
    gridVisibility: hexagram.lines[5] ? 0.3 : 0.1,   // Line 6 → background grid
  }
}
```

---

## Pretext Integration Across Both Extensions

### Mage: Page Measurement for Intelligence

```typescript
// Mage uses pretext to understand page layout without triggering reflow
async function analyzePageLayout(document: Document) {
  const contentSections = extractContentSections(document)

  // Single DOM read
  const pageText = document.body.innerText
  const font = getComputedStyle(document.body).font

  // All subsequent measurement is arithmetic
  const prepared = prepareWithSegments(pageText, font)
  const { lines } = layoutWithLines(prepared, window.innerWidth, 24)

  // Find ToS clauses, privacy policy links, etc.
  const tosLines = findLinesContaining(lines, /terms|agree|consent|policy/i)

  // Return positions for Swordsman's spell suggestions
  return {
    prepared,
    lines,
    interestingPositions: tosLines.map(l => ({
      y: l.index * 24,
      text: l.text,
      type: classifyLine(l.text)
    }))
  }
}
```

### Swordsman: Spell Node Positioning

```typescript
// Swordsman uses pretext for intelligent spell placement
function calculateSpellPosition(
  cursorPos: Vector2,
  mageAnalysis: MageAnalysis,
  prepared: PreparedText
): Vector2 {
  // Snap to interesting positions if near them
  const nearbyInteresting = mageAnalysis.interestingPositions
    .find(p => Math.abs(p.y - cursorPos.y) < 50)

  if (nearbyInteresting) {
    // Place spell near the ToS/consent text
    return {
      x: cursorPos.x,
      y: nearbyInteresting.y
    }
  }

  // Otherwise, place at cursor with small jitter
  return {
    x: cursorPos.x + (Math.random() - 0.5) * 20,
    y: cursorPos.y + (Math.random() - 0.5) * 20
  }
}
```

### Website: Text Reflow Around Orbs

On agentprivacy.ai, text actually reflows around orbiting orbs:

```typescript
// The Living Spellbook text reflow
function reflowTextAroundOrbs(
  prepared: PreparedText,
  mageOrb: Vector2,
  swordsmanOrb: Vector2,
  containerWidth: number,
  lineHeight: number
): RenderedLine[] {
  const lines: RenderedLine[] = []
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = 0

  while (true) {
    // Calculate available width at this y-position
    const { width, offsetX } = getAvailableWidth(
      y, containerWidth, mageOrb, swordsmanOrb
    )

    // Layout single line with variable width
    const line = layoutNextLine(prepared, cursor, width)
    if (line === null) break

    lines.push({
      text: line.text,
      x: offsetX,
      y,
      width
    })

    cursor = line.end
    y += lineHeight
  }

  return lines
}

function getAvailableWidth(
  y: number,
  containerWidth: number,
  mageOrb: Vector2,
  swordsmanOrb: Vector2
): { width: number, offsetX: number } {
  let width = containerWidth
  let offsetX = 0
  const padding = 24

  for (const orb of [mageOrb, swordsmanOrb]) {
    const orbRadius = 40
    const dy = y - orb.y

    if (Math.abs(dy) < orbRadius + padding) {
      // Line intersects orb exclusion zone
      const chordHalf = Math.sqrt((orbRadius + padding) ** 2 - dy ** 2)
      const orbLeft = orb.x - chordHalf
      const orbRight = orb.x + chordHalf

      if (orbLeft < containerWidth / 2) {
        // Orb on left side
        offsetX = Math.max(offsetX, orbRight)
        width -= orbRight
      } else {
        // Orb on right side
        width -= (containerWidth - orbLeft)
      }
    }
  }

  return { width, offsetX }
}
```

---

## File Structure

```
pretext-agentprivacy/
├── packages/
│   ├── pretext/                    # @chenglou/pretext (vendored)
│   │
│   ├── mage-extension/             # Soulbae Extension
│   │   ├── manifest.json
│   │   ├── src/
│   │   │   ├── background/
│   │   │   │   ├── index.ts        # Service worker
│   │   │   │   ├── analyzer.ts     # Page privacy analysis
│   │   │   │   ├── hexagram.ts     # I Ching calculations
│   │   │   │   └── channel.ts      # Spell channel (to Swordsman)
│   │   │   ├── content/
│   │   │   │   ├── index.ts        # Content script
│   │   │   │   ├── mage-orb.ts     # Orb rendering
│   │   │   │   ├── pretext-measure.ts # Page measurement
│   │   │   │   └── suggestions.ts  # Spell suggestions
│   │   │   ├── popup/
│   │   │   │   ├── popup.tsx       # Analysis view
│   │   │   │   └── hexagram-display.tsx
│   │   │   └── lib/
│   │   │       ├── pretext/        # Bundled pretext
│   │   │       └── crypto.ts       # Key exchange
│   │   └── package.json
│   │
│   ├── swordsman-extension/        # Soulbis Extension
│   │   ├── manifest.json
│   │   ├── src/
│   │   │   ├── background/
│   │   │   │   ├── index.ts        # Service worker
│   │   │   │   ├── myterms.ts      # MyTerms configuration
│   │   │   │   ├── agreements.ts   # Agreement storage
│   │   │   │   └── channel.ts      # Spell channel (to Mage)
│   │   │   ├── content/
│   │   │   │   ├── index.ts        # Content script
│   │   │   │   ├── swordsman-orb.ts # Orb rendering
│   │   │   │   ├── spell-casting.ts # Casting engine
│   │   │   │   ├── constellation.ts # Constellation rendering
│   │   │   │   ├── convergence.ts  # Convergence protocol
│   │   │   │   └── cursor.ts       # Cursor state
│   │   │   ├── popup/
│   │   │   │   ├── popup.tsx       # MyTerms config
│   │   │   │   ├── spell-palette.tsx
│   │   │   │   └── agreement-viewer.tsx
│   │   │   └── lib/
│   │   │       ├── pretext/        # Bundled pretext
│   │   │       ├── crypto.ts       # Spell signing
│   │   │       └── spring-physics.ts
│   │   └── package.json
│   │
│   └── agentprivacy-website/       # Training ground
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   │   └── orbs/           # Website orb system
│       │   │       ├── dual-orb-canvas.tsx
│       │   │       ├── text-reflow.tsx
│       │   │       ├── spell-system.tsx
│       │   │       ├── constellation.tsx
│       │   │       └── i-ching.tsx
│       │   └── lib/
│       │       ├── pretext/
│       │       └── extension-sync.ts
│       └── package.json
│
├── shared/                         # Shared types and utilities
│   ├── types/
│   │   ├── spell.ts
│   │   ├── agreement.ts
│   │   ├── hexagram.ts
│   │   └── channel.ts
│   └── constants/
│       ├── spell-library.ts
│       └── myterms-mappings.ts
│
└── package.json                    # Workspace root
```

---

## Summary: The Separation IS the Security

| Aspect | Mage Extension | Swordsman Extension |
|--------|----------------|---------------------|
| **Role** | Understanding | Action |
| **Orb Color** | Teal | Purple |
| **Represents** | Site's terms | User's terms |
| **Primary Function** | Analyze, suggest | Cast, assert |
| **Writes to Page** | Analysis indicators | Spell nodes, constellation |
| **Stores** | Analysis cache | Agreements, config |
| **Keys** | Public key for verification | Signing key for spells |
| **I Ching** | Calculates hexagram | Consumes hexagram |
| **Gap** | Reports gap | Closes gap |
| **Convergence** | Acknowledges | Initiates |

The two extensions are **cryptographically separate** but **ritually connected** through the spell channel. The act of communication IS the gameplay. The protocol IS the experience.

---

*Document Version: 1.0.0*
*Created: 2026-03-29*
