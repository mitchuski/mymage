/**
 * Mage Effect Presets
 *
 * Built-in cursor effects for the Mage extension.
 * These use drift physics and emphasize observation/understanding.
 */

import type { PretextEffect } from '@agentprivacy/shared-types'

export const MAGE_PRESETS: PretextEffect[] = [
  // ============================================
  // CLASSIC PRESETS
  // ============================================
  {
    id: 'spell-orb',
    name: 'Spell Orb',
    type: 'preset',
    visual: {
      emoji: '✦',
      scale: 1.0,
      cssFilter: 'drop-shadow(0 0 4px rgba(29, 158, 117, 0.7))'
    },
    physics: {
      mode: 'drift',
      driftSpeed: 0.3,
      attractorStrength: 0.2
    },
    trail: {
      enabled: true,
      length: 5,
      fadeRate: 0.2,
      style: 'particles'
    },
    animations: {
      onClick: 'ripple',
      onHover: 'glow'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  {
    id: 'crystal-gaze',
    name: 'Crystal Gaze',
    type: 'preset',
    visual: {
      emoji: '🔮',
      scale: 1.2,
      cssFilter: 'drop-shadow(0 0 5px rgba(138, 43, 226, 0.6))'
    },
    physics: {
      mode: 'drift',
      driftSpeed: 0.2,
      attractorStrength: 0.3
    },
    trail: {
      enabled: false,
      length: 0,
      fadeRate: 0
    },
    animations: {
      onHover: 'glow',
      onClick: 'pulse'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  {
    id: 'constellation-star',
    name: 'Constellation',
    type: 'preset',
    visual: {
      emoji: '⭐',
      scale: 0.8,
      cssFilter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))'
    },
    physics: {
      mode: 'hybrid',
      stiffness: 0.02,
      damping: 0.92,
      driftSpeed: 0.1,
      attractorStrength: 0.15,
      hybridBalance: 0.6
    },
    trail: {
      enabled: true,
      length: 15,
      fadeRate: 0.08,
      color: '#FFD700',
      style: 'dotted'
    },
    animations: {
      onScroll: 'particles',
      onConvergence: 'spiral'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  // ============================================
  // ELEMENTAL PRESETS
  // ============================================
  {
    id: 'nature-leaf',
    name: 'Nature Leaf',
    type: 'preset',
    visual: {
      emoji: '🍃',
      scale: 1.1,
      rotation: 15,
      cssFilter: 'drop-shadow(0 0 2px rgba(34, 139, 34, 0.5))'
    },
    physics: {
      mode: 'drift',
      driftSpeed: 0.4,
      attractorStrength: 0.1
    },
    trail: {
      enabled: true,
      length: 8,
      fadeRate: 0.12,
      color: '#228B22',
      style: 'particles'
    },
    animations: {
      onScroll: 'trail',
      onClick: 'burst'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  {
    id: 'moon-phase',
    name: 'Moon Phase',
    type: 'preset',
    visual: {
      emoji: '🌙',
      scale: 1.0,
      cssFilter: 'drop-shadow(0 0 4px rgba(192, 192, 192, 0.7))'
    },
    physics: {
      mode: 'drift',
      driftSpeed: 0.15,
      attractorStrength: 0.25
    },
    trail: {
      enabled: true,
      length: 6,
      fadeRate: 0.15,
      color: '#C0C0C0',
      style: 'solid'
    },
    animations: {
      onHover: 'glow',
      onClick: 'pulse'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  // ============================================
  // MYSTICAL PRESETS
  // ============================================
  {
    id: 'third-eye',
    name: 'Third Eye',
    type: 'preset',
    visual: {
      emoji: '👁️‍🗨️',
      scale: 1.0,
      cssFilter: 'drop-shadow(0 0 3px rgba(29, 158, 117, 0.6))'
    },
    physics: {
      mode: 'drift',
      driftSpeed: 0.25,
      attractorStrength: 0.35
    },
    trail: {
      enabled: false,
      length: 0,
      fadeRate: 0
    },
    animations: {
      onClick: 'ripple',
      onHover: 'spin'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  {
    id: 'infinity-loop',
    name: 'Infinity Loop',
    type: 'preset',
    visual: {
      emoji: '∞',
      scale: 1.5,
      color: '#1D9E75',
      cssFilter: 'drop-shadow(0 0 2px rgba(29, 158, 117, 0.8))'
    },
    physics: {
      mode: 'hybrid',
      stiffness: 0.03,
      damping: 0.9,
      driftSpeed: 0.2,
      attractorStrength: 0.2,
      hybridBalance: 0.4
    },
    trail: {
      enabled: true,
      length: 10,
      fadeRate: 0.1,
      color: '#1D9E75',
      style: 'solid'
    },
    animations: {
      onScroll: 'stretch',
      onClick: 'pulse'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  },

  {
    id: 'spark-wisp',
    name: 'Spark Wisp',
    type: 'preset',
    visual: {
      emoji: '✨',
      scale: 0.9,
      cssFilter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))'
    },
    physics: {
      mode: 'drift',
      driftSpeed: 0.5,
      attractorStrength: 0.15
    },
    trail: {
      enabled: true,
      length: 12,
      fadeRate: 0.1,
      style: 'particles'
    },
    animations: {
      onClick: 'burst',
      onScroll: 'particles'
    },
    createdAt: 0,
    source: 'builtin',
    extension: 'mage'
  }
]

/**
 * Get all Mage presets
 */
export function getMagePresets(): PretextEffect[] {
  return MAGE_PRESETS
}

/**
 * Get a specific preset by ID
 */
export function getMagePreset(id: string): PretextEffect | undefined {
  return MAGE_PRESETS.find(p => p.id === id)
}
