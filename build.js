/**
 * Mage Extension Build Script
 *
 * Uses esbuild to bundle TypeScript into browser-ready JavaScript
 */

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'

const outdir = 'dist'

// Ensure dist directories exist
const dirs = [
  'dist',
  'dist/background',
  'dist/content',
  'dist/popup'
]

for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Common esbuild options
const commonOptions = {
  bundle: true,
  platform: 'browser',
  target: 'chrome110',
  sourcemap: true,
  alias: {
    '@shared': '../shared',
    '@shared/types': '../shared/types',
    '@agentprivacy/shared-types': '../shared/types'
  }
}

// Build background service worker
await esbuild.build({
  ...commonOptions,
  entryPoints: ['src/background/index.ts'],
  outfile: 'dist/background/index.js',
  format: 'esm'
})

// Build content script
await esbuild.build({
  ...commonOptions,
  entryPoints: ['src/content/index.ts'],
  outfile: 'dist/content/index.js',
  format: 'iife'
})

// Copy manifest
fs.copyFileSync('manifest.json', 'dist/manifest.json')

// Copy bundled grimoires (web_accessible_resources)
const grimoires = [
  'privacymage_grimoire_v10_2_0.json',
  'city_of_mages_grimoire_v1_2_0.json'
]
for (const g of grimoires) {
  if (fs.existsSync(g)) {
    fs.copyFileSync(g, path.join('dist', g))
  }
}

// Copy assets if they exist
if (fs.existsSync('assets')) {
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
  copyDir('assets', 'dist/assets')
}

// Create placeholder popup
const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      background: #1a2e1a;
      color: #eee;
    }
    h1 {
      font-size: 16px;
      margin: 0 0 12px;
      color: #5DCAA5;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1D9E75;
    }
    .dot.sword { background: #534AB7; }
    .stat {
      color: #888;
      font-size: 11px;
    }
    .section {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #333;
    }
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 8px;
    }
    .intel-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .intel-value {
      color: #5DCAA5;
    }
    .mana {
      font-size: 14px;
      color: #EF9F27;
      margin: 8px 0;
    }
    .hexagram {
      font-family: monospace;
      font-size: 12px;
      letter-spacing: 2px;
    }
    .warning {
      color: #E24B4A;
      font-size: 11px;
      padding: 8px;
      background: rgba(226, 75, 74, 0.1);
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>✦ Mage</h1>

  <div class="status">
    <span class="dot"></span>
    <span id="domain">—</span>
  </div>

  <div id="sword-warning" class="warning" style="display: none;">
    Swordsman not detected. Read-only mode.
  </div>

  <div class="section">
    <div class="section-title">Swordsman Status</div>
    <div class="status">
      <span class="dot sword" id="sword-dot" style="opacity: 0.3"></span>
      <span id="sword-status">Not detected</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Intelligence</div>
    <div class="intel-item">
      <span>Trackers</span>
      <span class="intel-value" id="trackers">—</span>
    </div>
    <div class="intel-item">
      <span>Dark patterns</span>
      <span class="intel-value" id="dark-patterns">—</span>
    </div>
    <div class="intel-item">
      <span>Gap score</span>
      <span class="intel-value" id="gap">—</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Hexagram</div>
    <div class="hexagram" id="hexagram">━ ━ ━ ━ ━ ━</div>
  </div>

  <div class="section">
    <div class="section-title">Mana</div>
    <div class="mana">✦ <span id="mana">0</span></div>
  </div>

  <script src="popup.js"></script>
</body>
</html>`

fs.writeFileSync('dist/popup/popup.html', popupHtml)

// Create popup script
const popupJs = `
// Get current tab
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tab = tabs[0]
  if (!tab?.id) return

  // Get domain
  try {
    const url = new URL(tab.url)
    document.getElementById('domain').textContent = url.hostname
  } catch {}

  // Request state from background
  chrome.runtime.sendMessage({ type: 'REQUEST_STATE' }, (response) => {
    if (chrome.runtime.lastError) return

    if (response) {
      // Swordsman status
      if (response.swordDetected) {
        document.getElementById('sword-dot').style.opacity = '1'
        document.getElementById('sword-status').textContent = 'Connected'
        document.getElementById('sword-warning').style.display = 'none'
      } else {
        document.getElementById('sword-warning').style.display = 'block'
      }

      // Mana
      if (response.manaState?.mana_state) {
        document.getElementById('mana').textContent = response.manaState.mana_state.balance || 0
      }
    }
  })
})

// Hexagram display helper
function renderHexagram(lines) {
  // lines is [0|1, 0|1, 0|1, 0|1, 0|1, 0|1]
  // 1 = yang (solid), 0 = yin (broken)
  return lines.map(l => l === 1 ? '━━━' : '━ ━').join(' ')
}
`

fs.writeFileSync('dist/popup/popup.js', popupJs)

console.log('✅ Mage extension built successfully')
console.log('   Load "dist" folder in chrome://extensions')
