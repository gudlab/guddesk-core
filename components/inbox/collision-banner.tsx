"use client";

import { Icons } from "@/components/shared/icons";

interface Viewer {
  userId: string;
  name: string;
  image: string | null;
}

interface Props {
  viewers: Viewer[];
  isOtherReplying: boolean;
  replyingUser: string | null;
}

export function CollisionBanner({
  viewers,
  isOtherReplying,
  replyingUser,
}: Props) {
  if (viewers.length === 0 && !isOtherReplying) return null;

  const viewerNames = viewers.map((v) => v.name);
  const viewerText =
    viewerNames.length === 1
      ? `${viewerNames[0]} is also viewing`
      : viewerNames.length === 2
        ? `${viewerNames[0]} and ${viewerNames[1]} are also viewing`
        : `${viewerNames[0]} and ${viewerNames.length - 1} others are also viewing`;

  return (
    <div className="flex items-center gap-2 border-b bg-blue-50 px-4 py-1.5 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-200">
      <Icons.eye className="size-3.5 shrink-0" />
      <span>
        {isOtherReplying && replyingUser
          ? `${replyingUser} is replying…`
          : viewerText}
      </span>
    </div>
  );
}
