import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { EliteInput } from "@/components/elite-os/elite-input";
import { LabelCaps } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

type EliteAuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: ReactNode;
  icon?: LucideIcon;
  error?: boolean;
};

export function EliteAuthField({
  label,
  icon: Icon,
  error,
  className,
  id,
  ...props
}: EliteAuthFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id}>
        <LabelCaps className="text-eos-on-surface-subtle">{label}</LabelCaps>
      </label>
      <div className="relative mt-1.5">
        {Icon ? (
          <Icon
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eos-on-surface-subtle"
          />
        ) : null}
        <EliteInput
          id={id}
          state={error ? "error" : "default"}
          className={cn(Icon && "pl-10")}
          {...props}
        />
      </div>
    </div>
  );
}
