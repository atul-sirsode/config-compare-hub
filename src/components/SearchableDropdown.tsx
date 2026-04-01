import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownGroup {
  heading: string;
  options: DropdownOption[];
}

interface SearchableDropdownProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  groups: DropdownGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
}

export function SearchableDropdown({
  id,
  label,
  value,
  onChange,
  groups,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  className,
  triggerClassName,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    for (const group of groups) {
      const found = group.options.find(o => o.value === value);
      if (found) return found.label;
    }
    return '';
  }, [value, groups]);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex items-center justify-between w-52 h-8 text-sm bg-surface border border-border rounded-md px-3 hover:bg-muted/50 transition-colors",
              triggerClassName
            )}
          >
            <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
              {selectedLabel || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {groups.map(group => (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {group.options.map(option => (
                    <CommandItem
                      key={option.value}
                      value={`${group.heading} ${option.label}`}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-3.5 w-3.5", value === option.value ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
