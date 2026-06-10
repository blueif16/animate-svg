#!/usr/bin/env bash
# pi-runner sandbox read-scope DEMO (macOS). Proves the Seatbelt profile in read-scope.sb denies the
# exact out-of-scope reads that bloated a composer node's context (it read OTHER lessons' source and
# grep'd the repo for a phantom component) while in-scope reads + the node toolchain still work.
#
# Renders read-scope.sb with the SAME substitution the driver's buildSandboxProfile() does, then runs
# a handful of reads under `sandbox-exec -f <profile>`. No pi / no model call — pure mechanism check.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../remotion-svg-primitives" && pwd)"
TMPL="$HERE/read-scope.sb"
SB="$(mktemp -t read-scope-demo.XXXXXX).sb"
trap 'rm -f "$SB"' EXIT

# IN-SCOPE roots — what a composer node legitimately reads (its own lesson + shared primitives + digest).
SCOPE=(
  "$REPO/lesson-data/kptest-fenyuhe-six"
  "$REPO/src/capabilities"
  "$REPO/src/shape-primitives"
  "$REPO/src/motion-primitives"
  "$REPO/node_modules"
)
IN_SCOPE="$REPO/src/capabilities/catalog-digest.md"          # allowed
OTHER_LESSON="$REPO/src/lessons/CompleteKptestGreetingsVerifyLesson.tsx"   # the incident read this — must be DENIED
OTHER_DATA="$REPO/lesson-data/kptest-greetings-verify"      # another lesson's data — must be DENIED

# Render the profile from the committed template (driver parity).
ALLOWS=""; for p in "${SCOPE[@]}"; do ALLOWS="$ALLOWS  (subpath \"$p\")"$'\n'; done
DEMO_HOME="$HOME" DEMO_TMP="${TMPDIR%/}" DEMO_ALLOWS="$ALLOWS" DEMO_TMPL="$TMPL" DEMO_OUT="$SB" python3 - <<'PY'
import os
s=open(os.environ["DEMO_TMPL"]).read()
s=s.replace("@HOME@",os.environ["DEMO_HOME"]).replace("@TMPDIR@",os.environ["DEMO_TMP"]).replace("@SCOPE_ALLOWS@",os.environ["DEMO_ALLOWS"].rstrip("\n"))
open(os.environ["DEMO_OUT"],"w").write(s)
PY

box() { sandbox-exec -f "$SB" "$@"; }
# A real Seatbelt denial = the wrapped command fails AND the error is NOT sandbox-exec's own (a
# profile parse error prints "sandbox-exec:" and must NOT be mistaken for a denial).
expect_ok()     { if out=$("$@" 2>&1); then echo "  PASS ALLOWED  - $LBL"; else echo "  FAIL blocked-but-should-allow - $LBL :: ${out:0:80}"; fi; }
expect_denied() { if out=$("$@" 2>&1); then echo "  FAIL allowed-but-should-deny - $LBL";
  elif printf '%s' "$out" | grep -q 'sandbox-exec:'; then echo "  ERROR profile failed to load - $LBL :: ${out:0:80}";
  else echo "  PASS DENIED   - $LBL"; fi; }

# Preflight: the profile MUST load, or every check below is meaningless.
if err=$(sandbox-exec -f "$SB" true 2>&1); then :; else
  echo "FATAL: read-scope.sb did not parse -- aborting demo:"; printf '  %s\n' "$err"; exit 1; fi

echo "profile: $SB  (parsed OK)"
echo
echo "[1] in-scope read (own catalog-digest) under sandbox:"
LBL="head catalog-digest.md"; expect_ok box head -n1 "$IN_SCOPE"
echo
echo "[2] out-of-scope read (ANOTHER lesson's source — the incident's actual read):"
LBL="cat CompleteKptestGreetingsVerifyLesson.tsx"; expect_denied box cat "$OTHER_LESSON"
echo
echo "[3] the phantom hunt (grep the whole src/lessons tree for RecapSpotlight):"
LBL="grep -rn RecapSpotlight src/lessons"; expect_denied box grep -rn RecapSpotlight "$REPO/src/lessons"
echo
echo "[4] other out-of-scope reads (repo-root file + another lesson's data dir):"
LBL="cat repo-root package.json (not in any scoped subdir)"; expect_denied box cat "$REPO/package.json"
LBL="ls another lesson's data dir (kptest-greetings-verify)"; expect_denied box ls "$OTHER_DATA"
echo
echo "[5] node BOOTS under the sandbox but the out-of-scope read is blocked (proves pi can start):"
sandbox-exec -f "$SB" node -e '
  console.log("  · node booted under sandbox");
  try { require("fs").readFileSync(process.argv[1]); console.log("  ✗ FAIL: read OK (should be blocked)"); }
  catch (e) { console.log("  ✓ in-process read blocked —", e.code); }
' "$OTHER_LESSON"
echo
echo "[6] control: WITHOUT the sandbox the same out-of-scope file reads fine (so it IS the sandbox):"
if head -n1 "$OTHER_LESSON" >/dev/null 2>&1; then echo "  ✓ readable un-sandboxed (confirms [2] denial is the sandbox, not a missing file)"; fi
