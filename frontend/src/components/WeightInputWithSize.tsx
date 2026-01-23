import { ReactNode } from "react";
import SizeSelector from "./SizeSelector";

type FishSize = 'P' | 'M' | 'G';

interface WeightInputWithSizeProps {
  label: string;
  icon?: ReactNode;
  placeholder?: string;
  weightValue: number | undefined;
  sizeValue: FishSize | undefined;
  onWeightChange: (value: number) => void;
  onSizeChange: (size: FishSize) => void;
  disabled?: boolean;
}

const WeightInputWithSize = ({
  label,
  icon,
  placeholder = "0.00",
  weightValue,
  sizeValue,
  onWeightChange,
  onSizeChange,
  disabled = false,
}: WeightInputWithSizeProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type="number"
            placeholder={placeholder}
            value={weightValue || ''}
            onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className={`w-full input-ocean ${icon ? 'pl-10' : ''} pr-10 ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            kg
          </span>
        </div>
        <SizeSelector value={sizeValue} onChange={onSizeChange} disabled={disabled} />
      </div>
    </div>
  );
};

export default WeightInputWithSize;
