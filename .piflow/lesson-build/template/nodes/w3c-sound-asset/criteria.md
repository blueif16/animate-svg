# node: w3c-sound-asset — GOLD CRITERIA (the QUALITY bar above the gap-scan-lint floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by the optimize loop's soft scoring, a verify/judge pass, and the
     human eye. NEVER injected into w3c-sound-asset's runtime prompt — seeing this bar teaches-to-the-test
     and voids the clean-room signal the loop depends on (the same law as game-omni's w1-design/criteria.md
     and every nodes/*/memory.md). Discovered BY CONVENTION at nodes/w3c-sound-asset/criteria.md (pointed to
     by node.json `optimize.criteria`), exactly like game-omni's w0-classify/sound. Maintenance = the
     optimize/enhance skill (the same loop that owns memory.md). -->

## What this file is (read before judging)

The **registry-membership floor is a PRIOR, separate stage**: `checks.pre` (`json-parses` on the injected
`audio-cues.json`) and `node.json` `optimize.measure` (`sound-asset-gap-scan` — cross-file membership against
the shared-sound `_index.json` files + the vlog_test GENERATED sidecar) fold their verdicts into
`optimize/substrate/measure.w3c-sound-asset.json` for triage. That floor now goes further than bare membership:
it `statSync`s the REAL `.wav` + a sibling `.license.txt` before counting any key resolved (an index/sidecar
row is a claim, not proof a file exists), hard-fails a syntactically-valid `audio-cues.json` that requests
ZERO keys (every lesson requires at least a `bed`), and cross-checks any comma-grouped byte count the log
cites for a resolved key against the file's REAL size. **None of the marks below is "does the key exist", "is
the JSON valid", or "is the cited byte count real"** — those already passed (or the run never reached
judging), and passing THEM earns NOTHING here.

These marks judge the one thing the floor cannot: **did the node actually VERIFY what it claims, and is its
log a trustworthy record a downstream reader (or an auditor) can act on without re-doing the work?**
w3c-sound-asset emits one small log (`_logs/sound-asset.md`) — usually confirming "nothing to do" — but a
false "all resolve" or an unminted gap silently glossed as resolved is discovered only at W5 (the last, most
expensive render stage), where the cheapest possible catch (a local file lookup, done here) has been squandered
and every downstream wave's work ships with a missing or broken sound asset. So the judge reads
`audio-cues.json` + the produced `_logs/sound-asset.md` and asks, as **a senior audio pipeline engineer who has
never seen this workflow** would: *could I re-derive every one of this log's resolution claims from its own
cited evidence, without re-trusting the node's say-so?*

**EVIDENCE LAW (anti-hallucination).** Every PASS requires a QUOTED line of the log (a file path, a byte count,
a license-sidecar check, a manifest row, a pipelineFinding) — no quote ⇒ FAIL. Cite the evidence BEFORE you
mark, never mark then rationalize; a confident "no gaps found" line never moves a mark on its own. Judge only
what is OBSERVABLE in the log text + the artifacts it claims to have checked; never credit unstated intent.

---

## The checklist — dimensions a great gap-scan log covers (flag any it silently skips)

- [ ] Every key actually referenced in `audio-cues.json` (`bed`, `intro.sting` if present, every `sfx[].sound`)
  is individually accounted for in the log — none silently dropped from the table/summary.
- [ ] Each accounted-for key's resolution cites the ACTUAL resolved file/evidence, not just the key name restated.
- [ ] A genuine gap (a key absent from the library at run time) is NAMED explicitly, never glossed as "resolved".
- [ ] A minted gap shows the FULL chain: manifest row → generator invocation → verified WAV → freeze — not
  just "created".
- [ ] License provenance is confirmed (a `.license.txt` sidecar exists) for every resolved/minted asset, not
  merely asserted.
- [ ] The log stays a LEAN, reusable spec — a per-key table is the spine, not a restated narrative essay
  (the workflow's own "lean artifact" law).
- [ ] Asset resolution never reaches outside the two declared external roots (the shared-sound library + the
  vlog_test pipeline) — scope discipline.
- [ ] Any upstream oddity in `audio-cues.json` itself (a malformed shape, a key outside the documented fixed
  vocabulary with no library entry, a parse issue) is FLAGGED as a `pipelineFinding` naming the true upstream
  owner (w2c-sound-design), never silently absorbed or silently "fixed" here.

---

## The six criteria (each keyed on a DECISION/RELATION, never mere PRESENCE)

**Required (R)** must ALL pass for a *sound* gap-scan. **Aspirational (A)** are the discriminators that
separate a *correct* pass from one that actually raises the floor of trust in this lane — they are NOT
required and NEVER block soundness; they are the headroom the optimize loop climbs toward.

### C1 · Resolution is GENUINE, not asserted (R, top leverage)
**PASS —** Every key the log calls "resolved" carries evidence beyond the bare key name — a specific file
path AND at least one corroborating fact (a byte size, a `.license.txt` check, an exact matched `_index.json`
entry) — such that a reader could re-derive the same resolution from the cited evidence alone, without
re-trusting the node's say-so. Quote the evidence line for at least one key.
**Failure signature —** The log states "all keys resolve" / "status ok" with no per-key evidence beyond
restating the key names — e.g. a bare one-line "no gaps found" with no verifiable table (the real historical
`kptest-fenyuhe-five` log: four keys named in prose, zero corroborating evidence, indistinguishable from a
node that never actually opened the index files).
**Why this cannot be gamed —** Restating "resolved: `<key>`" for every key is exactly the presence-based
surrogate this criterion forbids — passing requires citing something the node could only have produced by
actually reading the index (a real byte count, a real license check, an exact matched entry), not by asserting
success. Enum/path-format-validity is the hard floor's job and earns nothing here. Note the floor now backs
this up mechanically, not just rhetorically: `sound-asset-gap-scan` cross-checks any comma-grouped byte count
the log cites for a resolved key against that file's REAL `statSync` size (`logByteMismatches`) — a
FABRICATED number is caught deterministically before it ever reaches this judgment. So this mark's remaining
job is judging COMPLETENESS and QUALITY of the cited evidence (does every key get a real per-key line, not
just one), never verifying whether a cited number is itself true — that check is no longer this judge's to make.
**Grounding —** the node's own prompt: "you are DONE only when EVERY file below exists and is non-empty at
EXACTLY its path... an empty or wrong-path artifact set is a FAILURE, not an ok" — this criterion is that law
applied to the CLAIM, not just the file.

### C2 · A genuine gap is never silently absorbed (R)
**PASS —** If `audio-cues.json` references a key that was NOT, at run time, a member of the library index,
the log NAMES it explicitly as a gap and shows the mint chain (manifest row added, generator invoked, the
resulting WAV + `.license.txt` verified, frozen) OR explicitly reports it unresolved/blocked. Quote the
gap-naming line.
**Failure signature —** A key that did not exist in the index at run time is nonetheless reported "resolved"
with no mint evidence — the node asserted success without doing (or documenting) the minting work its own
contract requires (the exact shape of the historical `kptest-classroom-objects` run, whose log claimed full
success against an `audio-cues.json` that was never actually validated).
**Grounding —** the node's own prompt WORK section: "for a genuine GAP... NAME it, add a spec row..., mint it
author-time..., verify the WAV, and FREEZE before W4."

### C3 · Upstream oddities are flagged, not silently absorbed (R)
**PASS —** Any `audio-cues.json` shape/vocabulary that deviates from the documented schema or fixed vocabulary
(a malformed structure, a key outside `pop`/`chime`/`whoosh`/`tick`/`ta-da` with no library entry, a parse
error) is surfaced as a `pipelineFinding` naming w2c-sound-design, never quietly "fixed" or ignored in this
node's own scope.
**Failure signature —** The log proceeds as if the input were pristine when it manifestly was not, with zero
mention in issues/pipelineFindings.
**Grounding —** the workflow's READING LAW: "if the skills feel insufficient, that is a SKILL GAP → record it
in pipelineFindings... do NOT compensate by spelunking the repo" — the same discipline applied to a malformed
input rather than an insufficient skill.

### C4 · The log stays a LEAN, reusable spec (R)
**PASS —** The per-key resolution table is the artifact's spine — one row per key, no restated prose
narrative duplicating the table, no essay-length preamble; a downstream reader can verify every claim from the
table alone. Quote the table header + one row.
**Failure signature —** A verbose narrative log with no independently checkable table (the "trust me" style),
OR a table so sparse it omits keys `audio-cues.json` actually references.
**Grounding —** the node's own prompt LEAN ARTIFACT law: "your output is a SPEC the next wave consumes, not an
essay... prefer tables to prose."

### C5 · Metadata sanity beyond bare existence (A, aspirational)
**PASS —** When a key resolves to an asset whose registry metadata (length, license) is inconsistent with
what the lesson needs (an intro sting far longer than an intro card should hold, a missing license field), the
log notes the discrepancy as a finding even though the key technically "resolves" — a sanity read of the
metadata, not just the filename. Quote the discrepancy.
**Failure signature —** The log never engages with a resolved asset's metadata beyond the bare filename — a
technically-passing key sails through with no sanity check of its real-world fitness.
**Grounding —** the library's own `_index.json` carries `lengthSeconds` + `license` precisely so a consumer can
sanity-check fit, not just existence — a log that never reads them past presence leaves that signal unused.

### C6 · Honest DEFAULT=REUSE economy (A, aspirational)
**PASS —** For the common all-resolve case, the log demonstrably reflects a FAST, cheap pass (matching the
node's own "seconds" expectation) — no wasted re-exploration, no re-reading an index more than once, no
gap-minting machinery invoked when nothing was missing.
**Failure signature —** A trivial all-resolve lesson nonetheless shows signs of over-think (repeated re-reads,
invoking the generator/manifest process when nothing was missing) — corroborate against the REUSED trace
detectors (`mega-think`/`slow`/`tool-loop` in `measure.w3c-sound-asset.json`), never recompute this by hand.
**Grounding —** the node's own prompt: "DEFAULT = REUSE — the library is already richly minted... this is
usually a fast pass" and "If ALL resolve → status ok in seconds."

---

## The apex (aspirational, near-unachievable — do NOT award by default)

Reserve top marks for a log that is not merely accurate but **RAISES TRUST IN THE LANE**: genuine, re-derivable
resolution evidence for every key (C1) + honest gap-naming with a full mint chain when one exists (C2) +
upstream oddities flagged at their true source (C3) + a lean, table-first spec (C4) — AND ALSO a metadata
sanity pass (C5) + demonstrable efficiency (C6). A log can pass every Required mark and still not reach the
apex — that is BY DESIGN; the apex is the permanent headroom the loop climbs toward.

## Calibration note — which marks a typical current good run is expected to FAIL

A typical current *good* w3c-sound-asset run *reliably passes* the **correctness cluster — C1 (genuine
resolution), C2 (gaps never absorbed), C4 (lean spec)** — real runs like `kptest-compare-more-fewer` and
`kp2-counting-by-tens` cite byte sizes, license-sidecar checks, and a per-key table. **Drift note:** as of this
hardening pass, `kptest-compare-more-fewer`'s `audio-cues.json` on disk is now `{}` (empty) — its cited log
above is genuine historical evidence of what the input LOOKED LIKE when the log was written, but the log and
the current input no longer pair up, so do not attempt to re-verify this exemplar against today's input; use
`kp2-counting-by-tens` (still live-consistent) as the calibration anchor instead. This exact drift is now
CAUGHT mechanically going forward — the hardened `sound-asset-gap-scan` hard-fails a zero-key `audio-cues.json`
rather than passing it silently (see node.json's `optimize.measure[0].note`). C3 is inconsistently
reached (most runs never encounter a genuine upstream oddity to flag, so it is vacuously fine — but no sampled
run has ever exercised it against a real malformed input). The marks a good run is *expected to STALL on* are
the **discriminator cluster: C5 (metadata sanity)** — no sampled historical run has ever read past a resolved
asset's bare filename to sanity-check its length/license fit — **and, inconsistently, C1's evidence bar itself**
(several sampled runs, e.g. `kptest-fenyuhe-five`, `kptest-teen-numbers`, are bare prose assertions with no
per-key table, which is a genuine FAIL on the correctness cluster, not merely a missed aspirational mark — this
gap between the best-observed and the median-observed run is exactly the signal the loop should close first).
Hold C5 above what the current best run reaches; do not lower it to make a good-but-thin run look complete.

---

## GOLD — annotated exemplar: "the off-distribution mint" (a genuine gap + a metadata-sanity catch)

> A gap-scan log for a lesson UNLIKE any current test case (so the judge cannot pattern-match the answer) —
> it exercises BOTH the rare mint path (C2) and the aspirational metadata-sanity read (C5), which no sampled
> real run has combined. Read it, then the quote-map. The example IS the specification.

**`audio-cues.json` (lesson `kptest-lantern-riddle`):**
```json
{
  "bed": "literacy-playful-76",
  "toneSafe": false,
  "intro": { "sting": "riddle-chime-rise" },
  "outro": { "resolve": true },
  "sfx": [
    { "cue": "lantern-lit", "event": "popin", "sound": "pop" },
    { "cue": "riddle-solved", "event": "reward", "sound": "ta-da" }
  ]
}
```

**`_logs/sound-asset.md` (the gold log):**
```markdown
# W3c — Sound-Asset Gap-Scan · kptest-lantern-riddle

Fast pass with one genuine gap: `riddle-chime-rise` (intro sting) is not in the shared library — minted this
run. Everything else resolves.

## KEY → RESOLVED FILE

| key | type | resolved file | bytes | .license.txt | source |
|---|---|---|---|---|---|
| `literacy-playful-76` | bed | `_beds/literacy-playful-76.wav` | 32,881,004 | ✓ | pre-existing library |
| `riddle-chime-rise` | intro.sting | `_stings/riddle-chime-rise.wav` | 612,440 | ✓ | **minted this run** (see below) |
| `pop` | sfx (`lantern-lit`, popin) | `_sfx/pop.wav` | 17,358 | ✓ | pre-existing library |
| `ta-da` | sfx (`riddle-solved`, reward) | `_sfx/ta-da.wav` | 21,904 | ✓ | pre-existing library |

`outro.resolve: true` is an envelope flag (no separate asset) — nothing to resolve.

## GAP MINTED — `riddle-chime-rise`
- Named the gap: no `riddle-chime-rise` entry in `_stings/_index.json` at scan time.
- Added a row to `vlog_test/pipeline/sound-assets.manifest.json` (`id: riddle-chime-rise, kind: sting`).
- Ran `generate-sound-assets.mjs --only riddle-chime-rise` → exit 0, `.wav` + `.license.txt` written.
- Verified: `_stings/riddle-chime-rise.wav` now 612,440 bytes, `.license.txt` present. Frozen for W4.

## METADATA SANITY
- `riddle-chime-rise` runs 3.9s — long for a one-shot intro sting (most stings in this library run 1–3s);
  flagging in case it overhangs the intro card. Not a blocker (W4 can trim playback), but worth a second look.

## ISSUES
- None blocking. See METADATA SANITY above (non-blocking finding).

## PIPELINE FINDINGS
- None — `audio-cues.json` conformed to the documented schema.
```

### How this log passes each criterion (quote-anchored)

| # | Criterion | The line that earns the PASS |
|---|-----------|-------------------------------|
| C1 | Genuine resolution (R) | Every row cites a byte count + `.license.txt` check + source, not just the key name — e.g. `pop → _sfx/pop.wav, 17,358 bytes, ✓` is re-derivable without re-trusting the log. |
| C2 | Gaps never absorbed (R) | The GAP MINTED section names `riddle-chime-rise` explicitly and shows the full chain: manifest row → generator invocation (exit 0) → verified bytes → frozen. |
| C3 | Upstream oddities flagged (R) | Vacuously true here (input conformed) — PIPELINE FINDINGS correctly reports none, rather than inventing a finding. |
| C4 | Lean, table-first spec (R) | One table is the spine; the GAP MINTED section is four short bullet lines, not an essay. |
| C5 | Metadata sanity (A) | METADATA SANITY notes the 3.9s sting length against the "most stings run 1–3s" norm — a real fitness read past bare existence, exactly the mark no sampled real run has reached. |
| C6 | Honest REUSE economy (A) | Three of four keys resolve pre-existing in one pass; only the genuine gap triggers the heavier mint path — no wasted machinery on what didn't need it. |

> This exemplar clears every Required mark AND the C5 aspirational discriminator (C6 is a trace-detector read,
> not gradable from the log text alone) — it is the apex made concrete for the rare mint path.
