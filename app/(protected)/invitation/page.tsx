"use client";

import { useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { acceptInvitation } from "@/actions/accept-invitation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

export default function InvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invitation link");
      router.push("/dashboard");
      return;
    }

    startTransition(async () => {
      const result = await acceptInvitation(token);

      if (result.status === "error") {
        toast.error(result.message || "Failed to accept invitation");
        router.push("/dashboard");
        return;
      }

      if ("alreadyMember" in result && result.alreadyMember) {
        toast.info(result.message);
      } else {
        toast.success("You have joined the workspace!");
      }
      router.push(`/workspace/${result.workspaceSlug}/inbox`);
    });
  }, [token, router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Accepting Invitation</CardTitle>
          <CardDescription>
            Please wait while we add you to the workspace...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isPending && (
            <Icons.spinner className="size-8 animate-spin text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
