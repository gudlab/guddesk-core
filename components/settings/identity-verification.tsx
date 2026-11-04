"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import {
  generateIdentitySecret,
  disableIdentityVerification,
} from "@/actions/update-widget-settings";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface IdentityVerificationProps {
  workspaceId: string;
  initialSecret: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IdentityVerification({
  workspaceId,
  initialSecret,
}: IdentityVerificationProps) {
  const [secret, setSecret] = useState(initialSecret);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEnabled = !!secret;

  function handleEnable() {
    startTransition(async () => {
      const result = await generateIdentitySecret(workspaceId);
      if (result.status === "success") {
        setSecret(result.secret);
        toast.success("Identity verification enabled");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDisable() {
    startTransition(async () => {
      const result = await disableIdentityVerification(workspaceId);
      if (result.status === "success") {
        setSecret(null);
        toast.success("Identity verification disabled");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hmacSnippet = `const crypto = require('crypto');

const userHash = crypto
  .createHmac('sha256', '${secret ?? "YOUR_SECRET"}')
  .update(userId)
  .digest('hex');`;

  const identifySnippet = `// After your user logs in, identify them to GudDesk
window.GudDesk.identify({
  userId: user.id,           // Required: your user's unique ID
  name: user.name,           // Optional: display name
  email: user.email,         // Optional: email address
  ${isEnabled ? 'userHash: userHash,        // Required when identity verification is enabled\n  ' : ''}metadata: {               // Optional: custom attributes
    plan: "pro",
    company: "Acme Inc"
  }
});`;

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Shield className="h-4 w-4 text-green-600" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="text-sm font-medium">Identity Verification</h3>
        </div>
        <Button
          variant={isEnabled ? "destructive" : "default"}
          size="sm"
          onClick={isEnabled ? handleDisable : handleEnable}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          {isEnabled ? "Disable" : "Enable"}
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {isEnabled
          ? "Identity verification is active. The widget will require a server-generated HMAC hash to accept user identification, preventing impersonation."
          : "When enabled, the widget will require a server-side HMAC-SHA256 hash to verify user identity. This prevents users from impersonating others via the JavaScript API."}
      </p>

      {isEnabled && secret && (
        <div className="mt-4 space-y-4">
          {/* Secret display */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Secret Key
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 font-mono text-xs">
                {secret}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(secret)}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep this secret on your server. Never expose it in client-side code.
            </p>
          </div>

          {/* Server-side HMAC snippet */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Server-side: Generate the hash
            </label>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              <code>{hmacSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Identify snippet (always shown) */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Client-side: Identify logged-in users
        </label>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          <code>{identifySnippet}</code>
        </pre>
        <p className="mt-1 text-xs text-muted-foreground">
          Call this after your user logs in. The widget will link the chat session
          to the identified customer, preserving conversation history across visits.
        </p>
      </div>
    </div>
  );
}
