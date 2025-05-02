import * as React from "react";
import { X, Check, Plus } from "lucide-react";
import { Badge } from "./badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandInput
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";

export type Option = {
  value: string;
  label: string;
  description?: string;
};

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustomEntry?: boolean;
}

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
  allowCustomEntry = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Ensure we always have arrays, even if values are somehow undefined
  const safeOptions = React.useMemo(() => {
    return Array.isArray(options) ? options : [];
  }, [options]);

  const safeValue = React.useMemo(() => {
    return Array.isArray(value) ? value : [];
  }, [value]);

  const handleUnselect = React.useCallback((item: string) => {
    onChange(safeValue.filter((i) => i !== item));
  }, [safeValue, onChange]);

  const handleSelect = React.useCallback((item: string) => {
    if (safeValue.includes(item)) {
      onChange(safeValue.filter((i) => i !== item));
    } else {
      onChange([...safeValue, item]);
    }
    // Keep the popover open for multiple selections
  }, [safeValue, onChange]);

  const handleAddCustomOption = React.useCallback(() => {
    if (!inputValue || safeValue.includes(inputValue)) {
      return;
    }
    
    onChange([...safeValue, inputValue]);
    setInputValue("");
  }, [inputValue, safeValue, onChange]);

  const selectedLabels = React.useMemo(() => {
    if (!safeOptions.length) return [];
    const knownLabels = safeValue.map(
      (v) => safeOptions.find((option) => option.value === v)?.label || v
    );
    
    // Include any custom values that might not be in options
    return knownLabels;
  }, [safeOptions, safeValue]);

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
                    const itemValue = safeOptions.find(
                      (option) => option.label === label
                    )?.value || label;
                    handleUnselect(itemValue);
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
        <Command>
          {allowCustomEntry && (
            <div className="flex items-center border-b px-3 py-2">
              <CommandInput 
                placeholder="Search or add new..." 
                value={inputValue}
                onValueChange={setInputValue}
                className="flex-1"
              />
              {inputValue && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAddCustomOption}
                  className="ml-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          )}
          
          <CommandEmpty>No options available</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {safeOptions.map((option) => {
              const isSelected = safeValue.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex cursor-pointer items-center py-2"
                >
                  <div className="flex items-start gap-2 w-full">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleSelect(option.value)}
                      className="mt-0.5"
                      id={`checkbox-${option.value}`}
                    />
                    <div className="flex flex-col">
                      <label 
                        htmlFor={`checkbox-${option.value}`}
                        className="font-medium cursor-pointer"
                      >
                        {option.label}
                      </label>
                      {option.description && (
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
