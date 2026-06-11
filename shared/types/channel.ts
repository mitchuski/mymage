/**
 * Channel Types - Inter-extension communication protocol
 */

import type { Blade, Forging, Hexagram, HexagramState } from './blade'
import type { Spell, SignedSpell, SpellSuggestion, Vector2 } from './spell'

// ============================================
// SWORDSMAN → MAGE MESSAGES
// ============================================

export type SwordToMageMessage =
  | SwordPresent
  | SpellCast
  | ConvergenceInitiated
  | BladeForged
  | OrbPositionUpdate
  | KeyExchange
  | TermAssert

export interface SwordPresent {
  type: 'SWORD_PRESENT'
  domain: string
  myTermsState: MyTermsState
  bladeLevel: number
  orbPosition: Vector2
  hexagramState: HexagramState
}

export interface SpellCast {
  type: 'SPELL_CAST'
  spell: SignedSpell
  position: Vector2
  timestamp: number
}

export interface ConvergenceInitiated {
  type: 'CONVERGENCE_INITIATED'
  spellsCast: SignedSpell[]
  convergencePoint: Vector2
}

export interface BladeForged {
  type: 'BLADE_FORGED'
  blade: Blade
  forging: Forging
  newHexagram: HexagramState
}

export interface TermAssert {
  type: 'TERM_ASSERT'
  terms: string[]
  domain: string
  intensity: number
}

// ============================================
// MAGE → SWORDSMAN MESSAGES
// ============================================

export type MageToSwordMessage =
  | MagePresent
  | Intelligence
  | HexagramUpdate
  | ConstellationWave
  | ConvergenceReady
  | OrbPositionUpdate
  | KeyExchange
  | Scan

export interface MagePresent {
  type: 'MAGE_PRESENT'
  domain: string
  analysis: PageAnalysis
  orbPosition: Vector2
  spellbookState: string[]           // Available spells
}

export interface Intelligence {
  type: 'INTELLIGENCE'
  analysis: PageAnalysis
  suggestedBlade: Blade
  suggestedSpells: SpellSuggestion[]
}

export interface HexagramUpdate {
  type: 'HEXAGRAM_UPDATE'
  hexagram: Hexagram
  reason: string
}

export interface ConstellationWave {
  type: 'CONSTELLATION_WAVE'
  direction: 'MAGE_TO_SWORD'
  payload: {
    threatLevel: number
    suggestedSpells: SpellSuggestion[]
    suggestedBlade: Blade | null
    hexagram: HexagramState
  }
  animation: {
    particleCount: number
    pathType: 'geodesic' | 'direct'
    duration: number
  }
}

export interface ConvergenceReady {
  type: 'CONVERGENCE_READY'
  position: Vector2
  finalAnalysis: PageAnalysis
}

export interface Scan {
  type: 'SCAN'
  findings: {
    trackers: TrackerInfo[]
    cookieBanner: CookieBannerInfo | null
    forms: FormInfo[]
    darkPatterns: DarkPatternInfo[]
    privacyPolicy: PolicyInfo | null
  }
  suggestedSpells: SpellSuggestion[]
}

// ============================================
// BIDIRECTIONAL MESSAGES
// ============================================

export interface OrbPositionUpdate {
  type: 'ORB_POSITION_UPDATE'
  orb: 'mage' | 'swordsman'
  position: Vector2
}

export interface KeyExchange {
  type: 'KEY_EXCHANGE'
  publicKey: JsonWebKey
}

// ============================================
// CEREMONY MESSAGES
// ============================================

export interface CeremonyBegin {
  type: 'CEREMONY_BEGIN'
  ceremonyType: CeremonyType
  initiator: 'SWORD' | 'MAGE' | 'AUTO'
  conditions: {
    orbDistance: number
    spellsCast: number
    gapScore: number
    drakeEligible: boolean
  }
}

export interface CeremonyComplete {
  type: 'CEREMONY_COMPLETE'
  result: {
    cursorState: CursorState
    myTermsRecorded: boolean
    constellationHash: string
    hexagramFinal: HexagramState
    drakePresent: boolean
    timestamp: number
  }
}

export type CeremonyType =
  | 'dual_convergence'
  | 'hexagram_cast'
  | 'quick_cast'
  | 'constellation_wave'
  | 'bilateral_exchange'
  | 'drake_summon'

export type CursorState =
  | 'default'
  | 'blade_active'
  | 'dual_active'
  | 'spell_selected'
  | 'casting'
  | 'sovereign'
  | 'hexagram_active'
  | 'drake_summoned'
  | 'full_sovereign'

// ============================================
// ANALYSIS TYPES
// ============================================

export interface PageAnalysis {
  domain: string
  url: string
  timestamp: number

  intelligence: {
    trackers: TrackerInfo[]
    cookies: CookieInfo
    cookieBanner: CookieBannerInfo | null
    forms: FormInfo[]
    darkPatterns: DarkPatternInfo[]
    privacyPolicy: PolicyInfo | null
  }

  hexagram: Hexagram
  gap: {
    score: number                    // 0-100
    factors: string[]
  }

  grimoireMatches: GrimoireMatch[]
  suggestedSpells: SpellSuggestion[]
  suggestedBlade: Blade | null
}

export interface TrackerInfo {
  domain: string
  type: 'analytics' | 'advertising' | 'social' | 'unknown'
  name?: string
}

export interface CookieInfo {
  total: number
  firstParty: number
  thirdParty: number
  session: number
  persistent: number
}

export interface CookieBannerInfo {
  detected: boolean
  hasReject: boolean
  rejectHidden: boolean
  isDarkPattern: boolean
  type: 'onetrust' | 'cookiebot' | 'custom' | 'unknown'
}

export interface FormInfo {
  action: string
  fields: string[]
  hasSensitiveFields: boolean
  sensitiveTypes: string[]           // 'email', 'phone', 'ssn', etc.
}

export interface DarkPatternInfo {
  type: 'pre-checked' | 'hidden-reject' | 'confirm-shaming' | 'trick-question'
  element: string
  severity: number
}

export interface PolicyInfo {
  url: string
  score: number                      // 0-1, higher is better
  keywords: string[]
  concerns: string[]
}

export interface GrimoireMatch {
  entryId: string
  section: string
  content: string
  matchedKeywords: string[]
  resonance: number                  // 0-1 match strength
}

// ============================================
// STATE TYPES
// ============================================

export interface MyTermsState {
  preferences: {
    doNotTrack: boolean
    doNotSell: boolean
    dataMinimisation: boolean
    cookiePreference: 'all' | 'essential-only' | 'none'
    credentialDisclosure: 'selective' | 'full' | 'none'
    agentDelegation: 'self-only' | 'emissary-allowed'
  }
  spellPalette: string[]             // Spell IDs
  autoAssertDomains: string[]
}
