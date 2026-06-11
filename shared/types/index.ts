/**
 * Shared Types - Export all types for both extensions
 *
 * This package MUST be identical in both Swordsman and Mage extensions.
 * The website also uses repertoire.ts for localStorage contract.
 */

export * from './spell'
export * from './blade'
export * from './channel'
export * from './ceremony-types'
export * from './repertoire'
export * from './effects'

// Extension IDs (replace with actual IDs after publishing)
export const SWORDSMAN_EXTENSION_ID = 'SWORDSMAN_EXTENSION_ID_PLACEHOLDER'
export const MAGE_EXTENSION_ID = 'MAGE_EXTENSION_ID_PLACEHOLDER'

// Ceremony thresholds
export const CONVERGENCE_THRESHOLD = 60    // px distance
export const DRAKE_THRESHOLD = {
  trackerCount: 10,
  policyScore: 0.3,
  darkPatternCount: 1
}

// Animation timings
export const CEREMONY_TIMINGS = {
  approach: 1000,
  contact: 500,
  resolution: 1500,
  crystallisation: 2000
}

// Orb colors
export const ORB_COLORS = {
  mage: {
    primary: '#1D9E75',
    glow: 'rgba(29, 158, 117, 0.3)',
    dark: '#5DCAA5'
  },
  swordsman: {
    primary: '#534AB7',
    glow: 'rgba(83, 74, 183, 0.3)',
    dark: '#AFA9EC'
  },
  convergence: '#EF9F27',
  drake: '#FFD700'
}
