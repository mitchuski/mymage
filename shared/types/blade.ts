/**
 * Blade Types - The 64-blade forge system for Swordsman
 */

import type { MyTermsType, Vector2 } from './spell'

export interface Blade {
  id: number                         // 0-63
  name: string
  layer: BladeLayer                  // 0-6 (Pascal's row)
  edges: number                      // Active privacy dimensions

  // I Ching mapping
  hexagram: HexagramState            // 6-bit state

  // What this blade asserts
  assertion: {
    terms: MyTermsType[]
    emoji: string
    description: string
  }

  // ZK properties
  zk: {
    statement: string                // What this blade claims
    witnessType: string              // What proves it
    verifiable: boolean              // Can be verified on-chain
  }

  // Unlock conditions
  unlock: {
    requiredLevel: BladeLayer
    requiredForgings?: number
    requiredDomains?: number
    special?: string                 // Special condition description
  }
}

export type BladeLayer = 0 | 1 | 2 | 3 | 4 | 5 | 6

// Pascal's row distribution: 1, 6, 15, 20, 15, 6, 1 = 64
export const BLADES_PER_LAYER: Record<BladeLayer, number> = {
  0: 1,   // Null blade
  1: 6,   // Single-edge
  2: 15,  // Twin-edge (Sword + Mage cooperation)
  3: 20,  // Triple-edge (Trust triad)
  4: 15,  // Quad-edge (Multi-domain)
  5: 6,   // Penta-edge (Near-sovereign)
  6: 1    // Full sovereignty (Dragon)
}

export interface Forging {
  id: string
  blade: Blade
  domain: string
  timestamp: number

  // ZK witness
  witness: {
    constellationHash: string        // Hash of spell node geometry
    signatureChain: string[]         // All spell signatures
    hexagramAtForge: HexagramState
  }

  // Proof
  proof: {
    type: 'local' | 'on-chain'
    txId?: string                    // Zcash transaction if inscribed
  }
}

export interface BladeForge {
  // User's current level
  currentLayer: BladeLayer
  highestBlade: Blade | null

  // Forging history
  forgings: Forging[]
  totalForgings: number
  domainsForged: string[]

  // Unlocked blades
  unlockedBlades: number[]           // Blade IDs

  // Progress toward next layer
  progress: {
    forgingsToNextLayer: number
    domainsToNextLayer: number
  }
}

// Hexagram (6-bit privacy state)
export type HexagramState = [number, number, number, number, number, number]

export interface Hexagram {
  lines: HexagramState
  number: number                     // 1-64
  name: string                       // "Creative", "Receptive", etc.
  description: string
}

// Hexagram line meanings
export const HEXAGRAM_LINES = {
  1: { name: 'Key Custody', yang: 'Self-custody', yin: 'Custodial' },
  2: { name: 'Credential Disclosure', yang: 'Selective (ZKP)', yin: 'Full disclosure' },
  3: { name: 'Agent Delegation', yang: 'Self-execute', yin: 'Emissary-execute' },
  4: { name: 'Data Residency', yang: 'Local/sovereign', yin: 'Federated/shared' },
  5: { name: 'Interaction Mode', yang: 'Direct (1st person)', yin: 'Delegated (3rd person)' },
  6: { name: 'Trust Boundary', yang: 'Closed perimeter', yin: 'Open perimeter' }
} as const
