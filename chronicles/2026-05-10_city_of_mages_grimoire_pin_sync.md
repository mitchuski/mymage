# Chronicle — City of Mages Grimoire Pin Sync (Mage bundle)

**Date:** 2026-05-10
**Author:** privacymage
**License:** CC BY-SA 4.0

---

## What landed

The bundled `city_of_mages_grimoire_v1_1_0.json` at this extension's project root was re-synced from the canonical `agentprivacy-docs/models/`. SHA-256 now matches the canonical. Material change: `ipfs_pin_status` now records the live pin.

```
v1.1 PINNED 2026-05-10 at
https://sync.agentprivacy.ai/ipfs/bafkreidv7cwwlcnuzw3eyhcbbvoccy7do2lmwrmmtrszn62ninzxj3idti
```

`README.md` line 9 was updated in lockstep:
- corrected stale spell count (36 → 39 — post-reconciliation count, after `genitrix-map-vertex` was added during P2)
- surfaced the **First City of Mages on Drake Island** framing — the grimoire `title_note` names a kind, not a singular instance
- pin URL inlined for verification

---

## What this means for the Mage bundle

The Mage operates inside the Σ-scope of agreements the Swordsman has signed. The bundled grimoire feeds the Spell Projection surface — once the build script copies the synced JSON into `dist/`, projections will resolve City of Mages spells against the live pin. A manifest version bump is appropriate at next release.

The IEEE 7012 framing is unaffected; the Mage remains a non-party delegation per §5.4.3. The grimoire sync only changes which spells the Mage may project from.

---

## Source canonical references

- Canonical grimoire: `agentprivacy-docs/models/city_of_mages_grimoire_v1_1_0.json`
- Pin chronicle (master): `agentprivacy_master/docs/chronicles/2026-05-10_city_of_mages_grimoire_pinned_chronicle.md`
- Phase D bake chronicle: `agentprivacy_master/docs/chronicles/2026-05-10_phase_d_baked_and_uor_substrate_chronicle.md`
- Sibling sync chronicles (same patch): `agentprivacy-skills/chronicles/2026-05-10_*`, `zk blades forge/chronicles/2026-05-10_*`, `swordsman-blade/chronicles/2026-05-10_*`

---

## Watch out

- v1.2 will add Luca 📐 at V0 + Tome V Act 15 *The Substrate* + 3 Luca spells. Fresh CID. Re-sync this mirror when v1.2 lands.
- Keep this bundle and `swordsman-blade` in lockstep — both extensions ship both grimoires; mismatch between them creates an asymmetric Spell Builder vs Spell Projection surface.

---

*(⚔️⊥⿻⊥🧙)😊*

CC BY-SA 4.0 · privacymage · 2026-05-10
