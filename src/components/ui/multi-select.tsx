import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import {
  Command,
  CommandGroup,
  CommandItem,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(value.filter((i) => i !== item));
  };

  const handleSelect = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((i) => i !== item));
    } else {
      onChange([...value, item]);
    }
    // Keep the popover open for multiple selections
  };

  const selectedLabels = React.useMemo(() => {
    return value.map(
      (v) => options.find((option) => option.value === v)?.label || v
    );
  }, [options, value]);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-h-10 w-full justify-between border border-input hover:bg-background",
            className
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1.5 py-0.5">
            {selectedLabels.length === 0 && placeholder}
            {selectedLabels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="mr-1 rounded-sm px-1 font-normal"
              >
                {label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const itemValue = options.find(
                      (option) => option.label === label
                    )?.value;
                    if (itemValue) handleUnselect(itemValue);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
          <span className="opacity-50">▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="max-h-64">
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2",
                    isSelected ? "bg-accent" : ""
                  )}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {isSelected && <span className="h-4 text-xs">✓</span>}
                  </div>
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
