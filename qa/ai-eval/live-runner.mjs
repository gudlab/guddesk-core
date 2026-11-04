#!/usr/bin/env node
// GudDesk Month 2 AI eval — LIVE runner (Preview / QA only). Node >=18, no dependencies.
//
// Pre-steps (manual, QA — this script does NOT do them):
//   1. Use a Vercel PREVIEW deployment + a fresh QA workspace. Never Production (soft launch HOLD; GudBot default OFF on prod).
//   2. In that workspace: AI settings → enable GudBot (Preview DB only). The model key lives in the app env, not here.
//   3. Seed the KB from seeded-kb.json: create each collectionSlug as a collection and PUBLISH every article (slug + title must match).
//   4. Export env (names only; see README): GUDBOT_EVAL_BASE_URL, GUDBOT_EVAL_APP_ID, optional GUDBOT_EVAL_BYPASS.
//
// Usage:
//   node live-runner.mjs [--limit N] [--ids 1,2,3] [--out results.jsonl] [--delay-ms 1500] [--timeout-ms 45000]
// Then: node score.mjs score --results results.jsonl
//
// Widget API used (from packages/widget/src/api/client.ts):
//   POST /api/widget/visitors            {appId, name, email, metadata}             -> {visitorId, visitorToken}
//   POST /api/widget/conversations       {appId, visitorToken, message}             -> {conversationId, messages, visitorToken}
//   GET  /api/widget/conversations/:id/messages   header x-visitor-token            -> {messages:[{id,type,body,senderName,createdAt}]}
// Message.type: VISITOR | AGENT | BOT | SYSTEM (NOTE is never returned to the widget).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const LIMIT = Number(opt('--limit', 0)) || 0;
const IDS = opt('--ids') ? new Set(opt('--ids').split(',').map(Number)) : null;
const OUT = path.resolve(opt('--out', path.join(DIR, 'results.jsonl')));
const DELAY = Number(opt('--delay-ms', 1500));
const TIMEOUT = Number(opt('--timeout-ms', 45000));
const POLL = 1500;

const BASE = (process.env.GUDBOT_EVAL_BASE_URL || '').replace(/\/+$/, '');
const APP_ID = process.env.GUDBOT_EVAL_APP_ID || '';
const BYPASS = process.env.GUDBOT_EVAL_BYPASS || '';

function die(m) { console.error(`live-runner: ${m}`); process.exit(1); }
if (!BASE || !APP_ID) die('set GUDBOT_EVAL_BASE_URL and GUDBOT_EVAL_APP_ID (see README).');
let host;
try { host = new URL(BASE).hostname.toLowerCase().replace(/\.+$/, ''); } catch { die('GUDBOT_EVAL_BASE_URL is not a valid URL'); }
// Production guard: refuse guddesk.com and every *.guddesk.com host (mailman, www, api, cdn, future).
if (/^guddesk\.com$/i.test(host) || /\.guddesk\.com$/i.test(host)) {
  die(`refusing to run against production host ${host}. Only Preview URLs are allowed (soft launch HOLD).`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (BYPASS) { h['x-vercel-protection-bypass'] = BYPASS; h['x-vercel-set-bypass-cookie'] = 'false'; }
  if (token) h['x-visitor-token'] = token;
  return h;
}
async function call(method, p, body, token) {
  const res = await fetch(`${BASE}${p}`, { method, headers: headers(token), body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) throw new Error(`${method} ${p} -> ${res.status} ${json?.error || text.slice(0, 120)}`);
  return json;
}

// Pull Sources out of a BOT message: explicit fields if the API returns them, else links in the body.
function extractCitations(msg) {
  const out = [];
  const meta = msg.metadata || msg.meta || {};
  for (const arr of [msg.sources, msg.citations, meta.sources, meta.citations]) {
    if (Array.isArray(arr)) for (const c of arr) out.push(typeof c === 'string' ? { url: c } : { title: c.title, slug: c.slug, url: c.url || c.href, articleId: c.articleId || c.id });
  }
  if (!out.length && typeof msg.body === 'string') {
    const b = msg.body; const i = b.search(/\bsources?\s*:/i);
    const section = i >= 0 ? b.slice(i) : '';
    for (const m of section.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g)) out.push({ title: m[1], url: m[2] });
    if (!out.length) for (const m of section.matchAll(/https?:\/\/[^\s)>\]]+/g)) out.push({ url: m[0] });
  }
  return out;
}
const isCsat = (m) => m.type === 'SYSTEM' && /"type"\s*:\s*"csat_survey"/.test(m.body || '');

async function runCase(q) {
  const row = { id: q.id, question: q.question, observed_action: 'error', observed_body: '', observed_citations: [], observed_handoff_hint: null, conversation_id: null, latency_ms: null, error: null };
  const t0 = Date.now();
  try {
    const v = await call('POST', '/api/widget/visitors', { appId: APP_ID, name: `ai-eval-m2 #${q.id}`, metadata: { source: 'ai-eval-m2', caseId: q.id } });
    const c = await call('POST', '/api/widget/conversations', { appId: APP_ID, visitorToken: v.visitorToken, message: q.question });
    const token = c.visitorToken || v.visitorToken;
    row.conversation_id = c.conversationId;
    const deadline = Date.now() + TIMEOUT;
    while (Date.now() < deadline) {
      await sleep(POLL);
      const { messages = [] } = await call('GET', `/api/widget/conversations/${encodeURIComponent(c.conversationId)}/messages`, null, token);
      const reply = messages.find((m) => (m.type === 'BOT' || m.type === 'SYSTEM') && !isCsat(m));
      if (!reply) continue;
      row.latency_ms = Date.now() - t0;
      row.observed_body = reply.body || '';
      if (reply.type === 'BOT') {
        row.observed_action = 'answer';
        row.observed_citations = extractCitations(reply);
      } else {
        row.observed_action = 'handoff';
        // Visitor-visible SYSTEM text. The reason note is an inbox NOTE (not visible to the widget); paste it into
        // observed_handoff_reason manually if you checked the inbox, or leave null (scorer only checks reason when present).
        row.observed_handoff_hint = reply.body || '';
        row.observed_handoff_reason = reply.metadata?.reason || reply.reason || null;
      }
      return row;
    }
    row.observed_action = 'timeout';
    row.latency_ms = Date.now() - t0;
  } catch (e) {
    row.error = e.message;
  }
  return row;
}

const questions = fs.readFileSync(path.join(DIR, 'questions.jsonl'), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
let todo = IDS ? questions.filter((q) => IDS.has(q.id)) : questions;
if (LIMIT) todo = todo.slice(0, LIMIT);
console.error(`live-runner: ${todo.length} case(s) against ${host} (bypass ${BYPASS ? 'set' : 'not set'}), timeout ${TIMEOUT}ms, delay ${DELAY}ms -> ${OUT}`);

fs.writeFileSync(OUT, '');
const tally = {};
for (const [i, q] of todo.entries()) {
  const r = await runCase(q);
  fs.appendFileSync(OUT, JSON.stringify(r) + '\n');
  tally[r.observed_action] = (tally[r.observed_action] || 0) + 1;
  console.error(`[${i + 1}/${todo.length}] #${q.id} expected=${q.expected_action} observed=${r.observed_action}${r.error ? ` error=${r.error}` : ''}`);
  if (i < todo.length - 1) await sleep(DELAY);
}
console.error(`live-runner: done ${JSON.stringify(tally)}. Next: node score.mjs score --results ${path.relative(process.cwd(), OUT) || OUT}`);
