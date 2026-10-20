"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Copy, Globe, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiKeyPermission } from "@prisma/client";

import {
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from "@/actions/manage-api-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// ─── Types ─────────────────────────────────────────────

interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permission: ApiKeyPermission;
  isEnabled: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  workspaceId: string | null;
}

interface ApiKeySettingsProps {
  workspaces: WorkspaceOption[];
  apiKeys: ApiKeyItem[];
}

// ─── Helpers ───────────────────────────────────────────

const PERMISSION_LABELS: Record<ApiKeyPermission, string> = {
  READ_ONLY: "Read Only",
  READ_WRITE: "Read & Write",
  FULL_ACCESS: "Full Access",
};

const PERMISSION_COLORS: Record<ApiKeyPermission, string> = {
  READ_ONLY: "bg-gray-100 text-gray-700",
  READ_WRITE: "bg-blue-100 text-blue-700",
  FULL_ACCESS: "bg-purple-100 text-purple-700",
};

function timeAgo(date: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// ─── Component ─────────────────────────────────────────

export function ApiKeySettings({
  workspaces,
  apiKeys: initialApiKeys,
}: ApiKeySettingsProps) {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [name, setName] = useState("");
  const [permission, setPermission] = useState<ApiKeyPermission>("READ_WRITE");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
    workspaces.length === 1 ? workspaces[0].id : "all",
  );
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const workspaceMap = new Map(workspaces.map((w) => [w.id, w]));

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    startTransition(async () => {
      const result = await createApiKey({
        name: name.trim(),
        permission,
        workspaceId: selectedWorkspaceId === "all" ? null : selectedWorkspaceId,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success("API key created");
      setNewRawKey(result.apiKey!.rawKey);
      setName("");
      setPermission("READ_WRITE");

      // Add to local list
      setApiKeys((prev) => [
        {
          id: result.apiKey!.id,
          name: result.apiKey!.name,
          keyPrefix: result.apiKey!.keyPrefix,
          permission: result.apiKey!.permission,
          isEnabled: true,
          lastUsedAt: null,
          expiresAt: null,
          createdAt: new Date(),
          workspaceId:
            selectedWorkspaceId === "all" ? null : selectedWorkspaceId,
        },
        ...prev,
      ]);
    });
  }

  function handleToggle(id: string, isEnabled: boolean) {
    // Optimistic update
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isEnabled } : k)),
    );

    startTransition(async () => {
      const result = await updateApiKey(id, { isEnabled });
      if (result.status === "error") {
        toast.error(result.message);
        // Rollback
        setApiKeys((prev) =>
          prev.map((k) =>
            k.id === id ? { ...k, isEnabled: !isEnabled } : k,
          ),
        );
      }
    });
  }

  function handleDelete(id: string) {
    const key = apiKeys.find((k) => k.id === id);
    if (!key) return;

    // Optimistic remove
    setApiKeys((prev) => prev.filter((k) => k.id !== id));

    startTransition(async () => {
      const result = await deleteApiKey(id);
      if (result.status === "error") {
        toast.error(result.message);
        // Rollback
        setApiKeys((prev) =>
          [...prev, key].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
        );
      } else {
        toast.success("API key deleted");
      }
    });
  }

  function getWorkspaceLabel(workspaceId: string | null) {
    if (!workspaceId) return null;
    return workspaceMap.get(workspaceId)?.name || "Unknown";
  }

  return (
    <div className="space-y-6">
      {/* Create new key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create API Key</CardTitle>
          <CardDescription>
            API keys authenticate external services, agents, and integrations.
            Keys are tied to your account and can be scoped to a specific
            workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1 space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Production Agent, Zapier"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            {/* Workspace selector: only shown if user has multiple workspaces */}
            {workspaces.length > 1 && (
              <div className="w-48 space-y-1.5">
                <label className="text-sm font-medium">Workspace</label>
                <Select
                  value={selectedWorkspaceId}
                  onValueChange={setSelectedWorkspaceId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workspaces</SelectItem>
                    {workspaces.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-44 space-y-1.5">
              <label className="text-sm font-medium">Permission</label>
              <Select
                value={permission}
                onValueChange={(v) => setPermission(v as ApiKeyPermission)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ_ONLY">Read Only</SelectItem>
                  <SelectItem value="READ_WRITE">Read & Write</SelectItem>
                  <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              Create Key
            </Button>
          </div>

          {/* One-time key display */}
          {newRawKey && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Copy your API key now. You won&apos;t be able to see it
                    again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-white px-3 py-2 font-mono text-sm dark:bg-amber-900">
                      {newRawKey}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      onClick={() => copyKey(newRawKey)}
                    >
                      {copiedKey ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API key list */}
      {apiKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Your API Keys ({apiKeys.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{key.name}</p>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-[10px] ${PERMISSION_COLORS[key.permission]}`}
                    >
                      {PERMISSION_LABELS[key.permission]}
                    </Badge>
                    {key.workspaceId ? (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px]"
                      >
                        {getWorkspaceLabel(key.workspaceId)}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] border-blue-200 bg-blue-50 text-blue-700"
                      >
                        <Globe className="mr-1 size-3" />
                        All Workspaces
                      </Badge>
                    )}
                    {!key.isEnabled && (
                      <Badge variant="outline" className="text-[10px]">
                        Disabled
                      </Badge>
                    )}
                    {key.expiresAt &&
                      new Date(key.expiresAt) < new Date() && (
                        <Badge
                          variant="destructive"
                          className="text-[10px]"
                        >
                          Expired
                        </Badge>
                      )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      {key.keyPrefix}{"••••••••"}
                    </code>
                    <span>Last used: {timeAgo(key.lastUsedAt)}</span>
                    <span>
                      Created:{" "}
                      {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Switch
                    checked={key.isEnabled}
                    onCheckedChange={(checked) =>
                      handleToggle(key.id, checked)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(key.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
          <CardDescription>
            Set up an AI support agent with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              gud-agent
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">1. Install</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm">
              <code>
                git clone https://github.com/gudlab/gud-agent.git && cd
                gud-agent && pnpm install
              </code>
            </pre>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">2. Configure</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm">
              <code>
                {`GUDDESK_API_KEY=<your-api-key>
OPENAI_API_KEY=sk-...
AGENT_URL=https://your-public-url.com`}
              </code>
            </pre>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              3. Crawl your site &amp; start
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm">
              <code>{`pnpm crawl https://your-website.com
pnpm start`}</code>
            </pre>
          </div>
          <p className="text-xs text-muted-foreground">
            The agent will automatically register its webhook and start
            responding to visitor messages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
