/**
 * Spell Types - Shared between Swordsman and Mage extensions
 */

export interface Spell {
  id: string
  type: 'emoji' | 'proverb' | 'keyword' | 'hexagram'
  content: string                    // The actual spell (emoji, text, etc.)
  emoji?: string                     // Visual representation

  // What this spell asserts
  assertion: {
    myTermsType: MyTermsType
    weight: number                   // Gap reduction amount
    description: string
  }

  // Learning metadata
  source: {
    tale?: string                    // Which tale taught this
    section?: GrimoireSection        // Which grimoire section
    learnedAt?: number               // Timestamp
  }

  // Visual
  visual: {
    yangYin: 'yang' | 'yin'
    color?: string
    particleType?: 'sparkle' | 'blade' | 'wave'
  }
}

export interface SignedSpell extends Spell {
  signature: string                  // ECDSA signature
  timestamp: number
  signedBy: 'swordsman'
}

export interface SpellNode {
  id: string
  spell: Spell
  position: Vector2
  castAt: number
  opacity: number                    // Fades over time
  connections: string[]              // Connected node IDs
}

export interface SpellSuggestion {
  spell: Spell
  reason: string
  position?: {
    near: 'cookie-banner' | 'form' | 'tos' | 'tracker'
    coordinates: Vector2
  }
  urgency: 'low' | 'medium' | 'high' | 'critical'
  confidence: number                 // 0-1
}

// MyTerms assertion types
export type MyTermsType =
  | 'DO_NOT_TRACK'
  | 'DO_NOT_SELL'
  | 'DATA_MINIMISATION'
  | 'ESSENTIAL_COOKIES_ONLY'
  | 'RIGHT_TO_DELETE'
  | 'RIGHT_TO_PORTABILITY'
  | 'NO_PROFILING'
  | 'CONSENT_REQUIRED'
  | 'EPHEMERAL_SESSION'
  | 'SELECTIVE_DISCLOSURE'
  | 'SELF_CUSTODY'
  | 'TRUST_EXTENSION'

// Grimoire sections
export type GrimoireSection = 'story' | 'zero' | 'canon' | 'parallel' | 'plurality'

// Utility types
export interface Vector2 {
  x: number
  y: number
}

export interface Vector3 extends Vector2 {
  z: number
}
