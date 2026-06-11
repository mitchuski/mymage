/**
 * Mage Spell Types
 *
 * Unified spell system for the Mage extension, integrating:
 * - Grimoire spell definitions (from agentprivacy_master)
 * - Spellweb visualization data
 * - Training ground repertoire sync
 *
 * The Mage (Emissary) deals in UNDERSTANDING:
 * - 8 spells total: 6 orbit + 2 reserve
 * - Left-click tap = cast last spell
 * - Left-click hold = view orbit menu
 * - M key = spell editor
 */

// ============================================
// CORE SPELL TYPES
// ============================================

export type SpellbookSource =
  | 'story'      // First Person (26 acts)
  | 'origins'    // Origin spells
  | 'zero'       // Zero Knowledge (30 tales)
  | 'canon'      // Blockchain Canon (11 chapters)
  | 'society'    // Parallel Society (17 chapters)
  | 'plurality'  // Plurality (30 acts)
  | 'incantations' // Unified incantations
  | 'none'

export type SpellType = 'emoji' | 'proverb' | 'keyword' | 'hexagram'

export type YangYin = 'yang' | 'yin'

export type SpellSlot = 'orbit' | 'reserve'

/**
 * Core spell definition - matches grimoire format
 */
export interface SpellCard {
  id: string
  title: string
  spellbook: SpellbookSource
  spell: string          // Emoji sequence (e.g., "👤↔️🏛️")
  proverb: string        // Associated wisdom
  learnUrl?: string      // Link to training ground
  actNumber?: number     // Position in spellbook
}

/**
 * Mage spell with orbit/reserve assignment and casting metadata
 */
export interface MageSpell {
  id: string
  name: string
  emoji: string           // Primary display emoji
  emojiSequence?: string  // Full emoji spell sequence
  description: string
  yangYin: YangYin
  slot: SpellSlot

  // Grimoire reference
  grimoireId?: string
  spellbook?: SpellbookSource
  proverb?: string

  // MyTerms mapping for sovereignty assertions
  myTermsMapping: string
  weight: number          // Gap reduction weight

  // Visual properties
  color?: string
  glowColor?: string
}

/**
 * Learned spell from training ground (synced via localStorage)
 */
export interface LearnedSpell {
  id: string
  type: SpellType
  content: string
  emoji?: string
  myTermsMapping: string
  weight: number
  yangYin: YangYin
  learnedAt: number
  learnedInSection: string
  source: SpellbookSource
}

/**
 * Spell cast event for history tracking
 */
export interface SpellCastEvent {
  spellId: string
  timestamp: number
  position: { x: number; y: number }
  section: string
  domain?: string
}

// ============================================
// REPERTOIRE (synced with training ground)
// ============================================

export interface SpellRepertoire {
  version: '1.0'
  learnedSpells: LearnedSpell[]
  castHistory: SpellCastEvent[]
  trainingProgress: TrainingProgress
  constellationSnapshot?: ConstellationSnapshot
  hexagramSnapshot?: HexagramSnapshot
  lastUpdated: number
}

export interface TrainingProgress {
  sectionsVisited: string[]
  orbConvergenceCount: number
  spellsCastCount: number
  drakeSpellUnlocked: boolean
  firstCastTimestamp?: number
  pathUnlocked: boolean
}

export interface ConstellationSnapshot {
  nodeCount: number
  patternTypes: string[]
  hash?: string
}

export interface HexagramSnapshot {
  lines: [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]
  number: number
  name: string
}

// ============================================
// SPELL LOADOUT
// ============================================

/**
 * Mage's spell loadout configuration
 * 8 total: 6 orbit + 2 reserve
 */
export interface MageLoadout {
  version: 2
  orbitSpells: MageSpell[]    // 6 active spells in orbit menu
  reserveSpells: MageSpell[]  // 2 reserve spells
  lastSelected: number        // Index of last used orbit spell
  hexagramState?: HexagramSnapshot
}

// ============================================
// CONSTELLATION NODE (for rendering)
// ============================================

export interface SpellNode {
  id: string
  spell: {
    type: SpellType
    content: string
    yangYin: YangYin
    grimoireId?: string
  }
  x: number
  y: number
  opacity: number
  pulse: number
  castAt: number
}

// ============================================
// SPELLWEB GRAPH TYPES
// ============================================

export type SpellwebNodeType = 'grimoire' | 'spell' | 'skill' | 'persona' | 'ceremony'

export interface SpellwebNode {
  id: string
  type: SpellwebNodeType
  emoji: string
  label: string
  fullTitle?: string
  val: number
  color?: string
  group?: string
  isLit: boolean
  isOnPath: boolean
  sequenceNumber?: number
}

export interface SpellwebLink {
  source: string
  target: string
  type: 'defines' | 'follows' | 'narrates' | 'proves' | 'implements' | 'references'
}

// ============================================
// BLADE DIMENSIONS (from spellweb)
// ============================================

export interface BladeDimensions {
  protection: boolean    // d1: Boundaries forged (🛡️)
  delegation: boolean    // d2: Agency transferred (🤝)
  memory: boolean        // d3: State accumulated (📜)
  connection: boolean    // d4: Multi-party coordination (🔗)
  computation: boolean   // d5: ZK proof active (⚡)
  value: boolean         // d6: Economic flow (💎)
}

export type ChargeLevelType = 'spark' | 'ember' | 'flame' | 'blaze' | 'inferno' | 'equilibrium'
export type BladeTierType = 'light' | 'heavy' | 'dragon'

export interface SpellProof {
  lapCount: number
  duration: number
  constellationHash: string
  nodeCount: number
  chargeLevel: ChargeLevelType
  signature: string
  spellsCast: number
  bladeDimensions: BladeDimensions
  bladeStratum: number
  bladeTier: BladeTierType
  bladeHex: string
}

// ============================================
// STORAGE KEYS
// ============================================

export const MAGE_STORAGE_KEYS = {
  repertoire: 'agentprivacy_spell_repertoire',
  loadout: 'mage_spell_loadout',
  castHistory: 'mage_cast_history',
  constellation: 'mage_constellation_state',
  hexagram: 'mage_hexagram_state'
} as const

// ============================================
// TYPE GUARDS
// ============================================

export function isYang(spell: MageSpell | LearnedSpell): boolean {
  return spell.yangYin === 'yang'
}

export function isYin(spell: MageSpell | LearnedSpell): boolean {
  return spell.yangYin === 'yin'
}

export function isOrbitSpell(spell: MageSpell): boolean {
  return spell.slot === 'orbit'
}

export function isReserveSpell(spell: MageSpell): boolean {
  return spell.slot === 'reserve'
}
