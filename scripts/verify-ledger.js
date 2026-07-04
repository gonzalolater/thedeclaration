#!/usr/bin/env node
// Independently verifies the ledger hash chain served at /api/ledger.json.
// Zero dependencies; uses only the algorithm the endpoint itself documents.
//
// Usage:
//   node scripts/verify-ledger.js                       # verifies production
//   node scripts/verify-ledger.js http://localhost:8080 # verifies a local server
//   curl -s .../api/ledger.json | node scripts/verify-ledger.js -   # from stdin

const crypto = require("crypto");

function canonicalJSON(v) {
  if (Array.isArray(v)) return "[" + v.map(canonicalJSON).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonicalJSON(v[k])).join(",") + "}";
  }
  return JSON.stringify(v === undefined ? null : v);
}

function verify({ genesis, head, entries }) {
  let prev = genesis;
  let broken = 0;
  let legacy = 0;
  for (const rec of entries) {
    const { prev: _p, h: _h, ...rest } = rec;
    const expected = crypto
      .createHash("sha256")
      .update("thedeclaration.ai:ledger:v1:" + prev + ":" + canonicalJSON(rest), "utf8")
      .digest("hex");
    if (rec.h) {
      if (rec.h !== expected || rec.prev !== prev) {
        broken++;
        console.error(`✗ broken chain at ${rec.slug || rec.tombstone || "?"}: record altered, dropped, or reordered`);
      }
      prev = rec.h;
    } else {
      legacy++;
      prev = expected; // pre-chain record: folds in with its recomputed hash
    }
  }
  const headOk = prev === head;
  if (!headOk) console.error(`✗ head mismatch: replayed ${prev}, server claims ${head}`);
  if (broken === 0 && headOk) {
    console.log(`✓ chain verified: ${entries.length} record(s) (${legacy} pre-chain), head ${head.slice(0, 16)}…`);
    return 0;
  }
  console.error(`✗ chain INVALID: ${broken} broken record(s)${headOk ? "" : ", head mismatch"}`);
  return 1;
}

async function main() {
  const arg = process.argv[2];
  let json;
  if (arg === "-") {
    json = await new Promise((resolve) => {
      let d = "";
      process.stdin.on("data", (c) => (d += c)).on("end", () => resolve(d));
    });
  } else {
    const base = (arg || "https://thedeclaration.ai").replace(/\/$/, "");
    json = await (await fetch(base + "/api/ledger.json")).text();
  }
  process.exit(verify(JSON.parse(json)));
}

main().catch((e) => {
  console.error("verify failed:", e.message);
  process.exit(1);
});
