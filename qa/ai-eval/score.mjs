#!/usr/bin/env node
// GudDesk Month 2 AI eval: validator + scorer. Node >=18, no dependencies.
// Usage:
//   node score.mjs validate
//   node score.mjs offline
//   node score.mjs score --results <results.jsonl|results.json> [--out summary.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS = path.join(DIR, 'questions.jsonl');
const KB = path.join(DIR, 'seeded-kb.json');

// Minimum distribution (see README "Distribution").
const MIN = { total: 100, answer_core: 60, handoff: 18, edge: 8, kb: 12 };
const ACTIONS = ['answer', 'handoff'];
const KNOWN_REASONS = ['low_confidence', 'max_turns', 'explicit', 'no_evidence'];
// Visitor/inbox phrasing that maps to a reason code.
const REASON_PHRASES = {
  no_evidence: ['no matching knowledge base articles', 'no_evidence', 'no evidence'],
  low_confidence: ['low_confidence', 'low confidence'],
  max_turns: ['max_turns', 'max turns', 'maximum number of turns'],
  explicit: ['explicit', 'asked for a human', 'requested a human', 'requested human'],
};

const lc = (s) => String(s ?? '').toLowerCase();

function splitSentences(text) {
  return String(text ?? '')
    .split(/(?<=[.!?])(?:\s+|$)|[\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function proseFromFixtures(kb, questions) {
  const parts = [];
  for (const a of kb || []) {
    for (const k of ['title', 'excerpt', 'body']) parts.push(a?.[k]);
  }
  for (const q of questions || []) {
    parts.push(q?.question, q?.expected_gist, ...(q?.must_include || []));
  }
  return parts.filter((s) => typeof s === 'string').join('\n');
}

/** Stale Cloud-plan copy. Checked per sentence so a legacy $29 Pro note can stand. */
function stalePricingHits(text) {
  const hits = [];
  for (const raw of splitSentences(text)) {
    const s = lc(raw);
    const flag = (why) => hits.push({ sentence: raw, why });
    if (s.includes('only two cloud plans')) flag('only two cloud plans');
    if (s.includes('only free and pro')) flag('only free and pro');
    // Conversation caps. "500 GudBot answers" / "500 answers" stay legal.
    if (/500\s+conversations/.test(s)) flag('500 conversations');
    if (
      /\b2\s+members\b/.test(s)
      || /\b2\s+team\s+members\b/.test(s)
      || /\btwo\s+team\s+members\b/.test(s)
    ) {
      flag('2 members');
    }
    if (/10x/.test(s)) flag('10x');
    if (/\$390\b/.test(s)) flag('$390');
    if (/\$790\b/.test(s)) flag('$790');
    if (/\$1,190\b|\$1190\b/.test(s)) flag('$1,190');
    if (
      /\$29/.test(s)
      && /\bpro\b/.test(s)
      && !/\blegacy\b/.test(s)
      && !/existing customers?/.test(s)
    ) {
      flag('$29 Pro as current');
    }
  }
  return hits;
}

function stalePricingSelfTest() {
  const errors = [];
  const shouldPass = [
    'Existing customers on the legacy Pro plan keep $29 per month',
    '500 GudBot answers',
    'A $10 top-up adds 500 answers that never expire',
  ];
  const shouldFail = [
    'Pro is $29 per month',
    'up to 2 team members',
    '500 conversations per month',
    '$390 a year',
  ];
  for (const t of shouldPass) {
    if (stalePricingHits(t).length) errors.push(`stale-pricing self-test expected pass: ${t}`);
  }
  for (const t of shouldFail) {
    if (!stalePricingHits(t).length) errors.push(`stale-pricing self-test expected fail: ${t}`);
  }
  return errors;
}

function readJsonl(file) {
  const out = [];
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    try { out.push(JSON.parse(line)); }
    catch (e) { throw new Error(`${path.basename(file)}:${i + 1} invalid JSON: ${e.message}`); }
  });
  return out;
}

function readResults(file) {
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (raw.startsWith('[')) return JSON.parse(raw);
  if (raw.startsWith('{') && !raw.includes('\n')) {
    const o = JSON.parse(raw);
    return Array.isArray(o.results) ? o.results : [o];
  }
  return readJsonl(file);
}

function loadAll() {
  const kb = JSON.parse(fs.readFileSync(KB, 'utf8'));
  const questions = readJsonl(QUESTIONS);
  return { kb, questions };
}

function validate({ kb, questions }) {
  const errors = [];
  const err = (m) => errors.push(m);

  // KB
  if (!Array.isArray(kb)) err('seeded-kb.json must be an array');
  const slugs = new Map();
  (kb || []).forEach((a, i) => {
    for (const k of ['slug', 'title', 'collectionSlug', 'excerpt', 'body']) {
      if (typeof a[k] !== 'string' || !a[k].trim()) err(`kb[${i}] missing/empty ${k}`);
    }
    if (a.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) err(`kb[${i}] slug not kebab-case: ${a.slug}`);
    if (slugs.has(a.slug)) err(`kb duplicate slug ${a.slug}`);
    slugs.set(a.slug, a);
  });
  if (kb.length < MIN.kb) err(`kb has ${kb.length} articles (< ${MIN.kb})`);

  // Questions
  const ids = new Set(); const texts = new Set();
  const counts = { total: questions.length, answer: 0, handoff: 0, edge: 0, answer_core: 0, by_category: {}, by_area: {} };
  const cited = new Set();
  questions.forEach((q, i) => {
    const at = `q[line ${i + 1}, id ${q.id}]`;
    const keys = ['id', 'question', 'category', 'expected_action', 'expected_gist', 'must_include', 'expected_citation_slugs', 'handoff_reason_any_of', 'source_kb_area'];
    for (const k of keys) if (!(k in q)) err(`${at} missing field ${k}`);
    for (const k of Object.keys(q)) if (!keys.includes(k)) err(`${at} unknown field ${k}`);
    if (!Number.isInteger(q.id) || q.id < 1) err(`${at} id must be positive integer`);
    if (ids.has(q.id)) err(`${at} duplicate id`); ids.add(q.id);
    if (typeof q.question !== 'string' || !q.question.trim()) err(`${at} empty question`);
    const t = lc(q.question).trim(); if (texts.has(t)) err(`${at} duplicate question text`); texts.add(t);
    if (typeof q.category !== 'string' || !q.category) err(`${at} category must be string`);
    if (!ACTIONS.includes(q.expected_action)) err(`${at} expected_action must be answer|handoff`);
    if (typeof q.expected_gist !== 'string') err(`${at} expected_gist must be string`);
    if (!Array.isArray(q.must_include) || q.must_include.some((s) => typeof s !== 'string' || !s)) err(`${at} must_include must be string[]`);
    if (!Array.isArray(q.expected_citation_slugs) || q.expected_citation_slugs.some((s) => typeof s !== 'string')) err(`${at} expected_citation_slugs must be string[]`);
    if (!(q.handoff_reason_any_of === null || (Array.isArray(q.handoff_reason_any_of) && q.handoff_reason_any_of.every((r) => KNOWN_REASONS.includes(r)))))
      err(`${at} handoff_reason_any_of must be null or subset of ${KNOWN_REASONS.join(',')}`);
    if (typeof q.source_kb_area !== 'string' || !q.source_kb_area) err(`${at} source_kb_area must be string`);

    for (const s of q.expected_citation_slugs || []) { if (!slugs.has(s)) err(`${at} citation slug not in kb: ${s}`); cited.add(s); }

    if (q.expected_action === 'answer') {
      counts.answer++;
      if (!q.must_include?.length) err(`${at} answer requires ≥1 must_include`);
      if (!q.expected_citation_slugs?.length) err(`${at} answer requires ≥1 expected_citation_slugs`);
      if (!q.expected_gist?.trim()) err(`${at} answer requires expected_gist`);
      if (q.handoff_reason_any_of !== null) err(`${at} answer must have handoff_reason_any_of=null`);
      // Grounding: each must_include must appear in at least one cited article (title/excerpt/body).
      const corpus = lc((q.expected_citation_slugs || []).map((s) => { const a = slugs.get(s); return a ? `${a.title}\n${a.excerpt}\n${a.body}` : ''; }).join('\n'));
      for (const m of q.must_include || []) if (!corpus.includes(lc(m))) err(`${at} must_include "${m}" not found in cited KB articles (ungrounded)`);
    } else {
      counts.handoff++;
      if (q.must_include?.length) err(`${at} handoff must have empty must_include`);
      if (q.expected_gist !== '') err(`${at} handoff-only must have empty expected_gist`);
      if (!Array.isArray(q.handoff_reason_any_of) || !q.handoff_reason_any_of.length) err(`${at} handoff requires handoff_reason_any_of`);
    }
    if (q.category === 'edge_variant') counts.edge++;
    else if (q.expected_action === 'answer') counts.answer_core++;
    counts.by_category[q.category] = (counts.by_category[q.category] || 0) + 1;
    counts.by_area[q.source_kb_area] = (counts.by_area[q.source_kb_area] || 0) + 1;
  });

  // Seed coverage: ids 1..30 are the rewritten original seed questions.
  for (let i = 1; i <= 30; i++) if (!ids.has(i)) err(`seed id ${i} missing`);

  // Product-fact guards. Pricing is per sentence so legacy $29 Pro can stand.
  for (const e of stalePricingSelfTest()) err(e);
  for (const hit of stalePricingHits(proseFromFixtures(kb, questions))) {
    err(`stale pricing (${hit.why}): ${hit.sentence}`);
  }
  const blob = lc(JSON.stringify(kb) + JSON.stringify(questions));
  if (/gudbot (is )?(on|enabled) by default/.test(blob)) err('claims GudBot is on by default');
  if (/(sk-ant-|gd_live_|gd_sk_|-----begin)/.test(blob)) err('possible secret material in files');

  if (counts.total < MIN.total) err(`questions ${counts.total} < ${MIN.total}`);
  if (counts.answer_core < MIN.answer_core) err(`answerable(core) ${counts.answer_core} < ${MIN.answer_core}`);
  if (counts.handoff < MIN.handoff) err(`handoff ${counts.handoff} < ${MIN.handoff}`);
  if (counts.edge < MIN.edge) err(`edge_variant ${counts.edge} < ${MIN.edge}`);

  const uncited = [...slugs.keys()].filter((s) => !cited.has(s));
  return { ok: errors.length === 0, errors, counts, kb_articles: kb.length, uncited_kb_slugs: uncited };
}

// ---------- scoring ----------
function normCitations(obs) {
  const list = Array.isArray(obs) ? obs : obs ? [obs] : [];
  return list.map((c) => {
    if (typeof c === 'string') return { text: c, slug: slugFromUrl(c) };
    const url = c.url || c.href || '';
    return { text: [c.title, c.slug, url, c.articleId].filter(Boolean).join(' '), slug: c.slug || slugFromUrl(url) };
  });
}
function slugFromUrl(u) {
  const m = String(u || '').match(/^https?:\/\/[^\s]+|^\/[^\s]+/);
  if (!m) return null;
  const seg = m[0].replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
  return seg ? decodeURIComponent(seg).toLowerCase() : null;
}
// Sources section from body text, e.g. "Sources:\n- Install the chat widget (https://…/install-widget)".
function sourcesFromBody(body) {
  const b = String(body || '');
  const idx = b.search(/\bsources?\s*:?\s*\n|\bsources?\s*:/i);
  return idx >= 0 ? b.slice(idx) : '';
}
function detectReason(text) {
  const t = lc(text);
  return Object.entries(REASON_PHRASES).filter(([, ps]) => ps.some((p) => t.includes(p))).map(([k]) => k);
}

function scoreCase(q, r, kbBySlug, kbTitles) {
  const reasons = [];
  const action = r ? lc(r.observed_action) : 'missing';
  const body = r?.observed_body ?? '';
  const cits = normCitations(r?.observed_citations);
  const srcText = lc(cits.map((c) => c.text).join('\n') + '\n' + sourcesFromBody(body));

  // handoff_pass
  let handoff_pass = action === q.expected_action;
  if (!r) reasons.push('no result row');
  else if (!handoff_pass) reasons.push(`action expected=${q.expected_action} observed=${action || 'none'}`);
  if (handoff_pass && q.expected_action === 'handoff' && q.handoff_reason_any_of?.length) {
    const found = detectReason(`${r.observed_handoff_hint ?? ''}\n${r.observed_handoff_reason ?? ''}`);
    if (found.length && !found.some((f) => q.handoff_reason_any_of.includes(f))) {
      handoff_pass = false; reasons.push(`handoff reason ${found.join('/')} not in ${q.handoff_reason_any_of.join('/')}`);
    }
  }

  // accuracy_pass
  let accuracy_pass;
  if (q.expected_action === 'answer') {
    const missing = action === 'answer' ? q.must_include.filter((m) => !lc(body).includes(lc(m))) : q.must_include;
    accuracy_pass = action === 'answer' && missing.length === 0;
    if (action === 'answer' && missing.length) reasons.push(`missing must_include: ${missing.join(', ')}`);
  } else {
    accuracy_pass = action === 'handoff'; // SYSTEM handoff and no confident BOT answer
    if (action === 'answer') reasons.push('confident BOT answer where handoff expected');
  }

  // citation_pass
  let citation_pass = true;
  const invented = cits.filter((c) => c.slug && !kbBySlug.has(c.slug) && !kbTitles.some((t) => lc(c.text).includes(t)));
  if (q.expected_action === 'answer') {
    if (action === 'answer') {
      const miss = q.expected_citation_slugs.filter((s) => { const a = kbBySlug.get(s); return !(srcText.includes(s) || (a && srcText.includes(lc(a.title)))); });
      if (miss.length) { citation_pass = false; reasons.push(`missing citation: ${miss.join(', ')}`); }
      if (invented.length) { citation_pass = false; reasons.push(`invented citation: ${invented.map((c) => c.slug).join(', ')}`); }
    } else citation_pass = false;
  } else if (action === 'answer' && (cits.length || sourcesFromBody(body))) {
    citation_pass = false; reasons.push('Sources claimed resolution on a handoff case');
  }

  const case_pass = accuracy_pass && citation_pass && handoff_pass;
  return { id: q.id, accuracy_pass, citation_pass, handoff_pass, case_pass, reasons };
}

function score(questions, kb, results) {
  const kbBySlug = new Map(kb.map((a) => [a.slug, a]));
  const kbTitles = kb.map((a) => lc(a.title));
  const byId = new Map(results.map((r) => [Number(r.id), r]));
  const rows = questions.map((q) => scoreCase(q, byId.get(q.id), kbBySlug, kbTitles));
  const n = (k) => rows.filter((x) => x[k]).length;
  const total = rows.length; const case_pass = n('case_pass');
  return {
    total, case_pass,
    accuracy_pct: total ? Math.round((case_pass / total) * 1000) / 10 : 0,
    accuracy_pass_n: n('accuracy_pass'), citation_pass_n: n('citation_pass'), handoff_pass_n: n('handoff_pass'),
    target_pct: 80, meets_target: total ? case_pass / total >= 0.8 : false,
    results_rows: results.length, missing_results: questions.filter((q) => !byId.has(q.id)).length,
    fails: rows.filter((x) => !x.case_pass).map((x) => ({ id: x.id, reasons: x.reasons })),
  };
}

// ---------- CLI ----------
const [cmd, ...rest] = process.argv.slice(2);
const arg = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
try {
  const data = loadAll();
  if (cmd === 'validate' || cmd === 'offline') {
    const v = validate(data);
    if (cmd === 'validate') {
      console.log(JSON.stringify({ ok: v.ok, counts: { total: v.counts.total, answer: v.counts.answer, handoff: v.counts.handoff, answer_core: v.counts.answer_core, edge_variant: v.counts.edge }, kb_articles: v.kb_articles, errors: v.errors }, null, 2));
    } else {
      console.log(JSON.stringify({
        mode: 'offline-dry-run', ok: v.ok,
        note: 'Schema + fixture checks only. No model was called; this is NOT an accuracy score. Run live-runner.mjs on Preview, then `node score.mjs score --results results.jsonl`.',
        counts: v.counts, kb_articles: v.kb_articles, uncited_kb_slugs: v.uncited_kb_slugs,
        would_run: { cases: v.counts.total, est_minutes_at_45s_timeout_worst_case: Math.ceil((v.counts.total * 46) / 60) },
        errors: v.errors,
      }, null, 2));
    }
    process.exit(v.ok ? 0 : 1);
  } else if (cmd === 'score') {
    const file = arg('--results');
    if (!file) throw new Error('score requires --results <path>');
    const v = validate(data);
    if (!v.ok) { console.error('questions/kb invalid; run validate'); process.exit(1); }
    const summary = score(data.questions, data.kb, readResults(file));
    const out = arg('--out'); if (out) fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  } else {
    console.error('usage: node score.mjs validate | offline | score --results <path> [--out summary.json]');
    process.exit(2);
  }
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}
