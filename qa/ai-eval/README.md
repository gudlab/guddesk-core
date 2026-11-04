# GudDesk AI eval — Month 2 (GudBot v1)

Per-release eval of GudBot against a fixed, seeded knowledge base. It scores three things for each case:

1. **Answer accuracy**: did the bot state the right facts?
2. **Citation correctness**: did the Sources point at the right KB articles, with none invented?
3. **Handoff correctness**: did it answer when it should, and hand off to a human when it should?

**Target: overall accuracy (case pass rate) ≥ 80%** on a live Preview run.

> **Soft launch HOLD.** GudBot is optional and **OFF by default**, and it stays OFF on Production.
> Run this eval **only on a Vercel Preview deployment with a fresh QA workspace**. Never turn GudBot on in a prod
> workspace for this eval. `live-runner.mjs` refuses `guddesk.com` and any `*.guddesk.com` host.

## Files

| File | What it is |
|---|---|
| `questions.jsonl` | 110 cases, one JSON object per line (schema below) |
| `seeded-kb.json` | 18 published-style KB articles `{slug,title,collectionSlug,excerpt,body}`. These are the only facts answers may use |
| `score.mjs` | Validator and scorer (Node ≥18, no dependencies) |
| `live-runner.mjs` | Live Preview runner. Writes `results.jsonl` |
| `CHECKIN.md` | Where these files go in the repos |

## Modes

### Offline (every PR or release, no network)
```bash
node score.mjs validate   # schema, ≥100 cases, distribution, citation slugs exist in KB, must_include grounded in cited articles; exit 0/1
node score.mjs offline    # validate + dry-run summary (counts per category/area, uncited KB articles). NOT an accuracy score
```
`validate` also enforces these rules:
- Every `must_include` string appears in the cited article text.
- Seed ids 1–30 are present.
- There's no priced Business tier.
- Nothing claims GudBot is on by default.
- Nothing looks like secret material.

### Live (once per release, Preview only)

**Manual QA pre-steps** (the runner does none of these):
1. Pick a **Preview** deployment of the release candidate, plus a **fresh QA workspace** on the Preview DB.
2. Open AI settings and turn GudBot ON for that workspace only. The model provider key (Anthropic) lives **only in the app's Preview env**. The eval never reads or needs it.
3. Seed the KB from `seeded-kb.json`. Create one collection per `collectionSlug` (widget, inbox, knowledge-base, billing, self-hosting, getting-started, api, agents). Then create every article with the **exact title and slug**, paste the body, and **Publish**. Spot-check that `/help/<workspace>/<collection>/<slug>` returns 200.
4. Make sure nothing else is published in that workspace. Extra articles skew retrieval.
5. Note the workspace's public appId (`gd_pub_…`). If the layout embeds the marketing widget, that doesn't matter here, because the runner calls the widget API directly.

**Env vars** (names only, never commit values):

| Name | Required | Meaning |
|---|---|---|
| `GUDBOT_EVAL_BASE_URL` | yes | Preview origin, e.g. `https://guddesk-git-<branch>-….vercel.app` |
| `GUDBOT_EVAL_APP_ID` | yes | QA workspace public appId (`gd_pub_…`) |
| `GUDBOT_EVAL_BYPASS` | optional | Vercel Protection Bypass for Automation secret, sent as `x-vercel-protection-bypass` for protected Previews |

No other secrets. The Anthropic key is app-side only.

```bash
node live-runner.mjs --limit 5          # smoke test first
node live-runner.mjs                    # full run -> results.jsonl (~2–4 min; 1.5 s polite delay between cases)
node score.mjs score --results results.jsonl --out summary.json
```
Runner options: `--limit N`, `--ids 1,5,87`, `--out path`, `--delay-ms 1500`, `--timeout-ms 45000`.

For each case the runner works through the widget API:
1. `POST /api/widget/visitors` with `{appId}` creates an anonymous visitor.
2. `POST /api/widget/conversations` with `{appId, visitorToken, message}` sends the question.
3. It polls `GET /api/widget/conversations/:id/messages` (header `x-visitor-token`) until the first `BOT` or `SYSTEM` message arrives, or 45 s pass.

CSAT survey SYSTEM messages are ignored. Each row in `results.jsonl` looks like this:
```json
{"id":1,"question":"…","observed_action":"answer|handoff|timeout|error","observed_body":"…","observed_citations":[{"title":"…","url":"…"}],"observed_handoff_hint":"SYSTEM text or null","observed_handoff_reason":null,"conversation_id":"…","latency_ms":1234,"error":null}
```
Citations come from `sources` / `citations` / `metadata.sources` if the API exposes them. Otherwise the runner parses links in the `Sources:` section of the BOT body.

The handoff **reason** goes into an inbox internal NOTE, which the widget never sees. To check reasons, open the conversations in the inbox and fill `observed_handoff_reason` in by hand, e.g. `"no matching knowledge base articles"`. If it's left null, the reason check is skipped.

Each run creates 110 visitors and 110 conversations in the **Preview** QA workspace only. Delete the workspace afterwards or leave it; it's disposable.

## Question schema (`questions.jsonl`)
```json
{"id":1,"question":"…","category":"widget_install","expected_action":"answer|handoff","expected_gist":"key facts (empty for handoff)","must_include":["case-insensitive substrings"],"expected_citation_slugs":["install-widget"],"handoff_reason_any_of":null,"source_kb_area":"widget/installation"}
```
Handoff reason codes: `low_confidence`, `max_turns`, `explicit`, `no_evidence` ("no matching knowledge base articles"). Out-of-KB cases accept `["no_evidence","low_confidence"]`, and requests for a human accept `["explicit"]`. `max_turns` can't happen in a single-turn eval.

## Distribution (110)

| Bucket | Count | Notes |
|---|---|---|
| Answerable from seeded KB | 76 | widget install/customization, identify + HMAC, inbox, KB/help center, billing (Free $0 / Pro $29 only), open source / self-host, API, MCP, GudBot settings and behaviour |
| Should hand off | 22 | out-of-KB (SLA, shortcuts, webhooks, proration, SOC 2, Salesforce, phone), account-specific (orders, double charge, password reset, data deletion, discounts, outage), competitor-only, nonsense, off-topic, explicit human request |
| Edge variants | 12 | typos, shouting, terse and German paraphrases of answerable cases (expected_action=answer) |

Ids 1–30 are the original `qa/ai-eval.jsonl` seed questions rewritten to this schema. Seeds whose facts aren't in the product KB were turned into **handoff** cases rather than invented answers: 13 (keyboard shortcuts), 14–16 (SLA / business hours), 21 (mid-cycle proration) and 28 (webhook events). If those docs get added to the seeded KB later, flip those cases to `answer`.

## Scoring rules (`node score.mjs score --results <file>`)
The results file can be JSONL, a JSON array, or `{results:[…]}`. A question with no result row fails.

- **accuracy_pass**
  - `answer` cases: the observed action is a BOT answer, and the body contains **all** `must_include` strings (case-insensitive).
  - `handoff` cases: the visitor saw a SYSTEM (handoff) message, not a confident BOT answer.
- **citation_pass**
  - `answer` cases: every expected slug shows up, either as its slug or its article title, in the observed citations or the body's `Sources:` section. Any citation whose URL/slug doesn't match a seeded KB slug or title counts as **invented** and fails the case. A wrong action also fails.
  - `handoff` cases: pass unless a BOT reply showed Sources as if the question were resolved.
- **handoff_pass**: the observed action (`answer`/`handoff`) matches the expected one. For handoff cases with `handoff_reason_any_of`, if a reason can be detected in `observed_handoff_hint`/`observed_handoff_reason`, it must be one of the allowed codes. If nothing is detected, this check is skipped.
- **case_pass** = accuracy_pass AND citation_pass AND handoff_pass.
- **overall accuracy** = case_pass / total. The target is ≥ 80%. `timeout`/`error` rows fail.

Output:
```json
{"total":110,"case_pass":0,"accuracy_pct":0,"accuracy_pass_n":0,"citation_pass_n":0,"handoff_pass_n":0,"target_pct":80,"meets_target":false,"results_rows":0,"missing_results":0,"fails":[{"id":5,"reasons":["missing must_include: left"]}]}
```

## Per-release checklist
1. Run `node score.mjs validate` and confirm exit 0. If the KB or questions changed, make the change in both.
2. Preview deploy, then the QA workspace with GudBot ON and the KB seeded (pre-steps above).
3. Run `live-runner.mjs --limit 5` as a smoke test, then the full run.
4. Run `score.mjs score`. Attach `summary.json` plus any fails to the release QA note. ≥80% means PASS for the AI gate. Production GudBot rollout stays a separate decision for Kim (soft launch HOLD).
