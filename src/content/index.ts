/**
 * Mage Extension - Content Script
 *
 * The spell that projects sovereignty across distance. Handles:
 * - Deep page scanning
 * - Mage orb physics (autonomous movement)
 * - Constellation management
 * - Drake emergence engine
 * - Hexagram state machine
 * - Home territory bonus interactions
 * - Training ground sync (repertoire)
 *
 * IMPORTANT: The Mage does NOT inject a canvas.
 * All rendering data is sent to the Swordsman who owns the single canvas overlay.
 *
 * CONTROL SCHEME (Left Side = Emissary = Left Click):
 * - Left-click tap: Cast last selected spell
 * - Left-click hold: Show spell orbit menu
 * - M key: Open spell editor
 * - 8 spells: 6 orbit + 2 reserve
 */

import { SWORDSMAN_EXTENSION_ID } from '@agentprivacy/shared-types'
import type {
  MageMessage,
  SwordMessage,
  Position,
  HexagramState,
  RenderNode,
  RenderEdge,
  DetectedPattern,
  DrakeBodyNode,
  DeepScanFindings,
  AnimationParams
} from '@agentprivacy/shared-types'

import type { MageSpell, MageLoadout, SpellNode, HexagramSnapshot } from '../lib/spell-types'
import {
  ORBIT_SPELLS,
  RESERVE_SPELLS,
  ALL_SPELLS,
  GRIMOIRE_SPELLS,
  getDefaultLoadout,
  getSpellById,
  SPELL_MATHEMATICS
} from '../lib/spell-definitions'
import {
  isHomeDomain,
  syncFromTrainingGround,
  getLoadoutFromStorage,
  saveLoadoutToStorage,
  updateLoadoutWithUnlocked,
  broadcastSpellCast,
  broadcastOrbConvergence,
  broadcastConstellationUpdate,
  announceMagePresence,
  setupWebsiteListener,
  recordSpellCast
} from '../lib/repertoire-sync'

// ============================================
// STATE
// ============================================

let swordPresent = false
let swordOrbPosition: Position = { x: 0, y: 0 }

// Mage orb state (autonomous movement)
let mageOrbState = {
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  attractors: [] as Attractor[]
}

// Constellation state (Mage owns this)
let constellationState = {
  nodes: [] as SpellNode[],
  edges: [] as RenderEdge[],
  patterns: [] as DetectedPattern[],
  hash: null as string | null
}

// Hexagram state (I Ching 6-bit state)
let hexagramState: HexagramState = {
  lines: [1, 0, 1, 0, 1, 0] // Default: hexagram 21 (Biting Through)
}

// Drake state
let drakeState = {
  eligible: false,
  summoned: false,
  formationProgress: 0,
  bodyNodes: [] as DrakeBodyNode[],
  patrolPath: [] as Position[]
}

// Home territory
let isHomeTerritoryPage = false
let homeTerritoryType: 'agentprivacy' | 'spellweb' | 'bgin' | null = null

// ============================================
// SPELL SYSTEM (Left Side = Emissary = Left Click)
// 8 Spells: 6 in orbit + 2 reserve
// ============================================

// Current loadout (initialized from storage or defaults)
let currentLoadout: MageLoadout = getDefaultLoadout()

let spellState = {
  isHolding: false,
  holdStartTime: 0,
  lastSpell: currentLoadout.orbitSpells[0],
  selectedSpellIndex: 0,
  orbitVisible: false,
  orbitPosition: { x: 0, y: 0 },
  orbitElement: null as HTMLElement | null
}

// ============================================
// TYPES
// ============================================

interface Attractor {
  x: number
  y: number
  strength: number
  type: 'tracker' | 'form' | 'cookie-banner' | 'privacy-link'
}

// ============================================
// INITIALIZATION
// ============================================

async function initialize(): Promise<void> {
  console.log('[Mage Content] Initializing...')
  console.log('[Mage Content] Spell Mathematics:', SPELL_MATHEMATICS.byteRepresentation)

  // Load spell loadout from storage
  currentLoadout = await getLoadoutFromStorage()
  spellState.lastSpell = currentLoadout.orbitSpells[currentLoadout.lastSelected] || currentLoadout.orbitSpells[0]

  // Check for home territory
  checkHomeTerritory()

  // If on home territory, sync with training ground
  if (isHomeTerritoryPage) {
    await syncWithTrainingGround()
  }

  // Discover Swordsman
  const hasSword = await discoverSwordsman()

  if (!hasSword) {
    console.log('[Mage Content] Swordsman not detected. Read-only mode.')
    runReadOnlyMode()
  } else {
    console.log('[Mage Content] Swordsman detected. Full ceremony mode.')
    runFullCeremonyMode()
  }
}

/**
 * Sync spell loadout with training ground progress
 */
async function syncWithTrainingGround(): Promise<void> {
  try {
    const { learned, progress, unlocked } = await syncFromTrainingGround()

    console.log('[Mage Content] Training ground sync:', {
      learnedSpells: learned.length,
      spellsCast: progress.spellsCastCount,
      pathUnlocked: progress.pathUnlocked,
      unlockedSpells: unlocked
    })

    // Update loadout with any newly unlocked spells
    if (unlocked.length > 0) {
      currentLoadout = await updateLoadoutWithUnlocked(unlocked)
      spellState.lastSpell = currentLoadout.orbitSpells[currentLoadout.lastSelected] || currentLoadout.orbitSpells[0]
    }

    // Dragon spell special handling
    if (progress.drakeSpellUnlocked) {
      drakeState.eligible = true
    }
  } catch (error) {
    console.error('[Mage Content] Training sync failed:', error)
  }
}

// ============================================
// SWORDSMAN DISCOVERY
// ============================================

async function discoverSwordsman(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, {
        type: 'MAGE_PRESENT',
        domain: location.hostname,
        spellbookState: [], // TODO: Get from background
        orbPosition: { x: mageOrbState.x, y: mageOrbState.y }
      }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve(false)
          return
        }
        if (response.type === 'SWORD_ACKNOWLEDGE' || response.acknowledged) {
          swordPresent = true
          swordOrbPosition = response.orbPosition || { x: 0, y: 0 }
          resolve(true)
        } else {
          resolve(false)
        }
      })
    } catch {
      resolve(false)
    }
  })
}

// Re-check periodically
setInterval(async () => {
  if (!swordPresent) {
    const found = await discoverSwordsman()
    if (found) {
      runFullCeremonyMode()
    }
  }
}, 30000)

// ============================================
// HOME TERRITORY DETECTION
// ============================================

const HOME_DOMAINS = [
  'agentprivacy.ai',
  'www.agentprivacy.ai',
  'spellweb.ai',
  'www.spellweb.ai',
  'bgin.ai',
  'www.bgin.ai',
  // Local development
  'localhost',
  '127.0.0.1'
]

function checkHomeTerritory(): void {
  const host = location.hostname.replace('www.', '')
  const port = location.port

  // Check if this is a home territory domain
  isHomeTerritoryPage = HOME_DOMAINS.includes(host)

  // Also check for local dev server on port 5000
  if ((host === 'localhost' || host === '127.0.0.1') && port === '5000') {
    isHomeTerritoryPage = true
  }

  if (isHomeTerritoryPage) {
    if (host === 'agentprivacy.ai' || host === 'localhost' || host === '127.0.0.1') {
      homeTerritoryType = 'agentprivacy'
    } else if (host === 'spellweb.ai') {
      homeTerritoryType = 'spellweb'
    } else if (host === 'bgin.ai') {
      homeTerritoryType = 'bgin'
    }
    console.log('[Mage Content] Home territory detected:', homeTerritoryType)
  }
}

// ============================================
// READ-ONLY MODE
// ============================================

function runReadOnlyMode(): void {
  // Still scan the page and store data
  // But don't send ceremony messages or show UI
  const scan = deepScanPage()
  chrome.runtime.sendMessage({ type: 'DEEP_SCAN_COMPLETE', data: scan })
}

// ============================================
// FULL CEREMONY MODE
// ============================================

function runFullCeremonyMode(): void {
  // Setup message listeners
  setupMessageListeners()

  // Setup spell control listeners (Left click = Emissary)
  setupSpellControls()

  // Run deep scan and send to Swordsman
  const scan = deepScanPage()
  sendScanToSword(scan)

  // Build attractors for Mage orb
  mageOrbState.attractors = buildAttractors(scan)

  // Start physics and data sync loops
  startMageOrbPhysics()
  startConstellationSync()

  // Check Drake eligibility
  checkDrakeEligibility(scan)

  // Activate home territory mode if applicable
  if (isHomeTerritoryPage) {
    activateHomeTerritoryMode()
  }
}

// ============================================
// SPELL CONTROL SYSTEM (Left Click = Emissary)
// ============================================

function setupSpellControls(): void {
  document.addEventListener('mousedown', handleSpellMouseDown)
  document.addEventListener('mouseup', handleSpellMouseUp)
  document.addEventListener('mousemove', handleSpellMouseMove)
  document.addEventListener('keydown', handleSpellKeydown)
}

function handleSpellMouseDown(e: MouseEvent): void {
  // Left click = spell system (button 0)
  if (e.button === 0) {
    // Don't intercept if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.tagName === 'A' || target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
        target.closest('a, button, input, textarea, [role="button"]')) {
      return
    }

    spellState.isHolding = true
    spellState.holdStartTime = Date.now()
    spellState.orbitPosition = { x: e.clientX, y: e.clientY }

    // Show spell orbit after brief hold
    setTimeout(() => {
      if (spellState.isHolding) {
        showSpellOrbit(e.clientX, e.clientY)
      }
    }, 200) // Slightly longer than Swordsman for differentiation
  }
}

function handleSpellMouseUp(e: MouseEvent): void {
  if (e.button === 0 && spellState.isHolding) {
    const holdDuration = Date.now() - spellState.holdStartTime

    if (spellState.orbitVisible) {
      // Release with orbit visible = cast selected spell
      castMageSpell(spellState.lastSpell, { x: e.clientX, y: e.clientY })
      hideSpellOrbit()
    } else if (holdDuration < 200) {
      // Quick tap = cast last selected spell (emissary executes fast)
      castMageSpell(spellState.lastSpell, { x: e.clientX, y: e.clientY })
    }

    spellState.isHolding = false
  }
}

function handleSpellMouseMove(e: MouseEvent): void {
  if (spellState.isHolding && spellState.orbitVisible) {
    // Calculate which spell is being hovered based on angle from orbit center
    const dx = e.clientX - spellState.orbitPosition.x
    const dy = e.clientY - spellState.orbitPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 25) { // Must move away from center to select
      const angle = Math.atan2(dy, dx)
      // Normalize angle to 0-1 range, offset to start from top
      let normalizedAngle = (angle + Math.PI / 2) / (2 * Math.PI)
      if (normalizedAngle < 0) normalizedAngle += 1
      const orbitSpells = currentLoadout.orbitSpells
      const spellIndex = Math.floor(normalizedAngle * orbitSpells.length) % orbitSpells.length

      if (spellIndex !== spellState.selectedSpellIndex) {
        spellState.selectedSpellIndex = spellIndex
        spellState.lastSpell = orbitSpells[spellIndex]
        updateSpellOrbitHighlight()
      }
    }
  }
}

function handleSpellKeydown(e: KeyboardEvent): void {
  // M key = Open spell editor (Mage's full editor)
  if (e.key === 'm' || e.key === 'M') {
    // Don't trigger if user is typing in an input
    if (document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable) {
      return
    }
    e.preventDefault()
    openSpellEditor()
    return
  }
}

// ============================================
// SPELL ORBIT UI
// ============================================

function showSpellOrbit(x: number, y: number): void {
  if (spellState.orbitElement) return

  spellState.orbitVisible = true
  const orbitSpells = currentLoadout.orbitSpells
  const reserveSpells = currentLoadout.reserveSpells

  // Create orbital menu element
  const orbit = document.createElement('div')
  orbit.id = 'mage-spell-orbit'
  orbit.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    pointer-events: none;
    z-index: 2147483647;
  `

  // Create 6 orbit spell items in radial layout (60° hexagonal symmetry)
  orbitSpells.forEach((spell, i) => {
    const angle = (i / orbitSpells.length) * Math.PI * 2 - Math.PI / 2
    const radius = 65
    const itemX = Math.cos(angle) * radius
    const itemY = Math.sin(angle) * radius

    // Use spell's color if defined, otherwise default teal
    const spellColor = spell.color || '#1D9E75'
    const glowColor = spell.glowColor || 'rgba(29, 158, 117, 0.5)'

    const item = document.createElement('div')
    item.className = 'spell-item'
    item.dataset.index = String(i)
    item.dataset.yangyin = spell.yangYin
    item.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) translate(${itemX}px, ${itemY}px);
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${i === spellState.selectedSpellIndex ? spellColor : 'rgba(20, 30, 25, 0.85)'};
      border: 2px solid ${i === spellState.selectedSpellIndex ? '#5DCAA5' : spellColor};
      border-radius: 50%;
      color: white;
      font-size: 18px;
      transition: all 0.12s ease;
      box-shadow: 0 0 ${i === spellState.selectedSpellIndex ? '12px' : '4px'} ${glowColor};
    `
    item.innerHTML = `<span>${spell.emoji}</span>`
    orbit.appendChild(item)
  })

  // Center indicator showing current spell name and proverb
  const center = document.createElement('div')
  center.id = 'spell-center-label'
  center.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 30, 25, 0.95);
    border: 2px solid #1D9E75;
    border-radius: 8px;
    padding: 6px 10px;
    color: #5DCAA5;
    font-family: system-ui, sans-serif;
    font-size: 10px;
    text-align: center;
    white-space: nowrap;
    min-width: 60px;
  `
  const spellProverb = spellState.lastSpell.proverb
    ? `<br><span style="color: #666; font-size: 7px; font-style: italic;">${spellState.lastSpell.proverb.slice(0, 30)}...</span>`
    : ''
  center.innerHTML = `<strong>${spellState.lastSpell.name}</strong><br><span style="color: #888; font-size: 8px;">${spellState.lastSpell.description}</span>${spellProverb}`
  orbit.appendChild(center)

  // Reserve spells indicator (bottom)
  const reserve = document.createElement('div')
  reserve.id = 'spell-reserve'
  reserve.style.cssText = `
    position: absolute;
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
    background: rgba(20, 40, 35, 0.9);
    border: 1px solid #1D9E75;
    border-radius: 4px;
    padding: 2px 8px;
    color: #888;
    font-family: system-ui, sans-serif;
    font-size: 9px;
    white-space: nowrap;
  `
  reserve.innerHTML = `reserve: ${reserveSpells.map(s => s.emoji).join(' ')}`
  orbit.appendChild(reserve)

  document.body.appendChild(orbit)
  spellState.orbitElement = orbit
}

function updateSpellOrbitHighlight(): void {
  if (!spellState.orbitElement) return

  const orbitSpells = currentLoadout.orbitSpells
  const items = spellState.orbitElement.querySelectorAll('.spell-item')
  items.forEach((item, i) => {
    const el = item as HTMLElement
    const spell = orbitSpells[i]
    const isSelected = i === spellState.selectedSpellIndex
    const spellColor = spell?.color || '#1D9E75'
    const glowColor = spell?.glowColor || 'rgba(29, 158, 117, 0.5)'

    el.style.background = isSelected ? spellColor : 'rgba(20, 30, 25, 0.85)'
    el.style.borderColor = isSelected ? '#5DCAA5' : spellColor
    el.style.boxShadow = `0 0 ${isSelected ? '12px' : '4px'} ${glowColor}`
  })

  const center = spellState.orbitElement.querySelector('#spell-center-label')
  if (center) {
    const spell = spellState.lastSpell
    const proverbSnippet = spell.proverb
      ? `<br><span style="color: #666; font-size: 7px; font-style: italic;">${spell.proverb.slice(0, 30)}...</span>`
      : ''
    center.innerHTML = `<strong>${spell.name}</strong><br><span style="color: #888; font-size: 8px;">${spell.description}</span>${proverbSnippet}`
  }
}

function hideSpellOrbit(): void {
  if (spellState.orbitElement) {
    spellState.orbitElement.remove()
    spellState.orbitElement = null
  }
  spellState.orbitVisible = false
}

function castMageSpell(spell: MageSpell, position: Position): void {
  console.log('[Mage Content] Casting spell:', spell.name, 'at', position)
  console.log('[Mage Content] Spell proverb:', spell.proverb || '(none)')

  // Add to constellation
  addSpellNode({
    type: spell.emojiSequence ? 'emoji' : 'keyword',
    content: spell.emoji,
    yangYin: spell.yangYin,
    grimoireId: spell.grimoireId
  }, position)

  // Mutate hexagram on spell cast
  mutateHexagram('spell')

  // Update last selected in loadout
  const spellIndex = currentLoadout.orbitSpells.findIndex(s => s.id === spell.id)
  if (spellIndex >= 0) {
    currentLoadout.lastSelected = spellIndex
    saveLoadoutToStorage(currentLoadout)
  }

  // Record cast in local history
  recordSpellCast(spell.id, position, location.hostname)

  // Broadcast to website if on home territory
  if (isHomeTerritoryPage) {
    broadcastSpellCast(
      spell.id,
      spell.proverb || spell.name,
      spell.emoji,
      position,
      homeTerritoryType || 'unknown'
    )
  }

  // Notify background
  chrome.runtime.sendMessage({
    type: 'SPELL_CAST',
    spell: {
      id: spell.id,
      name: spell.name,
      emoji: spell.emoji,
      yangYin: spell.yangYin,
      myTermsMapping: spell.myTermsMapping,
      grimoireId: spell.grimoireId
    },
    position,
    timestamp: Date.now()
  })

  // Send to Swordsman if present
  if (swordPresent) {
    sendToSword({
      type: 'SPELL_CAST' as any,
      spell: {
        id: spell.id,
        name: spell.name,
        emoji: spell.emoji,
        yangYin: spell.yangYin,
        myTermsMapping: spell.myTermsMapping
      },
      position
    })
  }

  // Visual feedback - flash emoji with spell color
  flashSpellCast(position.x, position.y, spell.emoji, spell.glowColor)
}

function flashSpellCast(x: number, y: number, emoji: string, glowColor?: string): void {
  const glow = glowColor || 'rgba(29, 158, 117, 0.8)'
  const flash = document.createElement('div')
  flash.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%) scale(1);
    font-size: 28px;
    pointer-events: none;
    z-index: 2147483647;
    opacity: 1;
    transition: all 0.4s ease-out;
    filter: drop-shadow(0 0 8px ${glow});
  `
  flash.textContent = emoji
  document.body.appendChild(flash)

  // Animate out
  requestAnimationFrame(() => {
    flash.style.transform = 'translate(-50%, -50%) scale(1.8)'
    flash.style.opacity = '0'
  })

  // Remove after animation
  setTimeout(() => flash.remove(), 400)
}

function openSpellEditor(): void {
  // Send message to open popup/editor
  chrome.runtime.sendMessage({ type: 'OPEN_SPELL_EDITOR' })
  console.log('[Mage Content] Opening spell editor (M key)')
}

// ============================================
// DEEP PAGE SCANNER
// ============================================

function deepScanPage(): DeepScanFindings {
  const domain = location.hostname

  // Categorize trackers
  const trackerCategories: Record<string, string[]> = {}
  const scripts = [...document.scripts].filter(s => s.src)

  for (const script of scripts) {
    try {
      const host = new URL(script.src).hostname
      if (host && host !== domain && !host.endsWith('.' + domain)) {
        const category = categorizeTracker(host)
        if (!trackerCategories[category]) trackerCategories[category] = []
        trackerCategories[category].push(host)
      }
    } catch {}
  }

  // Privacy policy analysis
  const privacyLink = document.querySelector('a[href*="privacy"]') as HTMLAnchorElement | null
  const privacyPolicyAnalysis = {
    url: privacyLink?.href || null,
    score: privacyLink ? 0.5 : 0.3, // Basic heuristic
    keywords: {
      dataSharing: [] as string[],
      retention: [] as string[],
      thirdParty: [] as string[],
      userRights: [] as string[]
    }
  }

  // Dark patterns detection
  const darkPatterns = detectDarkPatterns()

  // Form analysis
  const forms = document.querySelectorAll('form')
  const sensitiveInputs = document.querySelectorAll(
    'input[type="email"], input[type="tel"], input[name*="ssn"], input[name*="social"], input[name*="password"]'
  )
  const hiddenInputs = document.querySelectorAll('input[type="hidden"]')

  const formAnalysis = {
    totalForms: forms.length,
    totalSensitiveFields: sensitiveInputs.length,
    hasHiddenInputs: hiddenInputs.length > 0
  }

  // Meta tags
  const metaTags = {
    hasDoNotTrack: !!document.querySelector('meta[name="dnt"]'),
    hasGPC: !!document.querySelector('meta[name="gpc"]'),
    opaqueTracking: [] as string[]
  }

  // Calculate gap score
  let gapScore = 20
  gapScore += Object.values(trackerCategories).flat().length * 5
  gapScore += darkPatterns.preCheckedConsent * 10
  gapScore += darkPatterns.hiddenReject ? 20 : 0
  gapScore += formAnalysis.totalSensitiveFields * 3
  gapScore = Math.min(100, Math.max(0, gapScore))

  return {
    domain,
    trackerCategories,
    privacyPolicyAnalysis,
    darkPatterns,
    formAnalysis,
    metaTags,
    gapScore
  }
}

function categorizeTracker(host: string): string {
  const TRACKER_CATEGORIES: Record<string, string> = {
    'google-analytics.com': 'analytics',
    'googletagmanager.com': 'tag-management',
    'facebook.net': 'social-tracking',
    'doubleclick.net': 'advertising',
    'hotjar.com': 'session-recording',
    'fullstory.com': 'session-recording',
    'mixpanel.com': 'analytics',
    'segment.com': 'data-collection',
    'amplitude.com': 'analytics'
  }

  for (const [pattern, category] of Object.entries(TRACKER_CATEGORIES)) {
    if (host.includes(pattern)) return category
  }
  return 'unknown'
}

function detectDarkPatterns() {
  // Pre-checked consent boxes
  const preChecked = document.querySelectorAll(
    'input[type="checkbox"]:checked[name*="consent"], input[type="checkbox"]:checked[name*="marketing"]'
  )

  // Hidden reject button
  const bannerSelectors = ['#onetrust-banner-sdk', '.cookieconsent', '#cookie-banner', '[class*="cookie"]', '[id*="consent"]']
  const banner = bannerSelectors.map(s => document.querySelector(s)).find(Boolean)
  let hiddenReject = false

  if (banner) {
    const buttons = banner.querySelectorAll('button, a[role="button"]')
    const reject = [...buttons].find(b => /reject|decline|refuse|deny|no\s|essential/i.test(b.textContent || ''))
    if (reject) {
      const style = getComputedStyle(reject as Element)
      hiddenReject = style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none' ||
                     (reject as HTMLElement).offsetWidth < 10
    } else {
      hiddenReject = true // No reject button at all
    }
  }

  return {
    preCheckedConsent: preChecked.length,
    hiddenReject,
    confusingLanguage: false, // TODO: NLP analysis
    urgencyTactics: false     // TODO: Pattern matching
  }
}

function sendScanToSword(scan: DeepScanFindings): void {
  const waveData = {
    type: 'CONSTELLATION_WAVE' as const,
    direction: 'MAGE_TO_SWORD' as const,
    payload: {
      threatLevel: scan.gapScore > 50 ? 0.7 : 0.3,
      suggestedAssertions: generateSpellSuggestions(scan),
      trackerCount: Object.values(scan.trackerCategories).flat().length,
      darkPatternCount: scan.darkPatterns.preCheckedConsent + (scan.darkPatterns.hiddenReject ? 1 : 0),
      gapScore: scan.gapScore
    },
    animation: {
      particleCount: Math.min(20, Object.values(scan.trackerCategories).flat().length),
      pathType: 'geodesic',
      duration: 2000
    }
  }

  sendToSword(waveData)

  // Also send scan results to website when on home territory
  if (isHomeTerritoryPage) {
    window.postMessage({
      type: 'SCAN_RESULTS',
      findings: scan
    }, '*')
  }
}

function generateSpellSuggestions(scan: DeepScanFindings): string[] {
  const suggestions: string[] = []

  if (Object.values(scan.trackerCategories).flat().length > 5) {
    suggestions.push('DO_NOT_TRACK')
  }
  if (scan.darkPatterns.preCheckedConsent > 0) {
    suggestions.push('COOKIE_ESSENTIAL_ONLY')
  }
  if (scan.formAnalysis.totalSensitiveFields > 0) {
    suggestions.push('DATA_MINIMISATION')
  }

  return suggestions
}

// ============================================
// MAGE ORB PHYSICS (Autonomous Movement)
// ============================================

function startMageOrbPhysics(): void {
  let lastTime = performance.now()

  function update() {
    const now = performance.now()
    const dt = (now - lastTime) / 1000
    lastTime = now

    updateMageOrb(dt)
    maybeSendPosition()

    requestAnimationFrame(update)
  }

  requestAnimationFrame(update)
}

function updateMageOrb(dt: number): void {
  // Base orbit (Perlin noise for organic drift)
  const baseVx = Math.sin(Date.now() * 0.0007) * 0.3
  const baseVy = Math.cos(Date.now() * 0.0005) * 0.2

  // Attractor forces
  let ax = baseVx, ay = baseVy
  for (const att of mageOrbState.attractors) {
    const dx = att.x - mageOrbState.x
    const dy = att.y - mageOrbState.y
    const dist = Math.sqrt(dx * dx + dy * dy) + 1
    const force = att.strength / (dist * dist) * 100
    ax += (dx / dist) * force
    ay += (dy / dist) * force
  }

  // Apply with damping
  mageOrbState.vx = (mageOrbState.vx + ax * dt) * 0.95
  mageOrbState.vy = (mageOrbState.vy + ay * dt) * 0.95
  mageOrbState.x += mageOrbState.vx
  mageOrbState.y += mageOrbState.vy

  // Clamp to viewport
  mageOrbState.x = Math.max(20, Math.min(window.innerWidth - 20, mageOrbState.x))
  mageOrbState.y = Math.max(20, Math.min(window.innerHeight - 20, mageOrbState.y))
}

function buildAttractors(scan: DeepScanFindings): Attractor[] {
  const attractors: Attractor[] = []

  // Cookie banners attract the Mage
  const banner = document.querySelector('#onetrust-banner-sdk, [class*="cookie"], [id*="consent"]')
  if (banner) {
    const rect = banner.getBoundingClientRect()
    attractors.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      strength: 0.5,
      type: 'cookie-banner'
    })
  }

  // Forms attract weakly
  document.querySelectorAll('form').forEach(form => {
    const rect = form.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      attractors.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        strength: 0.2,
        type: 'form'
      })
    }
  })

  // Privacy links attract
  const privacyLink = document.querySelector('a[href*="privacy"]')
  if (privacyLink) {
    const rect = privacyLink.getBoundingClientRect()
    attractors.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      strength: 0.3,
      type: 'privacy-link'
    })
  }

  return attractors
}

let lastPositionSend = 0
function maybeSendPosition(): void {
  const now = performance.now()
  if (now - lastPositionSend < 33) return // 30fps throttle
  lastPositionSend = now

  sendToSword({
    type: 'MAGE_ORB_POSITION',
    x: mageOrbState.x,
    y: mageOrbState.y
  })
}

// ============================================
// CONSTELLATION MANAGEMENT
// ============================================

function startConstellationSync(): void {
  // Sync constellation state to Swordsman every 100ms
  setInterval(() => {
    if (swordPresent && constellationState.nodes.length > 0) {
      sendConstellationToSword()
    }
  }, 100)
}

function updateConstellation(): void {
  // Rebuild edges based on proximity
  constellationState.edges = []

  for (let i = 0; i < constellationState.nodes.length; i++) {
    for (let j = i + 1; j < constellationState.nodes.length; j++) {
      const dx = constellationState.nodes[i].x - constellationState.nodes[j].x
      const dy = constellationState.nodes[i].y - constellationState.nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 180) {
        const sameType = constellationState.nodes[i].spell.yangYin === constellationState.nodes[j].spell.yangYin
        constellationState.edges.push({
          from: constellationState.nodes[i].id,
          to: constellationState.nodes[j].id,
          strength: 1 - dist / 180,
          type: sameType ? 'solid' : 'dashed'
        })
      }
    }
  }

  // Detect patterns
  constellationState.patterns = detectPatterns()

  // Compute hash
  constellationState.hash = computeConstellationHash()
}

function detectPatterns(): DetectedPattern[] {
  // Simple pattern detection
  const patterns: DetectedPattern[] = []

  // Pairs
  if (constellationState.edges.length >= 1) {
    for (const edge of constellationState.edges) {
      patterns.push({ type: 'pair', nodeIds: [edge.from, edge.to] })
    }
  }

  // Triangles
  for (let i = 0; i < constellationState.nodes.length; i++) {
    for (let j = i + 1; j < constellationState.nodes.length; j++) {
      for (let k = j + 1; k < constellationState.nodes.length; k++) {
        const hasIJ = constellationState.edges.some(e =>
          (e.from === constellationState.nodes[i].id && e.to === constellationState.nodes[j].id) ||
          (e.from === constellationState.nodes[j].id && e.to === constellationState.nodes[i].id)
        )
        const hasJK = constellationState.edges.some(e =>
          (e.from === constellationState.nodes[j].id && e.to === constellationState.nodes[k].id) ||
          (e.from === constellationState.nodes[k].id && e.to === constellationState.nodes[j].id)
        )
        const hasIK = constellationState.edges.some(e =>
          (e.from === constellationState.nodes[i].id && e.to === constellationState.nodes[k].id) ||
          (e.from === constellationState.nodes[k].id && e.to === constellationState.nodes[i].id)
        )

        if (hasIJ && hasJK && hasIK) {
          patterns.push({
            type: 'triangle',
            nodeIds: [constellationState.nodes[i].id, constellationState.nodes[j].id, constellationState.nodes[k].id]
          })
        }
      }
    }
  }

  return patterns
}

function computeConstellationHash(): string {
  // Privacy-preserving geometry proof
  const normalized = constellationState.nodes.map(n => ({
    x: Math.round(n.x / 10),
    y: Math.round(n.y / 10),
    yin: n.spell.yangYin === 'yin'
  }))
  return btoa(JSON.stringify(normalized)).slice(0, 32)
}

function sendConstellationToSword(): void {
  const mappedNodes = constellationState.nodes.map(n => ({
    id: n.id,
    x: n.x,
    y: n.y,
    yangYin: n.spell.yangYin,
    opacity: n.opacity,
    pulse: n.pulse,
    emoji: n.spell.type === 'emoji' ? n.spell.content : undefined
  }))

  const constellationData = {
    type: 'CONSTELLATION_UPDATE' as const,
    nodes: mappedNodes,
    edges: constellationState.edges,
    patterns: constellationState.patterns
  }

  sendToSword(constellationData)

  // Broadcast to website using repertoire-sync module
  if (isHomeTerritoryPage) {
    broadcastConstellationUpdate(
      mappedNodes,
      constellationState.edges,
      constellationState.patterns
    )
  }
}

function addSpellNode(spell: SpellNode['spell'], position: Position): void {
  const node: SpellNode = {
    id: crypto.randomUUID(),
    spell,
    x: position.x,
    y: position.y,
    opacity: 1,
    pulse: 0,
    castAt: Date.now()
  }

  constellationState.nodes.push(node)
  updateConstellation()

  // Award mana for spell cast (10 casts = 1 mana)
  chrome.runtime.sendMessage({
    type: 'ADD_MANA',
    amount: 0.1,
    eventType: 'earn_spell',
    domain: location.hostname,
    details: spell.content
  })
}

// ============================================
// DRAKE EMERGENCE ENGINE
// ============================================

function checkDrakeEligibility(scan: DeepScanFindings): void {
  const trackerCount = Object.values(scan.trackerCategories).flat().length
  const darkPatternCount = scan.darkPatterns.preCheckedConsent + (scan.darkPatterns.hiddenReject ? 1 : 0)

  drakeState.eligible =
    trackerCount >= 10 ||
    darkPatternCount >= 1 ||
    scan.privacyPolicyAnalysis.score < 0.3 ||
    location.hostname.includes('agentprivacy.ai')

  if (drakeState.eligible) {
    console.log('[Mage Content] Drake eligible on this page')
  }
}

function initiateDrakeFormation(): void {
  if (!drakeState.eligible || constellationState.nodes.length < 7) {
    console.log('[Mage Content] Drake formation requirements not met')
    return
  }

  drakeState.summoned = true
  drakeState.formationProgress = 0
  drakeState.bodyNodes = computeDrakeBodyNodes()
  drakeState.patrolPath = computePatrolPath()

  // Start formation animation
  const animate = () => {
    drakeState.formationProgress += 0.02
    if (drakeState.formationProgress < 1) {
      requestAnimationFrame(animate)
    }
    sendDrakeToSword()
  }
  requestAnimationFrame(animate)
}

function computeDrakeBodyNodes(): DrakeBodyNode[] {
  const pvmConditions: DrakeBodyNode['pvmCondition'][] = ['P', 'C', 'Q', 'S', 'network', 'phi', 'R']

  // Sort nodes by angle from center
  const cx = constellationState.nodes.reduce((s, n) => s + n.x, 0) / constellationState.nodes.length
  const cy = constellationState.nodes.reduce((s, n) => s + n.y, 0) / constellationState.nodes.length

  const sorted = [...constellationState.nodes].sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx)
    const angleB = Math.atan2(b.y - cy, b.x - cx)
    return angleA - angleB
  })

  return sorted.slice(0, 7).map((node, i) => ({
    nodeId: node.id,
    pvmCondition: pvmConditions[i],
    position: { x: node.x, y: node.y },
    health: 1.0
  }))
}

function computePatrolPath(): Position[] {
  // Create patrol path around the constellation
  const cx = constellationState.nodes.reduce((s, n) => s + n.x, 0) / constellationState.nodes.length
  const cy = constellationState.nodes.reduce((s, n) => s + n.y, 0) / constellationState.nodes.length
  const radius = 150

  const path: Position[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    path.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    })
  }
  return path
}

function sendDrakeToSword(): void {
  if (!drakeState.summoned) return

  sendToSword({
    type: 'DRAKE_FORMATION',
    bodyNodes: drakeState.bodyNodes,
    patrolPath: drakeState.patrolPath,
    formationProgress: drakeState.formationProgress
  })
}

// ============================================
// HEXAGRAM ENGINE
// ============================================

function mutateHexagram(trigger: 'scroll' | 'spell' | 'time' | 'user'): void {
  const lineIndex = trigger === 'scroll'
    ? Math.floor((window.scrollY / document.body.scrollHeight) * 6) % 6
    : trigger === 'spell'
    ? constellationState.nodes.length % 6
    : Math.floor(Math.random() * 6)

  hexagramState.lines[lineIndex] = hexagramState.lines[lineIndex] === 1 ? 0 : 1

  // Calculate hexagram number
  hexagramState.number = hexagramState.lines.reduce((acc, line, i) => acc + line * Math.pow(2, 5 - i), 0) + 1

  // Send update to Swordsman
  sendHexagramUpdate()
}

function hexagramToAnimationParams(): AnimationParams {
  return {
    orbitRadii: hexagramState.lines[0] ? 0.7 : 1.0,
    spellSpawnRate: hexagramState.lines[1] ? 0.8 : 0.3,
    phaseCoupling: hexagramState.lines[2] ? 0.8 : 0.2,
    edgeThreshold: hexagramState.lines[3] ? 120 : 220,
    glowIntensity: hexagramState.lines[4] ? 0.4 : 0.15,
    gridVisibility: hexagramState.lines[5] ? 0.08 : 0.02
  }
}

function sendHexagramUpdate(): void {
  sendToSword({
    type: 'HEXAGRAM_UPDATE',
    state: hexagramState,
    animationParams: hexagramToAnimationParams()
  })
}

// Mutate on scroll
let lastScrollY = 0
window.addEventListener('scroll', () => {
  const scrollDelta = Math.abs(window.scrollY - lastScrollY)
  if (scrollDelta > 500) {
    mutateHexagram('scroll')
    lastScrollY = window.scrollY
  }
}, { passive: true })

// ============================================
// HOME TERRITORY MODE
// ============================================

let websiteListenerCleanup: (() => void) | null = null

function activateHomeTerritoryMode(): void {
  console.log('[Mage Content] Activating home territory mode:', homeTerritoryType)

  // Setup website message listener using repertoire-sync module
  websiteListenerCleanup = setupWebsiteListener({
    onRepertoireSync: async (repertoire) => {
      console.log('[Mage Content] Repertoire sync received:', repertoire.learnedSpells.length, 'spells')
      // Re-sync with training ground
      await syncWithTrainingGround()
    },

    onPathUnlocked: async (progress) => {
      console.log('[Mage Content] Path unlocked!', progress)
      // Update loadout with new unlocked spells
      const { unlocked } = await syncFromTrainingGround()
      if (unlocked.length > 0) {
        currentLoadout = await updateLoadoutWithUnlocked(unlocked)
      }
    },

    onSpellbookUnlocked: (grimoire) => {
      console.log('[Mage Content] Spellbook unlocked:', grimoire)
      chrome.runtime.sendMessage({
        type: 'GRIMOIRE_UNLOCKED',
        grimoire
      })
    },

    onManaEarned: (amount, reason) => {
      chrome.runtime.sendMessage({
        type: 'ADD_MANA',
        amount,
        eventType: 'website_earn',
        domain: location.hostname,
        details: reason
      })
    },

    onManaSpent: (amount, reason) => {
      chrome.runtime.sendMessage({
        type: 'SPEND_MANA',
        amount,
        eventType: 'website_spend',
        domain: location.hostname,
        details: reason
      })
    }
  })

  // Also listen for additional website messages
  window.addEventListener('message', handleWebsiteMessage)

  // Announce presence to the website
  announceToWebsite()

  // Re-announce periodically in case website loads after extension
  setInterval(announceToWebsite, 5000)
}

function announceToWebsite(): void {
  announceMagePresence({ x: mageOrbState.x, y: mageOrbState.y })

  // Also send extended announcement with capabilities
  window.postMessage({
    type: 'MAGE_PRESENT',
    domain: location.hostname,
    orbPosition: { x: mageOrbState.x, y: mageOrbState.y },
    homeTerritoryType,
    capabilities: ['deep-scan', 'constellation', 'hexagram', 'drake', 'spell-orbit'],
    spellCount: SPELL_MATHEMATICS.total,
    orbitCount: SPELL_MATHEMATICS.orbit,
    reserveCount: SPELL_MATHEMATICS.reserve
  }, '*')
}

function handleWebsiteMessage(event: MessageEvent): void {
  // Only handle messages from same origin
  if (event.origin !== location.origin) return

  const { data } = event
  if (!data || !data.type) return

  switch (data.type) {
    case 'WEBSITE_READY':
      console.log('[Mage Content] Website ready, capabilities:', data.capabilities)
      // Re-announce to confirm connection
      announceToWebsite()
      break

    case 'CEREMONY_CONFIRMATION':
      console.log('[Mage Content] Inscription confirmed:', data.action)
      break

    case 'CEREMONY_ERROR':
      console.warn('[Mage Content] Inscription error:', data.reason)
      break

    case 'PROVERB_INSCRIBED':
      console.log('[Mage Content] Proverb inscribed:', data.proverbId)
      // Award mana for inscription
      chrome.runtime.sendMessage({
        type: 'ADD_MANA',
        amount: 1,
        eventType: 'proverb_inscribed',
        domain: location.hostname,
        details: data.tale
      })
      break
  }
}

function inscribeOnTerritory(action: string, data: any): void {
  window.postMessage({
    type: 'CEREMONY_INSCRIPTION',
    action,
    ...data
  }, '*')
}

// ============================================
// MESSAGE HANDLING
// ============================================

function setupMessageListeners(): void {
  // From background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'SWORD_ORB_POSITION':
        swordOrbPosition = { x: message.x, y: message.y }
        break

      case 'SLASH_EVENT':
        // Add spell node at slash location
        addSpellNode({
          type: 'keyword',
          content: message.data.assertion,
          yangYin: 'yang'
        }, { x: mageOrbState.x, y: mageOrbState.y })
        break

      case 'WARD_EVENT':
        // Update hexagram
        mutateHexagram('spell')
        break

      case 'CRYSTALLISE':
        // Lock constellation
        console.log('[Mage Content] Constellation crystallised')
        break

      case 'DRAKE_SUMMON_REQUEST':
        initiateDrakeFormation()
        break
    }
    sendResponse({ received: true })
  })

  // From Swordsman extension (external)
  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (sender.id !== SWORDSMAN_EXTENSION_ID) return

    switch (message.type) {
      case 'SWORD_PRESENT':
        swordPresent = true
        swordOrbPosition = message.orbPosition || { x: 0, y: 0 }
        sendResponse({
          type: 'MAGE_ACKNOWLEDGE',
          orbPosition: { x: mageOrbState.x, y: mageOrbState.y },
          spellbookState: []
        })
        if (!swordPresent) {
          runFullCeremonyMode()
        }
        break

      case 'ORB_POSITION':
        swordOrbPosition = { x: message.x, y: message.y }
        sendResponse({ acknowledged: true })
        break
    }
  })
}

// ============================================
// SEND TO SWORDSMAN
// ============================================

function sendToSword(message: MageMessage): void {
  if (!swordPresent) return

  try {
    chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, message)
  } catch (error) {
    console.error('[Mage Content] Failed to send to Swordsman:', error)
  }
}

// ============================================
// START
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}

console.log('[Mage Content] Script loaded')
