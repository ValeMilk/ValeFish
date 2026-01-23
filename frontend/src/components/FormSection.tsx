import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
  headerContent?: ReactNode;
}

const FormSection = ({ 
  title, 
  icon, 
  children, 
  isOpen = true, 
  onToggle,
  collapsible = false,
  collapsed = false,
  headerContent
}: FormSectionProps) => {
  // Se collapsed está definido, usar como base para determinar se deve estar aberto
  const shouldBeOpen = collapsed ? false : isOpen;
  
  return (
    <div className="card-ocean overflow-hidden animate-slide-up">
      <div className="w-full flex items-center justify-between p-3 md:p-5 gap-2">
        <button
          onClick={collapsible ? onToggle : undefined}
          className={`flex items-center gap-2 md:gap-3 flex-1 min-w-0 ${
            collapsible ? 'cursor-pointer hover:bg-muted/30 transition-colors' : 'cursor-default'
          } rounded px-2 py-1 -ml-2`}
          disabled={!collapsible}
        >
          <div className="icon-box flex-shrink-0">
            {icon}
          </div>
          <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{title}</h3>
          {collapsible && (
            <ChevronDown
              className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform duration-200 ml-auto flex-shrink-0 ${
                shouldBeOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>
        {headerContent && (
          <div className="flex items-center gap-1 md:gap-2 ml-1 flex-shrink-0 overflow-x-auto">
            {headerContent}
          </div>
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          shouldBeOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-3 md:px-5 pb-3 md:pb-5 pt-0">
          <div className="section-divider !mt-0 !mb-3 md:!mb-5" />
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormSection;
