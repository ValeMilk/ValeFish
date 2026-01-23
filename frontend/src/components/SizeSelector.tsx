import { cn } from "@/lib/utils";

type FishSize = 'P' | 'M' | 'G';

interface SizeSelectorProps {
  value: FishSize | undefined;
  onChange: (size: FishSize) => void;
  disabled?: boolean;
}

const SizeSelector = ({ value, onChange, disabled = false }: SizeSelectorProps) => {
  const sizes: { key: FishSize; label: string }[] = [
    { key: 'P', label: 'P' },
    { key: 'M', label: 'M' },
    { key: 'G', label: 'G' },
  ];

  return (
    <div className="flex gap-1">
      {sizes.map((size) => (
        <button
          key={size.key}
          type="button"
          disabled={disabled}
          onClick={() => onChange(size.key)}
          className={cn(
            "w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            value === size.key
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
