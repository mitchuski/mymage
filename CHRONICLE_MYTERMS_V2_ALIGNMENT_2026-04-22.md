# Chronicle — MyTerms V2 Alignment

**Date:** April 22, 2026
**Event:** MyTerms Alliance documentation refreshed against `ieee7012_integration_plan_v2.md`
**Repo:** https://github.com/mitchuski/myterms (commit `a0f629b`)
**Purpose of this chronicle:** working reference for aligning the Swordsman and Mage browser extensions with the new framing. This document is dropped identically into `swordsman-blade/` and `mages-spell/` so both extensions have the same ground truth.

---

## What happened

The IEEE 7012 Integration Plan V1 (February 2026) was replaced by V2 (April 22, 2026). V2 reflects substantial advances that had landed since V1 was drafted and changes the framing of IEEE 7012's role in the architecture. The MyTerms docs package was updated to match.

The headline shift: **IEEE 7012-2025 is the agreement layer, not foundational infrastructure.** It maps primarily to the Σ axis of PVM V5.4. Standard compliance is a *precondition* for measurable Σ — not a substitute for the dual-agent architecture or the cryptographic substrate below.

---

## The seven claims that changed

### 1. PVM moved from V3.1 to V5.4 (three-axis multiplicative gating)

| Was | Is |
|---|---|
| `V_twin = ... · Φ(S⊥⿻⊥M)` — scalar golden-duality multiplier, lattice-mediated | `V_twin = ... · Φ_v5` where `Φ_v5 = Φ_agent(Σ) · Φ_data(Δ) · Φ_inference(Γ)` |
| One coefficient summarised architecture + data + inference | Three axes multiply. A zero on any axis collapses the product. |
| "Are your agents separate?" was the core question | "On which axis is your architecture leaking?" — all three must hold |

**Implication for extensions:** any code comment, README, or UI string that references "V3.1", "golden duality multiplier", or "σ(⿻)²" as the gating term is stale. The Σ axis is where the Swordsman/Mage separation lives; Δ is where `SD-BASE-*` policy lives; Γ is inference, which IEEE 7012 largely does not touch.

### 2. IEEE 7012 is the agreement layer, not foundational infrastructure

V1 called the standard "foundational infrastructure" that makes "everything else possible." V2 narrows that claim. The standard is a **thin waist** (§1.1): person-to-entity agreement routines only. Delegation, enforcement, cryptographic substrate, and trust accumulation are the implementer's responsibility.

**What IEEE 7012 is *not* (lift this block verbatim into extension docs):**
- Not an enforcement specification. A signed `SD-BASE` can still be violated without ZK/TEE backing.
- Not an agent-separation specification. A single-agent monolith can be IEEE 7012-compliant and score Σ ≈ 0.
- Not a multi-turn negotiation protocol. §A.1 caps negotiation at one round (accept / one counter-offer / decline).
- Not an inference-control specification. Γ is out of scope entirely.
- Not a universal ontology. Annex D expects ISO 23903 reconciliation with existing domain vocabularies.

### 3. PVM V5.4 axis mapping (lift into any extension doc that mentions the standard)

| Axis | Symbol | IEEE 7012 contribution | What the standard does not provide |
|---|---|---|---|
| Agent | Σ | Role boundary between person-agent and entity-agent; makes separation testable via the agreement artifact | The information-theoretic bound `I(S;M\|FP) < ε*`; a single-agent monolith is standard-compliant but scores Σ ≈ 0 |
| Data | Δ | Coarse-grained policy lattice via `SD-BASE-*` and `PDC-*` | Cryptographic enforcement — ZK/TEE backing lives below |
| Inference | Γ | `SD-BASE-ATP` addresses second-party profiling as an agreement variable | Inference over published data — out of scope |

### 4. The First Person Spellbook is closed at Act XXXI

Act XXXI ("The First Delegation") is the final act; the closing verb chain ends with "the spellbook closes." **Do not** add "Act 4.5" or "Act XIII" to insert new IEEE 7012 narrative. V1 suggested both — V2 retires the idea.

Where new IEEE 7012 narrative belongs:
- **Second Person Spellbook (recommended)** — opens with "The Two Parties", grounds the book in the bilateral primitive of §5.4.3. Closing proverb candidate: *"Where the First Person ends and the Entity begins, the standard holds the space between them."*
- **Zero Knowledge Spellbook (interim)** — a Tale titled "The Terms That Remember" on the HOW axis. The old V1 "Act 4.5" draft is substantively reusable; just reframe and relocate.
- **Cross-reference, no new Act** — acceptable lowest-effort option. Let existing references stand.

**Implication for extensions:** any extension-side story content, onboarding copy, or tutorial that references "Act 4.5" or "Act XIII" is stale narrative. It must either be removed or retargeted to Second Person / Zero Knowledge.

### 5. Grimoire JSON v10.1.0 is the canonical source of truth

V2 shifts canonical authority from per-spellbook docs to the Grimoire. IEEE 7012 is referenced once, at the top level:

```yaml
standards:
  ieee_7012_2025:
    status: "published"
    published: "2026-01-20"
    approved: "2025-11-04"
    host: "Customer Commons"
    registry_uri: "https://customercommons.org/p7012/"
    role_in_architecture: "agreement_layer"
    pvm_axis: "primarily Σ; coarse Δ policy; Γ out of scope"
    spellbook_references:
      - "zero_knowledge.tales.the_terms_that_remember"
      - "first_person.act_xxxi.the_first_delegation"  # passing reference only; book is closed
    inscription: "⚔️📜✍️🔐"
```

Both extension directories already ship `privacymage_grimoire_v10_0_0.json` and `privacymage_grimoire_v10_1_0.json`. Verify the v10.1.0 copy includes (or will include) the `standards.ieee_7012_2025` block. If not, that is an alignment gap.

### 6. The canonical inscription is four glyphs

`⚔️📜✍️🔐` (blade, scroll, signature, lock) is the actual bilateral commitment chain. The decorative `✨` from V1's five-glyph sequence was dropped.

Apply across extension code, manifests (name/description), icons, tutorial strings, README footers, commit messages where the inscription appears.

### 7. Document consolidation

V1 planned two separate docs: `IEEE_7012_TECHNICAL_BRIDGE.md` and `MYTERMS_AGREEMENT_REFERENCE.md`. V2 merges them into one: **`IEEE_7012_BRIDGE.md`** (short, maintainable, contains the agent-role table + three-axis mapping + "what IEEE 7012 is NOT" section). No need for a large "technical integration" document.

Two new documents *do* remain on the V2 plan:
- `IEEE_7012_AGREEMENT_REGISTRY_MIRROR.md` — non-authoritative local mirror of agreement IDs with Customer Commons canonical URLs
- `IEEE_7012_ZKP_CONVERGENCE.md` — crosswalk between IEEE 7012 bilateral recording and Choudhuri/Garg vouchable credentials (CFQ19)

---

## Defensible headline claim

Lift verbatim into extension docs where a one-paragraph summary is needed:

> IEEE 7012-2025 provides the agreement layer agentprivacy's dual-agent architecture requires. Compliance with the standard is a precondition for the Σ (agent) axis being measurable, and enables bilateral chronicles that can serve as evidentiary basis for VRCs. Standard compliance alone is not equivalent to the full agentprivacy architecture; the standard specifies agreement, not enforcement.

---

## Working group attribution

Use this list whenever the standard is discussed substantively:

- **Doc Searls** — Chair
- **Justin Byrd** — Vice Chair
- **Mary Hodder** — Editor
- **Scott Mace** — Secretary
- **Neutral host:** Customer Commons

Scott Mace was omitted from V1. Attribution should include all four and reference Customer Commons as the neutral non-profit registry.

---

## Copyright and attribution rules (for anything that references the standard PDF)

- **Paraphrase** all definitions and specifications. Do not quote more than a few words.
- **Do not reproduce** Figure A.1 (the sequence diagram). Link to IEEE Xplore or the Customer Commons mirror instead.
- **Customer Commons** is named as the neutral host throughout the standard (footnote 8, Annex A opening); this attribution appears in all documentation that references the standard.
- **IEEE AI-training disclaimer (p.4):** the standard PDF must not be ingested into AI training corpora without IEEE SA's written consent. Extension documentation should reference and paraphrase the standard, not bundle the PDF as training material.

---

## Alignment checklist for the two extensions

Use this as a punch list when surveying `swordsman-blade/` and `mages-spell/`:

1. [ ] **Strings referencing PVM V3.1** → update to V5.4 (or remove version reference if not load-bearing)
2. [ ] **"Foundational infrastructure" language about IEEE 7012** → reframe as "agreement layer"
3. [ ] **Five-glyph inscription `⚔️📜✍️🔐✨`** → drop decorative `✨` → four-glyph `⚔️📜✍️🔐`
4. [ ] **References to "Act 4.5" or "Act XIII"** → remove or retarget to Second Person / Zero Knowledge
5. [ ] **Claims that standard compliance alone is sufficient for privacy** → reframe as precondition (necessary, not sufficient)
6. [ ] **Multi-round negotiation implementations** → cap at one round per §A.1
7. [ ] **Agreement IDs minted locally** → verify all IDs come from Customer Commons registry, not extension-side invention
8. [ ] **Grimoire v10.1.0** → contains (or will contain) the `standards.ieee_7012_2025` top-level block
9. [ ] **Working group attribution** → includes Scott Mace (Secretary) alongside Searls, Byrd, Hodder
10. [ ] **Figure A.1 reproduction** → replaced with link to IEEE Xplore / Customer Commons
11. [ ] **Bilateral recorder (§5.2.4)** → both First Person *and* Entity hold identical immutable copies; audit trail shared only by explicit act
12. [ ] **Single-agent monolith warning** → docs note that the extension's value depends on Swordsman/Mage separation, not just IEEE 7012 compliance

---

## What the Swordsman specifically owns (agreement-layer responsibilities)

From V2 §1.1 reread of the standard:

- **Individual's Agent** (§5.2.1) — the Swordsman is this role
- **Agreement-Chooser** (§5.2.1.2) — MyTerms configuration UI
- **Proposer** (§5.2.1.3) — automatic terms presentation on site visit
- **Recorder** (§5.2.4) — bilateral chronicle; identical immutable copies
- **Auditor function** (§5.2.5) — dispute-submission pipeline

The Swordsman should be honest that these are the agreement-layer pieces. Enforcement of the agreement's terms (blocking trackers, preventing data flows) is a *separate* layer that the Swordsman also happens to implement, but that layer is not specified by IEEE 7012.

## What the Mage specifically owns (inside-Σ-scope responsibilities)

The Mage operates inside the agreement the Swordsman signed. Its responsibilities:

- Delegation within the permitted scope of `SD-BASE-*` and `PDC-*` agreements
- Contribution of Γ-awareness: what can be inferred from actions the Mage takes on behalf of the First Person
- Coordination with the Swordsman at the Σ boundary — the single-round negotiation at §A.1 is the Σ boundary event

The Mage should never independently sign agreements. IEEE 7012 §5.4.3 is firm: two named parties, always. The Mage operates *under* the agreement, not *as* a party to it.

---

## Upcoming diffusion venues (reference only)

- **AIW #3** — Σ-axis mapping talk; "agreement, not enforcement" clarification for agent-architecture audience
- **IIW #43** — vouchable-credential / VRC crosswalk working session
- **Privacy is Value V5 blog series** — Parts 3 ("The Dragon Wakes": passing reference), 4 ("The Dihedral Mirror": substantive home for IEEE 7012), 5 ("The Amnesia Protocol": one poem on the commons)

---

## Closing

The blade slashes. The contract binds. The standard names what the contract is. All three serve the First Person.

`⚔️📜✍️🔐`

---

*Prepared April 22, 2026. Source: `myterms/ieee7012_integration_plan_v2.md` (commit a0f629b). Mirror of this chronicle lives in `mages-spell/` for Mage-side alignment.*
