"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  testWebhookEndpoint,
  rotateWebhookSecret,
} from "@/actions/manage-webhooks";

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  isEnabled: boolean;
  onMessageCreated: boolean;
  onConversationCreated: boolean;
  onConversationClosed: boolean;
  onConversationAssigned: boolean;
  createdAt: Date;
  deliveryCount: number;
}

interface WebhookSettingsProps {
  workspaceId: string;
  workspaceSlug: string;
  endpoints: WebhookEndpoint[];
}

export function WebhookSettings({
  workspaceId,
  workspaceSlug,
  endpoints: initialEndpoints,
}: WebhookSettingsProps) {
  const [endpoints, setEndpoints] = useState(initialEndpoints);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [rotatedSecret, setRotatedSecret] = useState<{ id: string; secret: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!newUrl.trim()) return;

    startTransition(async () => {
      const result = await createWebhookEndpoint(workspaceId, {
        url: newUrl.trim(),
        description: newDescription.trim() || undefined,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success("Webhook endpoint created");
      setNewSecret(result.endpoint!.secret);
      setNewUrl("");
      setNewDescription("");

      // Add to local state
      setEndpoints((prev) => [
        {
          id: result.endpoint!.id,
          url: result.endpoint!.url,
          description: result.endpoint!.description,
          isEnabled: true,
          onMessageCreated: true,
          onConversationCreated: true,
          onConversationClosed: false,
          onConversationAssigned: false,
          createdAt: new Date(),
          deliveryCount: 0,
        },
        ...prev,
      ]);
    });
  };

  const handleToggle = (
    endpointId: string,
    field: string,
    value: boolean,
  ) => {
    // Optimistic update
    setEndpoints((prev) =>
      prev.map((ep) =>
        ep.id === endpointId ? { ...ep, [field]: value } : ep,
      ),
    );

    startTransition(async () => {
      const result = await updateWebhookEndpoint(endpointId, workspaceId, {
        [field]: value,
      });
      if (result.status === "error") {
        toast.error(result.message);
        // Revert on error
        setEndpoints((prev) =>
          prev.map((ep) =>
            ep.id === endpointId ? { ...ep, [field]: !value } : ep,
          ),
        );
      }
    });
  };

  const handleDelete = (endpointId: string) => {
    startTransition(async () => {
      const result = await deleteWebhookEndpoint(endpointId, workspaceId);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success("Webhook endpoint deleted");
      setEndpoints((prev) => prev.filter((ep) => ep.id !== endpointId));
    });
  };

  const handleTest = (endpointId: string) => {
    startTransition(async () => {
      const result = await testWebhookEndpoint(endpointId, workspaceId);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      if (result.testResult?.success) {
        toast.success(`Ping delivered — HTTP ${result.testResult.httpStatus}`);
      } else {
        toast.error(
          `Ping failed${result.testResult?.errorMessage ? `: ${result.testResult.errorMessage}` : ""}`,
        );
      }
    });
  };

  const handleRotateSecret = (endpointId: string) => {
    startTransition(async () => {
      const result = await rotateWebhookSecret(endpointId, workspaceId);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      setRotatedSecret({ id: endpointId, secret: result.secret! });
      toast.success("Signing secret rotated");
    });
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Add new endpoint */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-medium">Add Webhook Endpoint</h3>
        <p className="text-sm text-muted-foreground">
          GudDesk will send POST requests to your endpoint when events occur.
          The URL must use HTTPS.
        </p>

        <div className="space-y-3">
          <div>
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-server.com/webhook"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="webhook-desc">Description (optional)</Label>
            <Input
              id="webhook-desc"
              placeholder="e.g. AI Agent, Zapier, Custom integration"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handleCreate} disabled={isPending || !newUrl.trim()}>
            {isPending ? "Creating..." : "Add Endpoint"}
          </Button>
        </div>

        {/* Show secret after creation (one-time) */}
        {newSecret && (
          <SecretAlert
            secret={newSecret}
            onCopy={copySecret}
            onDismiss={() => setNewSecret(null)}
          />
        )}
      </div>

      {/* Active endpoints */}
      {endpoints.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Active Endpoints</h3>
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-mono text-sm">{endpoint.url}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {endpoint.deliveryCount} deliveries
                    </Badge>
                  </div>
                  {endpoint.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`enabled-${endpoint.id}`}
                      className="text-sm"
                    >
                      Enabled
                    </Label>
                    <Switch
                      id={`enabled-${endpoint.id}`}
                      checked={endpoint.isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle(endpoint.id, "isEnabled", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Rotated secret alert (per endpoint) */}
              {rotatedSecret?.id === endpoint.id && (
                <SecretAlert
                  secret={rotatedSecret.secret}
                  onCopy={copySecret}
                  onDismiss={() => setRotatedSecret(null)}
                />
              )}

              {/* Event toggles */}
              <div className="grid grid-cols-2 gap-3">
                <EventToggle
                  label="Message created"
                  checked={endpoint.onMessageCreated}
                  onChange={(v) =>
                    handleToggle(endpoint.id, "onMessageCreated", v)
                  }
                />
                <EventToggle
                  label="Conversation created"
                  checked={endpoint.onConversationCreated}
                  onChange={(v) =>
                    handleToggle(endpoint.id, "onConversationCreated", v)
                  }
                />
                <EventToggle
                  label="Conversation closed"
                  checked={endpoint.onConversationClosed}
                  onChange={(v) =>
                    handleToggle(endpoint.id, "onConversationClosed", v)
                  }
                />
                <EventToggle
                  label="Conversation assigned"
                  checked={endpoint.onConversationAssigned}
                  onChange={(v) =>
                    handleToggle(endpoint.id, "onConversationAssigned", v)
                  }
                />
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleTest(endpoint.id)}
                    disabled={isPending}
                  >
                    <Icons.zap className="mr-1 size-3" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleRotateSecret(endpoint.id)}
                    disabled={isPending}
                  >
                    <Icons.refreshCw className="mr-1 size-3" />
                    Rotate Secret
                  </Button>
                  <Link
                    href={`/workspace/${workspaceSlug}/settings/webhooks/${endpoint.id}/deliveries`}
                  >
                    <Button variant="outline" size="sm" className="text-xs">
                      <Icons.fileText className="mr-1 size-3" />
                      View Logs
                    </Button>
                  </Link>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(endpoint.id)}
                  disabled={isPending}
                >
                  <Icons.trash className="mr-1 size-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="rounded-lg border p-4">
        <h3 className="font-medium">Webhook Payload</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Each webhook request includes a{" "}
          <code className="rounded bg-muted px-1">X-GudDesk-Signature</code>{" "}
          header for HMAC SHA-256 verification, and a{" "}
          <code className="rounded bg-muted px-1">X-GudDesk-Event</code>{" "}
          header with the event name.
        </p>
        <div className="mt-3 rounded bg-muted p-3 font-mono text-xs">
          {`{
  "event": "message.created",
  "data": {
    "conversationId": "...",
    "messageId": "...",
    "type": "VISITOR",
    "body": "Hello!",
    "workspaceId": "..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function SecretAlert({
  secret,
  onCopy,
  onDismiss,
}: {
  secret: string;
  onCopy: (s: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
        Signing Secret (save this — it won&apos;t be shown again)
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-xs dark:bg-black">
          {secret}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(secret)}
        >
          <Icons.copy className="mr-1 size-3" />
          Copy
        </Button>
      </div>
      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
        Use this secret to verify webhook signatures via the{" "}
        <code className="rounded bg-white/50 px-1 dark:bg-black/50">
          X-GudDesk-Signature
        </code>{" "}
        header.
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
}

function EventToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
