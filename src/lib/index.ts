/**
 * Mage Spell Library
 *
 * Unified spell system exports for the Mage extension
 */

// Types
export type {
  SpellbookSource,
  SpellType,
  YangYin,
  SpellSlot,
  SpellCard,
  MageSpell,
  LearnedSpell,
  SpellCastEvent,
  SpellRepertoire,
  TrainingProgress,
  ConstellationSnapshot,
  HexagramSnapshot,
  MageLoadout,
  SpellNode,
  SpellwebNodeType,
  SpellwebNode,
  SpellwebLink,
  BladeDimensions,
  ChargeLevelType,
  BladeTierType,
  SpellProof
} from './spell-types'

// Type guards
export {
  isYang,
  isYin,
  isOrbitSpell,
  isReserveSpell,
  MAGE_STORAGE_KEYS
} from './spell-types'

// Spell definitions
export {
  ORBIT_SPELLS,
  RESERVE_SPELLS,
  ALL_SPELLS,
  GRIMOIRE_SPELLS,
  getDefaultLoadout,
  getSpellById,
  getSpellByGrimoireId,
  getSpellsBySpellbook,
  getYangSpells,
  getYinSpells,
  SPELL_MATHEMATICS
} from './spell-definitions'

// Repertoire sync
export {
  REPERTOIRE_STORAGE_KEY,
  LOADOUT_STORAGE_KEY,
  isHomeDomain,
  getRepertoireFromStorage,
  getLoadoutFromStorage,
  saveLoadoutToStorage,
  learnedSpellToMageSpell,
  syncFromTrainingGround,
  updateLoadoutWithUnlocked,
  broadcastSpellCast,
  broadcastOrbConvergence,
  broadcastConstellationUpdate,
  announceMagePresence,
  setupWebsiteListener,
  recordSpellCast,
  getCastHistory,
  getMageStats
} from './repertoire-sync'

export type { WebsiteMessage, WebsiteEventHandler } from './repertoire-sync'
