# Mage — Spellbook Projection

**Chrome Manifest V3 browser extension implementing the delegation layer that operates inside the Σ-scope of agreements the Swordsman signs.**

The Mage is not a party to the IEEE 7012 agreement. Per §5.4.3, a contract has exactly two named parties: the First Person and the Entity. The Mage is a delegation of the First Person, constrained by what the Swordsman has already agreed to on the First Person's behalf. Its value-add sits on axes the agreement layer does not cover: operational delegation, Γ-awareness (inference posture), and projection across distance.

**Bundled grimoires (v1.1.0+):**
- `privacymage_grimoire_v10_2_0.json` (v10.2.1 internally) — the privacymage grimoire (First Person + Zero + Canon + Society + Plurality spellbooks)
- `city_of_mages_grimoire_v1_2_0.json` — the City of Mages grimoire (Second Person · Tomes IV–V cast; **14 personas** the Mage may project (geometry-Mage Luca 📐 added at V0); 42 spells; **UOR Foundation** recognised as kindred substrate provider; **SpaceComputer** recognised as the first kindred ecosystem — celestial-mana 🌌 source feeding Adamantia (Etherchanting), Vulcana (Forge(t)), and Vagari (Holon Hitchhikers); **two-mana economy** canonical: chain-mana (Aether Mana Ξ on Ethereum as canonical first instance; Bitcoin Lightning sats / Oasis ROSE / Zcash etc. admitted under their own symbols) ⊥ Celestial Mana 🌌; setting: the **First City of Mages on Drake Island** within the agentprivacy universe — the title names a kind, so future Mages who found cities elsewhere will each pin their own First City of Mages grimoire under the same title pattern). File content is v1.2.2; v1.2 base pinned 2026-05-10 at `https://sync.agentprivacy.ai/ipfs/bafkreidxhmuykjew6dtnuprggtd2rapwm43ghtmfhf2occ2wfk2zpx2b6a`; v1.2.2 (Luca + SpaceComputer + two-mana economy) awaits a fresh re-pin. v1.1 pin `bafkreidv7c…idti` retained as historical.

Both grimoires bundle at project root and surface as `web_accessible_resources`. Build script copies them to `dist/`. Spell projection filters by spellbook source.

Paired with:

- [mitchuski/swordsman](https://github.com/mitchuski/swordsman) — the agreement-layer agent. The Swordsman signs; the Mage operates inside what was signed.
- [mitchuski/myterms](https://github.com/mitchuski/myterms) — the MyTerms Alliance application docs package. The canonical framing for everything here lives there.

---

## What the Mage is

The Mage extension contributes capabilities that IEEE 7012 explicitly leaves to implementers:

| Capability | What the Mage does |
|---|---|
| **Delegation inside Σ** | Operates on behalf of the First Person within the permission envelope of the signed agreement. Never signs, never negotiates. |
| **Γ-aware posture** | Reads the active sticker loadout (especially `emoji_cloak` → ANONYMIZE, `proverb_weather` → EPHEMERAL_SESSION) to shape how it handles the First Person's context on a given site. |
| **Page intelligence** | Knowledge scanning, constellation mapping, ceremony engine — all operating within the signed agreement's Δ ceiling. |
| **Projection across distance** | Carries the First Person's preferences across sessions and surfaces without the Swordsman having to re-present terms each time. |

## What the Mage is *not*

- **Not a party to any IEEE 7012 agreement.** §5.4.3 constrains contracts to exactly two named parties (First Person + Entity). The Mage is neither. Any code path that makes the Mage sign, negotiate, or record a bilateral agreement is a Σ-boundary violation.
- **Not a third party.** IEEE 7012 does not recognize three-party agreements. The Mage is a *delegation* of the First Person, not an independent actor.
- **Not a wallet, key-custody, or identity system.** It projects intent; it does not hold credentials.
- **Not a replacement for the Swordsman.** If the Swordsman has not signed, the Mage has no envelope to operate inside. The Mage only acts on sites where an agreement is in place.

## Architecture position — PVM V5.4

The Mage sits inside the Σ boundary the Swordsman enforces, and primarily contributes to the **Γ axis**:

| Axis | Symbol | Mage contribution |
|---|---|---|
| Agent | Σ | Operates strictly inside the Σ envelope. Never crosses the boundary to become an agreement-layer actor. |
| Data | Δ | Respects the coarse-grained policy set by the signed `SD-BASE-*` / `PDC-*` agreement. Never fetches or emits data outside that envelope. |
| Inference | Γ | **Primary contribution.** Posture adjustments in response to active stickers; Γ-aware output rewriting; inference-control decisions that IEEE 7012 does not specify. |

---

## Install & build

```bash
git clone https://github.com/mitchuski/mage.git
cd mage
npm install
npm run build       # esbuild via build.js → produces dist/
npm run typecheck   # tsc --noEmit
```

Load into Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** on
3. Click **Load unpacked**
4. Select this directory (the one with `manifest.json`)

The extension appears as **Mage — Spellbook Projection** and runs on `<all_urls>` at `document_idle`.

For the Mage to be useful, install the [Swordsman](https://github.com/mitchuski/swordsman) alongside it — the Mage reads the Swordsman's signed agreement and active sticker state to shape its posture.

---

## Repository layout

```
manifest.json               Chrome MV3 manifest
package.json                npm scripts + esbuild deps
build.js                    esbuild bundler
tsconfig.json               TypeScript config

src/
  background/index.ts       Service worker: shared-secret derivation,
                            repertoire sync, message routing
  content/
    index.ts                Page-level entry: scanning, overlay rendering
    cursor-overlay.ts       Mage-side cursor/overlay state
  lib/
    repertoire-sync.ts      Sticker loadout synchronization (reads from
                            agentprivacy:active-hex-spells)
    spell-definitions.ts    Canonical eight stickers + posture mappings
    spell-types.ts          Sticker type definitions
    effect-presets.ts       Visual effect templates
    effect-storage.ts       Effect persistence

shared/                     Types shared with the Swordsman extension
  types/                    blade, ceremony, channel, effects,
                            repertoire, spell

assets/icons/               Extension icons (SVG, 16/48/128)

privacymage_grimoire_v10_*.json   Unified spellbook data

docs & design:
  AGENT_BUILD_INSTRUCTIONS_MAGE.md
  agentprivacy-living-spellbook-design.md
  DUAL_EXTENSION_ARCHITECTURE.md
  INTERFACE_CONTRACT.md
  CONTROL_SCHEME*.md / DUAL_CONTROL_SCHEME.md
  QUICKSTART.md
  ieee7012_integration_plan_v2.md    (current canonical plan)
  CHRONICLE_MYTERMS_V2_ALIGNMENT_2026-04-22.md
  CHRONICLE_UOR_CONVERGENCE_2026-03-31.md
  CHRONICLE_DRAGONS_ANATOMY_AND_FLIGHT.md
  TheCelestialDualCeremony☀️⊥🌙.md
  the-ceremonies_sun-and-moon_pm.md
  PLAN_EDGES_TO_FILL_2026-03-31.md
  REVIEW_UOR_CONVERGENCE_GAPS_2026-03-31.md
```

---

## Interaction with the Swordsman

The Mage reads from a shared repertoire the Swordsman writes to:

- **Active stickers** — 6 of 8 MyTerms action tokens active at any time in the hex loadout (`agentprivacy:active-hex-spells` key in `localStorage`, broadcast via `agentprivacy:hex-spells-changed` CustomEvent). Each sticker maps to a Γ-shape the Mage applies to its output: `emoji_cloak` → ANONYMIZE, `proverb_weather` → EPHEMERAL_SESSION, `emoji_crystal` → SELECTIVE_DISCLOSURE, etc.
- **Posture sync** — the Mage receives the current cursor state / signed agreement from the Swordsman, so its operational posture stays coherent with what was signed.
- **Shared key derivation** — a Web Crypto `CryptoKey` derived via `crypto.subtle.deriveKey` allows proverb-level encrypted exchanges between the two agents.

The communication surface is defined in `shared/types/` — both extensions import the same types to stay in sync.

## The Aether — full shared-substrate spec

For the complete contract between the two extensions — message types, storage keys, crypto key derivation, numeric thresholds, and the conceptual boundaries — see [`AETHER.md`](./AETHER.md). This file is **identical** in the Swordsman and Mage repositories; if the two copies drift, the contract is broken. Keep them in sync.

---

## The Σ boundary — the single most important rule

Any PR, change, or new feature that makes the Mage sign an agreement, negotiate terms with an Entity, or otherwise step outside the scope the Swordsman has set is a **§5.4.3 violation** and should be rejected.

The agreement is bilateral: First Person + Entity. The Mage is First-Person-side tooling, not a third party. This is the rule the V2 plan underlines in red.

Conversely, any feature that strengthens the Mage's Γ-awareness — better inference control, richer sticker-driven posture, more careful handling of what it emits on the First Person's behalf — is on-axis and welcome.

---

## Canonical framing (must match mitchuski/myterms)

- **Plan:** `ieee7012_integration_plan_v2.md` (April 22, 2026). Supersedes the February v1.
- **PVM:** V5.4 — three-axis multiplicative gating `Φ_v5 = Φ_agent(Σ) · Φ_data(Δ) · Φ_inference(Γ)`.
- **Inscription:** `⚔️📜✍️🔐` (four glyphs — blade, scroll, signature, lock). The decorative `✨` from earlier versions is retired.
- **Working group:** Doc Searls (Chair), Justin Byrd (Vice Chair), Mary Hodder (Editor), Scott Mace (Secretary). Neutral host: Customer Commons.
- **Defensible headline claim:**

  > IEEE 7012-2025 provides the agreement layer agentprivacy's dual-agent architecture requires. Compliance with the standard is a precondition for the Σ (agent) axis being measurable, and enables bilateral chronicles that can serve as evidentiary basis for VRCs. Standard compliance alone is not equivalent to the full agentprivacy architecture; the standard specifies agreement, not enforcement.

See `CHRONICLE_MYTERMS_V2_ALIGNMENT_2026-04-22.md` in this repository for the alignment checklist this extension is tracked against.

---

## Known alignment gaps

Tracked against the V2 plan (see the chronicle for the full list):

- [ ] `DUAL_EXTENSION_ARCHITECTURE.md` lines 490–494 say "Both extensions record the agreement" — that is a §5.4.3 violation. Only the Swordsman records; the Mage acknowledges and stores for operational context only.
- [ ] `privacymage_grimoire_v10_*.json` — add top-level `standards.ieee_7012_2025` block per plan §2.1.
- [ ] `DUAL_EXTENSION_ARCHITECTURE.md` — add a one-sentence caveat in the Agreement Formation section: *"IEEE 7012 compliance is necessary for measurable Σ but not sufficient; enforcement and delegation layers are distinct."*
- [ ] Working-group attribution (including Scott Mace) in any doc that discusses the standard substantively.

Overall the Mage is ~95% aligned with the V2 plan — narrower gap than the Swordsman because the Mage has fewer surfaces that claim things about the standard.

---

## Copyright and attribution

When any document in this repository references IEEE Std 7012™-2025:

- **Paraphrase** all definitions and specifications. Do not quote more than a few words at a stretch.
- **Do not reproduce** Figure A.1 (the sequence diagram). Link to IEEE Xplore or the Customer Commons mirror.
- **Customer Commons** is named as the neutral host throughout the standard; this attribution appears wherever the standard is referenced.
- **IEEE AI-training disclaimer (p.4):** the standard PDF must not be ingested into AI training corpora without IEEE SA's written consent.

---

## Contact

**privacymage**

- mage@agentprivacy.ai
- https://agentprivacy.ai
- https://github.com/mitchuski

---

*The spell projects. The agent defers. The First Person is never alone inside what was signed.*

`⚔️📜✍️🔐`
