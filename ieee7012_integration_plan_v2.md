# IEEE 7012-2025 Integration Plan — V2

## Integrating the Standard into the Current agentprivacy Corpus

**Prepared for:** privacymage / agentprivacy
**Supersedes:** IEEE_7012_Integration_Plan v1 (February 2026)
**Standard reference:** IEEE Std 7012™-2025, published 20 January 2026, IEEE SA Standards Board approval 4 November 2025
**Working group:** Doc Searls (Chair), Justin Byrd (Vice Chair), Mary Hodder (Editor), Scott Mace (Secretary)
**Neutral host:** Customer Commons

---

## Executive Summary

IEEE 7012-2025 has been the public baseline for roughly three months. The integration surface has changed substantially since the first plan was drafted:

1. **PVM has advanced from V3.1 to V5.4**, replacing the scalar golden-duality multiplier with a three-axis multiplicative gating equation `Φ_v5 = Φ_agent(Σ) · Φ_data(Δ) · Φ_inference(Γ)`. IEEE 7012 now maps cleanly and *primarily* onto the Σ (agent) axis, with specific implications for Δ and Γ that were not articulable at V3.1.
2. **The First Person Spellbook has closed at Act XXXI ("The First Delegation")** with the closing verb chain inscribed. New IEEE 7012 narrative material can no longer be inserted as "Act 4.5" or "Act XIII". It belongs in the Second Person Spellbook (WHO), or as a Tale within the Zero Knowledge Spellbook (HOW). Both options are explored below.
3. **The Grimoire JSON (v10.0.0) is now the canonical source of truth**, unifying five spellbooks. IEEE 7012 references need to be added to the Grimoire directly, not to each spellbook independently, to avoid drift.
4. **ZKP convergence with the Choudhuri/Garg/First Person Project cryptographic framework** provides a second formal alignment surface for IEEE 7012. Vouchable credentials (CFQ19 primitive) are effectively the cryptographic substrate for VRCs born from signed MyTerms agreements.
5. **BGIN co-chair role (Identity Key Management & Privacy WG)** opens a governance and policy channel for IEEE 7012 that the v1 plan did not have access to.
6. **AIW #3 and IIW #43 are the next diffusion venues**, and the Privacy is Value blog series (Parts 3–5) provides three scheduled publication slots where IEEE 7012 can be woven in narratively.

This plan replaces the v1 document-update checklist with a version targeted at the current codebase, Grimoire, and upcoming publications.

---

## Part I: Re-reading IEEE 7012-2025 Against the Current Architecture

### 1.1 What the standard actually specifies

Reading the published PDF directly (rather than the pre-publication summary used in v1), five points deserve sharper attention than they received before:

**1. The standard is intentionally narrow.** Section 1.1 confines it to "routines in which persons acting as first parties arrive at contractual agreements with organizational entities acting as second-party service providers." Party-to-party negotiation of terms is *out of scope*. This is architecturally important: the standard does exactly one thing, and does it at the agreement layer. Everything above (delegation, VRCs, trust graphs) and below (enforcement, chronicle, cryptographic primitives) is the implementer's responsibility. IEEE 7012 is a thin waist.

**2. The agreement-selection model is deliberately Creative-Commons-shaped.** Annex A makes this explicit: a small baseline term (`SD-BASE`) annotated with permission modifiers. The roster is kept small on purpose. This means a Swordsman implementation should not invent new agreement IDs; it consumes the Customer Commons registry and enforces what the registry defines.

**3. Negotiation is capped at one round.** Section A.1 and Figure A.1: the entity either accepts, makes one counter-offer, or declines. There is no multi-turn negotiation. This is a design constraint that the dual-agent architecture must respect at the Σ boundary.

**4. The recorder is bilateral and the auditor function is explicit.** Section 5.2.4 and 5.2.5 specify that both sides keep identical immutable copies and that the First Person's agent has a function for submitting an agreement in dispute to auditors or regulators. This is the architectural hook that makes VRCs possible without surveillance: the audit trail exists only between the two parties, and is shared only by explicit act.

**5. Interoperability is scoped through ISO 23903 in Annex D.** The standard expects implementations to reconcile with existing domain ontologies (HL7 in the worked example) rather than impose a universal vocabulary. This maps directly to the guild-based secret-language thesis: the shared waist is IEEE 7012 + DPV + ODRL; community vocabularies live above it.

### 1.2 What was overstated in the v1 plan

The v1 plan described IEEE 7012 as "foundational infrastructure" for the Swordsman. This is correct but imprecise. More accurately: IEEE 7012 is the **agreement layer only**. Within PVM V5.4 terms:

- **Σ (agent separation axis):** IEEE 7012 is a *necessary but not sufficient* condition. The standard specifies what a person-side agent does and what it proposes; it does not specify the Σ separation bound `I(S;M|FP) < ε*`. A single-agent monolith can technically implement IEEE 7012 and still score zero on Σ.
- **Δ (data axis):** IEEE 7012's agreement IDs (`SD-BASE-A`, `SD-BASE-AT`, etc.) are a coarse-grained Δ policy. PDC-INTENT and PDC-AI address contribution scope. The standard does not prescribe cryptographic enforcement of Δ; it prescribes the *agreement* about Δ.
- **Γ (inference axis):** IEEE 7012 is mostly silent on inference. `SD-BASE-ATP` addresses profiling-by-the-second-party as a prohibited or permitted activity, but inference-over-published-data is not in scope.

The implication: IEEE 7012 is the *protocol for agreeing about* the three axes. The enforcement that actually moves the PVM value needle happens below and above the standard. The Swordsman implements the agreement; the Mage operates inside it; the ZK substrate provides the Δ/Γ guarantees that the agreement alone cannot.

---

## Part II: Grimoire and Documentation Updates

Because the Grimoire JSON is now the canonical source, edits should flow Grimoire-first, with derived documents regenerated or corrected against it.

### 2.1 Grimoire JSON (v10.0.0 → v10.1.0)

Suggested additions to `grimoire.json` at the top level:

```
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

The inscription should use four glyphs rather than five. The extra `✨` in the v1 plan's emoji sequence was decorative. The four-glyph sequence (blade, scroll, signature, lock) is the actual bilateral commitment chain.

### 2.2 Documents that need correction, not rewriting

These exist and are approximately correct; they need targeted edits.

| Document | Current ref | Update |
|---|---|---|
| `GLOSSARY_MASTER` | contains IEEE 7012 stub | Add formal definitions from §3.1 verbatim in paraphrase. Tag with `status: IEEE_STANDARD` |
| `agentprivacy-docs/whitepaper` (current V5.4) | mentions IEEE 7012 as "Swordsman's first blade" | Add one section explicitly naming the Σ-axis mapping and the single-round negotiation constraint |
| `agentprivacy-docs/README` | Technology Stack section | Add standards layer: IEEE 7012-2025, W3C DPV, ODRL |
| `PVM V5.4 specification` | Σ axis definition | Add worked example: IEEE 7012-compliant single-agent monolith scores `Σ ≈ 0` despite standard compliance |

### 2.3 Documents that do not exist yet and should

These are new artifacts, not edits.

**`IEEE_7012_BRIDGE.md`** — a short technical mapping document living in `agentprivacy-docs/standards/`. Replaces the v1 plan's idea of a large "technical integration" document with something tight enough to maintain. Content: the agent-role table (Individual's Agent = Swordsman; Proposer = terms presentation; Recorder = bilateral chronicle; Auditor = dispute pipeline), the three-axis mapping above, and a "what IEEE 7012 is NOT" section to prevent the common misread that the standard enforces anything beyond the agreement.

**`IEEE_7012_AGREEMENT_REGISTRY_MIRROR.md`** — a non-authoritative local mirror listing every agreement ID (`SD-BASE` through `SD-BASE-ATP-S3P-DP`, `PDC-INTENT`, `PDC-AI`, `PDC-GOOD`) with the Customer Commons canonical URL and a note that the Customer Commons copy is authoritative. Purpose: make the Swordsman's agreement set reviewable in one place without forking.

**`IEEE_7012_ZKP_CONVERGENCE.md`** — a crosswalk between IEEE 7012's bilateral recording model and the Choudhuri/Garg vouchable credentials primitive. The connection worth documenting: a signed MyTerms agreement is itself a vouch-worthy credential. Accumulated signed agreements with consistent behaviour over time are the evidentiary basis for a VRC. The ZKP framework provides the cryptographic wrapper; IEEE 7012 provides the agreement substrate. This document is the formal alignment between the two convergent research lines.

### 2.4 Documents that were suggested in v1 and should be skipped

**`VISUAL_ARCHITECTURE_GUIDE_v1_3` update with IEEE 7012 diagrams.** Figure A.1 from the standard is already a clear sequence diagram. Replicating or re-drawing it risks copyright issues and adds little. Link to the standard instead and add one original diagram showing how the IEEE 7012 agreement-layer sits between PVM Σ (below) and VRC accumulation (above).

**Separate `IEEE_7012_TECHNICAL_BRIDGE.md` and `MYTERMS_AGREEMENT_REFERENCE.md` as two documents.** Merge into the single `IEEE_7012_BRIDGE.md` above.

---

## Part III: Spellbook Integration — Relocated

The First Person Spellbook is closed. Act XXXI ("The First Delegation") is the final act, and the closing verb chain ends with "the spellbook closes." Adding a new act would break the inscription. Three viable options remain.

### 3.1 Option A: Second Person Spellbook (recommended)

The Second Person Spellbook is on the horizon and asks WHO as its central question. IEEE 7012 is fundamentally a WHO question: who is the first party, who is the second party, who signs, who records, who audits. The standard is a near-perfect opening motif for Second Person.

**Proposed opening Act: "The Two Parties"**

The motif: Soulbae and Soulbis discover that every contract has exactly two named parties. Not one, not many, always two. The First Person stands on one side. The Entity stands on the other. Neither can be absent. Neither can be merged. The ⊥ between them is the standard itself.

This frames the Second Person Spellbook around bilateral relationship as the primitive, with IEEE 7012 as the inaugural rite. The remainder of Second Person can then treat delegation, reputation, VRCs, and trust accumulation as *what grows between two named parties* rather than as abstract properties.

Closing proverb candidate: "Where the First Person ends and the Entity begins, the standard holds the space between them. This space is not empty. It is where every agreement lives."

### 3.2 Option B: Zero Knowledge Spellbook — "The Terms That Remember"

If the Second Person Spellbook is too far out, the IEEE 7012 narrative can land in Zero Knowledge as a Tale on the HOW axis. The v1 plan's "Act 4.5" draft is substantively good; it just needs relocation and a slight reframe.

The Zero Knowledge framing: the standard makes agreements *remember themselves* without requiring a watching third party. Both parties hold matching records. Neither can forget. Neither can fabricate. This is zero-knowledge in the social rather than cryptographic sense — knowledge of the agreement is symmetric and self-verifying between the two parties, opaque to everyone else.

The Tale would sit alongside the other thirty Zero Knowledge tales and reference Customer Commons as the neutral commons (⿻) where the roster is kept.

### 3.3 Option C: Cross-spellbook reference, no new Act

IEEE 7012 appears already in the First Person Spellbook as a passing blade in Act IV and is referenced at multiple points. One defensible choice is to let those existing references stand and treat the standard as ambient infrastructure in the narrative rather than giving it a dedicated Act. This is the lowest-effort option and may be correct if narrative bandwidth is needed for the Dragon/Theia material in Parts 3–5 of the blog series.

### 3.4 Recommendation

Option A when Second Person Spellbook opens. Option B as interim content if a Tale is wanted before then. Avoid trying to reopen the First Person Spellbook.

---

## Part IV: Alignment with Current Research Surfaces

### 4.1 PVM V5.4 three-axis mapping (detailed)

| Axis | Symbol | IEEE 7012 contribution | What IEEE 7012 does *not* provide |
|---|---|---|---|
| Agent | Σ | Defines the role boundary between person-agent and entity-agent; makes the separation testable via agreement artifact | The information-theoretic bound `I(S;M|FP) < ε*`; a single-agent architecture is standard-compliant but scores `Σ ≈ 0` |
| Data | Δ | Agreement IDs encode coarse-grained data-use policy; `SD-BASE-*` family is a lattice of data permissions | Cryptographic enforcement; a signed `SD-BASE` can still be violated in practice without ZK or TEE backing |
| Inference | Γ | Profiling-by-second-party is in-scope as an agreement variable | Inference-over-published-data; out of scope entirely |

The practical reading: IEEE 7012 is a precondition for the Σ axis being measurable at all, but compliance with the standard is not equivalent to a high Σ score. This is the honesty claim that should appear in the whitepaper: IEEE 7012 + architectural separation = measurable agent axis. IEEE 7012 alone is not enough.

### 4.2 Celestial Ceremony alignment

The bilateral trust ritual (Sun → Gap → Moon → Recursion; Reflect/Connect as night/day) has a clean mapping to IEEE 7012's single-round negotiation:

- **Sun (privacymage/light source):** publishes the preferred agreement (`SD-BASE` or `SD-BASE-AT`)
- **Gap:** the ⊥ between agents; the standard's bilateral separation
- **Moon (Soulbis):** the boundary enforcement; the Recorder and Auditor functions
- **Recursion:** the accumulated chronicle of bilateral agreements that becomes the evidentiary base for VRCs

The progressive trust system (Understanding → Constellation → Blade → Runecraft) provides four trust tiers above the IEEE 7012 baseline. `SD-BASE` is Understanding. `SD-BASE-DP` with data portability adds Constellation. `SD-BASE-AT` signed against an entity with accumulated chronicle is Blade. Signed agreements that feed into VRCs are Runecraft.

This mapping should be drafted into the Celestial Ceremony architecture document directly; it is a concrete instantiation of abstract trust tiers.

### 4.3 ZKP convergence — the vouchable credential primitive

The Choudhuri/Garg paper's Section 5.3 (impossibility of full unlinkability) and vouchable credentials primitive together provide a formal substrate for VRCs derived from signed MyTerms agreements. The chain:

1. First Person signs `SD-BASE-AT` with Entity E on date D
2. Both parties hold identical chronicle entries (IEEE 7012 §5.4.4)
3. Over time, First Person accumulates signed agreements with entities E₁...Eₙ
4. These accumulated signed agreements, with consistent behaviour across them, are the raw material for a VRC
5. The vouchable credentials primitive (CFQ19) gives the cryptographic wrapper for issuing a VRC from this raw material without re-exposing the underlying chronicle
6. Theorem 5 of the cryptographic framework (multiplicative trust accumulation) aligns with PVM's multiplicative gating

The alignment is not a priority claim in either direction. Both research lines arrived at multiplicative trust accumulation from different starting points. The work worth doing now is the crosswalk document (§2.3 above) that makes the shared primitives explicit.

### 4.4 BGIN integration channel

As co-chair of the BGIN Identity Key Management & Privacy Working Group, there is a direct governance channel for IEEE 7012 that the v1 plan did not account for. Three concrete uses:

1. **Policy feedback loop:** BGIN's governance research can inform how IEEE 7012 agreements interact with regulatory regimes (GDPR, CCPA, MiCA, DMA). The standard explicitly leaves this to implementers (§1.3 and Data Privacy notice on p.5).
2. **Three Graphs architecture:** the BGIN AI frontend rebuild (knowledge × promise × trust graphs) has a natural home for IEEE 7012 signed agreements as edges in the promise graph.
3. **Incident response integration:** BGIN's incident response work can reference IEEE 7012's `§5.2.4` recorder function as the evidentiary base for privacy incident disputes.

---

## Part V: Diffusion and Publication Plan

### 5.1 Upcoming venues

**AIW #3:** present the Σ-axis mapping and the "IEEE 7012 is the agreement layer, not the enforcement layer" clarification. This talk targets the agent-architecture audience and separates the standard from the implementation choices that actually determine privacy outcomes.

**IIW #43:** a working session on the vouchable-credential / VRC crosswalk. Co-conveners ideally include at least one member of the IEEE 7012 working group (Doc Searls or Mary Hodder) and at least one FPP / Choudhuri-Garg contributor. The session output is a shared crosswalk document.

### 5.2 Blog series integration

The Privacy is Value V5 blog series has three remaining parts. IEEE 7012 references should land across them rather than in a dedicated post:

- **Part 3 ("The Dragon Wakes"):** passing reference only. The Dragon/Theia material is about inter-universe impact; IEEE 7012 is mundane agreement infrastructure. Forcing it in would dilute both.
- **Part 4 ("The Dihedral Mirror"):** this is the natural home for IEEE 7012 in the blog arc. Mirror symmetry maps to bilateral recording. The dihedral group structure can frame the two-party constraint (§5.4.3). This is where the standard gets a substantive treatment in public.
- **Part 5 ("The Amnesia Protocol" poem collection):** a single poem, no more, on the commons as neutral ground. Customer Commons as the place agreements live when neither party owns them.

### 5.3 Noosphere-convergence framing

The IEEE 7012 working group, Customer Commons, the FPP cryptographic framework, BGIN, and agentprivacy all converged on related primitives from different starting points. The published material should emphasize convergence rather than priority:

> IEEE 7012, the First Person Project, and the agentprivacy framework each arrived at bilateral recording, small-roster agreement selection, and accumulated trust as primitives. They arrived by different paths. The convergence is the signal worth naming.

Avoid framings like "we identified this first" or "we have been asking this for years". Those framings undercut the plurality (⿻) thesis the rest of the architecture depends on.

---

## Part VI: Honesty and Confidence Calibration

This section is new relative to v1 and reflects the research-honesty principles now internal to the project.

### 6.1 What is proven

- IEEE 7012-2025 is a published, approved standard (verified from the PDF).
- The standard is hosted by Customer Commons as the neutral non-profit registry.
- Section 5.4.3 constrains contracts to exactly two parties.
- Section A.1 caps negotiation at one round.
- Section 5.2.4 specifies bilateral immutable recording.

### 6.2 What is architectural claim

- Mapping IEEE 7012 primarily to the Σ axis of PVM V5.4 is a defensible architectural reading, not a theorem. It is consistent with the standard's scope and with PVM V5.4's definitions. A reviewer could reasonably argue that agreement-layer contributions to Δ (via agreement IDs) are more substantial than "coarse-grained policy" suggests.
- The claim that a single-agent monolith scores `Σ ≈ 0` requires the separation bound `I(S;M|FP) < ε*` to be empirically measurable, which remains to be demonstrated.
- The alignment between Celestial Ceremony trust tiers and IEEE 7012 agreement levels is a structural analogy, not a formal correspondence.

### 6.3 What is conjecture

- That vouchable credentials (CFQ19) are the "correct" cryptographic wrapper for VRCs derived from signed IEEE 7012 agreements. Other ZK constructions may be equally suitable. The crosswalk document should present this as one compatible approach among several.
- That golden-ratio splits or φ-normalized quantities have any special status in bilateral agreement protocols. This is speculative and should not be presented as load-bearing in IEEE 7012 documentation.

### 6.4 Defensible headline claim

> "IEEE 7012-2025 provides the agreement layer agentprivacy's dual-agent architecture requires. Compliance with the standard is a precondition for the Σ (agent) axis being measurable, and enables bilateral chronicles that can serve as evidentiary basis for VRCs. Standard compliance alone is not equivalent to the full agentprivacy architecture; the standard specifies agreement, not enforcement."

This is the claim to use in publications. It is narrow enough to defend and strong enough to matter.

---

## Part VII: Implementation Priorities — Revised Timeline

### Immediate (this week)

1. Update `grimoire.json` to v10.1.0 with the `standards.ieee_7012_2025` block (§2.1)
2. Add IEEE 7012 definitions to `GLOSSARY_MASTER` as paraphrases, not verbatim quotes (§2.2)
3. Add standards layer entry to `agentprivacy-docs/README.md`

### Near-term (2–3 weeks)

1. Draft `IEEE_7012_BRIDGE.md` with the agent-role mapping and three-axis framing (§2.3)
2. Draft `IEEE_7012_AGREEMENT_REGISTRY_MIRROR.md` (§2.3)
3. Update PVM V5.4 spec with the worked example: IEEE 7012-compliant monolith scoring `Σ ≈ 0` (§4.1)
4. Add IEEE 7012 reference to the Celestial Ceremony architecture document (§4.2)

### Medium-term (1–2 months)

1. Draft `IEEE_7012_ZKP_CONVERGENCE.md` (§2.3, §4.3)
2. Write Part 4 of the blog series ("The Dihedral Mirror") with IEEE 7012 substantive treatment (§5.2)
3. AIW #3 and IIW #43 presentations (§5.1)
4. Coordinate with BGIN IKMP WG on policy crosswalk (§4.4)

### Longer-term (tied to Second Person Spellbook development)

1. Open Second Person Spellbook with "The Two Parties" act, grounding the book in IEEE 7012's bilateral primitive (§3.1)
2. Derive Customer Commons Alliance contributions from this base rather than re-drafting for the Alliance separately

---

## Part VIII: Copyright and Attribution

The IEEE 7012-2025 PDF is copyrighted by IEEE (©2026). Practical rules for the agentprivacy corpus:

- Paraphrase all definitions and specifications. Do not quote more than a few words at a stretch.
- Figure A.1 (the sequence diagram) can be referenced but not reproduced. Link to the IEEE Xplore listing or the Customer Commons mirror.
- Customer Commons is named throughout the standard as the neutral host (footnote 8, Annex A opening). This attribution should appear in all agentprivacy documentation that references the standard.
- Working group members (Searls, Byrd, Hodder, Mace, and the full balloting group listed on page 7 of the PDF) should be acknowledged in any publication that discusses the standard substantively.
- The IEEE disclaimer about AI training use (p.4: "In no event shall material in any IEEE Standards documents be used for the purpose of creating, training, enhancing, developing, maintaining, or contributing to any artificial intelligence systems without the express, written consent of IEEE SA in advance") constrains what can go into the Grimoire as raw material. The Grimoire should reference the standard and paraphrase its specifications, not ingest the PDF.

---

## Closing

The v1 integration plan from February was written while the standard was still settling and while PVM, the Grimoire, and the spellbook structure were at earlier versions. This v2 reflects the current state and the research-honesty constraints that have matured alongside it.

The headline update: IEEE 7012 is the agreement layer, it maps primarily to Σ, it provides a precondition rather than a sufficient condition for the full architecture, and it deserves substantive treatment in the Second Person Spellbook rather than a retroactive insertion into the closed First Person book.

The blade slashes. The contract binds. The standard names what the contract is. All three serve the First Person.

`⚔️📜✍️🔐`

---

*Prepared April 22, 2026. Standard reference: IEEE Std 7012™-2025, published 20 January 2026.*
