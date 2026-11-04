# Check-in: AI eval Month 2

## cavewebs/flowchat (primary)

These files live under `qa/ai-eval/`:

- `qa/ai-eval/README.md`
- `qa/ai-eval/questions.jsonl`
- `qa/ai-eval/seeded-kb.json`
- `qa/ai-eval/score.mjs`
- `qa/ai-eval/live-runner.mjs`
- `qa/ai-eval/CHECKIN.md`

Also add `qa/ai-eval/results*.jsonl` and `qa/ai-eval/summary*.json` to `.gitignore`. Run outputs are per-release artifacts and shouldn't be committed.

The old 30-question seed (`qa/ai-eval.jsonl`) is replaced by `questions.jsonl`, where ids 1–30 are the rewritten seeds. Don't check the old file in next to the new one. If it's already in the repo, delete it in the same PR.

There are no secrets in any of these files. Env var **names** are documented in the README; values stay in local shells and CI secrets.

Optional CI step (offline, no network): `node qa/ai-eval/score.mjs validate`.

## gudlab/guddesk-core (OSS mirror)

If the eval is shared with the open-source repo, Eng mirrors the same `qa/ai-eval/` files into `gudlab/guddesk-core` through the usual **sync-oss** flow. Don't hand-copy or push a separate fork. The content is product-generic: it has no workspace IDs, appIds, Preview URLs or keys.
