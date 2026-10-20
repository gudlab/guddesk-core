"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { SlaPolicy, BusinessHours } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { createSlaPolicy, updateSlaPolicy, deleteSlaPolicy } from "@/actions/manage-sla-policies";
import { upsertBusinessHours } from "@/actions/manage-business-hours";
import { normaliseTimeZone } from "@/lib/timezones";
import { TimezonePicker } from "@/components/settings/timezone-picker";
import type { WeekSchedule, DaySchedule } from "@/lib/sla/business-hours";

const PRIORITY_LABELS: Record<string, string> = {
  "null": "Default (all priorities)",
  "0": "Normal (P0)",
  "1": "Low (P1)",
  "2": "High (P2)",
  "3": "Urgent (P3)",
};

const DAY_NAMES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "17:00" },
  wednesday: { start: "09:00", end: "17:00" },
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
  saturday: null,
  sunday: null,
};

interface Props {
  policies: SlaPolicy[];
  businessHours: BusinessHours | null;
  workspaceId: string;
}

export function SlaPoliciesManager({ policies, businessHours, workspaceId }: Props) {
  return (
    <div className="space-y-8">
      <BusinessHoursSection
        businessHours={businessHours}
        workspaceId={workspaceId}
      />
      <PoliciesSection policies={policies} workspaceId={workspaceId} />
    </div>
  );
}

// ─── Business Hours Section ───────────────────────────

function BusinessHoursSection({
  businessHours,
  workspaceId,
}: {
  businessHours: BusinessHours | null;
  workspaceId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [timezone, setTimezone] = useState(businessHours?.timezone ?? "UTC");
  const [usingBrowserZone, setUsingBrowserZone] = useState(false);

  // First visit (nothing saved yet): start from the browser's timezone.
  useEffect(() => {
    if (businessHours) return;
    const browserZone = normaliseTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    if (browserZone) {
      setTimezone(browserZone);
      setUsingBrowserZone(true);
    }
  }, [businessHours]);
  const [schedule, setSchedule] = useState<WeekSchedule>(
    (businessHours?.schedule as WeekSchedule) ?? DEFAULT_SCHEDULE,
  );
  const [holidays, setHolidays] = useState<string[]>(
    (businessHours?.holidays as string[]) ?? [],
  );
  const [newHoliday, setNewHoliday] = useState("");

  function toggleDay(day: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day as keyof WeekSchedule]
        ? null
        : { start: "09:00", end: "17:00" },
    }));
  }

  function updateDayTime(day: string, field: "start" | "end", value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...(prev[day as keyof WeekSchedule] as DaySchedule), [field]: value },
    }));
  }

  function addHoliday() {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays([...holidays, newHoliday].sort());
      setNewHoliday("");
    }
  }

  function removeHoliday(date: string) {
    setHolidays(holidays.filter((h) => h !== date));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await upsertBusinessHours(workspaceId, {
        timezone,
        schedule,
        holidays,
      });
      if (result.status === "error") {
        toast.error(result.message);
      } else {
        setTimezone(result.timezone);
        setUsingBrowserZone(false);
        toast.success("Business hours saved");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>
          SLA deadlines only count time during business hours. Configure your working schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timezone */}
        <div className="space-y-2">
          <Label>Timezone</Label>
          <TimezonePicker
            value={timezone}
            onChange={(value) => {
              setTimezone(value);
              setUsingBrowserZone(false);
            }}
          />
          {usingBrowserZone && (
            <p className="text-sm text-muted-foreground">
              Set from your browser. Save to keep it.
            </p>
          )}
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          <Label>Weekly Schedule</Label>
          <div className="space-y-2">
            {DAY_NAMES.map((day) => {
              const daySchedule = schedule[day];
              const isEnabled = !!daySchedule;
              return (
                <div key={day} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-24 text-left text-sm font-medium ${
                      isEnabled ? "text-foreground" : "text-muted-foreground line-through"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                  {isEnabled ? (
                    <>
                      <Input
                        type="time"
                        value={daySchedule!.start}
                        onChange={(e) => updateDayTime(day, "start", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={daySchedule!.end}
                        onChange={(e) => updateDayTime(day, "end", e.target.value)}
                        className="w-32"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Off</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays */}
        <div className="space-y-3">
          <Label>Holidays (excluded from SLA)</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" size="sm" onClick={addHoliday}>
              Add Holiday
            </Button>
          </div>
          {holidays.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {holidays.map((date) => (
                <Badge key={date} variant="secondary" className="gap-1">
                  {date}
                  <button
                    type="button"
                    onClick={() => removeHoliday(date)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Business Hours"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── SLA Policies Section ─────────────────────────────

function PoliciesSection({
  policies,
  workspaceId,
}: {
  policies: SlaPolicy[];
  workspaceId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(policyId: string) {
    if (!confirm("Delete this SLA policy?")) return;
    startTransition(async () => {
      const result = await deleteSlaPolicy(workspaceId, policyId);
      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success("Policy deleted");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>SLA Policies</CardTitle>
          <CardDescription>
            Define response and resolution time targets per priority level.
          </CardDescription>
        </div>
        <CreatePolicyDialog workspaceId={workspaceId} />
      </CardHeader>
      <CardContent>
        {policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No SLA policies configured. Create one to start tracking response and resolution times.
          </p>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{policy.name}</span>
                    {policy.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <Badge variant="outline">
                      {PRIORITY_LABELS[String(policy.priority ?? "null")]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    First response: {formatMinutes(policy.firstResponseMinutes)} •
                    Resolution: {formatMinutes(policy.resolutionMinutes)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(policy.id)}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Create Policy Dialog ─────────────────────────────

function CreatePolicyDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [firstResponseMinutes, setFirstResponseMinutes] = useState(30);
  const [resolutionMinutes, setResolutionMinutes] = useState(480);
  const [priority, setPriority] = useState<string>("null");
  const [isDefault, setIsDefault] = useState(false);

  function handleSubmit() {
    startTransition(async () => {
      const result = await createSlaPolicy(workspaceId, {
        name,
        firstResponseMinutes,
        resolutionMinutes,
        priority: priority === "null" ? null : parseInt(priority),
        isDefault,
      });

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success("SLA policy created");
        setOpen(false);
        setName("");
        setFirstResponseMinutes(30);
        setResolutionMinutes(480);
        setPriority("null");
        setIsDefault(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Policy</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create SLA Policy</DialogTitle>
          <DialogDescription>
            Set response and resolution time targets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Policy Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard SLA"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Response Target (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={firstResponseMinutes}
                onChange={(e) => setFirstResponseMinutes(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                {formatMinutes(firstResponseMinutes)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Resolution Target (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={resolutionMinutes}
                onChange={(e) => setResolutionMinutes(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                {formatMinutes(resolutionMinutes)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isDefault">Set as default policy</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Creating..." : "Create Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
