/**
 * Mage Spell Definitions
 *
 * The 8 spells of the Emissary:
 * - 6 Orbit spells (quick access via left-click hold)
 * - 2 Reserve spells (swappable via M key editor)
 *
 * Each spell maps to:
 * - A grimoire entry (proverb + emoji sequence)
 * - A MyTerms assertion (privacy preference)
 * - A yang/yin polarity (action/reception)
 *
 * The Mage casts OUTWARD - projecting understanding onto the page.
 */

import type { MageSpell, MageLoadout, SpellbookSource } from './spell-types'

// ============================================
// 6 ORBIT SPELLS (Left-click hold menu)
// ============================================

export const ORBIT_SPELLS: MageSpell[] = [
  {
    id: 'shield',
    name: 'Shield',
    emoji: '🛡️',
    emojiSequence: '🛡️✨',
    description: 'Defensive ward against tracking',
    yangYin: 'yang',
    slot: 'orbit',
    grimoireId: 'act-04-blade-alone',
    spellbook: 'story',
    proverb: 'The blade stands alone so that others may stand together.',
    myTermsMapping: 'DO_NOT_TRACK',
    weight: 2,
    color: '#e74c3c',
    glowColor: 'rgba(231, 76, 60, 0.5)'
  },
  {
    id: 'insight',
    name: 'Insight',
    emoji: '👁️',
    emojiSequence: '👁️🔍✨',
    description: 'Reveal hidden trackers',
    yangYin: 'yin',
    slot: 'orbit',
    grimoireId: 'act-07-mirror',
    spellbook: 'story',
    proverb: 'The mirror shows not what we wish, but what we are.',
    myTermsMapping: 'SELECTIVE_DISCLOSURE',
    weight: 2,
    color: '#9b59b6',
    glowColor: 'rgba(155, 89, 182, 0.5)'
  },
  {
    id: 'seal',
    name: 'Seal',
    emoji: '🔒',
    emojiSequence: '🔒🔐',
    description: 'Lock data access',
    yangYin: 'yang',
    slot: 'orbit',
    grimoireId: 'zero-tale-1',
    spellbook: 'zero',
    proverb: 'To prove without revealing is the first magic.',
    myTermsMapping: 'DATA_MINIMISATION',
    weight: 3,
    color: '#3498db',
    glowColor: 'rgba(52, 152, 219, 0.5)'
  },
  {
    id: 'clarity',
    name: 'Clarity',
    emoji: '✨',
    emojiSequence: '✨🌟💫',
    description: 'Illuminate dark patterns',
    yangYin: 'yin',
    slot: 'orbit',
    grimoireId: 'act-17-bonfire-dark-forest',
    spellbook: 'story',
    proverb: 'In the dark forest, the bonfire reveals both friend and foe.',
    myTermsMapping: 'TRANSPARENCY_REQUEST',
    weight: 2,
    color: '#f1c40f',
    glowColor: 'rgba(241, 196, 15, 0.5)'
  },
  {
    id: 'purge',
    name: 'Purge',
    emoji: '🔥',
    emojiSequence: '🔥💨',
    description: 'Clear tracking cookies',
    yangYin: 'yang',
    slot: 'orbit',
    grimoireId: 'act-12-forgetting',
    spellbook: 'story',
    proverb: 'To forget is not weakness but sovereignty over memory.',
    myTermsMapping: 'COOKIE_ESSENTIAL_ONLY',
    weight: 3,
    color: '#e67e22',
    glowColor: 'rgba(230, 126, 34, 0.5)'
  },
  {
    id: 'shadow',
    name: 'Shadow',
    emoji: '🌙',
    emojiSequence: '🌙🌑✨',
    description: 'Obscure identity',
    yangYin: 'yin',
    slot: 'orbit',
    grimoireId: 'act-09-zcash-shield',
    spellbook: 'story',
    proverb: 'The shield is not armor but absence—you cannot strike what is not there.',
    myTermsMapping: 'DO_NOT_SELL',
    weight: 3,
    color: '#2c3e50',
    glowColor: 'rgba(44, 62, 80, 0.5)'
  }
]

// ============================================
// 2 RESERVE SPELLS (Swappable via editor)
// ============================================

export const RESERVE_SPELLS: MageSpell[] = [
  {
    id: 'crystallize',
    name: 'Crystallize',
    emoji: '💎',
    emojiSequence: '💎✨🔮',
    description: 'Lock constellation state',
    yangYin: 'yang',
    slot: 'reserve',
    grimoireId: 'act-24-holographic-bound',
    spellbook: 'story',
    proverb: 'The holographic bound holds all parts in each part.',
    myTermsMapping: 'CONSTELLATION_LOCK',
    weight: 4,
    color: '#1abc9c',
    glowColor: 'rgba(26, 188, 156, 0.5)'
  },
  {
    id: 'proverb',
    name: 'Proverb',
    emoji: '📜',
    emojiSequence: '📜✍️💬',
    description: 'Invoke grimoire wisdom',
    yangYin: 'yin',
    slot: 'reserve',
    grimoireId: 'act-13-book-of-promises',
    spellbook: 'story',
    proverb: 'The book of promises binds without chains.',
    myTermsMapping: 'PROVERB_INVOCATION',
    weight: 2,
    color: '#8e44ad',
    glowColor: 'rgba(142, 68, 173, 0.5)'
  }
]

// ============================================
// ALL 8 SPELLS
// ============================================

export const ALL_SPELLS: MageSpell[] = [...ORBIT_SPELLS, ...RESERVE_SPELLS]

// ============================================
// EXTENDED SPELL LIBRARY (from grimoire)
// ============================================

/**
 * Additional spells that can be swapped into orbit/reserve slots
 * These come from the full grimoire and can be unlocked through training
 */
export const GRIMOIRE_SPELLS: MageSpell[] = [
  // From Zero Knowledge
  {
    id: 'proof',
    name: 'Proof',
    emoji: '🔮',
    emojiSequence: '🔮⚡✓',
    description: 'Generate zero-knowledge proof',
    yangYin: 'yang',
    slot: 'reserve',
    grimoireId: 'zero-tale-5',
    spellbook: 'zero',
    proverb: 'The proof convinces without revealing the secret.',
    myTermsMapping: 'ZK_PROOF_ACTIVE',
    weight: 4,
    color: '#9b59b6',
    glowColor: 'rgba(155, 89, 182, 0.5)'
  },
  // From Canon
  {
    id: 'guardian',
    name: 'Guardian',
    emoji: '🏛️',
    emojiSequence: '🏛️🛡️⚖️',
    description: 'Invoke cypherpunk lineage',
    yangYin: 'yang',
    slot: 'reserve',
    grimoireId: 'canon-chapter-1',
    spellbook: 'canon',
    proverb: 'Privacy is necessary for an open society.',
    myTermsMapping: 'CYPHERPUNK_ASSERTION',
    weight: 3,
    color: '#e74c3c',
    glowColor: 'rgba(231, 76, 60, 0.5)'
  },
  // From Plurality
  {
    id: 'coordinate',
    name: 'Coordinate',
    emoji: '⿻',
    emojiSequence: '⿻🤝🌐',
    description: 'Plural coordination spell',
    yangYin: 'yin',
    slot: 'reserve',
    grimoireId: 'plurality-act-1',
    spellbook: 'plurality',
    proverb: 'Plurality is collaborative technology for collaborative society.',
    myTermsMapping: 'PLURAL_COORDINATION',
    weight: 3,
    color: '#3498db',
    glowColor: 'rgba(52, 152, 219, 0.5)'
  },
  // From Society
  {
    id: 'exit',
    name: 'Exit',
    emoji: '🚪',
    emojiSequence: '🚪➡️🏝️',
    description: 'Parallel society exit',
    yangYin: 'yang',
    slot: 'reserve',
    grimoireId: 'parallel-1',
    spellbook: 'society',
    proverb: 'Exit is the ultimate expression of voice.',
    myTermsMapping: 'EXIT_ASSERTION',
    weight: 3,
    color: '#2ecc71',
    glowColor: 'rgba(46, 204, 113, 0.5)'
  },
  // Dragon spell (unlocked through training)
  {
    id: 'dragon',
    name: 'Dragon',
    emoji: '🐉',
    emojiSequence: '🐉🔥✨',
    description: 'Summon the manifold dragon',
    yangYin: 'yang',
    slot: 'reserve',
    grimoireId: 'act-23-manifold-dragon',
    spellbook: 'story',
    proverb: 'The dragon is not one but many, not many but one.',
    myTermsMapping: 'TRUST_EXTENSION',
    weight: 5,
    color: '#f1c40f',
    glowColor: 'rgba(241, 196, 15, 0.7)'
  },
  // Hexagram spell
  {
    id: 'hexagram',
    name: 'Hexagram',
    emoji: '☰',
    emojiSequence: '☰☷⚡',
    description: 'I Ching state mutation',
    yangYin: 'yin',
    slot: 'reserve',
    grimoireId: 'act-08-ancient-rule',
    spellbook: 'story',
    proverb: 'The ancient rule: what changes, remains.',
    myTermsMapping: 'HEXAGRAM_MUTATION',
    weight: 2,
    color: '#95a5a6',
    glowColor: 'rgba(149, 165, 166, 0.5)'
  }
]

// ============================================
// DEFAULT LOADOUT
// ============================================

export function getDefaultLoadout(): MageLoadout {
  return {
    version: 2,
    orbitSpells: [...ORBIT_SPELLS],
    reserveSpells: [...RESERVE_SPELLS],
    lastSelected: 0
  }
}

// ============================================
// SPELL LOOKUP
// ============================================

export function getSpellById(id: string): MageSpell | undefined {
  return ALL_SPELLS.find(s => s.id === id) ||
         GRIMOIRE_SPELLS.find(s => s.id === id)
}

export function getSpellByGrimoireId(grimoireId: string): MageSpell | undefined {
  return ALL_SPELLS.find(s => s.grimoireId === grimoireId) ||
         GRIMOIRE_SPELLS.find(s => s.grimoireId === grimoireId)
}

export function getSpellsBySpellbook(spellbook: SpellbookSource): MageSpell[] {
  return [...ALL_SPELLS, ...GRIMOIRE_SPELLS].filter(s => s.spellbook === spellbook)
}

export function getYangSpells(): MageSpell[] {
  return ALL_SPELLS.filter(s => s.yangYin === 'yang')
}

export function getYinSpells(): MageSpell[] {
  return ALL_SPELLS.filter(s => s.yangYin === 'yin')
}

// ============================================
// SPELL MATHEMATICS
// ============================================

/**
 * 8 spells = 1 byte of sovereign data
 * 6 orbit + 2 reserve
 *
 * Yang spells (assertive): Shield, Seal, Purge, Crystallize = 4
 * Yin spells (receptive): Insight, Clarity, Shadow, Proverb = 4
 *
 * Balance: 4 yang + 4 yin = perfect equilibrium
 */
export const SPELL_MATHEMATICS = {
  total: 8,
  orbit: 6,
  reserve: 2,
  yangCount: ALL_SPELLS.filter(s => s.yangYin === 'yang').length,
  yinCount: ALL_SPELLS.filter(s => s.yangYin === 'yin').length,
  byteRepresentation: '8 spells = 8 bits = 1 byte of sovereign data'
} as const
