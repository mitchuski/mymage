/**
 * Repertoire Sync Module
 *
 * Handles bidirectional sync between the Mage extension and training ground:
 *
 * WEBSITE → EXTENSION (localStorage read on agentprivacy.ai):
 * - Reads from localStorage['agentprivacy_spell_repertoire']
 * - Syncs learned spells from training ground
 * - Updates spell loadout based on training progress
 *
 * EXTENSION → WEBSITE (postMessage):
 * - Broadcasts spell casts to website
 * - Sends constellation updates
 * - Reports orb convergences
 *
 * This maintains the separation principle:
 * - Website owns training progress
 * - Extension owns casting mechanics
 * - localStorage is the sync bridge
 */

import type {
  SpellRepertoire,
  LearnedSpell,
  SpellCastEvent,
  TrainingProgress,
  MageSpell,
  MageLoadout,
  HexagramSnapshot,
  ConstellationSnapshot,
  SpellbookSource
} from './spell-types'
import { ALL_SPELLS, GRIMOIRE_SPELLS, getDefaultLoadout, getSpellById } from './spell-definitions'

// ============================================
// CONSTANTS
// ============================================

export const REPERTOIRE_STORAGE_KEY = 'agentprivacy_spell_repertoire'
export const LOADOUT_STORAGE_KEY = 'mage_spell_loadout'

const HOME_DOMAINS = [
  'agentprivacy.ai',
  'www.agentprivacy.ai',
  'localhost',
  '127.0.0.1'
]

// ============================================
// WEBSITE MESSAGE TYPES
// ============================================

export type WebsiteMessage =
  | { type: 'SPELL_CAST'; spellId: string; content: string; emoji: string; position: { x: number; y: number }; section: string }
  | { type: 'ORB_CONVERGENCE'; count: number; timestamp: number }
  | { type: 'SECTION_VISITED'; sectionId: string; totalVisited: number }
  | { type: 'PATH_UNLOCKED'; progress: { sectionsVisited: number; spellsCast: number; convergences: number } }
  | { type: 'REPERTOIRE_SYNC'; repertoire: SpellRepertoire }
  | { type: 'CONSTELLATION_UPDATE'; nodes: unknown[]; edges: unknown[]; patterns: unknown[] }
  | { type: 'MAGE_PRESENT'; domain: string; orbPosition: { x: number; y: number } }

// ============================================
// STORAGE OPERATIONS
// ============================================

/**
 * Check if we're on a home territory domain (can read training data)
 */
export function isHomeDomain(): boolean {
  const host = location.hostname.replace('www.', '')
  return HOME_DOMAINS.includes(host)
}

/**
 * Get the spell repertoire from localStorage (only on home domains)
 */
export function getRepertoireFromStorage(): SpellRepertoire | null {
  if (!isHomeDomain()) return null

  try {
    const raw = localStorage.getItem(REPERTOIRE_STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (data.version !== '1.0') {
      console.warn('[RepertoireSync] Unknown repertoire version:', data.version)
      return null
    }

    return data as SpellRepertoire
  } catch (e) {
    console.error('[RepertoireSync] Failed to load repertoire:', e)
    return null
  }
}

/**
 * Get the Mage's spell loadout from chrome.storage
 */
export async function getLoadoutFromStorage(): Promise<MageLoadout> {
  return new Promise((resolve) => {
    chrome.storage.local.get([LOADOUT_STORAGE_KEY], (result) => {
      if (result[LOADOUT_STORAGE_KEY]) {
        resolve(result[LOADOUT_STORAGE_KEY] as MageLoadout)
      } else {
        resolve(getDefaultLoadout())
      }
    })
  })
}

/**
 * Save the Mage's spell loadout to chrome.storage
 */
export async function saveLoadoutToStorage(loadout: MageLoadout): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [LOADOUT_STORAGE_KEY]: loadout }, resolve)
  })
}

// ============================================
// SPELL CONVERSION
// ============================================

/**
 * Convert a LearnedSpell from training ground to a MageSpell
 */
export function learnedSpellToMageSpell(learned: LearnedSpell): MageSpell | null {
  // Try to find matching spell in our definitions
  const existing = getSpellById(learned.id) ||
                   ALL_SPELLS.find(s => s.myTermsMapping === learned.myTermsMapping) ||
                   GRIMOIRE_SPELLS.find(s => s.myTermsMapping === learned.myTermsMapping)

  if (existing) {
    return existing
  }

  // Create a new MageSpell from the learned data
  return {
    id: learned.id,
    name: learned.content.slice(0, 20),
    emoji: learned.emoji || '✨',
    emojiSequence: learned.emoji,
    description: `Learned in ${learned.learnedInSection}`,
    yangYin: learned.yangYin,
    slot: 'reserve', // Learned spells go to reserve by default
    spellbook: normalizeSource(learned.source),
    myTermsMapping: learned.myTermsMapping,
    weight: learned.weight
  }
}

/**
 * Normalize source name from training ground format
 */
function normalizeSource(source: string): SpellbookSource {
  const sourceMap: Record<string, SpellbookSource> = {
    'story': 'story',
    'zk': 'zero',
    'canon': 'canon',
    'parallel': 'society',
    'plurality': 'plurality',
    'society': 'society'
  }
  return sourceMap[source] || 'story'
}

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Sync repertoire from training ground to extension
 * Call this when on home territory
 */
export async function syncFromTrainingGround(): Promise<{
  learned: LearnedSpell[]
  progress: TrainingProgress
  unlocked: string[]
}> {
  const repertoire = getRepertoireFromStorage()

  if (!repertoire) {
    return {
      learned: [],
      progress: {
        sectionsVisited: [],
        orbConvergenceCount: 0,
        spellsCastCount: 0,
        drakeSpellUnlocked: false,
        pathUnlocked: false
      },
      unlocked: []
    }
  }

  // Determine which grimoire spells are unlocked
  const unlocked: string[] = []

  // Dragon spell unlocked after 5 spells learned
  if (repertoire.trainingProgress.drakeSpellUnlocked) {
    unlocked.push('dragon')
  }

  // Path unlock grants access to extended spells
  if (repertoire.trainingProgress.pathUnlocked) {
    unlocked.push('proof', 'guardian', 'coordinate', 'exit', 'hexagram')
  }

  console.log('[RepertoireSync] Synced from training ground:', {
    learnedCount: repertoire.learnedSpells.length,
    castCount: repertoire.trainingProgress.spellsCastCount,
    unlockedSpells: unlocked
  })

  return {
    learned: repertoire.learnedSpells,
    progress: repertoire.trainingProgress,
    unlocked
  }
}

/**
 * Update the loadout with unlocked spells from training
 */
export async function updateLoadoutWithUnlocked(unlockedIds: string[]): Promise<MageLoadout> {
  const loadout = await getLoadoutFromStorage()

  // Add unlocked spells to reserve if not already in loadout
  for (const id of unlockedIds) {
    const spell = GRIMOIRE_SPELLS.find(s => s.id === id)
    if (spell && !loadout.reserveSpells.some(s => s.id === id)) {
      // Keep reserve at 2 max - replace oldest if needed
      if (loadout.reserveSpells.length >= 2) {
        loadout.reserveSpells.shift()
      }
      loadout.reserveSpells.push(spell)
    }
  }

  await saveLoadoutToStorage(loadout)
  return loadout
}

// ============================================
// BROADCAST TO WEBSITE
// ============================================

/**
 * Broadcast a spell cast to the website (when on home territory)
 */
export function broadcastSpellCast(
  spellId: string,
  content: string,
  emoji: string,
  position: { x: number; y: number },
  section: string
): void {
  if (!isHomeDomain()) return

  const message: WebsiteMessage = {
    type: 'SPELL_CAST',
    spellId,
    content,
    emoji,
    position,
    section
  }

  window.postMessage(message, '*')
}

/**
 * Broadcast orb convergence to the website
 */
export function broadcastOrbConvergence(count: number): void {
  if (!isHomeDomain()) return

  const message: WebsiteMessage = {
    type: 'ORB_CONVERGENCE',
    count,
    timestamp: Date.now()
  }

  window.postMessage(message, '*')
}

/**
 * Broadcast constellation update to the website
 */
export function broadcastConstellationUpdate(
  nodes: unknown[],
  edges: unknown[],
  patterns: unknown[]
): void {
  if (!isHomeDomain()) return

  const message: WebsiteMessage = {
    type: 'CONSTELLATION_UPDATE',
    nodes,
    edges,
    patterns
  }

  window.postMessage(message, '*')
}

/**
 * Announce Mage presence to the website
 */
export function announceMagePresence(position: { x: number; y: number }): void {
  if (!isHomeDomain()) return

  const message: WebsiteMessage = {
    type: 'MAGE_PRESENT',
    domain: location.hostname,
    orbPosition: position
  }

  window.postMessage(message, '*')
}

// ============================================
// LISTEN TO WEBSITE
// ============================================

export type WebsiteEventHandler = {
  onRepertoireSync?: (repertoire: SpellRepertoire) => void
  onPathUnlocked?: (progress: { sectionsVisited: number; spellsCast: number; convergences: number }) => void
  onSpellbookUnlocked?: (grimoire: string) => void
  onManaEarned?: (amount: number, reason: string) => void
  onManaSpent?: (amount: number, reason: string) => void
}

/**
 * Setup listeners for messages from the website
 */
export function setupWebsiteListener(handlers: WebsiteEventHandler): () => void {
  const listener = (event: MessageEvent) => {
    // Only accept messages from same origin
    if (event.origin !== location.origin) return

    const { data } = event
    if (!data || !data.type) return

    switch (data.type) {
      case 'REPERTOIRE_SYNC':
        handlers.onRepertoireSync?.(data.repertoire)
        break

      case 'PATH_UNLOCKED':
        handlers.onPathUnlocked?.(data.progress)
        break

      case 'SPELLBOOK_UNLOCKED':
        handlers.onSpellbookUnlocked?.(data.grimoire)
        break

      case 'MANA_EARNED':
        handlers.onManaEarned?.(data.amount, data.reason)
        break

      case 'MANA_SPENT':
        handlers.onManaSpent?.(data.amount, data.reason)
        break
    }
  }

  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}

// ============================================
// CAST HISTORY (local to extension)
// ============================================

const CAST_HISTORY_KEY = 'mage_cast_history'
const MAX_HISTORY_SIZE = 100

/**
 * Record a spell cast in extension-local history
 */
export async function recordSpellCast(
  spellId: string,
  position: { x: number; y: number },
  domain: string
): Promise<void> {
  const event: SpellCastEvent = {
    spellId,
    timestamp: Date.now(),
    position,
    section: domain,
    domain
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([CAST_HISTORY_KEY], (result) => {
      const history: SpellCastEvent[] = result[CAST_HISTORY_KEY] || []
      history.push(event)

      // Trim to max size
      while (history.length > MAX_HISTORY_SIZE) {
        history.shift()
      }

      chrome.storage.local.set({ [CAST_HISTORY_KEY]: history }, resolve)
    })
  })
}

/**
 * Get recent cast history
 */
export async function getCastHistory(limit = 20): Promise<SpellCastEvent[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([CAST_HISTORY_KEY], (result) => {
      const history: SpellCastEvent[] = result[CAST_HISTORY_KEY] || []
      resolve(history.slice(-limit))
    })
  })
}

// ============================================
// STATS
// ============================================

export async function getMageStats(): Promise<{
  totalCasts: number
  uniqueSpells: Set<string>
  favoritedSpell: string | null
  lastCastTime: number | null
}> {
  const history = await getCastHistory(MAX_HISTORY_SIZE)

  const spellCounts = new Map<string, number>()
  for (const cast of history) {
    spellCounts.set(cast.spellId, (spellCounts.get(cast.spellId) || 0) + 1)
  }

  let favoritedSpell: string | null = null
  let maxCount = 0
  for (const [id, count] of spellCounts) {
    if (count > maxCount) {
      maxCount = count
      favoritedSpell = id
    }
  }

  return {
    totalCasts: history.length,
    uniqueSpells: new Set(history.map(h => h.spellId)),
    favoritedSpell,
    lastCastTime: history.length > 0 ? history[history.length - 1].timestamp : null
  }
}
