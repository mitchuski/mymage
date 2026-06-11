# AETHER — The Shared Substrate

**What the Swordsman and the Mage share that makes the dual-extension architecture work.**

> **Naming clarification (added 2026-05-09):** This `AETHER.md` is the **technical wire-protocol substrate** between the two browser extensions — TypeScript types, message protocol, storage contract, crypto contract, meaning contract. It is **not** the cosmological *Aether Blade*. The Aether Blade — Greek Aether = medieval Quintessence = the Gap (⿻) — is the third blade in the sky-family alongside the Sun Blade and the Moon Blade. It is documented in `agentprivacy-docs/research/aether-blade-ceremony-circuit.md` and shipped as `AETHER_BLADE_PRESET` in `spellweb/src/data/presets.ts`. Both meanings of *Aether* coexist; context disambiguates. The technical Aether is **infrastructure**; the cosmological Aether is **ceremony**.

This file is **identical** in both repositories. If the Swordsman's copy and the Mage's copy disagree, one of them is wrong and the contract is broken. Keep them in sync.

Paired repositories:

- [mitchuski/swordsman](https://github.com/mitchuski/swordsman) — agreement layer
- [mitchuski/mage](https://github.com/mitchuski/mage) — delegation layer

---

## The One-Paragraph Picture

Two browser extensions run side-by-side on every page. Neither one is the whole product. The **Swordsman** sits at the IEEE 7012 boundary: it presents terms, signs the bilateral agreement, and records the chronicle. The **Mage** operates inside whatever the Swordsman has signed: it analyzes the page, suggests spells, shapes the First Person's Γ-posture (inference/output control), and delegates action within the agreed envelope. The two talk to each other across a small, versioned wire protocol — message types, a shared repertoire in `localStorage`, a derived `CryptoKey` for private exchanges, and a handful of numeric thresholds and timings. Everything else lives inside one extension or the other. **This document is that wire.**

---

## Three Layers of Sharing

The aether has three distinct layers. Every shared concern lives in exactly one of them.

| Layer | What lives here | Source of truth |
|---|---|---|
| **Types** | TypeScript definitions for messages, repertoire, ceremony, blade, spell, effects | `shared/types/` in each repo (duplicated, must be kept identical) |
| **Data** | Sticker repertoire, grimoire content, cast history, training progress | `localStorage` (website-written) + `privacymage_grimoire_v10_*.json` (shipped in both extensions) |
| **Meaning** | Σ boundary, yang/yin polarity, sticker hex semantics, four-glyph inscription, IEEE 7012 framing | Design docs in both repos (this file, `INTERFACE_CONTRACT.md`, `DUAL_EXTENSION_ARCHITECTURE.md`, the V2 plan) |

---

## Layer 1 — The Types Contract

Both repos carry an identical `shared/types/` directory. The source of this identity is *discipline*, not tooling — if you change one, you must change the other before the next build.

```
shared/types/
├── index.ts           # re-exports + extension IDs + thresholds + timings + colors
├── spell.ts           # Spell, SignedSpell, SpellSuggestion, Vector2
├── blade.ts           # Blade, Forging, Hexagram, HexagramState
├── channel.ts         # SwordToMage / MageToSword message types + ceremony
├── ceremony-types.ts  # Ceremony choreography primitives
├── repertoire.ts      # SpellRepertoire — localStorage contract with the website
└── effects.ts         # Visual effect templates
```

The top-level declaration (`index.ts`) is explicit about the requirement:

> This package MUST be identical in both Swordsman and Mage extensions.
> The website also uses repertoire.ts for localStorage contract.

### Recommendation — consider extracting as a package

Today `shared/types/` is physically duplicated in each repo. This works because the surface area is small and churn is low, but it is a known debt. When the surface grows or when a third consumer (e.g., a mobile app) appears, extract `shared/types/` as a real npm package (`@agentprivacy/shared-types`) consumed by all three. Until then: **copy with discipline, diff before commit**.

```bash
# Verify the two copies have not drifted:
diff -rq swordsman/shared/ mage/shared/   # should print nothing
```

---

## Layer 2 — The Wire Contract

### 2.1 Message types

Inter-extension messaging is typed through `shared/types/channel.ts`. There are three directional channels.

**Swordsman → Mage:**

| Type | Purpose |
|---|---|
| `SWORD_PRESENT` | Announce presence: domain, MyTerms state, blade level, orb position, hexagram state. |
| `SPELL_CAST` | Notify that the First Person cast a signed spell at a position. |
| `CONVERGENCE_INITIATED` | Orbs are converging — cast spell list + convergence point. |
| `BLADE_FORGED` | A new blade (64-blade lattice) was forged; includes forging metadata + new hexagram. |
| `TERM_ASSERT` | Assert MyTerms on the current domain with given intensity. |
| `ORB_POSITION_UPDATE` | Position delta for the Sword Orb. |
| `KEY_EXCHANGE` | Public key material for shared-secret derivation. |

**Mage → Swordsman:**

| Type | Purpose |
|---|---|
| `MAGE_PRESENT` | Announce presence: domain, PageAnalysis, orb position, available spells. |
| `INTELLIGENCE` | Full analysis + a suggested blade + suggested spells. |
| `SCAN` | Scan findings: trackers, cookie banner, forms, dark patterns, privacy policy + suggested spells. |
| `HEXAGRAM_UPDATE` | Hexagram mutation with a human-readable reason. |
| `CONSTELLATION_WAVE` | Direction + payload + animation spec (particleCount, pathType, duration). |
| `CONVERGENCE_READY` | Mage-side signal that it is ready to converge at a position. |
| `ORB_POSITION_UPDATE` / `KEY_EXCHANGE` | Symmetric with Swordsman. |

**Bidirectional (ceremony):**

| Type | Purpose |
|---|---|
| `CEREMONY_BEGIN` | Initiator + conditions (orbDistance, spellsCast, gapScore, drakeEligible). |
| `CEREMONY_COMPLETE` | Result: cursorState, myTermsRecorded, constellationHash, hexagramFinal, drakePresent, timestamp. |

Ceremony types: `dual_convergence`, `hexagram_cast`, `quick_cast`, `constellation_wave`, `bilateral_exchange`, `drake_summon`.

Cursor states: `default`, `blade_active`, `dual_active`, `spell_selected`, `casting`, `sovereign`, `hexagram_active`, `drake_summoned`, `full_sovereign`.

### 2.2 Extension IDs

```typescript
// shared/types/index.ts
export const SWORDSMAN_EXTENSION_ID = 'SWORDSMAN_EXTENSION_ID_PLACEHOLDER'
export const MAGE_EXTENSION_ID      = 'MAGE_EXTENSION_ID_PLACEHOLDER'
```

Replace the placeholders with real Chrome Web Store IDs when published. Until then, side-loaded IDs from `chrome://extensions` are fine for local development.

### 2.3 Numeric contracts (must match between extensions)

```typescript
// shared/types/index.ts

// Orb convergence distance threshold (pixels)
export const CONVERGENCE_THRESHOLD = 60

// Drake-summon eligibility
export const DRAKE_THRESHOLD = {
  trackerCount: 10,
  policyScore: 0.3,      // lower = worse policy
  darkPatternCount: 1
}

// Animation timings (milliseconds)
export const CEREMONY_TIMINGS = {
  approach:        1000,
  contact:         500,
  resolution:      1500,
  crystallisation: 2000
}

// Visible palette
export const ORB_COLORS = {
  mage:       { primary: '#1D9E75', glow: 'rgba(29, 158, 117, 0.3)', dark: '#5DCAA5' },
  swordsman:  { primary: '#534AB7', glow: 'rgba(83, 74, 183, 0.3)', dark: '#AFA9EC' },
  convergence: '#EF9F27',
  drake:       '#FFD700'
}
```

If one extension changes a threshold and the other does not, convergence will behave inconsistently (e.g., Mage thinks orbs are close; Swordsman thinks they are apart). Change both.

---

## Layer 2 — The Storage Contract

### 3.1 `localStorage` keys

| Key | Writer | Readers | Schema |
|---|---|---|---|
| `agentprivacy_spell_repertoire` | agentprivacy.ai website | both extensions | `SpellRepertoire` (`shared/types/repertoire.ts`), schema version `1.0` |
| `agentprivacy:active-hex-spells` | website + either extension | both extensions | `string[]` of 6 sticker IDs (out of 8) |

The website is the **primary source of truth** for learned spells and repertoire progression (see comment at top of `repertoire.ts`: *"This is a ONE-WAY sync: website → extensions"*). Extensions read this state to stay coherent with what the First Person has learned.

The sticker-hex key (`agentprivacy:active-hex-spells`) is different: it is the active-loadout toggle that either agent can mutate when the First Person swaps a sticker. Mutations broadcast a `CustomEvent`.

### 3.2 Custom events

| Event name | Dispatched by | Payload |
|---|---|---|
| `agentprivacy:hex-spells-changed` | whoever swaps a sticker | none (receivers re-read `agentprivacy:active-hex-spells`) |

### 3.3 Sync domains + externally_connectable

Both extensions' `manifest.json` file accepts external messages from:

```json
"externally_connectable": {
  "ids": ["*"],
  "matches": [
    "http://localhost:5000/*",
    "https://agentprivacy.ai/*",
    "https://*.agentprivacy.ai/*"
  ]
}
```

And `repertoire.ts` hardcodes:

```typescript
export const SYNC_DOMAINS = ['agentprivacy.ai', 'www.agentprivacy.ai']
```

If you change one list, change both — they must agree on which origins are trusted.

### 3.4 One-way flow

```
┌──────────────────────┐
│ agentprivacy.ai      │   writes SpellRepertoire
│ (website, the forge) │   ──────────────▶ localStorage
└──────────────────────┘                        │
                                                ▼
                           ┌────────────────────────────────────┐
                           │  agentprivacy_spell_repertoire     │
                           │  agentprivacy:active-hex-spells    │
                           └────────────────────────────────────┘
                                        │           │
                                        ▼           ▼
                               ┌────────────┐ ┌────────────┐
                               │ Swordsman  │ │   Mage     │
                               └─────┬──────┘ └─────┬──────┘
                                     │              │
                                     └── channel ───┘
                                         (typed messages,
                                          derived CryptoKey)
```

The website writes; extensions read and exchange. Extensions never write the repertoire back to the website's storage key. Sticker hex mutations **can** flow either direction.

---

## Layer 2 — The Crypto Contract

Some inter-extension exchanges (proverb-level content) are encrypted with a **derived shared secret** so neither the page nor any other extension can observe them:

```typescript
// Simplified from DUAL_EXTENSION_ARCHITECTURE.md

async function setupChannel() {
  const swordsmanKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  )
  // exchange public keys via KEY_EXCHANGE messages...
  const sharedSecret = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: magePublicKey },
    swordsmanKeys.privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  return { swordsmanKeys, magePublicKey, sharedSecret }
}
```

- Both extensions use **ECDH on P-256** for key agreement.
- Both derive an **AES-GCM 256-bit** symmetric key from the shared secret.
- The key is **non-exportable** (`extractable: false`).
- Key rotation happens on Swordsman restart — `sharedSecret = null` is set and a new exchange is triggered.

No key material crosses the wire. Public keys are exchanged via the `KEY_EXCHANGE` message type. The resulting `CryptoKey` is a browser-local object; only derived ciphertext travels between agents.

---

## Layer 3 — The Meaning Contract

These are not enforceable by code but are enforceable by review. A PR that crosses any of these boundaries should be bounced.

### 4.1 The Σ boundary (the one non-negotiable rule)

Per **IEEE 7012-2025 §5.4.3**, a contract has exactly two named parties: the **First Person** and the **Entity**. The Mage is neither. The Mage is First-Person-side tooling; it operates *inside* the scope of agreements the Swordsman signs.

- **Only the Swordsman signs.** Any code path, UI copy, or doc claim where the Mage signs, negotiates, or mints a bilateral agreement is a §5.4.3 violation.
- **No three-party agreements.** The standard does not recognize them. If a feature seems to require one, the feature is wrong, not the standard.
- **The Mage can refuse, but cannot agree.** If the Mage detects that operating inside the current agreement would violate First Person intent, it can escalate to the Swordsman or stop — it cannot renegotiate.

### 4.2 Yang / Yin — the polarity axis

Every sticker is either **yang** (outward assertion — Swordsman energy, boundary-making) or **yin** (inward concealment — Mage energy, Γ-aware posture). The default hex loadout is 3 yang + 3 yin; drift from that balance should be deliberate.

| Axis | Swordsman affinity | Mage affinity |
|---|---|---|
| Yang | Primary — blade, assertion, slashing trackers | Secondary — receives, reflects |
| Yin | Secondary — boundary-holding silence | Primary — cloaking, rewriting, ephemerality |

### 4.3 The sticker hex (MyTerms action tokens)

Eight canonical stickers; six active at a time in the hex loadout; two benched. Each sticker carries a `myTermsMapping` (enforcement verb) that both extensions interpret:

| ID | Mapping | Interpreted by |
|---|---|---|
| `emoji_shield` | `DO_NOT_TRACK` | Swordsman tightens tracker blocking |
| `emoji_dragon` | `TRUST_EXTENSION` | Swordsman relaxes on trusted surface |
| `proverb_gap` | `DATA_MINIMISATION` | Both: minimize emitted/accepted data |
| `keyword_dnt` | `DO_NOT_TRACK` | Swordsman; reinforces shield |
| `emoji_crystal` | `SELECTIVE_DISCLOSURE` | Mage: Γ-shape — choose what to reveal |
| `proverb_weather` | `EPHEMERAL_SESSION` | Both: short-lived state, no persistence |
| `keyword_dns` | `DO_NOT_SELL` | Swordsman: enforce no-sale term |
| `emoji_cloak` | `ANONYMIZE` | Mage: Γ-shape — rewrite before emitting |

Stickers **compose with** signed agreements; they **never replace** Customer Commons agreement IDs. The agreement is the Δ ceiling; the active stickers are which subset of that ceiling the First Person chooses to express in the session.

### 4.4 The four-glyph inscription

Canonical: `⚔️📜✍️🔐` (blade, scroll, signature, lock) — the bilateral commitment chain.

Do not add the decorative `✨` (retired in V2). Do not use three-glyph or five-glyph variants. Any emoji sequence appearing in UI, docs, or commit messages that purports to be "the inscription" must be these four, in this order.

### 4.5 The PVM V5.4 axis map

| Axis | Symbol | Swordsman | Mage |
|---|---|---|---|
| Agent | Σ | Defines and honors the boundary | Operates strictly inside the boundary |
| Data | Δ | Chooses the policy via `SD-BASE-*` / `PDC-*` | Respects the chosen policy; never expands |
| Inference | Γ | Largely out of scope | **Primary contribution** — sticker-driven Γ-shaping |

The product `Φ_v5 = Φ_agent(Σ) · Φ_data(Δ) · Φ_inference(Γ)` is multiplicative. A zero on any axis collapses the whole product. The dual-extension architecture exists precisely because one extension cannot cover all three axes credibly.

---

## Evolving the Contract Without Breaking Things

### When adding a new sticker

1. Update `DEFAULT_SPELLS` in the website (agentprivacy.ai source of truth).
2. Update `LearnedSpell['source']` union in `shared/types/repertoire.ts` (both repos) if needed.
3. Update the sticker → enforcement mapping in `src/lib/spell-definitions.ts` (Mage) and the corresponding Swordsman consumer.
4. Update the canonical eight table in `AETHER.md` (both repos).
5. Verify `getActiveHexSpellIds()` / `getBenchedHexSpells()` still return `length === 6` / `length === 2`.

### When adding a new message type

1. Define the interface in `shared/types/channel.ts` (both repos, identical).
2. Add it to the appropriate union type (`SwordToMageMessage` or `MageToSwordMessage`).
3. Implement the **sender** in one extension and the **handler** in the other.
4. Add a `version` bump comment to `shared/types/index.ts` if the addition is breaking.

### When changing a threshold

If you change `CONVERGENCE_THRESHOLD`, `DRAKE_THRESHOLD`, or `CEREMONY_TIMINGS`, change both repos in the same PR. Otherwise convergence / drake-summon / ceremony pacing will be inconsistent between the two agents.

### When changing the storage schema

`SpellRepertoire['version']` is currently `'1.0'`. Any breaking change to the shape of localStorage data requires bumping the version and adding migration logic in `parseRepertoire()`. Both extensions must be updated together or they will disagree on what the website has written.

---

## Deeper Documents (both repos)

This file is the map. For details, follow the pointers:

| Document | Covers |
|---|---|
| `INTERFACE_CONTRACT.md` | Fuller per-message spec; request/response timing; error conditions. |
| `DUAL_EXTENSION_ARCHITECTURE.md` | End-to-end architecture including the key derivation ceremony and the ceremony lifecycle. |
| `DUAL_CONTROL_SCHEME.md` / `CONTROL_SCHEME*.md` | Keyboard, mouse, and gesture bindings in each extension and how they map to shared messages. |
| `ieee7012_integration_plan_v2.md` | The V2 canonical plan; every claim in this file ultimately answers to the plan. |
| `CHRONICLE_MYTERMS_V2_ALIGNMENT_2026-04-22.md` | Checklist for keeping the two extensions aligned with the V2 plan. |
| `QUICKSTART.md` | How to install, pair, and verify both extensions are talking. |
| `TheCelestialDualCeremony☀️⊥🌙.md` | The ceremonial / narrative framing of the dual architecture. |

---

## The Single Diff That Should Never Have Output

```bash
diff -rq swordsman/shared/ mage/shared/
```

If this command prints anything, the aether is broken. Fix it before shipping.

---

*Two agents. One First Person. One contract with the Entity. The aether is how both extensions know they are serving the same person.*

`⚔️📜✍️🔐`
