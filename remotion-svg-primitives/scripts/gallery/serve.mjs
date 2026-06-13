// =========================================================================
// serve.mjs — zero-dependency static server for the capability gallery.
// Rebuilds gallery-data.json first (so it's never stale), then serves the
// gallery/ directory over http so the page's fetch() works (file:// blocks it).
//
//   npm run gallery            # build data + serve, open the printed URL
//
// Self-contained: no express/serve dep. Serves only ./gallery.
// =========================================================================

import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {existsSync} from "node:fs";
import {join, dirname, extname, normalize} from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const ROOT = join(REPO, "gallery");
const PORT = Number(process.env.GALLERY_PORT || 4317);

// 1) (re)build the derived data from the registry — never serve stale data.
const build = spawnSync(process.execPath, [join(__dirname, "build-gallery-data.mjs")], {
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

// hint if no rendered previews exist yet (cards will show placeholders).
if (!existsSync(join(ROOT, "previews", "manifest.json"))) {
  console.log("  note: no rendered previews yet — run `npm run gallery:previews` for the visuals.");
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";
    // contain to ROOT — reject path traversal.
    const filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
      res.writeHead(404, {"content-type": "text/plain"});
      res.end("404 " + urlPath);
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {"content-type": TYPES[extname(filePath)] || "application/octet-stream", "cache-control": "no-store"});
    res.end(body);
  } catch (e) {
    res.writeHead(500, {"content-type": "text/plain"});
    res.end("500 " + (e?.message || e));
  }
});

server.listen(PORT, () => {
  console.log(`\n  Capability Field Guide  →  http://localhost:${PORT}\n  (serving ${ROOT}; Ctrl-C to stop)\n`);
});
