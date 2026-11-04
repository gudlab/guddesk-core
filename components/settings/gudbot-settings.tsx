"use client";

import { useState, useTransition } from "react";
import { updateGudBotSettings } from "@/actions/update-gudbot-settings";
import { toast } from "sonner";

import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_HANDOFF_MESSAGE,
  DEFAULT_MAX_TURNS,
  MAX_CONFIDENCE_THRESHOLD,
  MAX_MAX_TURNS,
  MIN_CONFIDENCE_THRESHOLD,
  MIN_MAX_TURNS,
} from "@/lib/gudbot/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/shared/icons";

export interface GudBotSettingsValues {
  enabled: boolean;
  confidenceThreshold: number;
  maxTurns: number;
  handoffMessage: string;
}

interface GudBotSettingsFormProps {
  workspaceId: string;
  settings: GudBotSettingsValues | null;
}

export function GudBotSettingsForm({
  workspaceId,
  settings,
}: GudBotSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(settings?.enabled ?? false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(
    settings?.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD,
  );
  const [maxTurns, setMaxTurns] = useState(
    settings?.maxTurns ?? DEFAULT_MAX_TURNS,
  );
  const [handoffMessage, setHandoffMessage] = useState(
    settings?.handoffMessage ?? DEFAULT_HANDOFF_MESSAGE,
  );

  function handleSave() {
    startTransition(async () => {
      const result = await updateGudBotSettings(workspaceId, {
        enabled,
        confidenceThreshold,
        maxTurns,
        handoffMessage,
        channels: ["widget"],
      });
      if (result.status === "success") {
        toast.success("GudBot settings saved");
      } else {
        toast.error(result.message ?? "Failed to save");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">GudBot</CardTitle>
            <CardDescription>
              Off by default. Answers visitors from published help articles,
              then hands off with a suggested reply.
            </CardDescription>
          </div>
          <Switch
            id="gudbot-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Enable GudBot"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="max-w-prose text-sm text-neutral-600 dark:text-neutral-300">
          Pro inbox reply suggestions are separate from this toggle.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gudbot-threshold">Confidence threshold</Label>
            <span className="text-sm text-neutral-600 tabular-nums dark:text-neutral-300">
              {confidenceThreshold.toFixed(2)}
            </span>
          </div>
          <Slider
            id="gudbot-threshold"
            min={MIN_CONFIDENCE_THRESHOLD}
            max={MAX_CONFIDENCE_THRESHOLD}
            step={0.05}
            value={[confidenceThreshold]}
            onValueChange={(value) =>
              setConfidenceThreshold(value[0] ?? DEFAULT_CONFIDENCE_THRESHOLD)
            }
            disabled={!enabled}
          />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Replies below this score are not shown to the visitor. Range{" "}
            {MIN_CONFIDENCE_THRESHOLD.toFixed(2)} to{" "}
            {MAX_CONFIDENCE_THRESHOLD.toFixed(2)}. Default{" "}
            {DEFAULT_CONFIDENCE_THRESHOLD.toFixed(2)}.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gudbot-max-turns">Max turns</Label>
            <span className="text-sm text-neutral-600 tabular-nums dark:text-neutral-300">
              {maxTurns}
            </span>
          </div>
          <Slider
            id="gudbot-max-turns"
            min={MIN_MAX_TURNS}
            max={MAX_MAX_TURNS}
            step={1}
            value={[maxTurns]}
            onValueChange={(value) =>
              setMaxTurns(value[0] ?? DEFAULT_MAX_TURNS)
            }
            disabled={!enabled}
          />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Hand off after this many GudBot replies. Range {MIN_MAX_TURNS} to{" "}
            {MAX_MAX_TURNS}. Default {DEFAULT_MAX_TURNS}.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gudbot-handoff">Handoff message</Label>
          <Textarea
            id="gudbot-handoff"
            value={handoffMessage}
            onChange={(event) => setHandoffMessage(event.target.value)}
            disabled={!enabled}
            maxLength={500}
          />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Shown to the visitor when GudBot passes the conversation to a human.
          </p>
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Icons.spinner className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save GudBot settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
