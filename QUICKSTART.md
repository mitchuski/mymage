# Quick Start: Extension + Training Grounds Integration

## What We've Built

1. **Mage extension** now recognizes `localhost:5000` as home territory
2. **Website-to-extension bridge** (`extension-bridge.ts`) enables bidirectional communication
3. **ExtensionBridgeContext** React context provides hooks for components
4. **Extensions announce presence** to the website via `postMessage`

## Setup Steps

### 1. Install Dependencies

```bash
cd C:\Users\mitch\pretext-agentprivacy
npm install

# If workspace install fails, install individually:
cd shared && npm install && cd ..
cd mage-spells && npm install && cd ..
cd swordsman-blade && npm install && cd ..
```

### 2. Build Extensions

```bash
# Build both extensions
npm run build

# Or individually:
cd mage-spells && npm run build
cd swordsman-blade && npm run build
```

### 3. Load Extensions in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select `C:\Users\mitch\pretext-agentprivacy\mage-spells\dist`
5. Repeat for `C:\Users\mitch\pretext-agentprivacy\swordsman-blade\dist`
6. Note the extension IDs shown in Chrome

### 4. Run Training Grounds

```bash
cd C:\Users\mitch\agentprivacy_master
npm install
npm run dev
```

Open http://localhost:5000 in Chrome

### 5. Verify Integration

Open browser DevTools (F12) and check the console. You should see:

```
[ExtensionBridge] Initialized and listening for extensions
[Mage Content] Home territory detected: agentprivacy
[Mage Content] Activating home territory mode: agentprivacy
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Training Grounds (localhost:5000)                          │
│  ┌─────────────────────────────────────────────────────────┐
│  │  ExtensionBridgeProvider                                │
│  │    ├── Listens for: MAGE_PRESENT, SWORD_PRESENT         │
│  │    ├── Sends: WEBSITE_READY, PROVERB_INSCRIBED          │
│  │    └── State: isConnected, isDualMode, manaBalance      │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
           ▲                           ▲
           │ window.postMessage        │ window.postMessage
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Mage Extension      │◄──►│  Swordsman Extension │
│  (Content Script)    │    │  (Content Script)    │
│  ├── Deep scan       │    │  ├── Canvas overlay  │
│  ├── Constellation   │    │  ├── Spring physics  │
│  └── Hexagram        │    │  └── MyTerms         │
└──────────────────────┘    └──────────────────────┘
           │                           │
           │ chrome.runtime            │ chrome.runtime
           │ .sendMessageExternal      │ .sendMessageExternal
           ▼                           ▼
    ┌─────────────────────────────────────────┐
    │  Dual-Extension Communication           │
    │  (ECDH key exchange, ceremony messages) │
    └─────────────────────────────────────────┘
```

## Using the Extension Bridge in Components

```tsx
import { useExtensionBridge, useExtensionStatus } from '@/contexts/ExtensionBridgeContext'

function MyComponent() {
  const { isConnected, state, earnMana } = useExtensionBridge()

  // Check if extension detected
  if (isConnected) {
    console.log('Extension mana balance:', state.manaBalance)
  }

  // Award mana when user completes action
  const handleProverbSubmit = () => {
    earnMana(1, 'proverb_submitted')
  }

  return (
    <div>
      {isConnected ? 'Extension connected' : 'No extension detected'}
    </div>
  )
}
```

## Key Files Modified

### pretext-agentprivacy (Extensions)
- `mage-spells/src/content/index.ts` - Home territory detection + website sync
- `mage-spells/manifest.json` - Updated externally_connectable
- `swordsman-blade/manifest.json` - Updated externally_connectable
- `*/build.js` - Build config with shared types alias

### agentprivacy_master (Training Grounds)
- `src/lib/extension-bridge.ts` - Communication layer (NEW)
- `src/contexts/ExtensionBridgeContext.tsx` - React context (NEW)
- `src/app/layout.tsx` - Added ExtensionBridgeProvider

## Next Steps

1. **Test the build** - Run `npm run build` in pretext-agentprivacy
2. **Load extensions** - Follow steps above
3. **Verify detection** - Check console logs on localhost:5000
4. **Add UI indicators** - Use `useExtensionStatus()` to show connection status
5. **Sync mana** - Connect mana economy between website and extensions
