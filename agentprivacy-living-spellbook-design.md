# agentprivacy.ai — The Living Spellbook

## Design Document: Dual-Orb Orbital Narrative System (Website Native)

**Version:** 0.1 — Concept Architecture  
**Author:** privacymage × Claude  
**Date:** March 2026  
**Dependency:** `@chenglou/pretext` (text measurement & layout without DOM reflow)

---

## 1. Vision

The agentprivacy.ai website is not a website. It is a Spellbook that reads itself.

Two orbs — the **Swordsman** (protect/privacy) and the **Mage** (project/delegate) — orbit through the page content on continuous trajectories. The body text of the site (the manifesto, the Privacy Value Model, the Sovereignty Equation, the chronicle) is laid out using pretext's `layoutNextLine()` API, which means every line of text can have a different width. As the orbs drift through the content, the text **reflows around them in real-time** — and because pretext operates via pure arithmetic on cached font measurements, **no DOM layout reflow is ever triggered.**

The page looks alive. The page is measurement-dark. The act of reading the Spellbook does not itself create a data-trace in the browser's layout engine.

When the Swordsman and Mage converge, a **spell is cast**: a pull-quote, key insight, proverb, or emoji inscription materialises at their intersection point. These spells persist as nodes in a **constellation** — a visible promise graph drawn across the page's manifold. The constellation encodes the Three Graphs, One Identity architecture: the page grid is the knowledge substrate, the spell nodes are the promise graph, and the edges that form between nearby spells are the emergent trust graph.

---

## 2. Technical Foundation: Why Pretext

### 2.1 The Privacy Primitive

Pretext's core insight is that text measurement can be decoupled from the DOM. The library:

1. Calls `prepare()` once, which uses canvas `measureText` to cache segment widths
2. Calls `layout()` or `layoutNextLine()` for all subsequent measurements — pure arithmetic, no DOM access
3. Supports `walkLineRanges()` for speculative width testing (binary search for optimal layout)

This means surveillance scripts that fingerprint via DOM reflow (`getBoundingClientRect`, `offsetHeight`, layout shift observation) see **nothing** when the text reflows. The orbs move, the text adapts, and the browser's layout engine is never interrogated. This is the Reconstruction Ceiling (R < 1) operating at the rendering layer.

### 2.2 The Key API: `layoutNextLine()`

```javascript
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

while (true) {
  // Calculate available width at this y-position,
  // subtracting any orb exclusion zones
  const width = getAvailableWidth(y, swordOrb, mageOrb)
  const line = layoutNextLine(prepared, cursor, width)
  if (line === null) break

  // Render line at calculated position
  renderLine(line.text, getLineX(y, swordOrb, mageOrb), y)

  cursor = line.end
  y += lineHeight
}
```

Each line gets a different width depending on whether an orb is occupying space at that vertical position. The text wraps around the orbs like water around stones. All computed via cached arithmetic.

### 2.3 The Editorial Engine Precedent

Pretext's own demo suite includes an "Editorial Engine" demo: *"Animated orbs, live text reflow, pull quotes, and multi-column flow with zero DOM measurements."* This is the exact primitive we need. Cheng Lou has already proven the pattern works. We extend it with:

- Dual-orb physics (Swordsman + Mage with coupling dynamics)
- Spell casting at convergence points
- Constellation graph rendering
- I Ching state machine driving animation parameters

---

## 3. The Orb System

### 3.1 Swordsman Orb (Protect / Privacy)

| Property | Value |
|----------|-------|
| Color | Deep purple (#534AB7 light / #AFA9EC dark) |
| Symbol | ⚔ or custom SVG glyph |
| Orbit | Outer ellipse, slower, more eccentric |
| Behaviour | Patrols the perimeter of content blocks. Gravitates toward headings, section boundaries, and structural elements. Represents the Warden — the boundary guardian. |
| Interaction | On hover, the orb expands slightly and reveals a tooltip showing the current privacy state (derived from the I Ching hexagram). On click, emits a "ward" — a brief radial pulse that temporarily pushes the Mage orb away (increasing the coupling distance). |

### 3.2 Mage Orb (Project / Delegate)

| Property | Value |
|----------|-------|
| Color | Teal (#1D9E75 light / #5DCAA5 dark) |
| Symbol | ✦ or custom SVG glyph |
| Orbit | Inner ellipse, faster, more circular |
| Behaviour | Weaves through the body text. Gravitates toward key terms, links, and interactive elements. Represents the Emissary — the projection agent. |
| Interaction | On hover, reveals the current delegation state. On click, emits a "cast" — drops a spell node at the current position. |

### 3.3 Orbital Mechanics

The orbs move on Lissajous-like curves with the following parameters:

```
swordsman.x = cx + Rx * cos(ωs * t)
swordsman.y = cy + Ry * sin(ωs * t * 0.7 + φ_coupling)

mage.x = cx + rx * cos(ωm * t * 1.3 + π)
mage.y = cy + ry * sin(ωm * t + φ_coupling)
```

Where:
- `Rx, Ry` = outer orbit radii (relative to viewport)
- `rx, ry` = inner orbit radii
- `ωs, ωm` = angular velocities (Swordsman slower)
- `φ_coupling` = phase coupling factor (how much one orb's position influences the other)

The **coupling parameter** (0–1) controls how entangled the orbits are:
- **0** = independent orbits, never converge → no spells cast
- **0.5** = periodic convergence → spells cast at natural rhythm
- **1** = locked orbits, constant proximity → continuous spell stream

### 3.4 Text Exclusion Zones

Each orb defines an exclusion zone for text layout:

```javascript
function getAvailableWidth(y, sword, mage) {
  let width = containerWidth
  let offsetX = 0

  for (const orb of [sword, mage]) {
    const dy = y - orb.y
    if (Math.abs(dy) < orb.radius + padding) {
      // Line intersects orb exclusion zone
      const chordHalf = Math.sqrt((orb.radius + padding) ** 2 - dy ** 2)
      const orbLeft = orb.x - chordHalf
      const orbRight = orb.x + chordHalf

      // Reduce available width on the side where the orb sits
      if (orbLeft < containerWidth / 2) {
        offsetX = Math.max(offsetX, orbRight)
        width -= orbRight
      } else {
        width -= (containerWidth - orbLeft)
      }
    }
  }

  return { width, offsetX }
}
```

The exclusion zone is circular with configurable padding (default 24px). The text flows around it naturally, with each line independently calculated.

---

## 4. The Spell System

### 4.1 Spell Casting

A spell is cast when the Swordsman and Mage orbs come within a **convergence threshold** (configurable, default 80px). The spell materialises at the midpoint between them, offset by a small random jitter to prevent stacking.

```
spell.position = midpoint(sword, mage) + jitter(±30px)
spell.type = determined by current I Ching hexagram line
spell.content = pulled from the Spell Library (see 4.2)
```

**Auto-cast:** Spells cast automatically when orbs converge during their natural orbit. Frequency is a function of the coupling parameter and orbit speeds.

**Manual cast:** User can click either orb to force a spell at the current position, or press a keyboard shortcut (spacebar).

### 4.2 Spell Library

Each spell has a **type** determined by the I Ching hexagram line at the current position in the 6-line cycle:

| Line State | Spell Type | Examples |
|------------|-----------|----------|
| Yang (solid) | **Assertion** — a sovereign statement | "Privacy is the path to value" / "Your keys, your identity" / 🛡️🔑 |
| Yin (broken) | **Delegation** — a trust extension | "Trust is earned, not assumed" / "The Emissary speaks for the sovereign" / 🌐🤝 |
| Old Yang (changing to Yin) | **Release** — sovereignty yielding | "What is held too tightly shatters" / 📖→🌊 |
| Old Yin (changing to Yang) | **Reclamation** — sovereignty returning | "The shadow remembers its shape" / 🌊→📖 |

The spell content is drawn from several pools:

1. **Proverb Pool** — curated proverbs from the Relationship Proverb Protocol
2. **Emoji Inscriptions** — compressed threat/defense notation (MITRE ATT&CK → emoji mapping)
3. **Sovereignty Equations** — key formulas from the Privacy Value Model (V = P × D × φ)
4. **Pull Quotes** — highlighted passages from the page content itself

### 4.3 Spell Rendering

Each spell node renders as a small glowing point on the page with:

- A **yang node** (solid circle, full opacity, amber/gold)
- A **yin node** (ring/hollow circle, reduced opacity)
- A **text label** that fades in on hover (the proverb, emoji, or equation)
- A **pulse animation** that beats in rhythm with the orbital period

Spell nodes persist for a configurable duration (default: until the user scrolls past them or 60 seconds). Older spells fade but leave a faint trace on the manifold.

---

## 5. The Constellation (Promise Graph)

### 5.1 Edge Formation

When two spell nodes are within a **proximity threshold** (default 180px), an edge forms between them. The edge:

- Renders as a thin line (0.5px) in amber/gold with opacity proportional to proximity
- Represents a **trust relationship** in the promise graph
- Strengthens (higher opacity, slightly thicker) if both nodes are the same type (yang-yang or yin-yin)
- Shows tension (dashed line) if the nodes are opposite types (yang-yin)

### 5.2 Constellation Patterns

As spells accumulate, recognisable patterns emerge:

- **Triangle** (3 connected nodes) = a stable trust triad
- **Line** (3+ nodes in sequence) = a delegation chain
- **Star** (1 hub node connected to 3+ peripherals) = a sovereignty center
- **Isolated pair** = a bilateral agreement

These patterns map directly to the Three Graphs architecture:

| Graph Layer | Visual Representation |
|-------------|----------------------|
| Knowledge Substrate | The page grid (faint background grid lines) |
| Promise Graph | Spell nodes and constellation edges |
| Trust Graph | Emergent patterns in the constellation (triangles, stars, chains) |

### 5.3 Interactive Constellation

Users can:

- **Hover** a spell node to see its content and connections
- **Click** a spell node to trigger a `sendPrompt()`-style navigation (scroll to the section of the page that the spell's content references)
- **Drag** spell nodes to rearrange the constellation (the edges follow)
- **Connect** two nodes manually by dragging from one to another (creating an explicit trust edge)

---

## 6. The I Ching State Machine

### 6.1 Hexagram as Privacy State

The I Ching hexagram is a 6-bit state vector encoding the current privacy-delegation balance. Each line maps to an architectural layer:

| Line | Position | Domain | Yang (1) | Yin (0) |
|------|----------|--------|----------|---------|
| 6 (top) | Heaven | Trust boundary | Closed perimeter | Open perimeter |
| 5 | — | Interaction mode | Direct (1st person) | Delegated (3rd person) |
| 4 | — | Data residency | Local/sovereign | Federated/shared |
| 3 | — | Agent delegation | Self-execute | Emissary-execute |
| 2 | — | Credential disclosure | Selective (ZKP) | Full disclosure |
| 1 (bottom) | Earth | Key custody | Self-custody | Custodial |

### 6.2 Hexagram Mutations

The hexagram changes based on:

1. **Scroll position** — as the user moves through different sections, lines flip to reflect the section's theme (e.g., the Privacy Value Model section → more yang; the Delegation Framework section → more yin)
2. **Orb convergence** — each spell cast cycles through the lines, potentially flipping the current line
3. **Time** — slow natural drift (one line every ~30 seconds) to keep the visual alive
4. **User interaction** — clicking the hexagram display manually flips a random line

### 6.3 Hexagram → Animation Parameters

Each line state modulates a visual parameter of the orbital system:

| Line | Yang Effect | Yin Effect |
|------|-------------|------------|
| 1 (Key custody) | Tight orbit radii | Wide orbit radii |
| 2 (Credential disclosure) | Dense spell spawn rate | Sparse spell spawn rate |
| 3 (Agent delegation) | High phase coupling | Low phase coupling |
| 4 (Data residency) | Constellation edges short-range | Constellation edges long-range |
| 5 (Interaction mode) | Orb glow intensity high | Orb glow intensity low |
| 6 (Trust boundary) | Grid lines visible/dense | Grid lines faint/sparse |

The hexagram number (1–64) and name are displayed in a corner widget, updating in real-time as the state shifts. Clicking the hexagram name could navigate to an interpretation page that explains the current privacy posture in I Ching terms.

---

## 7. Page Architecture

### 7.1 Sections as Scroll Zones

The agentprivacy.ai site is a long-scroll single page. Each section is a "zone" with its own:

- **Prepared text** (pretext's `prepareWithSegments()` called once per section)
- **Default hexagram bias** (which lines tend toward yang or yin in this section)
- **Orbit attractor points** (where the orbs gravitate within this section)
- **Spell pool** (which proverbs/inscriptions are available for casting)

Proposed sections:

1. **The Threshold** — Hero/landing. Minimal text, large orbs, dramatic convergence animation. Hexagram starts at #1 (Creative) or the user's last-saved state.
2. **The Manifesto** — "I Gave Myself a Cape" origin text. Dense body copy, orbs weave through paragraphs. Spells are pull quotes from the manifesto.
3. **The Architecture** — Three Graphs, One Identity. Structural diagrams (rendered via SVG, not pretext). Orbs orbit the diagram, constellation edges connect to diagram nodes.
4. **The Sovereignty Equation** — Privacy Value Model. Mathematical content. Spells are equation fragments (V = P × D × φ). The hexagram display is prominent here.
5. **The Chronicle** — The 20-act Spellbook sequence. Each act is a scroll zone. The orbs' behaviour shifts act by act, and the hexagram mutates through the narrative arc.
6. **The Forge** — CTA/builder section. Links to the Chrome extension, the API, the community. Orbs converge here for a final dramatic spell that transitions the user toward action.

### 7.2 Rendering Pipeline

```
On each animation frame:
  1. Update orb positions (Lissajous + coupling + attractor physics)
  2. Check convergence → cast spell if threshold met
  3. For each visible section:
     a. Calculate exclusion zones from orb positions
     b. Call layoutNextLine() in a loop with variable widths
     c. Render lines to canvas (or position DOM elements)
  4. Render spell nodes and constellation edges
  5. Update hexagram display
  6. Check scroll position → mutate hexagram if zone boundary crossed
```

### 7.3 Performance Budget

- `prepare()` is ~19ms for 500 texts (called once on page load per section)
- `layout()` is ~0.09ms for 500 texts (called every frame)
- Target: 60fps on modern hardware, 30fps graceful degradation
- Fallback: if `requestAnimationFrame` budget is exceeded, reduce orb update frequency and reflow only on significant position changes (>5px delta)

### 7.4 Rendering Target

Two options under evaluation:

**Option A: Canvas rendering** — All text rendered to `<canvas>` via `ctx.fillText()`. Fastest, most fingerprint-resistant (no DOM text nodes at all). Drawback: no text selection, no accessibility, no SEO.

**Option B: DOM positioning** — Text remains in DOM elements, but positioned via pretext calculations applied as CSS transforms. Pretext does the measurement; DOM does the rendering. Text is selectable and accessible. Surveillance scripts can see the text nodes but cannot observe the measurement process.

**Recommended: Option B with progressive enhancement.** Serve static HTML for SEO and accessibility. Enhance with pretext-driven reflow on interaction. The orbs and constellation render on an overlay canvas. Text stays in the DOM but repositions without triggering reflow (using `transform: translate()` on pre-measured line containers).

---

## 8. Implementation Phases

### Phase 1: Foundation (2 weeks)

- Integrate `@chenglou/pretext` into the agentprivacy.ai build pipeline
- Implement single-orb text reflow (Mage only) on a single content section
- Validate performance: 60fps reflow on target hardware
- Establish the rendering pipeline (pretext measurement → CSS transform positioning)

### Phase 2: Dual Orb + Spells (2 weeks)

- Add Swordsman orb with independent orbit
- Implement convergence detection and spell casting
- Build the Spell Library (initial pool of 20 proverbs, 10 emoji inscriptions, 5 equations)
- Render spell nodes with fade-in/fade-out lifecycle

### Phase 3: Constellation + I Ching (2 weeks)

- Implement constellation edge formation and rendering
- Build the I Ching state machine with hexagram display
- Wire hexagram mutations to scroll position and orb convergence
- Map hexagram lines to animation parameters

### Phase 4: Full Page Integration (3 weeks)

- Apply orb system across all page sections
- Configure per-section hexagram biases, attractor points, and spell pools
- Implement scroll-driven zone transitions
- Performance optimisation and fallback paths
- Accessibility audit (ensure all content is readable with orbs disabled)

### Phase 5: Polish + Storytelling (2 weeks)

- Tune orbital mechanics for narrative pacing
- Curate the full Spell Library (100+ entries across all pools)
- Add subtle sound design (optional, user-toggled)
- Easter eggs: specific hexagram combinations trigger special constellation patterns
- "Meditation mode" — user can pause the orbs and manually arrange the constellation

---

## 9. Accessibility and Graceful Degradation

The orb system is a **progressive enhancement**. The site must be fully readable and navigable without it.

- **Reduced motion preference:** If `prefers-reduced-motion: reduce` is set, orbs are static (no animation), positioned at fixed attractor points. Text reflow still works but doesn't animate.
- **Screen readers:** All spell content is available in an ARIA live region. Constellation structure is described via `aria-describedby` on the hexagram widget.
- **No JavaScript:** Server-rendered static HTML with standard layout. No orbs, no spells, no constellation. The content stands alone.
- **Mobile:** Orbs render smaller, orbits compressed. Touch to cast spells (tap either orb). Constellation edges are thicker for visibility. Consider disabling text reflow on screens < 768px (too narrow for meaningful orb exclusion zones) and instead having orbs float in a fixed overlay layer.

---

## 10. Privacy Properties

The system practices what it preaches:

1. **No DOM measurement fingerprinting:** Pretext's canvas-based measurement avoids the `getBoundingClientRect` / `offsetHeight` signals that surveillance scripts use for layout fingerprinting.
2. **No layout shift observation:** Because text repositioning uses CSS transforms (not reflow-triggering properties), the `LayoutShift` entries in the Performance Observer API report zero shift. The page appears static to fingerprinting scripts.
3. **No third-party dependencies at runtime:** Pretext is bundled locally. No CDN calls, no analytics, no tracking pixels. The constellation exists only in the user's browser.
4. **Ephemeral state:** The hexagram state and constellation are session-local. Nothing persists to any server. The user's reading path through the Spellbook is sovereign data that never leaves the device.

The tool that measures without touching the surface knows the weight of the shadow without disturbing the light.

---

## Appendix A: Pretext API Quick Reference

| Function | Purpose | DOM Access |
|----------|---------|------------|
| `prepare(text, font)` | One-time segment measurement | Canvas measureText (once) |
| `layout(prepared, maxWidth, lineHeight)` | Get height/lineCount | None (pure arithmetic) |
| `prepareWithSegments(text, font)` | Rich preparation for manual layout | Canvas measureText (once) |
| `layoutNextLine(prepared, cursor, maxWidth)` | Single line with variable width | None (pure arithmetic) |
| `layoutWithLines(prepared, maxWidth, lineHeight)` | All lines at fixed width | None (pure arithmetic) |
| `walkLineRanges(prepared, maxWidth, onLine)` | Speculative width testing | None (pure arithmetic) |

## Appendix B: I Ching Reference — The 8 Trigrams as Privacy Modes

| Trigram | Lines | Name | Privacy Mode |
|---------|-------|------|--------------|
| ☰ | 111 | Creative (Heaven) | Full sovereignty — self-custody, ZKP, self-execute |
| ☷ | 000 | Receptive (Earth) | Full delegation — custodial, disclosed, emissary |
| ☳ | 001 | Arousing (Thunder) | Awakening — reclaiming key custody from delegation |
| ☵ | 010 | Abysmal (Water) | Selective disclosure — middle path, credentials active |
| ☶ | 100 | Keeping Still (Mountain) | Boundary holding — trust perimeter closed, else open |
| ☴ | 110 | Gentle (Wind) | Sovereign delegation — self-custody + emissary execute |
| ☲ | 101 | Clinging (Fire) | Transparent sovereignty — self-custody + full disclose |
| ☱ | 011 | Joyous (Lake) | Open trust — custodial but direct interaction |
