"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateWidgetSettings } from "@/actions/update-widget-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";
import { useState } from "react";
interface WidgetConfiguratorProps {
  workspaceId: string;
  plan?: string;
  settings: {
    primaryColor: string;
    position: "bottom-right" | "bottom-left";
    welcomeMessage: string;
    workspaceName: string | null;
    showBranding: boolean;
    requireEmail: boolean;
    offlineFormTimeout: number | null;
    pageVisibilityMode: "exclude" | "include";
    pageVisibilityPatterns: string[];
  };
}

export function WidgetConfigurator({
  workspaceId,
  settings,
}: WidgetConfiguratorProps) {
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(settings);

  function handleSave() {
    startTransition(async () => {
      const result = await updateWidgetSettings(workspaceId, {
        ...config,
        pageVisibilityPatterns: config.pageVisibilityPatterns.filter(
          (p) => p.trim() !== "",
        ),
      });

      if (result.status === "error") {
        toast.error(result.message || "Failed to save settings");
        return;
      }

      toast.success("Widget settings saved!");
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Settings form */}
      <div className="space-y-6 rounded-lg border p-6">
        <h3 className="text-sm font-medium">Customize Widget</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspaceName">Display Name</Label>
            <Input
              id="workspaceName"
              value={config.workspaceName ?? ""}
              onChange={(e) =>
                setConfig((s) => ({ ...s, workspaceName: e.target.value }))
              }
              placeholder="Your workspace name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Input
              id="welcomeMessage"
              value={config.welcomeMessage}
              onChange={(e) =>
                setConfig((s) => ({ ...s, welcomeMessage: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primaryColor"
                value={config.primaryColor}
                onChange={(e) =>
                  setConfig((s) => ({ ...s, primaryColor: e.target.value }))
                }
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <Input
                value={config.primaryColor}
                onChange={(e) =>
                  setConfig((s) => ({ ...s, primaryColor: e.target.value }))
                }
                className="w-28"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select
              value={config.position}
              onValueChange={(value: "bottom-right" | "bottom-left") =>
                setConfig((s) => ({ ...s, position: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requireEmail">Require email before chat</Label>
            <Switch
              id="requireEmail"
              checked={config.requireEmail}
              onCheckedChange={(checked) =>
                setConfig((s) => ({ ...s, requireEmail: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showBranding">Show GudDesk branding</Label>
            <Switch
              id="showBranding"
              checked={config.showBranding}
              onCheckedChange={(checked) =>
                setConfig((s) => ({ ...s, showBranding: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offlineFormToggle">Offline contact form</Label>
                <p className="text-xs text-muted-foreground">
                  Show a contact form when no agent responds
                </p>
              </div>
              <Switch
                id="offlineFormToggle"
                checked={config.offlineFormTimeout !== null}
                onCheckedChange={(checked) =>
                  setConfig((s) => ({
                    ...s,
                    offlineFormTimeout: checked ? 2 : null,
                  }))
                }
              />
            </div>
            {config.offlineFormTimeout !== null && (
              <div className="flex items-center gap-2">
                <Label htmlFor="offlineTimeout" className="shrink-0 text-xs">
                  Show after
                </Label>
                <Select
                  value={String(config.offlineFormTimeout)}
                  onValueChange={(value) =>
                    setConfig((s) => ({
                      ...s,
                      offlineFormTimeout: parseInt(value, 10),
                    }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 min</SelectItem>
                    <SelectItem value="2">2 min</SelectItem>
                    <SelectItem value="3">3 min</SelectItem>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  of no response
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label>Page visibility</Label>
              <p className="text-xs text-muted-foreground">
                Control which pages display the chat widget.
              </p>
            </div>

            <Select
              value={config.pageVisibilityMode}
              onValueChange={(value: "exclude" | "include") =>
                setConfig((s) => ({ ...s, pageVisibilityMode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exclude">
                  Show on all pages except...
                </SelectItem>
                <SelectItem value="include">Only show on...</SelectItem>
              </SelectContent>
            </Select>

            {config.pageVisibilityPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={pattern}
                  onChange={(e) => {
                    const updated = [...config.pageVisibilityPatterns];
                    updated[index] = e.target.value;
                    setConfig((s) => ({
                      ...s,
                      pageVisibilityPatterns: updated,
                    }));
                  }}
                  placeholder="/admin/*"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updated = config.pageVisibilityPatterns.filter(
                      (_, i) => i !== index,
                    );
                    setConfig((s) => ({
                      ...s,
                      pageVisibilityPatterns: updated,
                    }));
                  }}
                >
                  <Icons.trash className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((s) => ({
                  ...s,
                  pageVisibilityPatterns: [
                    ...s.pageVisibilityPatterns,
                    "",
                  ],
                }))
              }
            >
              <Icons.add className="mr-2 size-4" />
              Add pattern
            </Button>

            <p className="text-xs text-muted-foreground">
              Use <code className="rounded bg-muted px-1 text-[10px]">*</code>{" "}
              to match a single path segment and{" "}
              <code className="rounded bg-muted px-1 text-[10px]">**</code> to
              match multiple segments. Example:{" "}
              <code className="rounded bg-muted px-1 text-[10px]">
                /admin/*
              </code>{" "}
              matches <span className="italic">/admin/dashboard</span> but not{" "}
              <span className="italic">/admin/users/1</span>.
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isPending} className="w-full">
          {isPending && (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Live preview */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-sm font-medium">Preview</h3>
        <div className="relative h-[500px] rounded-lg bg-muted/50">
          {/* Widget preview mock */}
          <div
            className={`absolute bottom-4 ${config.position === "bottom-right" ? "right-4" : "left-4"}`}
          >
            {/* Chat window preview */}
            <div className="mb-3 w-[320px] overflow-hidden rounded-xl border bg-background shadow-lg">
              {/* Header */}
              <div
                className="p-4 text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                <p className="text-sm font-semibold">
                  {config.workspaceName || "Your Workspace"}
                </p>
                <p className="text-xs opacity-80">
                  We typically reply in a few minutes
                </p>
              </div>

              {/* Messages area */}
              <div className="space-y-3 p-4">
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] rounded-lg px-3 py-2 text-xs text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {config.welcomeMessage}
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    Type a message...
                  </div>
                </div>
                {config.showBranding && (
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    Powered by GudDesk
                  </p>
                )}
              </div>
            </div>

            {/* Bubble button */}
            <div
              className={`flex size-14 items-center justify-center rounded-full text-white shadow-lg ${config.position === "bottom-right" ? "ml-auto" : ""}`}
              style={{ backgroundColor: config.primaryColor }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
