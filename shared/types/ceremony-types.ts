/**
 * Ceremony Types - Inter-extension ceremony channel protocol
 *
 * IMPORTANT: This file MUST be identical in both Swordsman and Mage extensions.
 * Any changes here must be synced to both repos.
 */

// ============================================
// POSITION & STATE TYPES
// ============================================

export interface Position {
  x: number
  y: number
}

export type HexagramLines = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]

export interface HexagramState {
  lines: HexagramLines
  number?: number          // 1-64
  name?: string
}

// ============================================
// SWORD -> MAGE MESSAGES
// ============================================

export type SwordMessage =
  | SwordPresent
  | SwordOrbPosition
  | Slash
  | Ward
  | TermAssert
  | SwordCeremonyBegin
  | SummonDrake

export interface SwordPresent {
  type: 'SWORD_PRESENT'
  domain: string
  myTermsState: MyTermsSnapshot
  orbPosition: Position
  bladeLevel: number
  hexagramState: HexagramState
}

export interface SwordOrbPosition {
  type: 'ORB_POSITION'
  x: number
  y: number
}

export interface Slash {
  type: 'SLASH'
  target: string            // element selector or tracker domain
  domain: string
  assertion: string
  intensity: number         // 1-10
}

export interface Ward {
  type: 'WARD'
  boundary: string          // boundary type
  terms: string[]
  hexagramLine: number      // 0-5
  yangState: boolean
}

export interface TermAssert {
  type: 'TERM_ASSERT'
  domain: string
  assertions: AssertionRecord[]
  constellationHash: string
  hexagram: HexagramState
}

export interface SwordCeremonyBegin {
  type: 'CEREMONY_BEGIN'
  ceremonyType: CeremonyType
  initiator: 'SWORD'
  conditions: CeremonyConditions
}

export interface SummonDrake {
  type: 'SUMMON_DRAKE'
  conditions: DrakeConditions
}

// ============================================
// MAGE -> SWORD MESSAGES
// ============================================

export type MageMessage =
  | MagePresent
  | MageAcknowledge
  | MageOrbPosition
  | ConstellationWave
  | ConstellationUpdate
  | ScanResults
  | MageSpellCast
  | HexagramUpdate
  | DrakeFormation
  | MageCeremonyBegin
  | ReflowData

export interface MagePresent {
  type: 'MAGE_PRESENT'
  domain: string
  spellbookState: string[]
  orbPosition: Position
}

export interface MageAcknowledge {
  type: 'MAGE_ACKNOWLEDGE'
  orbPosition: Position
  spellbookState: string[]
}

export interface MageOrbPosition {
  type: 'MAGE_ORB_POSITION'
  x: number
  y: number
}

export interface ConstellationWave {
  type: 'CONSTELLATION_WAVE'
  direction: 'MAGE_TO_SWORD'
  payload: WavePayload
  animation: WaveAnimation
}

export interface ConstellationUpdate {
  type: 'CONSTELLATION_UPDATE'
  nodes: RenderNode[]
  edges: RenderEdge[]
  patterns: DetectedPattern[]
}

export interface ScanResults {
  type: 'SCAN_RESULTS'
  findings: DeepScanFindings
}

export interface MageSpellCast {
  type: 'SPELL_CAST'
  spell: SpellNodeData
}

export interface HexagramUpdate {
  type: 'HEXAGRAM_UPDATE'
  state: HexagramState
  animationParams: AnimationParams
}

export interface DrakeFormation {
  type: 'DRAKE_FORMATION'
  bodyNodes: DrakeBodyNode[]
  patrolPath: Position[]
  formationProgress: number
}

export interface MageCeremonyBegin {
  type: 'CEREMONY_BEGIN'
  ceremonyType: CeremonyType
  initiator: 'MAGE'
  conditions: CeremonyConditions
}

export interface ReflowData {
  type: 'REFLOW_DATA'
  lines: ReflowLine[]
}

// ============================================
// CEREMONY TYPES
// ============================================

export type CeremonyType =
  | 'dual_convergence'
  | 'hexagram_cast'
  | 'emoji_cast'
  | 'quick_cast'
  | 'constellation_wave'
  | 'bilateral_exchange'
  | 'drake_summon'

export interface CeremonyConditions {
  orbDistance: number
  spellsCast: number
  gapScore: number
  drakeEligible: boolean
}

// ============================================
// CURSOR STATES
// ============================================

export type CursorState =
  | 'default'
  | 'blade-active'
  | 'dual-active'
  | 'spell-selected'
  | 'casting'
  | 'sovereign'
  | 'contested'
  | 'inherited'
  | 'hexagram-active'
  | 'drake-summoned'
  | 'full-sovereign'

// ============================================
// CONSTELLATION TYPES
// ============================================

export interface RenderNode {
  id: string
  x: number
  y: number
  yangYin: 'yang' | 'yin'
  opacity: number
  pulse: number
  emoji?: string
}

export interface RenderEdge {
  from: string
  to: string
  strength: number
  type: 'solid' | 'dashed'
}

export interface DetectedPattern {
  type: 'triangle' | 'line' | 'star' | 'pair'
  nodeIds: string[]
}

export interface SpellNodeData {
  id: string
  type: 'emoji' | 'proverb' | 'keyword' | 'hexagram'
  content: string
  position: Position
  yangYin: 'yang' | 'yin'
  assertion?: string
  timestamp: number
}

// ============================================
// DRAKE TYPES
// ============================================

export interface DrakeConditions {
  trackerCount: number
  darkPatternCount: number
  policyScore: number
  constellationNodeCount: number
  hasLearnedDrakeSpell: boolean
}

export interface DrakeBodyNode {
  nodeId: string
  pvmCondition: 'P' | 'C' | 'Q' | 'S' | 'network' | 'phi' | 'R'
  position: Position
  health: number  // 0-1
}

// ============================================
// WAVE & ANIMATION TYPES
// ============================================

export interface WavePayload {
  threatLevel: number
  suggestedAssertions: string[]
  trackerCount: number
  darkPatternCount: number
  gapScore: number
  suggestedBlade?: number  // blade ID
}

export interface WaveAnimation {
  particleCount: number
  pathType: 'geodesic' | 'direct'
  duration: number
}

export interface AnimationParams {
  orbitRadii: number
  spellSpawnRate: number
  phaseCoupling: number
  edgeThreshold: number
  glowIntensity: number
  gridVisibility: number
}

// ============================================
// REFLOW TYPES
// ============================================

export interface ReflowLine {
  text: string
  width: number
  x: number
  y: number
}

// ============================================
// SCAN TYPES
// ============================================

export interface DeepScanFindings {
  domain: string
  trackerCategories: Record<string, string[]>
  privacyPolicyAnalysis: {
    url: string | null
    score: number
    keywords: {
      dataSharing: string[]
      retention: string[]
      thirdParty: string[]
      userRights: string[]
    }
  }
  darkPatterns: {
    preCheckedConsent: number
    hiddenReject: boolean
    confusingLanguage: boolean
    urgencyTactics: boolean
  }
  formAnalysis: {
    totalForms: number
    totalSensitiveFields: number
    hasHiddenInputs: boolean
  }
  metaTags: {
    hasDoNotTrack: boolean
    hasGPC: boolean
    opaqueTracking: string[]
  }
  gapScore: number
}

// ============================================
// MYTERMS TYPES
// ============================================

export interface MyTermsSnapshot {
  doNotTrack: boolean
  doNotSell: boolean
  dataMinimisation: boolean
  cookiePreference: 'essential-only' | 'functional' | 'all'
  credentialDisclosure: 'none' | 'selective' | 'full'
  agentDelegation: 'self-only' | 'emissary-allowed'
}

export interface AssertionRecord {
  term: string
  asserted: boolean
  timestamp: number
  spellUsed?: string
}
