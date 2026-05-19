import type { ComponentType, SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & { color?: string };

const vb = "0 0 40 40";
const sw = 2.8;
const cap = "round" as const;
const join = "round" as const;

export function MarkMeridian({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path
        d="M20 6 A14 14 0 0 1 20 34"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap={cap}
      />
      <path
        d="M20 6 A14 14 0 0 0 20 34"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap={cap}
        transform="translate(6 0)"
      />
    </svg>
  );
}

export function MarkVertex({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path
        d="M8 30 L20 10 L32 30"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap={cap}
        strokeLinejoin={join}
      />
      <path d="M14 24 H26" stroke={color} strokeWidth={sw * 0.85} strokeLinecap={cap} />
    </svg>
  );
}

export function MarkSeal({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path
        d="M20 5 L34 14 V26 L20 35 L6 26 V14 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin={join}
      />
      <circle cx="20" cy="20" r="2.2" fill={color} />
    </svg>
  );
}

export function MarkReadinessRing({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <circle
        cx="20"
        cy="20"
        r="13"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray="68 14"
        strokeLinecap={cap}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

export function MarkAsymmetricF({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path d="M12 8 V32" stroke={color} strokeWidth={sw + 0.4} strokeLinecap={cap} />
      <path d="M12 10 H28" stroke={color} strokeWidth={sw + 0.4} strokeLinecap={cap} />
      <path d="M12 19 H22" stroke={color} strokeWidth={sw + 0.4} strokeLinecap={cap} />
      <path d="M22 19 H32" stroke={color} strokeWidth={sw} strokeLinecap={cap} />
    </svg>
  );
}

export function MarkLinkNode({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <circle cx="15" cy="20" r="9" fill="none" stroke={color} strokeWidth={sw} />
      <circle cx="25" cy="20" r="9" fill="none" stroke={color} strokeWidth={sw} />
    </svg>
  );
}

export function MarkCrosshair({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <circle cx="20" cy="20" r="12" fill="none" stroke={color} strokeWidth={sw * 0.9} />
      <path d="M20 6 V34 M6 20 H34" stroke={color} strokeWidth={1.4} strokeLinecap={cap} />
      <circle cx="20" cy="20" r="2" fill={color} />
    </svg>
  );
}

export function MarkApex({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path
        d="M20 7 L33 31 H7 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin={join}
      />
      <path d="M10 24 H30" stroke={color} strokeWidth={sw * 0.7} strokeLinecap={cap} />
    </svg>
  );
}

export function MarkTension({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path d="M13 9 V31" stroke={color} strokeWidth={3.2} strokeLinecap={cap} />
      <path d="M13 11 H27" stroke={color} strokeWidth={3.2} strokeLinecap={cap} />
      <path d="M13 19 H21" stroke={color} strokeWidth={3.2} strokeLinecap={cap} />
      <path
        d="M9 27 C14 27 17 22 22 22 C27 22 28 30 33 27"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap={cap}
      />
    </svg>
  );
}

export function MarkFcOverlap({ color = "currentColor", ...p }: MarkProps) {
  return (
    <svg viewBox={vb} {...p}>
      <path
        d="M10 8 H18 V32 H10 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin={join}
      />
      <path
        d="M22 8 C30 8 30 32 22 32 C18 32 18 20 26 20"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap={cap}
      />
    </svg>
  );
}

export const EXPLORATION_MARKS: Record<string, ComponentType<MarkProps>> = {
  meridian: MarkMeridian,
  vertex: MarkVertex,
  seal: MarkSeal,
  "readiness-ring": MarkReadinessRing,
  "asymmetric-f": MarkAsymmetricF,
  "link-node": MarkLinkNode,
  crosshair: MarkCrosshair,
  apex: MarkApex,
  tension: MarkTension,
  "fc-overlap": MarkFcOverlap
};
