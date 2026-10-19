#!/usr/bin/env node
/**
 * widget.js is loaded with a plain <script> tag on customer sites. In that
 * context a browser cannot resolve a bare module name such as "pusher-js",
 * so the built files must not import or require any package by name. Every
 * dependency has to be bundled in.
 *
 * Usage: node scripts/check-widget-bundle.mjs [file ...]
 * With no arguments it checks public/widget.js and packages/widget/dist/*.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEFAULT_FILES = [
  "../public/widget.js",
  "../packages/widget/dist/guddesk.umd.cjs",
  "../packages/widget/dist/guddesk.js",
].map((path) => fileURLToPath(new URL(path, import.meta.url)));

const PATTERNS = [
  // import("x")
  /\bimport\s*\(\s*(["'`])([^"'`]+)\1\s*\)/g,
  // import x from "x", import { x } from "x", export * from "x"
  /\b(?:import|export)\b[^;"'`()]*?\bfrom\s*(["'`])([^"'`]+)\1/g,
  // import "x"
  /\bimport\s*(["'`])([^"'`]+)\1/g,
  // require("x"), but not __webpack_require__("x") or obj.require("x")
  /(?<![\w$.])require\s*\(\s*(["'`])([^"'`]+)\1\s*\)/g,
];

/** A specifier the browser can resolve without an import map. */
function isResolvable(specifier) {
  return /^(?:\.{0,2}\/|[a-z][a-z0-9+.-]*:)/i.test(specifier);
}

/**
 * Returns every bare module specifier that `code` imports or requires.
 * @param {string} code
 * @returns {string[]}
 */
export function findBareImports(code) {
  const found = new Set();
  for (const pattern of PATTERNS) {
    for (const match of code.matchAll(pattern)) {
      if (!isResolvable(match[2])) found.add(match[2]);
    }
  }
  return [...found];
}

function main(files) {
  let failed = false;
  for (const file of files) {
    const bare = findBareImports(readFileSync(file, "utf8"));
    if (bare.length > 0) {
      failed = true;
      console.error(
        `${file} imports packages by name: ${bare.join(", ")}. ` +
          "Bundle them into the widget, because a browser cannot resolve them.",
      );
    }
  }
  if (failed) process.exit(1);
  console.log(`Widget bundle check passed (${files.length} files).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  main(args.length > 0 ? args : DEFAULT_FILES);
}
