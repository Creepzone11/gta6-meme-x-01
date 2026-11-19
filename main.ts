// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry itself is an X post, not this program: the post carries the meme
// picture and its text, and the house reads that post straight from X. All
// this program has to do is hand the gate the post's address, by copying
// POST.json from the repository root into the output directory.
//
// Locally, the grader's /bot and /output paths are replaced with env vars:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(BOT_DIR, "POST.json");
const target = join(OUTPUT_DIR, "POST.json");

if (!existsSync(source)) {
  console.error(`POST.json not found in ${BOT_DIR} — the post has not been linked yet.`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`could not copy POST.json to ${target}: ${(err as Error).message}`);
  process.exit(1);
}

// Guard: the copied file must be JSON with a real post address in it, so a
// broken or still-placeholder POST.json fails loudly instead of passing on.
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(target, "utf8"));
} catch (err) {
  console.error(`POST.json in ${target} is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
const url = (parsed as { url?: unknown } | null)?.url;
if (typeof url !== "string" || url.length === 0 || url.includes("<")) {
  console.error(`POST.json in ${target} has no real post URL yet (url: ${JSON.stringify(url)}).`);
  process.exit(1);
}

console.log(`copied POST.json to ${target} (post: ${url})`);
