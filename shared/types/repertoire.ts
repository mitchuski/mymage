/**
 * Repertoire Types - Data contract between website and extensions
 *
 * The website writes to localStorage, extensions read from it.
 * This is a ONE-WAY sync: website -> extensions
 */

// ============================================
// MAIN REPERTOIRE INTERFACE
// ============================================

export interface SpellRepertoire {
  /** Schema version for forward compatibility */
  version: '1.0'

  /** Spells learned through training on agentprivacy.ai */
  learnedSpells: LearnedSpell[]

  /** History of spell casts on the website */
  castHistory: CastEvent[]

  /** Training completion state */
  trainingProgress: TrainingProgress

  /** Constellation state snapshot (optional, for resume) */
  constellationSnapshot?: ConstellationSnapshot

  /** Hexagram state snapshot (optional) */
  hexagramSnapshot?: HexagramSnapshot

  /** Last update timestamp */
  lastUpdated: number
}

// ============================================
// LEARNED SPELLS
// ============================================

export interface LearnedSpell {
  /** Unique spell identifier */
  id: string

  /** Spell type */
  type: 'emoji' | 'proverb' | 'keyword' | 'hexagram'

  /** The actual spell content (emoji, text, etc.) */
  content: string

  /** Visual representation emoji */
  emoji?: string

  /** MyTerms mapping (e.g., 'DO_NOT_TRACK', 'DO_NOT_SELL') */
  myTermsMapping: string

  /** Gap reduction weight */
  weight: number

  /** Yang or Yin energy */
  yangYin: 'yang' | 'yin'

  /** When this spell was learned */
  learnedAt: number

  /** Which website section taught this spell */
  learnedInSection: string

  /** Which grimoire this spell came from */
  source: 'story' | 'zk' | 'canon' | 'parallel' | 'plurality'
}

// ============================================
// CAST HISTORY
// ============================================

export interface CastEvent {
  /** ID of the spell that was cast */
  spellId: string

  /** When the spell was cast */
  timestamp: number

  /** Where on the page */
  position: { x: number; y: number }

  /** Which website section */
  section: string
}

// ============================================
// TRAINING PROGRESS
// ============================================

export interface TrainingProgress {
  /** Sections the user has visited */
  sectionsVisited: string[]

  /** Number of orb convergences witnessed */
  orbConvergenceCount: number

  /** Total spells cast on the website */
  spellsCastCount: number

  /** Whether the drake spell has been unlocked */
  drakeSpellUnlocked: boolean

  /** When the user first cast a spell (became "first person") */
  firstCastTimestamp?: number

  /** Whether /path page is accessible */
  pathUnlocked: boolean
}

// ============================================
// SNAPSHOTS
// ============================================

export interface ConstellationSnapshot {
  /** Number of spell nodes */
  nodeCount: number

  /** Pattern types detected */
  patternTypes: string[]

  /** Geometry hash for verification */
  hash?: string
}

export interface HexagramSnapshot {
  /** Six lines (0=yin, 1=yang) */
  lines: [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]

  /** Hexagram number (1-64) */
  number: number

  /** Hexagram name */
  name: string
}

// ============================================
// CONSTANTS
// ============================================

/** LocalStorage key used by the website */
export const REPERTOIRE_STORAGE_KEY = 'agentprivacy_spell_repertoire'

/** Domain whitelist for sync */
export const SYNC_DOMAINS = ['agentprivacy.ai', 'www.agentprivacy.ai']

/** Minimum training requirements to unlock /path */
export const PATH_UNLOCK_CRITERIA = {
  minSpellsCast: 3,
  minSectionsVisited: 3,
  minConvergences: 1
} as const

/** Minimum Swordsman requirements to unlock Mage download */
export const MAGE_UNLOCK_CRITERIA = {
  minVRC: 50,
  minDomainsAsserted: 10
} as const

// ============================================
// VALIDATION
// ============================================

/**
 * Validate and parse a repertoire from localStorage
 */
export function parseRepertoire(raw: string): SpellRepertoire | null {
  try {
    const data = JSON.parse(raw)

    // Known version - parse fully
    if (data.version === '1.0') {
      return data as SpellRepertoire
    }

    // Unknown version - try to extract basics
    if (data.learnedSpells && Array.isArray(data.learnedSpells)) {
      console.warn('[Repertoire] Unknown version, extracting basic data')
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
  } catch (e) {
    console.error('[Repertoire] Failed to parse:', e)
    return null
  }
}

/**
 * Check if training criteria are met to unlock /path
 */
export function checkPathUnlock(progress: TrainingProgress): boolean {
  return (
    progress.spellsCastCount >= PATH_UNLOCK_CRITERIA.minSpellsCast &&
    progress.sectionsVisited.length >= PATH_UNLOCK_CRITERIA.minSectionsVisited &&
    progress.orbConvergenceCount >= PATH_UNLOCK_CRITERIA.minConvergences
  )
}
