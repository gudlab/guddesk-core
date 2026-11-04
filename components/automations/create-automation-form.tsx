"use client";

import { useState, useTransition } from "react";

import { createAutomationRule } from "@/actions/manage-automation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateAutomationFormProps {
  workspaceId: string;
  workspaceMembers: Array<{ id: string; user: { name: string | null } }>;
}

export function CreateAutomationForm({
  workspaceId,
  workspaceMembers,
}: CreateAutomationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [tag, setTag] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [conditionField, setConditionField] = useState("");
  const [conditionValue, setConditionValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !trigger || !action) return;

    const conditions =
      conditionField && conditionValue
        ? { [conditionField]: conditionValue }
        : undefined;

    const actionConfig: Record<string, string> = {};
    if (action === "ASSIGN_TO") actionConfig.assigneeId = assigneeId;
    if (action === "ADD_TAG" || action === "REMOVE_TAG") actionConfig.tag = tag;
    if (action === "CHANGE_STATUS") actionConfig.status = status;
    if (action === "SEND_MESSAGE" || action === "NOTIFY_SLACK")
      actionConfig.message = message;

    startTransition(async () => {
      const result = await createAutomationRule(workspaceId, {
        name,
        trigger,
        conditions,
        action,
        actionConfig,
      });

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success("Automation created");
        setName("");
        setTrigger("");
        setAction("");
        setTag("");
        setAssigneeId("");
        setStatus("");
        setMessage("");
        setConditionField("");
        setConditionValue("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">Create Automation Rule</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Rule Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Auto-assign bug reports"
          />
        </div>

        <div className="space-y-2">
          <Label>Trigger</Label>
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger>
              <SelectValue placeholder="When..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONVERSATION_CREATED">
                New conversation
              </SelectItem>
              <SelectItem value="CONVERSATION_CLOSED">
                Conversation closed
              </SelectItem>
              <SelectItem value="MESSAGE_RECEIVED">
                Message received
              </SelectItem>
              <SelectItem value="TAG_ADDED">Tag added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Condition (optional)</Label>
          <Select value={conditionField} onValueChange={setConditionField}>
            <SelectTrigger>
              <SelectValue placeholder="If..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tags_contain">Tags contain</SelectItem>
              <SelectItem value="message_contains">
                Message contains
              </SelectItem>
              <SelectItem value="visitor_email_contains">
                Visitor email contains
              </SelectItem>
            </SelectContent>
          </Select>
          {conditionField && (
            <Input
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              placeholder="Value..."
              className="mt-1"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Action</Label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue placeholder="Then..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASSIGN_TO">Assign to agent</SelectItem>
              <SelectItem value="ADD_TAG">Add tag</SelectItem>
              <SelectItem value="REMOVE_TAG">Remove tag</SelectItem>
              <SelectItem value="CHANGE_STATUS">Change status</SelectItem>
              <SelectItem value="SEND_MESSAGE">Send auto-message</SelectItem>
              <SelectItem value="NOTIFY_SLACK">Notify Slack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action-specific config */}
      {action === "ASSIGN_TO" && (
        <div className="space-y-2">
          <Label>Assign to</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent..." />
            </SelectTrigger>
            <SelectContent>
              {workspaceMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.user.name ?? "Unnamed"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(action === "ADD_TAG" || action === "REMOVE_TAG") && (
        <div className="space-y-2">
          <Label>Tag</Label>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. bug"
          />
        </div>
      )}

      {action === "CHANGE_STATUS" && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="SNOOZED">Snoozed</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(action === "SEND_MESSAGE" || action === "NOTIFY_SLACK") && (
        <div className="space-y-2">
          <Label>Message</Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message text..."
          />
        </div>
      )}

      <Button type="submit" disabled={isPending || !name || !trigger || !action}>
        {isPending ? "Creating..." : "Create Rule"}
      </Button>
    </form>
  );
}
