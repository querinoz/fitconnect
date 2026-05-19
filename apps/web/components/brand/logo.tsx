import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  animated?: boolean;
  title?: string;
};

/**
 * FitConnect connection-node mark.
 * Three peripheral nodes linked to a central Volt hub — athlete, coach, platform.
 */
export function Logo({ className, animated = false, title = "FitConnect" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 52 52"
      width={36}
      height={36}
      role="img"
      aria-label={title}
      className={cn("h-9 w-9 shrink-0", animated && "fc-logo-pulse", className)}
    >
      <circle
        cx="10"
        cy="26"
        r="6"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
      <circle
        cx="42"
        cy="10"
        r="6"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
      <circle
        cx="42"
        cy="42"
        r="6"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
      <circle cx="26" cy="26" r="7" fill="var(--volt-500, #C8FF00)" />
      <circle cx="26" cy="26" r="13" fill="rgba(200,255,0,0.12)" />
      <line
        x1="16"
        y1="26"
        x2="19"
        y2="26"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
      <line
        x1="31"
        y1="21"
        x2="38"
        y2="14"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
      <line
        x1="31"
        y1="31"
        x2="38"
        y2="38"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LogoMono({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      role="img"
      aria-label="FitConnect"
      className={cn("h-5 w-5", className)}
    >
      <circle
        cx="10"
        cy="26"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle
        cx="42"
        cy="10"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle
        cx="42"
        cy="42"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle cx="26" cy="26" r="7" fill="currentColor" />
      <line
        x1="16"
        y1="26"
        x2="19"
        y2="26"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <line
        x1="31"
        y1="21"
        x2="38"
        y2="14"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <line
        x1="31"
        y1="31"
        x2="38"
        y2="38"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
    </svg>
  );
}
