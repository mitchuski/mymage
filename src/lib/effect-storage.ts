/**
 * Effect Storage - CRUD operations for Pretext cursor effects
 *
 * Manages user's effect library using chrome.storage.local
 * Handles effect creation, updates, deletion, and active effect tracking.
 *
 * NOTE: This is the Mage version - default effect is 'spell-orb'
 */

import type {
  PretextEffect,
  EffectLibrary,
  EffectSettings,
  ActiveExtensionMode
} from '@agentprivacy/shared-types'

// Re-export for convenience
export type { PretextEffect, EffectLibrary, EffectSettings, ActiveExtensionMode }

// Storage keys
const STORAGE_KEYS = {
  library: 'pretext_effect_library',
  activeEffect: 'pretext_active_effect',
  activeExtension: 'pretext_active_extension',
  settings: 'pretext_effect_settings'
} as const

// ============================================
// LIBRARY MANAGEMENT
// ============================================

/**
 * Get the full effect library
 */
export async function getEffectLibrary(): Promise<EffectLibrary> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.library)
  const library = result[STORAGE_KEYS.library] as EffectLibrary | undefined

  if (!library || library.version !== '1.0') {
    return createDefaultLibrary()
  }

  return library
}

/**
 * Save the effect library
 */
export async function saveEffectLibrary(library: EffectLibrary): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.library]: library })
}

/**
 * Create a default library with built-in presets
 */
function createDefaultLibrary(): EffectLibrary {
  return {
    version: '1.0',
    activeEffectId: 'spell-orb', // Default Mage effect
    effects: [], // Presets are added separately
    settings: {
      activeExtension: 'dual',
      globalOpacity: 0.9,
      disabledDomains: [],
      showOnHomeTerritoryOnly: false,
      trackingVisualization: true
    }
  }
}

// ============================================
// EFFECT CRUD
// ============================================

/**
 * Get all effects (user + builtin)
 */
export async function getAllEffects(): Promise<PretextEffect[]> {
  const library = await getEffectLibrary()
  return library.effects
}

/**
 * Get a specific effect by ID
 */
export async function getEffect(id: string): Promise<PretextEffect | null> {
  const library = await getEffectLibrary()
  return library.effects.find(e => e.id === id) || null
}

/**
 * Add a new effect
 */
export async function addEffect(effect: Omit<PretextEffect, 'id' | 'createdAt'>): Promise<PretextEffect> {
  const library = await getEffectLibrary()

  const newEffect: PretextEffect = {
    ...effect,
    id: generateEffectId(),
    createdAt: Date.now()
  }

  library.effects.push(newEffect)
  await saveEffectLibrary(library)

  return newEffect
}

/**
 * Update an existing effect
 */
export async function updateEffect(id: string, updates: Partial<PretextEffect>): Promise<PretextEffect | null> {
  const library = await getEffectLibrary()
  const index = library.effects.findIndex(e => e.id === id)

  if (index === -1) return null

  library.effects[index] = {
    ...library.effects[index],
    ...updates,
    id // Ensure ID can't be changed
  }

  await saveEffectLibrary(library)
  return library.effects[index]
}

/**
 * Delete an effect
 */
export async function deleteEffect(id: string): Promise<boolean> {
  const library = await getEffectLibrary()
  const initialLength = library.effects.length

  library.effects = library.effects.filter(e => e.id !== id)

  if (library.effects.length < initialLength) {
    // If deleted effect was active, clear active
    if (library.activeEffectId === id) {
      library.activeEffectId = null
    }
    await saveEffectLibrary(library)
    return true
  }

  return false
}

// ============================================
// ACTIVE EFFECT
// ============================================

/**
 * Get the currently active effect
 */
export async function getActiveEffect(): Promise<PretextEffect | null> {
  const library = await getEffectLibrary()

  if (!library.activeEffectId) return null

  return library.effects.find(e => e.id === library.activeEffectId) || null
}

/**
 * Set the active effect
 */
export async function setActiveEffect(effectId: string | null): Promise<void> {
  const library = await getEffectLibrary()
  library.activeEffectId = effectId
  await saveEffectLibrary(library)

  // Notify content scripts
  broadcastEffectChange(effectId)
}

/**
 * Broadcast effect change to all tabs
 */
async function broadcastEffectChange(effectId: string | null): Promise<void> {
  const effect = effectId ? await getEffect(effectId) : null

  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      try {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ACTIVE_EFFECT_CHANGED',
          effectId,
          effect
        })
      } catch {
        // Tab may not have content script
      }
    }
  }
}

// ============================================
// ACTIVE EXTENSION MODE
// ============================================

/**
 * Get the active extension mode
 */
export async function getActiveExtension(): Promise<ActiveExtensionMode> {
  const library = await getEffectLibrary()
  return library.settings.activeExtension
}

/**
 * Set the active extension mode
 */
export async function setActiveExtension(mode: ActiveExtensionMode): Promise<void> {
  const library = await getEffectLibrary()
  library.settings.activeExtension = mode
  await saveEffectLibrary(library)

  // Notify all tabs
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      try {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ACTIVE_EXTENSION_CHANGED',
          active: mode
        })
      } catch {
        // Tab may not have content script
      }
    }
  }

  // Notify the other extension
  const { SWORDSMAN_EXTENSION_ID } = await import('@agentprivacy/shared-types')
  try {
    chrome.runtime.sendMessage(SWORDSMAN_EXTENSION_ID, {
      type: 'ACTIVE_EXTENSION_CHANGED',
      active: mode
    })
  } catch {
    // Other extension may not be installed
  }
}

// ============================================
// SETTINGS
// ============================================

/**
 * Get effect settings
 */
export async function getEffectSettings(): Promise<EffectSettings> {
  const library = await getEffectLibrary()
  return library.settings
}

/**
 * Update effect settings
 */
export async function updateEffectSettings(updates: Partial<EffectSettings>): Promise<EffectSettings> {
  const library = await getEffectLibrary()
  library.settings = { ...library.settings, ...updates }
  await saveEffectLibrary(library)
  return library.settings
}

/**
 * Check if effects are disabled for a domain
 */
export async function isDomainDisabled(domain: string): Promise<boolean> {
  const settings = await getEffectSettings()
  return settings.disabledDomains.includes(domain)
}

/**
 * Toggle domain disabled state
 */
export async function toggleDomainDisabled(domain: string): Promise<boolean> {
  const library = await getEffectLibrary()
  const index = library.settings.disabledDomains.indexOf(domain)

  if (index === -1) {
    library.settings.disabledDomains.push(domain)
  } else {
    library.settings.disabledDomains.splice(index, 1)
  }

  await saveEffectLibrary(library)
  return index === -1 // Returns true if now disabled
}

// ============================================
// UTILITIES
// ============================================

/**
 * Generate a unique effect ID
 */
function generateEffectId(): string {
  return `effect_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Import effects from JSON
 */
export async function importEffects(effects: PretextEffect[]): Promise<number> {
  const library = await getEffectLibrary()
  let imported = 0

  for (const effect of effects) {
    // Generate new ID to avoid conflicts
    const newEffect: PretextEffect = {
      ...effect,
      id: generateEffectId(),
      createdAt: Date.now(),
      source: 'shared'
    }
    library.effects.push(newEffect)
    imported++
  }

  await saveEffectLibrary(library)
  return imported
}

/**
 * Export user effects as JSON
 */
export async function exportEffects(): Promise<PretextEffect[]> {
  const library = await getEffectLibrary()
  return library.effects.filter(e => e.source === 'user')
}

/**
 * Reset to default library
 */
export async function resetEffectLibrary(): Promise<void> {
  const defaultLibrary = createDefaultLibrary()
  await saveEffectLibrary(defaultLibrary)
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize effect storage with presets
 */
export async function initEffectStorage(presets: PretextEffect[]): Promise<void> {
  const library = await getEffectLibrary()

  // Add presets that don't already exist
  for (const preset of presets) {
    if (!library.effects.some(e => e.id === preset.id)) {
      library.effects.push(preset)
    }
  }

  await saveEffectLibrary(library)
  console.log('[EffectStorage] Initialized with', library.effects.length, 'effects')
}
