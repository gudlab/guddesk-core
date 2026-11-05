#!/usr/bin/env node
/**
 * Copy Prisma / pg (and their dependency trees) into a folder the
 * standalone runner can mount at /app/node_modules. Next marks these as
 * serverExternalPackages, so they are not in .next/standalone.
 */
import { createRequire } from "node:module";
import { cpSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const destRoot = process.argv[2] ?? "/tmp/guddesk-runtime-modules";
const roots = ["@prisma/client", "@prisma/adapter-pg", "pg"];

function pkgDir(name) {
  return dirname(require.resolve(`${name}/package.json`));
}

function collect(name, seen) {
  if (seen.has(name)) return;
  let dir;
  try {
    dir = pkgDir(name);
  } catch {
    return;
  }
  seen.set(name, dir);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  for (const dep of Object.keys(pkg.dependencies ?? {})) {
    collect(dep, seen);
  }
}

const seen = new Map();
for (const name of roots) collect(name, seen);

const prismaEngine = join(process.cwd(), "node_modules", ".prisma");
if (existsSync(prismaEngine)) {
  seen.set(".prisma", prismaEngine);
}

mkdirSync(destRoot, { recursive: true });
for (const [name, dir] of seen) {
  const dest = join(destRoot, name);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(dir, dest, { recursive: true, dereference: true });
}

console.log(`Copied ${seen.size} packages to ${destRoot}`);
