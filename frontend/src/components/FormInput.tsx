import { ReactNode } from "react";

interface FormInputProps {
  label: string;
  icon?: ReactNode;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  suffix?: string;
  disabled?: boolean;
  computed?: boolean;
  inputMode?: 'text' | 'numeric' | 'decimal';
}

const FormInput = ({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  suffix,
  disabled = false,
  computed = false,
  inputMode,
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-3 md:py-2 rounded-lg border border-muted-foreground/30 bg-muted text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${icon ? 'pl-10' : ''} ${suffix ? 'pr-14' : ''} ${
            computed ? 'bg-secondary/50 font-semibold text-secondary-foreground' : ''
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormInput;
