"use client";

import { useEffect, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  userId: string;
  user: { name: string | null; image: string | null };
}

interface Props {
  members: Member[];
  onSelect: (member: Member) => void;
  onClose: () => void;
}

export function MentionPicker({ members, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (members.length === 0) return null;

  return (
    <div
      ref={ref}
      className="bg-popover absolute bottom-full left-0 z-10 mb-1 max-h-[200px] w-[220px] overflow-y-auto rounded-md border p-1 shadow-md"
    >
      {members.slice(0, 10).map((member) => {
        const name = member.user.name ?? "Unknown";
        const initials = name.slice(0, 2).toUpperCase();
        return (
          <button
            key={member.id}
            className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
            onClick={() => onSelect(member)}
          >
            <Avatar className="size-5">
              {member.user.image && <AvatarImage src={member.user.image} />}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
