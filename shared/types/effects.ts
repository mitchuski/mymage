/**
 * Pretext Cursor Effects - Shared Types
 *
 * Defines the structure for custom cursor effects that users can create
 * and apply to either the Swordsman or Mage extension.
 */

// ============================================
// EFFECT DEFINITION
// ============================================

export interface PretextEffect {
  id: string
  name: string
  type: 'emoji' | 'svg' | 'preset' | 'custom'

  // Visual definition
  visual: EffectVisual

  // Physics behavior
  physics: EffectPhysics

  // Trail/particle effects
  trail?: EffectTrail

  // Trigger animations
  animations?: EffectAnimations

  // Metadata
  createdAt: number
  source: 'user' | 'builtin' | 'shared'
  extension: 'swordsman' | 'mage' | 'both'
}

export interface EffectVisual {
  emoji?: string           // Single or compound emoji (e.g., "⚔️" or "🐉✨")
  svgData?: string         // Inline SVG string
  presetId?: string        // Built-in preset identifier
  cssFilter?: string       // Optional CSS filter (e.g., "drop-shadow(0 0 4px #1D9E75)")
  scale?: number           // Size multiplier (0.5 - 3.0, default 1.0)
  rotation?: number        // Base rotation in degrees
  color?: string           // Primary color override
}

export interface EffectPhysics {
  mode: 'spring' | 'drift' | 'hybrid'

  // Spring mode parameters (Swordsman style)
  stiffness?: number       // Spring constant (0.01 - 0.2, default 0.04)
  damping?: number         // Damping factor (0.7 - 0.98, default 0.85)

  // Drift mode parameters (Mage style)
  driftSpeed?: number      // Autonomous movement speed (0.1 - 1.0, default 0.3)
  attractorStrength?: number // Attraction to page elements (0 - 1, default 0.2)

  // Hybrid mode uses both
  hybridBalance?: number   // 0 = full spring, 1 = full drift (default 0.5)
}

export interface EffectTrail {
  enabled: boolean
  length: number           // Number of trail segments (1 - 20, default 8)
  fadeRate: number         // Opacity decay per segment (0.05 - 0.3, default 0.15)
  color?: string           // Override trail color
  style?: 'solid' | 'dotted' | 'particles'
}

export interface EffectAnimations {
  onClick?: 'pulse' | 'burst' | 'ripple' | 'slash' | 'none'
  onHover?: 'glow' | 'spin' | 'bounce' | 'none'
  onScroll?: 'trail' | 'particles' | 'stretch' | 'none'
  onConvergence?: 'merge' | 'explosion' | 'spiral' | 'none'
}

// ============================================
// EFFECT LIBRARY
// ============================================

export interface EffectLibrary {
  version: '1.0'
  activeEffectId: string | null
  effects: PretextEffect[]
  settings: EffectSettings
}

export interface EffectSettings {
  activeExtension: 'swordsman' | 'mage' | 'dual'
  globalOpacity: number    // 0 - 1 (default 0.9)
  disabledDomains: string[]
  showOnHomeTerritoryOnly: boolean
  trackingVisualization: boolean  // Show reactions to trackers
}

// ============================================
// TRACKING VISUALIZATION
// ============================================

export interface TrackingVisualization {
  // How effect reacts when near tracking elements
  nearTracker: {
    swordsman: 'glow-red' | 'pulse' | 'none'
    mage: 'particle-stream' | 'attract' | 'none'
  }

  // Animation when tracker is blocked/analyzed
  onAction: {
    swordsman: 'slash' | 'shield' | 'none'
    mage: 'scan-ring' | 'node-create' | 'none'
  }
}

// ============================================
// EXTENSION COORDINATION
// ============================================

export type ActiveExtensionMode = 'swordsman' | 'mage' | 'dual'

export interface ExtensionToggleMessage {
  type: 'ACTIVE_EXTENSION_CHANGED'
  active: ActiveExtensionMode
  effectId?: string
}

export interface EffectUpdateMessage {
  type: 'EFFECT_UPDATED'
  effect: PretextEffect
}

export interface EffectSyncMessage {
  type: 'EFFECT_SYNC_REQUEST' | 'EFFECT_SYNC_RESPONSE'
  library?: EffectLibrary
}

// ============================================
// STORAGE KEYS
// ============================================

export const EFFECT_STORAGE_KEYS = {
  library: 'pretext_effect_library',
  activeEffect: 'pretext_active_effect',
  activeExtension: 'pretext_active_extension',
  settings: 'pretext_effect_settings'
} as const

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
  activeExtension: 'dual',
  globalOpacity: 0.9,
  disabledDomains: [],
  showOnHomeTerritoryOnly: false,
  trackingVisualization: true
}

export const DEFAULT_PHYSICS: Record<'spring' | 'drift' | 'hybrid', EffectPhysics> = {
  spring: {
    mode: 'spring',
    stiffness: 0.04,
    damping: 0.85
  },
  drift: {
    mode: 'drift',
    driftSpeed: 0.3,
    attractorStrength: 0.2
  },
  hybrid: {
    mode: 'hybrid',
    stiffness: 0.02,
    damping: 0.9,
    driftSpeed: 0.15,
    attractorStrength: 0.1,
    hybridBalance: 0.5
  }
}
