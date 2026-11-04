"use client";

interface CannedResponse {
  id: string;
  title: string;
  body: string;
}

interface CannedResponsePickerProps {
  responses: CannedResponse[];
  onSelect: (response: CannedResponse) => void;
  onClose: () => void;
}

export function CannedResponsePicker({
  responses,
  onSelect,
  onClose,
}: CannedResponsePickerProps) {
  return (
    <div className="bg-popover absolute inset-x-0 bottom-full mb-1 max-h-48 overflow-y-auto rounded-md border shadow-md">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          Canned responses
        </span>
        <button
          className="hover:text-foreground text-sm text-neutral-600 dark:text-neutral-300"
          onClick={onClose}
        >
          Esc
        </button>
      </div>
      {responses.map((r) => (
        <button
          key={r.id}
          className="hover:bg-muted flex w-full flex-col gap-0.5 px-3 py-2 text-left"
          onClick={() => onSelect(r)}
        >
          <span className="text-sm font-medium">{r.title}</span>
          <span className="truncate text-sm text-neutral-600 dark:text-neutral-300">
            {r.body}
          </span>
        </button>
      ))}
    </div>
  );
}
