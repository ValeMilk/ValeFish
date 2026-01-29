import { ReactNode } from "react";

export type FishSize = 'P' | 'M' | 'G' | 'GG';

interface SizeWeightInputProps {
  label: string;
  icon?: ReactNode;
  values: Record<FishSize, string | number>;
  onChange: (size: FishSize, value: string) => void;
  disabled?: boolean;
  suffix?: string;
}

const SizeWeightInput = ({
  label,
  icon,
  values,
  onChange,
  disabled = false,
  suffix = "KG",
}: SizeWeightInputProps) => {
  const sizes: FishSize[] = ['P', 'M', 'G', 'GG'];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <label className="text-sm font-medium text-foreground">{label}</label>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={values[size] || ''}
              onChange={(e) => onChange(size, e.target.value)}
              disabled={disabled}
              className={`w-full input-ocean text-center ${
                disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
            <span className="text-xs font-semibold text-muted-foreground">
              {size}
            </span>
          </div>
        ))}
      </div>

      {suffix && (
        <p className="text-xs text-muted-foreground text-center">
          Todos os valores em {suffix}
        </p>
      )}
    </div>
  );
};

export default SizeWeightInput;
