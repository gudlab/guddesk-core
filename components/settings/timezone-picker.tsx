"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  formatUtcOffset,
  isIanaTimeZone,
  listTimeZones,
} from "@/lib/timezones";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = { name: string; offset: string | null };

/**
 * Searchable list of IANA timezones with their current UTC offset. A saved
 * value that is not in the list (for example an offset saved before
 * validation) is still shown, so the page never hides what is stored.
 */
export function TimezonePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (timezone: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // Built only while the list is open: about 400 zones, each needing Intl.
  const options = useMemo<Option[]>(() => {
    if (!open) return [];
    const now = new Date();
    const names = listTimeZones();
    if (value && !names.includes(value)) names.unshift(value);
    return names.map((name) => ({ name, offset: formatUtcOffset(name, now) }));
  }, [open, value]);

  const currentOffset = value ? formatUtcOffset(value) : null;
  const isListed = !value || isIanaTimeZone(value);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[320px] justify-between font-normal"
          >
            <span className="truncate">
              {value || "Select a timezone"}
              {currentOffset && (
                <span className="text-muted-foreground ml-2">
                  {currentOffset}
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search timezones" />
            <CommandList>
              <CommandEmpty>No timezone found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.name}
                    value={`${option.name} ${option.offset ?? ""}`}
                    keywords={[
                      option.name.replace(/_/g, " "),
                      ...option.name.split("/"),
                    ]}
                    onSelect={() => {
                      onChange(option.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        option.name === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.name}</span>
                    {option.offset && (
                      <span className="text-muted-foreground ml-auto pl-2 text-xs">
                        {option.offset}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {!isListed && (
        <p className="text-muted-foreground text-sm">
          The saved value &quot;{value}&quot; is not an IANA timezone name. Pick
          a timezone from the list before you save.
        </p>
      )}
    </div>
  );
}
