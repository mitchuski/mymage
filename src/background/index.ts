/**
 * Mage Extension - Background Service Worker
 *
 * The spell that projects sovereignty across distance. Handles:
 * - Swordsman handshake and dependency check
 * - Knowledge graph management
 * - Intel pool state
 * - Grimoire data loading
 * - Mana balance tracking
 */

import { SWORDSMAN_EXTENSION_ID } from '@agentprivacy/shared-types'
import type {
  MageToSwordMessage,
  SwordToMageMessage,
  DeepScanFindings,
  HexagramState
} from '@agentprivacy/shared-types'

// ============================================
// STATE
// ============================================

let swordDetected = false
let sharedSecret: CryptoKey | null = null
let grimoireLoaded = false

interface ManaState {
  balance: number
  totalEarned: number
  totalSpent: number
  history: ManaEvent[]
  lastSyncWithMageMode: number
}

interface ManaEvent {
  type: 'earn_spell' | 'earn_ceremony' | 'earn_magemode' | 'spend_inscription'
  amount: number
  timestamp: number
  domain?: string
  details?: string
}

// ============================================
// INITIALIZATION
// ============================================

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Mage] Extension installed:', details.reason)

  if (details.reason === 'install') {
    await initializeGrimoire()
    await initializeManaState()
  }

  startSwordDetection()
})

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Mage] Extension started')
  await loadState()
  startSwordDetection()
})

// ============================================
// GRIMOIRE MANAGEMENT
// ============================================

async function initializeGrimoire(): Promise<void> {
  // Load grimoire data from bundled JSON files
  const grimoireState = {
    spellbooks: ['story', 'zk', 'canon', 'parallel', 'plurality'],
    loaded: true,
    spellCount: 0
  }

  await chrome.storage.local.set({ grimoireState })
  grimoireLoaded = true
  console.log('[Mage] Grimoire initialized')
}

async function loadState(): Promise<void> {
  const data = await chrome.storage.local.get(['grimoireState', 'manaState', 'knowledgeGraph'])
  grimoireLoaded = data.grimoireState?.loaded || false
  console.log('[Mage] State loaded')
}

// ============================================
// MANA SYSTEM
// ============================================

async function initializeManaState(): Promise<void> {
  const defaultState: ManaState = {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    history: [],
    lastSyncWithMageMode: 0
  }

  await chrome.storage.local.set({ manaState: defaultState })
  console.log('[Mage] Mana state initialized')
}

async function addMana(amount: number, type: ManaEvent['type'], domain?: string, details?: string): Promise<void> {
  const data = await chrome.storage.local.get('manaState')
  const state: ManaState = data.manaState || { balance: 0, totalEarned: 0, totalSpent: 0, history: [], lastSyncWithMageMode: 0 }

  state.balance += amount
  state.totalEarned += amount
  state.history.push({
    type,
    amount,
    timestamp: Date.now(),
    domain,
    details
  })

  // Keep only last 100 events
  if (state.history.length > 100) {
    state.history = state.history.slice(-100)
  }

  await chrome.storage.local.set({ manaState: state })
  console.log(`[Mage] Mana earned: +${amount} (total: ${state.balance})`)
}

// ============================================
// SWORDSMAN COMMUNICATION
// ============================================

function startSwordDetection(): void {
  // Periodic ping to check if Swordsman is installed
  setInterval(async () => {
    try {
      await chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, { type: 'PING' })
      if (!swordDetected) {
        console.log('[Mage] Swordsman extension detected!')
        swordDetected = true
        await performKeyExchange()
      }
    } catch {
      if (swordDetected) {
        console.log('[Mage] Swordsman extension disconnected')
        swordDetected = false
        sharedSecret = null
      }
    }
  }, 5000)
}

async function performKeyExchange(): Promise<void> {
  // Generate ephemeral keypair
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  )

  // Export and send public key
  const publicKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey)

  const response = await chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, {
    type: 'KEY_EXCHANGE',
    publicKey
  })

  if (response?.publicKey) {
    // Import Swordsman's public key
    const swordPublicKey = await crypto.subtle.importKey(
      'jwk',
      response.publicKey,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    )

    // Derive shared secret
    sharedSecret = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: swordPublicKey },
      keyPair.privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )

    console.log('[Mage] Key exchange complete')
  }
}

async function sendToSword(message: MageToSwordMessage): Promise<void> {
  if (!swordDetected) {
    console.log('[Mage] Swordsman not detected, message not sent')
    return
  }

  try {
    await chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, message)
  } catch (error) {
    console.error('[Mage] Failed to send to Swordsman:', error)
  }
}

// ============================================
// MESSAGE HANDLERS
// ============================================

// From Swordsman extension
chrome.runtime.onMessageExternal.addListener(
  (message: SwordToMageMessage, sender, sendResponse) => {
    if (sender.id !== SWORDSMAN_EXTENSION_ID) {
      console.warn('[Mage] Received message from unknown extension')
      return
    }

    handleSwordMessage(message, sendResponse)
    return true // Async response
  }
)

async function handleSwordMessage(
  message: SwordToMageMessage,
  sendResponse: (response: unknown) => void
): Promise<void> {
  switch (message.type) {
    case 'SWORD_PRESENT':
      console.log('[Mage] Swordsman presence confirmed on:', message.domain)
      swordDetected = true
      sendResponse({
        type: 'MAGE_ACKNOWLEDGE',
        orbPosition: { x: 100, y: 100 }, // Default position
        spellbookState: await getAvailableSpells()
      })
      break

    case 'ORB_POSITION':
      // Forward to content script for reflow calculations
      notifyContentScript({ type: 'SWORD_ORB_POSITION', x: message.x, y: message.y })
      sendResponse({ acknowledged: true })
      break

    case 'SLASH':
      console.log('[Mage] Swordsman slashed:', message.target)
      // Record in constellation
      notifyContentScript({ type: 'SLASH_EVENT', data: message })
      sendResponse({ acknowledged: true })
      break

    case 'WARD':
      console.log('[Mage] Swordsman set ward:', message.boundary)
      // Update hexagram
      notifyContentScript({ type: 'WARD_EVENT', data: message })
      sendResponse({ acknowledged: true })
      break

    case 'TERM_ASSERT':
      console.log('[Mage] MyTerms asserted on:', message.domain)
      // Crystallise constellation
      notifyContentScript({ type: 'CRYSTALLISE', data: message })
      // Award mana for ceremony completion
      await addMana(2, 'earn_ceremony', message.domain, 'convergence')
      sendResponse({ acknowledged: true })
      break

    case 'CEREMONY_BEGIN':
      console.log('[Mage] Ceremony initiated by Swordsman:', message.ceremonyType)
      notifyContentScript({ type: 'CEREMONY_FROM_SWORD', data: message })
      sendResponse({ acknowledged: true })
      break

    case 'SUMMON_DRAKE':
      console.log('[Mage] Drake summon requested')
      notifyContentScript({ type: 'DRAKE_SUMMON_REQUEST', conditions: message.conditions })
      sendResponse({ acknowledged: true })
      break

    case 'KEY_EXCHANGE':
      // Return our public key (handled in performKeyExchange)
      sendResponse({ acknowledged: true })
      break

    default:
      console.log('[Mage] Unknown message type:', (message as any).type)
      sendResponse({ error: 'Unknown message type' })
  }
}

// From content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleContentMessage(message, sender.tab?.id, sendResponse)
  return true
})

async function handleContentMessage(
  message: any,
  tabId: number | undefined,
  sendResponse: (response: unknown) => void
): Promise<void> {
  switch (message.type) {
    case 'DEEP_SCAN_COMPLETE':
      console.log('[Mage] Deep scan complete for:', message.data.domain)
      // Store in knowledge graph
      await storeIntelligence(message.data)
      sendResponse({ success: true })
      break

    case 'SEND_TO_SWORD':
      await sendToSword(message.payload)
      sendResponse({ sent: true })
      break

    case 'REQUEST_STATE':
      sendResponse({
        swordDetected,
        grimoireLoaded,
        manaState: await chrome.storage.local.get('manaState')
      })
      break

    case 'ADD_MANA':
      await addMana(message.amount, message.eventType, message.domain, message.details)
      sendResponse({ success: true })
      break

    case 'GET_GRIMOIRE_SPELLS':
      sendResponse(await getAvailableSpells())
      break

    default:
      sendResponse({ error: 'Unknown message type' })
  }
}

// ============================================
// INTELLIGENCE STORAGE
// ============================================

async function storeIntelligence(findings: DeepScanFindings): Promise<void> {
  const data = await chrome.storage.local.get('knowledgeGraph')
  const graph = data.knowledgeGraph || { domains: {} }

  graph.domains[findings.domain] = {
    ...findings,
    lastScanned: Date.now()
  }

  await chrome.storage.local.set({ knowledgeGraph: graph })
  console.log('[Mage] Intelligence stored for:', findings.domain)
}

async function getAvailableSpells(): Promise<string[]> {
  // Return list of available spell IDs from grimoire
  // For now, return placeholder
  return ['emoji_shield', 'proverb_trust', 'keyword_dnt', 'hexagram_1']
}

// ============================================
// UTILITIES
// ============================================

async function notifyContentScript(message: any): Promise<void> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(tabs[0].id, message)
  }
}

console.log('[Mage] Background service worker initialized')
