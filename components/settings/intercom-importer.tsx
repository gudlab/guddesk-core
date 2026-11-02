"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import type {
  ImportResult,
  PreviewCounts,
} from "@/lib/import/intercom/types";

interface IntercomImporterProps {
  workspaceId: string;
}

type Phase = "pick" | "preview" | "done";

function CountTable({
  counts,
}: {
  counts: PreviewCounts;
}) {
  const rows: Array<[string, number]> = [
    ["Contacts", counts.contacts],
    ["Collections", counts.collections],
    ["Articles", counts.articles],
    ["Published articles", counts.articlesPublished],
    ["Conversations", counts.conversations],
    ["Closed conversations", counts.conversationsClosed],
    ["Messages", counts.messages],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ResultTable({ result }: { result: ImportResult }) {
  const rows: Array<[string, ImportResult["contacts"]]> = [
    ["Contacts", result.contacts],
    ["Collections", result.collections],
    ["Articles", result.articles],
    ["Conversations", result.conversations],
    ["Messages", result.messages],
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th className="py-1 font-medium">Type</th>
          <th className="py-1 font-medium">Created</th>
          <th className="py-1 font-medium">Skipped</th>
          <th className="py-1 font-medium">Errors</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, counts]) => (
          <tr key={label} className="border-t">
            <td className="py-1">{label}</td>
            <td className="py-1">{counts.created}</td>
            <td className="py-1">{counts.skipped}</td>
            <td className="py-1">{counts.errors}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function IntercomImporter({ workspaceId }: IntercomImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<PreviewCounts | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  function reset() {
    setPhase("pick");
    setError(null);
    setCounts(null);
    setWarnings([]);
    setResult(null);
  }

  async function send(mode: "preview" | "commit") {
    if (!file) {
      setError("Choose a JSON or zip export first.");
      return;
    }
    setBusy(mode);
    setError(null);
    try {
      const body = new FormData();
      body.set("workspaceId", workspaceId);
      body.set("mode", mode);
      body.set("file", file);
      const response = await fetch("/api/import/intercom", {
        method: "POST",
        body,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          typeof payload.error === "string"
            ? payload.error
            : "The export could not be read.",
        );
        return;
      }
      setCounts(payload.counts ?? null);
      setWarnings(Array.isArray(payload.warnings) ? payload.warnings : payload.result?.warnings ?? []);
      if (mode === "preview") {
        setPhase("preview");
        return;
      }
      setResult(payload.result ?? null);
      setPhase("done");
    } catch {
      setError("The export could not be uploaded. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Intercom import</CardTitle>
        <CardDescription>
          Upload a JSON dump or a zip of JSON files from an Intercom data
          export. Preview the counts, then import into this workspace. The
          same Intercom ids are skipped on a second run. This does not turn
          on GudBot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="intercom-export" className="text-sm font-medium">
            Export file
          </label>
          <input
            id="intercom-export"
            type="file"
            accept=".json,.jsonl,.ndjson,.zip,application/json,application/zip"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              reset();
            }}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5"
          />
          <p className="text-xs text-muted-foreground">
            JSON or zip, up to 4 MB. Live Intercom API pull is not in this
            slice. A sample dump is in{" "}
            <code>lib/import/intercom/fixtures/sample-export.json</code>.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {phase === "pick" && (
          <Button
            onClick={() => send("preview")}
            disabled={!file || busy !== null}
          >
            {busy === "preview" && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Preview import
          </Button>
        )}

        {phase === "preview" && counts && (
          <div className="space-y-4">
            <CountTable counts={counts} />
            {warnings.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => send("commit")} disabled={busy !== null}>
                {busy === "commit" && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Import into this workspace
              </Button>
              <Button variant="outline" onClick={reset} disabled={busy !== null}>
                Choose a different file
              </Button>
            </div>
          </div>
        )}

        {phase === "done" && result && (
          <div className="space-y-4">
            {counts && <CountTable counts={counts} />}
            <ResultTable result={result} />
            {result.errors.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
                {result.errors.map((item, index) => (
                  <li key={`${item.entity}-${item.externalId}-${index}`}>
                    {item.entity}
                    {item.externalId ? ` ${item.externalId}` : ""}: {item.message}
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
