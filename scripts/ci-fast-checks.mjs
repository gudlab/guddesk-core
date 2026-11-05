#!/usr/bin/env node
/**
 * Offline CI fast checks. No network, no live GudBot eval.
 *
 * Fails when:
 *   - prisma/migrations or .github/workflows/ci.yml is missing
 *   - an AI/bot *Enabled / enabled field defaults true (GudBot must stay OFF)
 *   - sync-oss would overwrite or delete core's ci.yml
 *   - CI invokes the live AI eval runner
 *   - qa/ai-eval no longer records Soft-launch HOLD / GudBot OFF
 *
 * Usage: node scripts/ci-fast-checks.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CI_REL = ".github/workflows/ci.yml";
const MIGRATIONS_REL = "prisma/migrations";
const SYNC_OSS_REL = "scripts/sync-oss.sh";
const SETTINGS_REL = "lib/gudbot/settings.ts";
const SCHEMA_REL = "prisma/schema.prisma";
const EVAL_README_REL = "qa/ai-eval/README.md";

const AI_BOT_MODEL = /^model\s+(GudBot\w*|Ai\w*)\s*\{/m;
const ENABLED_FIELD =
  /^\s*(\w*Enabled|enabled)\s+Boolean(?:\s+[^\n]*?)?@default\((true|false)\)/gm;
const SQL_GUDBOT_ENABLED_TRUE =
  /"gudbot_settings"[\s\S]{0,800}?"enabled"\s+BOOLEAN\s+NOT NULL\s+DEFAULT\s+true/i;

export function jobSection(ci, jobId) {
  const jobsIdx = ci.search(/^jobs:\s*$/m);
  if (jobsIdx < 0) return null;
  const block = ci.slice(jobsIdx);
  const re = /^  ([A-Za-z][\w-]*):/gm;
  const jobs = [];
  let match;
  while ((match = re.exec(block))) {
    jobs.push({ id: match[1], start: match.index });
  }
  const idx = jobs.findIndex((job) => job.id === jobId);
  if (idx < 0) return null;
  const from = block.indexOf("\n", jobs[idx].start) + 1;
  const to = idx + 1 < jobs.length ? jobs[idx + 1].start : block.length;
  return block.slice(from, to);
}

export function checkSchema(schemaText) {
  const failures = [];
  const blocks = schemaText.split(/(?=^model\s+\w+\s*\{)/m);
  for (const block of blocks) {
    const header = block.match(/^model\s+(\w+)\s*\{/);
    if (!header) continue;
    const name = header[1];
    if (!AI_BOT_MODEL.test(`model ${name} {`)) continue;
    ENABLED_FIELD.lastIndex = 0;
    let field;
    while ((field = ENABLED_FIELD.exec(block))) {
      if (field[2] === "true") {
        failures.push(
          `${SCHEMA_REL}: ${name}.${field[1]} defaults true (GudBot must stay default OFF)`,
        );
      }
    }
  }
  if (!/model\s+GudBotSettings\s*\{[\s\S]*?\benabled\s+Boolean\s+@default\(false\)/.test(schemaText)) {
    failures.push(
      `${SCHEMA_REL}: GudBotSettings.enabled must be Boolean @default(false)`,
    );
  }
  return failures;
}

export function checkMigrationSql(sqlText) {
  const failures = [];
  if (SQL_GUDBOT_ENABLED_TRUE.test(sqlText)) {
    failures.push(
      `${MIGRATIONS_REL}: gudbot_settings.enabled defaults true (GudBot must stay default OFF)`,
    );
  }
  if (
    sqlText.includes("gudbot_settings") &&
    !/"enabled"\s+BOOLEAN\s+NOT NULL\s+DEFAULT\s+false/i.test(sqlText)
  ) {
    failures.push(
      `${MIGRATIONS_REL}: gudbot_settings.enabled must DEFAULT false`,
    );
  }
  return failures;
}

export function checkSettings(settingsText) {
  const failures = [];
  if (!/export const DISABLED_GUDBOT_SETTINGS[\s\S]*?\benabled:\s*false\b/.test(settingsText)) {
    failures.push(
      `${SETTINGS_REL}: DISABLED_GUDBOT_SETTINGS.enabled must be false`,
    );
  }
  if (!/\benabled:\s*row\.enabled === true\b/.test(settingsText)) {
    failures.push(
      `${SETTINGS_REL}: resolveGudBotSettings must treat enabled as true only when row.enabled === true`,
    );
  }
  return failures;
}

export function checkCiWorkflow(ciText) {
  const failures = [];
  for (const jobId of ["fast-gate", "migrations", "full-build"]) {
    if (!new RegExp(`^  ${jobId}:`, "m").test(ciText)) {
      failures.push(`${CI_REL}: missing job ${jobId}`);
    }
  }
  if (/live-runner/.test(ciText)) {
    failures.push(`${CI_REL}: must not run live-runner (offline validate only)`);
  }
  const fast = jobSection(ciText, "fast-gate");
  if (!fast) return failures;
  if (/\bpnpm lint\b/.test(fast) || /run:\s*pnpm build\s*$/m.test(fast)) {
    failures.push(
      `${CI_REL}: fast-gate must not run pnpm build or lint (Next build stays on full-build)`,
    );
  }
  if (!/score\.mjs validate/.test(fast)) {
    failures.push(`${CI_REL}: fast-gate must run node qa/ai-eval/score.mjs validate`);
  }
  if (!/pnpm test/.test(fast)) {
    failures.push(`${CI_REL}: fast-gate must run pnpm test`);
  }
  if (!/build:content/.test(fast)) {
    failures.push(
      `${CI_REL}: fast-gate must run build:content so tsc can see contentlayer types`,
    );
  }
  if (!/tsc --noEmit/.test(fast)) {
    failures.push(`${CI_REL}: fast-gate must run tsc --noEmit`);
  }
  if (!/ci-fast-checks\.mjs/.test(fast)) {
    failures.push(`${CI_REL}: fast-gate must run scripts/ci-fast-checks.mjs`);
  }
  const full = jobSection(ciText, "full-build");
  if (full && !/pnpm build/.test(full)) {
    failures.push(`${CI_REL}: full-build must run pnpm build`);
  }
  return failures;
}

export function checkSyncOss(scriptText) {
  const failures = [];
  if (!/keep_dest_files\s*=\s*\{[^}]*["']\.github\/workflows\/ci\.yml["']/.test(scriptText)) {
    failures.push(
      `${SYNC_OSS_REL}: keep_dest_files must include ${CI_REL} so flowchat sync cannot delete it`,
    );
  }
  if (!/exclude_files\s*=\s*\{[^}]*["']\.github\/workflows\/ci\.yml["']/.test(scriptText)) {
    failures.push(
      `${SYNC_OSS_REL}: exclude_files must include ${CI_REL} so flowchat sync cannot overwrite it`,
    );
  }
  return failures;
}

export function checkEvalReadme(text) {
  const failures = [];
  if (!/soft launch HOLD/i.test(text)) {
    failures.push(`${EVAL_README_REL}: missing Soft launch HOLD`);
  }
  if (!/OFF by default/i.test(text)) {
    failures.push(`${EVAL_README_REL}: missing GudBot OFF by default`);
  }
  return failures;
}

function readIfPresent(root, rel) {
  const path = join(root, rel);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

function readMigrationSql(root) {
  const dir = join(root, MIGRATIONS_REL);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return null;
  const chunks = [];
  for (const name of readdirSync(dir)) {
    const sql = join(dir, name, "migration.sql");
    if (existsSync(sql)) chunks.push(readFileSync(sql, "utf8"));
  }
  return chunks.join("\n");
}

export function collectFailures(root = process.cwd()) {
  const failures = [];
  const ciPath = join(root, CI_REL);
  const migrationsPath = join(root, MIGRATIONS_REL);

  if (!existsSync(ciPath)) failures.push(`missing ${CI_REL}`);
  if (!existsSync(migrationsPath) || !statSync(migrationsPath).isDirectory()) {
    failures.push(`missing ${MIGRATIONS_REL}/`);
  }

  const schema = readIfPresent(root, SCHEMA_REL);
  if (schema == null) failures.push(`missing ${SCHEMA_REL}`);
  else failures.push(...checkSchema(schema));

  const sql = readMigrationSql(root);
  if (sql != null) failures.push(...checkMigrationSql(sql));

  const settings = readIfPresent(root, SETTINGS_REL);
  if (settings == null) failures.push(`missing ${SETTINGS_REL}`);
  else failures.push(...checkSettings(settings));

  const ci = readIfPresent(root, CI_REL);
  if (ci != null) failures.push(...checkCiWorkflow(ci));

  const syncOss = readIfPresent(root, SYNC_OSS_REL);
  if (syncOss == null) failures.push(`missing ${SYNC_OSS_REL}`);
  else failures.push(...checkSyncOss(syncOss));

  const evalReadme = readIfPresent(root, EVAL_README_REL);
  if (evalReadme == null) failures.push(`missing ${EVAL_README_REL}`);
  else failures.push(...checkEvalReadme(evalReadme));

  return failures;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.argv[2] ?? process.cwd();
  const failures = collectFailures(root);
  if (failures.length > 0) {
    console.error("FAIL: CI fast-checks:");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }
  console.log("OK: fast-checks (GudBot default OFF, Soft-launch HOLD, CI files present)");
}
